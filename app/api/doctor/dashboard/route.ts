import { NextResponse } from "next/server";
import { db } from "@/database/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const doctorId = searchParams.get("doctorId");

    if (!doctorId) {
      return NextResponse.json({ error: "doctorId is required" }, { status: 400 });
    }

    const [docRows]: any = await db.query(
      `
      SELECT
        u.id                  AS userId,
        u.doctor_id           AS doctorId,
        u.first_name          AS firstName,
        u.middle_name         AS middleName,
        u.last_name           AS lastName,
        u.gender,
        u.phone,
        dp.doctor_code        AS doctorCode,
        dp.license_number     AS licenseNumber,
        dp.years_experience   AS yearsExperience,
        dp.specialty,
        dp.signature_path     AS signaturePath
      FROM users u
      JOIN doctor_profiles dp ON dp.doctor_id = u.doctor_id
WHERE u.doctor_id = ? AND u.role = 'doctor'
      LIMIT 1
      `,
      [doctorId]
    );

    const doctor = docRows?.[0];
    if (!doctor) {
      return NextResponse.json({ error: "Doctor not found" }, { status: 404 });
    }

    doctor.signatureUrl = doctor.signaturePath?.trim()
      ? `/api/signatures/${doctor.signaturePath}`
      : null;

    const [patientRows]: any = await db.query(
      `
      SELECT
        p.patient_id                                        AS patientId,
        CONCAT(u.first_name, ' ', IFNULL(u.last_name, '')) AS patientName,
        a.accession_number                                  AS accession,
        p.medical_record_number                             AS mrn,
        a.accession_id                                      AS accessionId,
        IFNULL(r.report_status, 'Draft')                    AS reportStatus
      FROM doctor_patient_assignments dpa
      JOIN patients p ON p.patient_id = dpa.patient_id
      JOIN users u ON u.patient_id = p.patient_id
      LEFT JOIN (
        SELECT patient_id, MAX(accession_id) AS last_accession_id
        FROM accession
        GROUP BY patient_id
      ) last_acc ON last_acc.patient_id = p.patient_id
      LEFT JOIN accession a ON a.accession_id = last_acc.last_accession_id
      LEFT JOIN reports r ON r.report_id = (
        SELECT report_id
        FROM reports
        WHERE accession_id = a.accession_id
        ORDER BY report_id DESC
        LIMIT 1
      )
      WHERE dpa.doctor_id = ?
      ORDER BY p.patient_id ASC
      `,
      [doctorId]
    );

    return NextResponse.json({ doctor, patients: patientRows });

  } catch (err) {
    console.error("Dashboard API Error:", err);
    return NextResponse.json({
      error: "Server error",
      details: err instanceof Error ? err.message : String(err),
    }, { status: 500 });
  }
}