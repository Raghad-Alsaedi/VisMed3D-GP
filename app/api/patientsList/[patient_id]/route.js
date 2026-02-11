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

    const resolvedParams = await params;
    const patient_id = resolvedParams.patient_id;

    console.log("Received patient_id:", patient_id);

    if (!patient_id) {
      console.error("No patient_id provided");
      return NextResponse.json(
        { status: "error", message: "patient_id is required" },
        { status: 400 }
      );
    }

    console.log("Fetching patient data for patient_id:", patient_id);

    const [patientRows] = await db.query(
      `
      SELECT 
        p.patient_id,
        CONCAT(u.first_name, ' ', u.last_name) AS full_name,
        p.medical_record_number,
        p.national_id,
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

    console.log("Query result:", patientRows);

    if (!patientRows.length) {
      console.error("Patient not found for ID:", patient_id);
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
        a.body_part,
        r.report_content,
        r.report_status
      FROM accession a
      LEFT JOIN reports r ON r.accession_id = a.accession_id
      WHERE a.patient_id = ?
      ORDER BY a.exam_date DESC
      `,
      [patient_id]
    );

    console.log("Patient found with", accessions.length, "accessions");

    return NextResponse.json({
      status: "ok",
      patient: {
        id: patient.patient_id,
        full_name: patient.full_name,
        national_id: patient.national_id,
        mrn: patient.medical_record_number,
        age: patient.age,
        gender: patient.gender === "male" ? "Male" : "Female",
        phone: patient.phone
      },
      accessions: accessions.map(acc => ({
        accession_id: acc.accession_id,
        accession_number: acc.accession_number,
        exam_date: new Date(acc.exam_date).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric"
        }),
        modality: acc.modality,
        body_part: acc.body_part || "N/A",
        report_content: acc.report_content || "",
        report_status: acc.report_status || "pending"
      }))
    });

  } catch (err) {
    console.error("GET PATIENT ERROR:", err);
    return NextResponse.json(
      { status: "error", message: "Server error" },
      { status: 500 }
    );
  }
}