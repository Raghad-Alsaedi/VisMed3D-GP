import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ filename: string }> }
) {
  try {
    const params = await context.params;
    let filename = params.filename;

    console.log('Signature request for:', filename);

    
    if (!filename) {
      return new NextResponse('Filename required', { status: 400 });
    }

    if (filename.includes('..') || filename.includes('\\')) {
      console.log('Invalid filename:', filename);
      return new NextResponse('Invalid filename', { status: 400 });
    }

    const ext = path.extname(filename).toLowerCase();
    const allowedExtensions = ['.png', '.jpg', '.jpeg'];
    
    if (!allowedExtensions.includes(ext)) {
      console.log('Invalid extension:', ext);
      return new NextResponse('Invalid file type', { status: 400 });
    }
    
    let filepath: string;
    
    if (filename.startsWith('reports/')) {
      filepath = path.join(process.cwd(), 'picture', 'signatures', filename);
    } else {
      filepath = path.join(process.cwd(), 'picture', 'signatures', filename);
    }
    
    console.log('Looking for file at:', filepath);

    if (!existsSync(filepath)) {
      console.error('Signature file not found:', filepath);
      return new NextResponse('Image not found', { status: 404 });
    }

    const imageBuffer = await readFile(filepath);
    
    console.log(' Signature loaded, size:', imageBuffer.length, 'bytes');

    const contentType = 
      ext === '.png' ? 'image/png' :
      ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' :
      'application/octet-stream';

    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
      },
    });

  } catch (error) {
    console.error('Error fetching signature:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}