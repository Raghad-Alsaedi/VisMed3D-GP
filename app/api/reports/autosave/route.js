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
        { status: 401 },
      );
    }

    const body = await req.json();
    const { accession_id, report_content } = body;

    if (!accession_id || report_content === undefined) {
      return NextResponse.json(
        {
          status: "error",
          message: "accession_id and report_content are required",
        },
        { status: 400 },
      );
    }

    const [doctorRows] = await db.query(
      `
      SELECT 
        u.id,
        u.first_name,
        u.last_name,
        d.doctor_id
      FROM users u
      JOIN doctors d ON d.doctor_id = u.doctor_id
      WHERE u.id = ? AND u.role = 'doctor'
      LIMIT 1
      `,
      [userId],
    );

    if (!doctorRows || doctorRows.length === 0) {
      return NextResponse.json(
        { status: "error", message: "Doctor not found" },
        { status: 404 },
      );
    }

    const doctor = doctorRows[0];
    const doctorName = `${doctor.first_name} ${doctor.last_name}`;

    const newStatus =
      report_content && report_content.trim().length > 0
        ? "completed"
        : "pending";

    const [existing] = await db.query(
      `SELECT report_id FROM reports WHERE accession_id = ? AND doctor_id = ? LIMIT 1`,
      [accession_id, doctor.doctor_id],
    );

    if (existing.length > 0) {
      await db.query(
        `
        UPDATE reports 
        SET report_content = ?, 
            report_status = ?,
            updated_at = NOW()
        WHERE accession_id = ? AND doctor_id = ?
        `,
        [report_content, newStatus, accession_id, doctor.doctor_id],
      );

      return NextResponse.json({
        status: "ok",
        message: "Report text updated successfully",
        action: "update",
      });
    } else {
      const [result] = await db.query(
        `
        INSERT INTO reports (accession_id, doctor_id, doctor_name, report_content, report_status, created_at)
        VALUES (?, ?, ?, ?, ?, NOW())
        `,
        [accession_id, doctor.doctor_id, doctorName, report_content, newStatus],
      );

      return NextResponse.json({
        status: "ok",
        message: "Report text created successfully",
        action: "insert",
        reportId: result.insertId,
      });
    }
  } catch (err) {
    console.error("AUTOSAVE ERROR:", err);
    return NextResponse.json(
      { status: "error", message: "Server error" },
      { status: 500 },
    );
  }
}
