import { NextResponse } from "next/server";
import { db } from "@/database/db";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params;

    const [patientRows]: any = await db.query(
      `SELECT patient_id FROM users WHERE id = ? AND role = 'patient' LIMIT 1`,
      [userId]
    );

    if (!patientRows.length || !patientRows[0].patient_id) {
      return NextResponse.json(
        { status: "error", message: "Patient not found" },
        { status: 404 }
      );
    }

    const patientId = patientRows[0].patient_id;

    const [rows] = await db.query(
      `SELECT
         r.report_id,
         a.accession_number,
         COALESCE(r.body_part, '') AS body_part,
         r.doctor_name,
         a.modality,
         a.exam_date,
         r.report_status,
         r.created_at,
         r.signed_at
       FROM reports r
       JOIN accession a ON a.accession_id = r.accession_id
       WHERE a.patient_id = ?
       GROUP BY r.report_id
       ORDER BY r.created_at DESC`,
      [patientId]
    );

    return NextResponse.json({ status: "ok", reports: rows });
  } catch (err) {
    console.error("Patient reports GET error:", err);
    return NextResponse.json(
      { status: "error", message: "Failed to fetch reports" },
      { status: 500 }
    );
  }
}