import { NextResponse } from "next/server";
import { db } from "@/database/db.js";

export async function GET(req) {
  try {
    const userId = req.cookies.get("user_id")?.value;

    if (!userId) {
      return NextResponse.json(
        { status: "error", message: "Not authenticated" },
        { status: 401 }
      );
    }

    console.log("Fetching patient data for user_id:", userId);

    // ✅ استعلام معدّل بناءً على الجداول الجديدة
    const [rows] = await db.query(
      `
      SELECT 
        u.user_id,
        p.first_name,
        p.middle_name,
        p.last_name,
        p.gender,
        p.phone,
        p.profile_picture,
        p.national_id,
        p.date_of_birth,
        TIMESTAMPDIFF(YEAR, p.date_of_birth, CURDATE()) AS age
      FROM users u
      JOIN patients p ON p.patient_id = u.patient_id
      WHERE u.user_id = ? AND u.role = 'patient'
      LIMIT 1
      `,
      [userId]
    );

    if (!rows.length) {
      return NextResponse.json(
        { status: "error", message: "Patient not found" },
        { status: 404 }
      );
    }

    const patient = rows[0];

    // ✅ جلب الفحوصات (studies)
    const [studies] = await db.query(
      `
      SELECT 
        a.accession_id AS id,
        a.exam_date AS created_at,
        a.body_part,
        CONCAT(d.first_name, ' ', d.last_name) AS doctor_name
      FROM accession a
      JOIN reports r ON r.accession_id = a.accession_id
      JOIN doctors d ON d.doctor_id = r.doctor_id
      JOIN users u ON u.patient_id = a.patient_id
      WHERE u.user_id = ?
      ORDER BY a.exam_date DESC
      `,
      [userId]
    );

    console.log("Patient data found:", patient);
    console.log("Studies found:", studies.length);

    return NextResponse.json({
      status: "ok",
      patient: {
        id: patient.user_id,
        fullName: `${patient.first_name} ${patient.middle_name || ""} ${patient.last_name}`.trim(),
        firstName: patient.first_name,
        lastName: patient.last_name,
        nationalId: patient.national_id,
        age: patient.age,
        gender: patient.gender === "male" ? "Male" : "Female",
        phone: patient.phone,
        profilePicture: patient.profile_picture,
      },
      studies: studies.map((study, index) => ({
        number: index + 1,
        id: study.id,
        date: new Date(study.created_at).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
        doctorName: study.doctor_name,
        bodyPart: study.body_part || "N/A",
      })),
    });
  } catch (err) {
    console.error("💥 GET PATIENT ERROR:", err);
    return NextResponse.json(
      { status: "error", message: "Server error" },
      { status: 500 }
    );
  }
}