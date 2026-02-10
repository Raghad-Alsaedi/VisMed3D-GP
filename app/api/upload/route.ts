import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';


export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const patientName = formData.get('patientName') as string;
    const accountNumber = formData.get('accountNumber') as string;
    const temporary = formData.get('temporary') as string; 

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file attached' },
        { status: 400 }
      );
    }

    if (!file.name.toLowerCase().endsWith('.raw')) {
      return NextResponse.json(
        { success: false, error: 'File must be in RAW format only' },
        { status: 400 }
      );
    }

    if (file.size === 0) {
      return NextResponse.json(
        { success: false, error: 'File is empty' },
        { status: 400 }
      );
    }

    const fileId = uuidv4();
    const timestamp = Date.now();
    const safeFileName = `${fileId}_${timestamp}.raw`;

    const isTemporary = temporary === 'true';
    const uploadDir = isTemporary 
      ? path.join(process.cwd(), 'public', 'uploads', 'temp') 
      : path.join(process.cwd(), 'public', 'uploads', 'scans'); 
    
    const filePath = path.join(uploadDir, safeFileName);

    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    await writeFile(filePath, buffer);

    const scanMetadata = {
      fileId: fileId,
      fileName: file.name,
      savedFileName: safeFileName,
      filePath: isTemporary 
        ? `/uploads/temp/${safeFileName}` 
        : `/uploads/scans/${safeFileName}`,
      fileSize: file.size,
      patientName: patientName,
      accountNumber: accountNumber,
      uploadDate: new Date().toISOString(),
      status: isTemporary ? 'temporary' : 'uploaded', 
      isTemporary: isTemporary, 
    };

    try {
      const fs = require('fs');
      const dbPath = path.join(process.cwd(), 'data', 'scans.json');
      
      let scansData: any = { scans: {} };
      if (fs.existsSync(dbPath)) {
        const fileContent = fs.readFileSync(dbPath, 'utf-8');
        scansData = JSON.parse(fileContent);
      }

      scansData.scans[fileId] = scanMetadata;

      fs.writeFileSync(dbPath, JSON.stringify(scansData, null, 2));
    } catch (dbError) {
      console.error('Error saving to JSON database:', dbError);
    }

    return NextResponse.json({
      success: true,
      fileId: fileId,
      message: isTemporary 
        ? 'File uploaded temporarily' 
        : 'File uploaded successfully',
      metadata: scanMetadata,
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { success: false, error: 'An error occurred while uploading the file' },
      { status: 500 }
    );
  }
}