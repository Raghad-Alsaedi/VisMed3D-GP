import { NextResponse } from "next/server";
import { db } from "@/database/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const doctorId = searchParams.get("doctorId"); 
    
    console.log("🔵 Dashboard API called with doctorId:", doctorId); // ← Debug
    
    if (!doctorId) {
      return NextResponse.json({ error: "doctorId is required" }, { status: 400 });
    }
    
    // 1) Doctor Card
    console.log("🔵 Fetching doctor data..."); // ← Debug
    
    const [docRows]: any = await db.query(
      `
      SELECT
        u.id AS doctor_id,
        u.first_name AS firstName,
        u.middle_name AS middleName,
        u.last_name AS lastName,
        u.gender,
        u.phone,
        dp.doctor_code,
        dp.license_number,
        dp.years_experience,
        dp.specialty,
        dp.profile_image_url
      FROM users u
      JOIN doctor_profiles dp ON dp.doctor_id = u.doctor_id
      WHERE u.id = ? AND u.role = 'doctor'
      LIMIT 1
      `,
      [doctorId]
    );
    
    console.log("🔵 Doctor query result:", docRows); // ← Debug
    
    const doctor = docRows?.[0];
    if (!doctor) {
      console.log("❌ Doctor not found"); // ← Debug
      return NextResponse.json({ error: "Doctor not found" }, { status: 404 });
    }
    
    // 2) My Patients
    console.log("🔵 Fetching patients..."); // ← Debug
    
    const [patientRows]: any = await db.query(
      `
      SELECT
        p.patient_id,
        CONCAT(u.first_name, ' ', IFNULL(u.last_name, '')) AS patient_name,
        u.profile_picture AS profile_image_url,
        a.accession_number AS accession,
        p.medical_record_number AS mrn,
        a.exam_date AS study_date,
        IFNULL(r.report_status, 'Draft') AS report_status,
        r.body_part,
        a.accession_id AS study_id
      FROM doctor_patient_assignments dpa
      JOIN patients p ON p.patient_id = dpa.patient_id
      JOIN users u ON u.patient_id = p.patient_id
      LEFT JOIN (
        SELECT patient_id, MAX(accession_id) AS last_accession_id
        FROM accession
        GROUP BY patient_id
      ) last_acc ON last_acc.patient_id = p.patient_id
      LEFT JOIN accession a ON a.accession_id = last_acc.last_accession_id
      LEFT JOIN reports r ON r.accession_id = a.accession_id
      WHERE dpa.doctor_id = (SELECT doctor_id FROM users WHERE id = ?)
      ORDER BY p.patient_id ASC
      `,
      [doctorId]
    );
    
    console.log("🔵 Patients query result:", patientRows?.length || 0, "patients"); // ← Debug
    
    return NextResponse.json({ doctor, patients: patientRows });
  } catch (err) {
    console.error("❌ Dashboard API Error:", err);
    return NextResponse.json({ 
      error: "Server error", 
      details: err instanceof Error ? err.message : String(err) 
    }, { status: 500 });
  }
}