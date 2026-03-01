import { NextResponse } from "next/server";
import { writeFile, mkdir, unlink } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { db } from "@/database/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json(
        { status: "error", message: "Not authenticated" },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const image = formData.get("image");
    const accessionId = formData.get("accession_id");

    console.log('UPLOAD IMAGE API START');
    console.log('Upload image API called with accessionId:', accessionId);
    console.log('Image file:', image ? `${image.name} (${image.size} bytes)` : 'No image');
    console.log('User ID:', userId);

    if (!image) {
      return NextResponse.json(
        { status: "error", message: "No image file provided" },
        { status: 400 }
      );
    }

    if (!accessionId) {
      return NextResponse.json(
        { status: "error", message: "accession_id is required" },
        { status: 400 }
      );
    }

    const doctorResult = await db.query(
      `
      SELECT 
        u.id,
        d.doctor_id
      FROM users u
      JOIN doctors d ON d.doctor_id = u.doctor_id
      WHERE u.id = ? AND u.role = 'doctor'
      LIMIT 1
      `,
      [userId]
    );

    const doctorRows = doctorResult[0];

    if (!doctorRows || doctorRows.length === 0) {
      console.error('Doctor not found for userId:', userId);
      return NextResponse.json(
        { status: "error", message: "Doctor not found" },
        { status: 404 }
      );
    }

    const doctor = doctorRows[0];
    console.log('Doctor found:', doctor.doctor_id);

    const reportResult = await db.query(
      `SELECT report_id, images FROM reports WHERE accession_id = ? AND doctor_id = ? LIMIT 1`,
      [accessionId, doctor.doctor_id]
    );

    const reportRows = reportResult[0];

    if (!reportRows || reportRows.length === 0) {
      console.error('Report not found for accessionId:', accessionId, 'doctorId:', doctor.doctor_id);
      return NextResponse.json(
        { status: "error", message: "Report not found" },
        { status: 404 }
      );
    }

    const report = reportRows[0];
    console.log('Report found:', report.report_id);
    console.log('Existing images field:', report.images);

    // ✅ حذف الصورة القديمة إذا كانت موجودة
    if (report.images) {
      try {
        const existingImages = typeof report.images === 'string' 
          ? JSON.parse(report.images) 
          : report.images;
        
        console.log('Parsed existing images:', existingImages);
        
        if (existingImages && existingImages.filename) {
          console.log('Old image exists, will be replaced:', existingImages.filename);
          
          // ✅ التعديل: استخدام المسار الصحيح
          const oldFilepath = path.join(process.cwd(), "picture", "reports-img", existingImages.filename);
          if (existsSync(oldFilepath)) {
            try {
              await unlink(oldFilepath);
              console.log('Old image file deleted:', oldFilepath);
            } catch (unlinkError) {
              console.error('Error deleting old image file:', unlinkError);
            }
          }
        }
      } catch (e) {
        console.error("Error parsing existing images:", e);
      }
    }

    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);
    console.log('Image converted to buffer:', buffer.length, 'bytes');

    // ✅ التعديل: استخدام المسار picture/reports-img
    const uploadDir = path.join(process.cwd(), "picture", "reports-img");
    
    if (!existsSync(uploadDir)) {
      console.log('Creating upload directory:', uploadDir);
      await mkdir(uploadDir, { recursive: true });
      console.log('Directory created');
    } else {
      console.log('Upload directory exists:', uploadDir);
    }

    const timestamp = Date.now();
    const filename = `screenshot_${accessionId}_${timestamp}.png`;
    const filepath = path.join(uploadDir, filename);

    console.log('Writing image to:', filepath);
    await writeFile(filepath, buffer);
    console.log('Image file written successfully');

    const imageUrl = `/api/reports/image/${filename}`;
    console.log('Image URL:', imageUrl);

    const imageData = {
      filename: filename,
      imageUrl: imageUrl,
      capturedAt: new Date().toISOString(),
      size: image.size
    };

    console.log('Updating database with image data:', JSON.stringify(imageData));
    
    const updateDbResult = await db.query(
      `
      UPDATE reports 
      SET images = ?,
          updated_at = NOW()
      WHERE accession_id = ? AND doctor_id = ?
      `,
      [JSON.stringify(imageData), accessionId, doctor.doctor_id]
    );

    const updateResult = updateDbResult[0];

    console.log('Database update result:', {
      affectedRows: updateResult.affectedRows,
      changedRows: updateResult.changedRows
    });

    if (updateResult.affectedRows === 0) {
      console.error('No rows affected in database update');
      return NextResponse.json(
        { status: "error", message: "Failed to update database" },
        { status: 500 }
      );
    }

    console.log('Database updated successfully');

    const verifyDbResult = await db.query(
      `SELECT images FROM reports WHERE accession_id = ? AND doctor_id = ? LIMIT 1`,
      [accessionId, doctor.doctor_id]
    );

    const verifyRows = verifyDbResult[0];

    console.log('Verification - saved images in DB:', verifyRows[0]?.images || 'No data');

    if (verifyRows[0]?.images) {
      try {
        const savedData = JSON.parse(verifyRows[0].images);
        console.log('Verified saved data:', savedData);
      } catch (e) {
        console.error('Error parsing verification data:', e);
      }
    }

    console.log('UPLOAD IMAGE API SUCCESS');

    return NextResponse.json({
      status: "ok",
      message: "Image uploaded successfully",
      filename: filename,
      imageUrl: imageUrl,
      data: imageData
    });

  } catch (err) {
    console.error("UPLOAD IMAGE API ERROR");
    console.error("Error details:", err);
    const errorMessage = err instanceof Error ? err.message : String(err);
    const errorStack = err instanceof Error ? err.stack : undefined;
    if (errorStack) {
      console.error("Error stack:", errorStack);
    }
    return NextResponse.json(
      { status: "error", message: "Server error: " + errorMessage },
      { status: 500 }
    );
  }
}