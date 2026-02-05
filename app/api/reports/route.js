import { NextResponse } from "next/server";
import { db } from "@/database/db.js";

// GET - Fetch report by study_id
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const studyId = searchParams.get("study_id");

    if (!studyId) {
      return NextResponse.json(
        { status: "error", message: "study_id is required" },
        { status: 400 }
      );
    }

    console.log("🔍 Fetching report for study_id:", studyId);

    // Fetch report with doctor and patient info
    const [rows] = await db.query(
      `
      SELECT 
        r.id,
        r.study_id,
        r.doctor_id,
        r.report_text,
        r.created_at,
        r.updated_at,
        CONCAT(doctor.firstName, ' ', doctor.lastName) AS doctor_name,
        s.patient_id,
        CONCAT(patient_user.firstName, ' ', patient_user.lastName) AS patient_name
      FROM reports r
      JOIN studies s ON s.id = r.study_id
      JOIN users doctor ON doctor.id = r.doctor_id
      JOIN patient_accounts pa ON pa.patient_id = s.patient_id
      JOIN users patient_user ON patient_user.id = pa.user_id
      WHERE r.study_id = ?
      LIMIT 1
      `,
      [studyId]
    );

    if (!rows.length) {
      // No report found - return empty
      return NextResponse.json({
        status: "ok",
        report: null,
        message: "No report found for this study"
      });
    }

    const report = rows[0];

    console.log("✅ Report found:", report);

    return NextResponse.json({
      status: "ok",
      report: {
        id: report.id,
        studyId: report.study_id,
        doctorId: report.doctor_id,
        doctorName: report.doctor_name,
        patientName: report.patient_name,
        reportText: report.report_text,
        createdAt: report.created_at,
        updatedAt: report.updated_at,
      },
    });
  } catch (err) {
    console.error("💥 GET REPORT ERROR:", err);
    return NextResponse.json(
      { status: "error", message: "Server error" },
      { status: 500 }
    );
  }
}