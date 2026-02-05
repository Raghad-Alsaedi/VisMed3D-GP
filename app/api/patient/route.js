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

    console.log("🔍 Fetching patient data for user_id:", userId);

    const [rows] = await db.query(
      `
      SELECT 
        u.id,
        u.firstName,
        u.middleName,
        u.lastName,
        u.gender,
        u.phone,
        u.profile_picture,
        p.patient_code,
        p.dob,
        TIMESTAMPDIFF(YEAR, p.dob, CURDATE()) AS age
      FROM users u
      JOIN patient_accounts pa ON pa.user_id = u.id
      JOIN patients p ON p.id = pa.patient_id
      WHERE u.id = ?
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

    const [studies] = await db.query(
      `
      SELECT 
        s.id,
        s.created_at,
        s.body_part,
        CONCAT(doctor.firstName, ' ', doctor.lastName) AS doctor_name
      FROM studies s
      JOIN patient_accounts pa ON pa.patient_id = s.patient_id
      JOIN reports r ON r.study_id = s.id
      JOIN users doctor ON doctor.id = r.doctor_id
      WHERE pa.user_id = ?
      ORDER BY s.created_at DESC
      `,
      [userId]
    );

    console.log("✅ Patient data found:", patient);
    console.log("✅ Studies found:", studies.length);

    return NextResponse.json({
      status: "ok",
      patient: {
        id: patient.id,
        fullName: `${patient.firstName} ${patient.middleName || ""} ${patient.lastName}`.trim(),
        firstName: patient.firstName,
        lastName: patient.lastName,
        nationalId: patient.patient_code,
        age: patient.age,
        gender: patient.gender === "M" ? "Male" : "Female",
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