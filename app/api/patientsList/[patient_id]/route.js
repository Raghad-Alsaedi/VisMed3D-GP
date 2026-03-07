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
        p.patient_id,
        CONCAT(u.first_name, ' ', u.last_name) AS full_name,
        p.medical_record_number,
        p.national_id,
        u.gender,
        u.phone,
        u.profile_picture,
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

    const patient = patientRows[0];

    const [accessions] = await db.query(
      `
      SELECT 
        a.accession_id,
        a.accession_number,
        a.exam_date,
        a.modality,
        r.body_part,
        r.report_text AS report_content,
        r.report_status,
        v.id AS volume_id
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
      status: "ok",
      patient: {
        id:              patient.patient_id,
        full_name:       patient.full_name,
        national_id:     patient.national_id,
        mrn:             patient.medical_record_number,
        age:             patient.age,
        gender:          patient.gender === "male" ? "Male" : "Female",
        phone:           patient.phone,
        profile_picture: patient.profile_picture,
      },
      accessions: accessions.map(acc => {
        let normalizedStatus = "draft";
        if (acc.report_status) {
          if (acc.report_status.toLowerCase() === "completed") {
            normalizedStatus = "completed";
          }
        }
        return {
          accession_id:     acc.accession_id,
          accession_number: acc.accession_number,
          exam_date:        new Date(acc.exam_date).toLocaleDateString("en-GB", {
            day:   "2-digit",
            month: "short",
            year:  "numeric",
          }),
          modality:       acc.modality,
          body_part:      acc.body_part      || "N/A",
          report_content: acc.report_content || "",
          report_status:  normalizedStatus,
          volume_id:      acc.volume_id ?? null,
        };
      }),
    });

  } catch (err) {
    console.error("GET PATIENT ERROR:", err);
    return NextResponse.json(
      { status: "error", message: "Server error" },
      { status: 500 }
    );
  }
}