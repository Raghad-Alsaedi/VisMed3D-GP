import { NextRequest, NextResponse } from 'next/server';
import { unlink } from 'fs/promises';
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
    const dbPath = path.join(process.cwd(), 'data', 'scans.json');

    if (!existsSync(dbPath)) {
      return NextResponse.json(
        { success: true, message: 'No file data found' },
        { status: 200 }
      );
    }

    const fileContent = fs.readFileSync(dbPath, 'utf-8');
    const scansData = JSON.parse(fileContent);
    const scanMetadata = scansData.scans[fileId];

    if (!scanMetadata) {
      return NextResponse.json(
        { success: true, message: 'File not found' },
        { status: 200 }
      );
    }

    const filePath = scanMetadata.isTemporary
      ? path.join(process.cwd(), 'public', 'uploads', 'temp', scanMetadata.savedFileName)
      : path.join(process.cwd(), 'public', 'uploads', 'scans', scanMetadata.savedFileName);

    if (existsSync(filePath)) {
      await unlink(filePath);
    }

    delete scansData.scans[fileId];
    fs.writeFileSync(dbPath, JSON.stringify(scansData, null, 2));

    return NextResponse.json({
      success: true,
      message: 'Temporary file deleted successfully',
    });

  } catch (error) {
    console.error('Delete temp file error:', error);
    return NextResponse.json(
      { success: false, error: 'An error occurred while deleting the file' },
      { status: 500 }
    );
  }
}