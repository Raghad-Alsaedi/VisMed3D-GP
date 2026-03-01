
import { NextResponse } from "next/server";
import { db } from "@/database/db";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params;

    const [[doctorRow]]: any = await db.query(
      `SELECT doctor_id FROM users WHERE id = ? AND role = 'doctor' LIMIT 1`,
      [userId]
    );

    if (!doctorRow?.doctor_id) {
      return NextResponse.json(
        { status: "error", message: "Doctor not found" },
        { status: 404 }
      );
    }

    const [rows] = await db.query(
      `SELECT
         r.report_id,
         a.accession_number,
         COALESCE(r.body_part, '')  AS body_part,
         r.doctor_name,
         CONCAT_WS(' ',
           pu.first_name,
           pu.middle_name,
           pu.last_name
         )                          AS patient_name,
         a.modality,
         a.exam_date,
         r.report_status,
         r.created_at,
         r.signed_at
       FROM reports r
       JOIN accession a  ON a.accession_id = r.accession_id
       JOIN patients  p  ON p.patient_id   = a.patient_id
       JOIN users     pu ON pu.patient_id  = p.patient_id
       WHERE r.doctor_id = ?
       GROUP BY r.report_id
       ORDER BY r.created_at DESC`,
      [doctorRow.doctor_id]
    );

    return NextResponse.json({ status: "ok", reports: rows });
  } catch (err) {
    console.error("Doctor reports GET error:", err);
    return NextResponse.json(
      { status: "error", message: "Failed to fetch reports" },
      { status: 500 }
    );
  }
}