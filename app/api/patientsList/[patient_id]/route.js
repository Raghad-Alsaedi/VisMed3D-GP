import { NextResponse } from "next/server";
import { db } from "@/database/db.js";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions"; 

export async function GET(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { status: "error", message: "Not authenticated" },
        { status: 401 }
      );
    }

    const { patient_id } = await params;

    if (!patient_id) {
      return NextResponse.json(
        { status: "error", message: "patient_id is required" },
        { status: 400 }
      );
    }

    const [patientRows] = await db.query(
      `
      SELECT 
        p.patient_id            AS id,
        CONCAT(u.first_name, ' ',
               u.last_name)     AS fullName,
        p.medical_record_number AS mrn,
        p.national_id           AS nationalId,
        u.gender,
        u.phone,
        TIMESTAMPDIFF(YEAR, p.date_of_birth, CURDATE()) AS age
      FROM patients p
      JOIN users u ON u.patient_id = p.patient_id
      WHERE p.patient_id = ?
      LIMIT 1
      `,
      [patient_id]
    );

    if (!patientRows.length) {
      return NextResponse.json(
        { status: "error", message: "Patient not found" },
        { status: 404 }
      );
    }

    const [accessions] = await db.query(
      `
      SELECT 
        a.accession_id     AS accessionId,
        a.accession_number AS accessionNumber,
        a.exam_date        AS examDate,
        a.modality,
        r.body_part        AS bodyPart,
        r.report_text      AS reportContent,
        r.report_status    AS reportStatus,
        v.id               AS volumeId
      FROM accession a
      LEFT JOIN reports r ON r.report_id = (
        SELECT report_id 
        FROM reports
        WHERE accession_id = a.accession_id
        ORDER BY report_id DESC
        LIMIT 1
      )
      LEFT JOIN volumes v ON v.id = (
        SELECT id FROM volumes
        WHERE accession_id = a.accession_id AND status = 'READY'
        ORDER BY uploaded_at DESC
        LIMIT 1
      )
      WHERE a.patient_id = ?
      ORDER BY a.exam_date DESC
      `,
      [patient_id]
    );

    return NextResponse.json({
      status:     "ok",
      patient:    patientRows[0],
      accessions,
    });

  } catch (err) {
    console.error("GET PATIENT ERROR:", err);
    return NextResponse.json(
      { status: "error", message: "Server error" },
      { status: 500 }
    );
  }
}