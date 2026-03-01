import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { db } from '@/database/db';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    
    if (!userId) {
      return NextResponse.json({ success: false, error: 'User ID not found' }, { status: 400 });
    }

    const [userRows]: any = await db.query(
      'SELECT doctor_id FROM users WHERE id = ? AND role = "doctor"',
      [userId]
    );

    if (userRows.length === 0 || !userRows[0].doctor_id) {
      return NextResponse.json({ 
        success: false, 
        error: 'Doctor profile not found' 
      }, { status: 404 });
    }

    const doctorId = userRows[0].doctor_id;

    const formData = await request.formData();
    const file = formData.get('signature') as File;

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file uploaded' }, { status: 400 });
    }

    const validTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json({ success: false, error: 'Invalid file type' }, { status: 400 });
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ success: false, error: 'File size exceeds 5MB' }, { status: 400 });
    }

const uploadsDir = path.join(process.cwd(), 'picture', 'signatures');
    await mkdir(uploadsDir, { recursive: true });

    const ext = path.extname(file.name);
    const filename = `signature_${doctorId}_${Date.now()}${ext}`;
    const filepath = path.join(uploadsDir, filename);

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filepath, buffer);

    const signaturePath = filename;
    
    const [result]: any = await db.query(
      'UPDATE doctor_profiles SET signature_path = ? WHERE doctor_id = ?',
      [signaturePath, doctorId]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Doctor profile not found' 
      }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      path: signaturePath,
      message: 'Signature saved successfully'
    });

  } catch (error) {
    console.error('Error uploading signature:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to upload signature' 
    }, { status: 500 });
  }
}