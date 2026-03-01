import { NextResponse } from "next/server";
import { db } from "@/database/db.js";
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

    const body = await req.json();
    const {
      accession_id,
      body_part,
      clinical_indication,
      technique,
      finding,
      impression,
      current_status,
    } = body;

    if (!accession_id) {
      return NextResponse.json(
        { status: "error", message: "accession_id is required" },
        { status: 400 }
      );
    }

  
    const [doctorRows] = await db.query(
      `
      SELECT 
        u.id,
        u.first_name,
        u.last_name,
        d.doctor_id,
        dp.signature_path
      FROM users u
      JOIN doctors d ON d.doctor_id = u.doctor_id
      LEFT JOIN doctor_profiles dp ON dp.doctor_id = d.doctor_id
      WHERE u.id = ? AND u.role = 'doctor'
      LIMIT 1
      `,
      [userId]
    );

    if (!doctorRows || doctorRows.length === 0) {
      return NextResponse.json(
        { status: "error", message: "Doctor not found" },
        { status: 404 }
      );
    }

    const doctor = doctorRows[0];
    const doctorName = `${doctor.first_name} ${doctor.last_name}`;
    const signaturePath = doctor.signature_path || null; 

    const autosaveData = {
      body_part: body_part || "",
      clinical_indication: clinical_indication || "",
      technique: technique || "",
      finding: finding || "",
      impression: impression || "",
    };

    const [existing] = await db.query(
      `SELECT report_id, report_status FROM reports WHERE accession_id = ? AND doctor_id = ? LIMIT 1`,
      [accession_id, doctor.doctor_id]
    );

    if (existing.length > 0) {
     
      await db.query(
        `
        UPDATE reports 
        SET autosave_text = ?,
            body_part = ?,
            doctor_signature_path = ?,
            last_autosave = NOW(),
            updated_at = NOW()
        WHERE accession_id = ? AND doctor_id = ?
        `,
        [
          JSON.stringify(autosaveData),
          body_part || "",
          signaturePath, 
          accession_id,
          doctor.doctor_id,
        ]
      );

      return NextResponse.json({
        status: "ok",
        message: "Auto-saved successfully",
        action: "update",
      });
    } else {

      const [result] = await db.query(
        `
        INSERT INTO reports (
          accession_id, 
          doctor_id, 
          doctor_name, 
          body_part,
          autosave_text,
          report_status,
          doctor_signature_path,
          last_autosave, 
          created_at
        )
        VALUES (?, ?, ?, ?, ?, 'Draft', ?, NOW(), NOW())
        `,
        [
          accession_id,
          doctor.doctor_id,
          doctorName,
          body_part || "",
          JSON.stringify(autosaveData),
          signaturePath 
        ]
      );

      return NextResponse.json({
        status: "ok",
        message: "Draft created successfully",
        action: "insert",
        reportId: result.insertId,
      });
    }
  } catch (err) {
    console.error("AUTOSAVE DRAFT ERROR:", err);
    return NextResponse.json(
      { status: "error", message: "Server error" },
      { status: 500 }
    );
  }
}