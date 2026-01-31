import { NextRequest, NextResponse } from 'next/server';
import { rename, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';


export async function POST(request: NextRequest) {
  try {
    const { fileId } = await request.json();

    if (!fileId) {
      return NextResponse.json(
        { success: false, error: 'File ID is required' },
        { status: 400 }
      );
    }

    const fs = require('fs');
    const dataDir = path.join(process.cwd(), 'data');
    const dbPath = path.join(dataDir, 'scans.json');

    if (!existsSync(dataDir)) {
      await mkdir(dataDir, { recursive: true });
      fs.writeFileSync(dbPath, JSON.stringify({ scans: {} }, null, 2));
    }

    if (!existsSync(dbPath)) {
      fs.writeFileSync(dbPath, JSON.stringify({ scans: {} }, null, 2));
    }

    const fileContent = fs.readFileSync(dbPath, 'utf-8');
    const scansData = JSON.parse(fileContent);
    const scanMetadata = scansData.scans[fileId];

    if (!scanMetadata) {
      return NextResponse.json(
        { success: false, error: 'File not found in database' },
        { status: 404 }
      );
    }

    if (!scanMetadata.isTemporary) {
      return NextResponse.json(
        { success: true, message: 'File already saved' },
        { status: 200 }
      );
    }

    const tempPath = path.join(
      process.cwd(),
      'public',
      'uploads',
      'temp',
      scanMetadata.savedFileName
    );
    
    const permanentDir = path.join(process.cwd(), 'public', 'uploads', 'scans');
    const permanentPath = path.join(permanentDir, scanMetadata.savedFileName);

    if (!existsSync(permanentDir)) {
      await mkdir(permanentDir, { recursive: true });
    }

    if (!existsSync(tempPath)) {
      return NextResponse.json(
        { success: false, error: 'Temporary file not found in filesystem' },
        { status: 404 }
      );
    }

    await rename(tempPath, permanentPath);

    scanMetadata.status = 'uploaded';
    scanMetadata.isTemporary = false;
    scanMetadata.filePath = `/uploads/scans/${scanMetadata.savedFileName}`;
    scanMetadata.savedDate = new Date().toISOString();

    scansData.scans[fileId] = scanMetadata;
    fs.writeFileSync(dbPath, JSON.stringify(scansData, null, 2));

    return NextResponse.json({
      success: true,
      message: 'File saved successfully',
      fileId: fileId,
    });

  } catch (error) {
    console.error('Save file error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'An error occurred while saving the file' },
      { status: 500 }
    );
  }
}