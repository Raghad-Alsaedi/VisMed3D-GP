import { NextResponse } from "next/server";
import { db } from "@/database/db.js";

// POST - Auto-save report (UPSERT logic)
export async function POST(req) {
  try {
    // Get doctor_id from cookies (authenticated user)
    const doctorId = req.cookies.get("user_id")?.value;

    if (!doctorId) {
      return NextResponse.json(
        { status: "error", message: "Not authenticated" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { study_id, report_text } = body;

    // Validation
    if (!study_id || report_text === undefined) {
      return NextResponse.json(
        { status: "error", message: "study_id and report_text are required" },
        { status: 400 }
      );
    }

    console.log("💾 Auto-saving report for study_id:", study_id);

    // Check if report already exists
    const [existing] = await db.query(
      `SELECT id FROM reports WHERE study_id = ? LIMIT 1`,
      [study_id]
    );

    if (existing.length > 0) {
      // UPDATE existing report
      await db.query(
        `
        UPDATE reports 
        SET report_text = ?, updated_at = NOW()
        WHERE study_id = ?
        `,
        [report_text, study_id]
      );

      console.log("✅ Report UPDATED for study_id:", study_id);

      return NextResponse.json({
        status: "ok",
        message: "Report updated successfully",
        action: "update",
      });
    } else {
      // INSERT new report
      const [result] = await db.query(
        `
        INSERT INTO reports (study_id, doctor_id, report_text, created_at)
        VALUES (?, ?, ?, NOW())
        `,
        [study_id, doctorId, report_text]
      );

      console.log("✅ New report CREATED for study_id:", study_id);

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