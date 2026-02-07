import { NextResponse } from "next/server";
import { db } from "@/database/db.js";

// POST - Auto-save report (UPSERT logic)
export async function POST(req) {
  try {
    // Get user_id from cookies (authenticated user)
    const userId = req.cookies.get("user_id")?.value;

    if (!userId) {
      return NextResponse.json(
        { status: "error", message: "Not authenticated" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { accession_id, report_content } = body;

    // Validation
    if (!accession_id || report_content === undefined) {
      return NextResponse.json(
        { status: "error", message: "accession_id and report_content are required" },
        { status: 400 }
      );
    }

    console.log("💾 Auto-saving report for accession_id:", accession_id);

    // 1️⃣ Get doctor info from users + doctors
    const [doctorRows] = await db.query(
      `
      SELECT 
        u.user_id,
        u.first_name,
        u.last_name,
        d.doctor_id
      FROM users u
      JOIN doctors d ON d.doctor_id = u.doctor_id
      WHERE u.user_id = ? AND u.role = 'doctor'
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

    // 2️⃣ Check if report already exists
    const [existing] = await db.query(
      `SELECT report_id FROM reports WHERE accession_id = ? AND doctor_id = ? LIMIT 1`,
      [accession_id, doctor.doctor_id]
    );

    if (existing.length > 0) {
      // UPDATE existing report
      await db.query(
        `
        UPDATE reports 
        SET report_content = ?, updated_at = NOW()
        WHERE accession_id = ? AND doctor_id = ?
        `,
        [report_content, accession_id, doctor.doctor_id]
      );

      console.log("✅ Report UPDATED for accession_id:", accession_id);

      return NextResponse.json({
        status: "ok",
        message: "Report updated successfully",
        action: "update",
      });
    } else {
      // INSERT new report
      const [result] = await db.query(
        `
        INSERT INTO reports (accession_id, doctor_id, doctor_name, report_content, created_at)
        VALUES (?, ?, ?, ?, NOW())
        `,
        [accession_id, doctor.doctor_id, doctorName, report_content]
      );

      console.log("✅ New report CREATED for accession_id:", accession_id);

      return NextResponse.json({
        status: "ok",
        message: "Report created successfully",
        action: "insert",
        reportId: result.insertId,
      });
    }
  } catch (err) {
    console.error("💥 AUTOSAVE ERROR:", err);
    return NextResponse.json(
      { status: "error", message: "Server error" },
      { status: 500 }
    );
  }
}