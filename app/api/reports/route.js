import { NextResponse } from "next/server";
import { db } from "@/database/db.js";

// GET - Fetch report by accession_id
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const accessionId = searchParams.get("accession_id");

    if (!accessionId) {
      return NextResponse.json(
        { status: "error", message: "accession_id is required" },
        { status: 400 }
      );
    }

    console.log("🔍 Fetching report for accession_id:", accessionId);

    // Fetch report with doctor, patient, and accession info
    const [rows] = await db.query(
      `
      SELECT 
        r.report_id,
        r.accession_id,
        r.doctor_id,
        r.report_content,
        r.created_at,
        r.updated_at,
        CONCAT(du.first_name, ' ', du.last_name) AS doctor_name,
        a.accession_number,
        a.exam_date,
        a.modality,
        a.body_part,
        a.patient_id,
        CONCAT(pu.first_name, ' ', pu.last_name) AS patient_name
      FROM reports r
      JOIN accession a ON a.accession_id = r.accession_id
      JOIN doctors d ON d.doctor_id = r.doctor_id
      JOIN users du ON du.doctor_id = d.doctor_id
      JOIN patients p ON p.patient_id = a.patient_id
      JOIN users pu ON pu.patient_id = p.patient_id
      WHERE r.accession_id = ?
      LIMIT 1
      `,
      [accessionId]
    );

    if (!rows.length) {
      // No report found - return empty
      return NextResponse.json({
        status: "ok",
        report: null,
        message: "No report found for this accession"
      });
    }

    const report = rows[0];

    console.log("✅ Report found:", report);

    return NextResponse.json({
      status: "ok",
      report: {
        id: report.report_id,
        accessionId: report.accession_id,
        doctorId: report.doctor_id,
        doctorName: report.doctor_name,
        patientName: report.patient_name,
        accessionNumber: report.accession_number,
        examDate: report.exam_date,
        modality: report.modality,
        bodyPart: report.body_part,
        reportText: report.report_content,
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