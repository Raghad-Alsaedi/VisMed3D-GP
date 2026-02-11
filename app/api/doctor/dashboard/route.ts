import { NextResponse } from "next/server";
import { db } from "@/database/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions"; 

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const doctorId = searchParams.get("doctorId");

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    if (!doctorId) {
      return NextResponse.json({ error: "doctorId is required" }, { status: 400 });
    }

    const [docRows]: any = await db.query(
      `
      SELECT
        u.doctor_id,
        u.first_name,
        u.middle_name,
        u.last_name,
        u.gender,
        u.phone,
        dp.doctor_code,
        dp.license_number,
        dp.years_experience,
        dp.specialty,
        dp.profile_image_url
      FROM users u
      JOIN doctor_profiles dp ON dp.doctor_id = u.doctor_id
      WHERE u.id = ?
      LIMIT 1
      `,
      [doctorId]
    );

    const doctor = docRows?.[0];
    if (!doctor) {
      return NextResponse.json({ error: "Doctor not found" }, { status: 404 });
    }

    const [patientRows]: any = await db.query(
      `
      SELECT
        p.patient_id,
        CONCAT(pu.first_name, ' ', pu.last_name) AS patient_name,
        pu.profile_picture AS profile_image_url,
        a.accession_number AS accession,
        p.medical_record_number AS mrn,
        a.exam_date AS study_date,
        'pending' AS report_status,
        a.body_part,
        a.accession_id AS study_id
      FROM doctor_patient_assignments dpa
      JOIN patients p ON p.patient_id = dpa.patient_id
      JOIN users pu ON pu.patient_id = p.patient_id
      LEFT JOIN (
        SELECT 
          patient_id, 
          accession_number,
          exam_date,
          body_part,
          accession_id,
          ROW_NUMBER() OVER (PARTITION BY patient_id ORDER BY accession_id DESC) as rn
        FROM accession
      ) a ON a.patient_id = p.patient_id AND a.rn = 1
      WHERE dpa.doctor_id = (SELECT doctor_id FROM users WHERE id = ? LIMIT 1)
      ORDER BY p.patient_id ASC
      `,
      [doctorId]
    );

    return NextResponse.json({ doctor, patients: patientRows });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}