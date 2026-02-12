// app/api/images/[userId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const userId = params.userId;
    
    // ✅ إذا كان userId = "default"، نرجع الصورة الافتراضية مباشرة
    if (userId === 'default') {
      const defaultPath = join(process.cwd(), 'picture', 'profiles', 'default-avatar.png');
      try {
        const defaultBuffer = await readFile(defaultPath);
        return new NextResponse(defaultBuffer, {
          headers: { 
            'Content-Type': 'image/png',
            'Cache-Control': 'public, max-age=86400',
          },
        });
      } catch (error) {
        return new NextResponse('Default image not found', { status: 404 });
      }
    }

    // ✅ محاولة قراءة صورة المستخدم
    const imagePath = join(process.cwd(), 'picture', 'profiles', `${userId}.png`);
    const defaultPath = join(process.cwd(), 'picture', 'profiles', 'default-avatar.png');

    try {
      const imageBuffer = await readFile(imagePath);
      return new NextResponse(imageBuffer, {
        headers: { 
          'Content-Type': 'image/png',
          'Cache-Control': 'public, max-age=3600',
        },
      });
    } catch (error) {
      // ✅ إذا لم توجد صورة المستخدم، نرجع الصورة الافتراضية
      try {
        const defaultBuffer = await readFile(defaultPath);
        return new NextResponse(defaultBuffer, {
          headers: { 
            'Content-Type': 'image/png',
            'Cache-Control': 'public, max-age=86400',
          },
        });
      } catch (fallbackError) {
        return new NextResponse('Image not found', { status: 404 });
      }
    }
  } catch (error) {
    console.error('Error loading image:', error);
    return new NextResponse('Server error', { status: 500 });
  }
}