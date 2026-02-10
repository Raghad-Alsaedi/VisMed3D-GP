import { NextResponse } from "next/server";
import { db } from "@/database/db.js";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query");
    const userId = req.cookies.get("user_id")?.value;

    if (!userId) {
      return NextResponse.json(
        { status: "error", message: "Not authenticated" },
        { status: 401 }
      );
    }

    if (!query) {
      return NextResponse.json(
        { status: "ok", patients: [] }
      );
    }

    console.log("Searching for patients with query:", query);

    const [userRows] = await db.query(
      `SELECT role, doctor_id, technician_id FROM users WHERE user_id = ?`,
      [userId]
    );

    if (!userRows.length) {
      return NextResponse.json(
        { status: "error", message: "User not found" },
        { status: 404 }
      );
    }

    const user = userRows[0];
    let patients = [];

    const isNumeric = /^\d/.test(query);

    if (user.role === "doctor" && user.doctor_id) {
      if (isNumeric) {
        [patients] = await db.query(
          `
          SELECT 
            p.patient_id,
            CONCAT(u.first_name, ' ', u.last_name) AS full_name,
            p.medical_record_number,
            u.profile_picture
          FROM doctor_patient_assignments dpa
          JOIN patients p ON p.patient_id = dpa.patient_id
          JOIN users u ON u.patient_id = p.patient_id
          WHERE dpa.doctor_id = ? 
            AND p.medical_record_number LIKE ?
          `,
          [user.doctor_id, `%${query}%`]
        );
      } else {
        [patients] = await db.query(
          `
          SELECT 
            p.patient_id,
            CONCAT(u.first_name, ' ', u.last_name) AS full_name,
            p.medical_record_number,
            u.profile_picture
          FROM doctor_patient_assignments dpa
          JOIN patients p ON p.patient_id = dpa.patient_id
          JOIN users u ON u.patient_id = p.patient_id
          WHERE dpa.doctor_id = ? 
            AND (u.first_name LIKE ? OR u.last_name LIKE ?)
          `,
          [user.doctor_id, `${query}%`, `${query}%`]
        );
      }
    } else if (user.role === "technician" && user.technician_id) {
      if (isNumeric) {
        [patients] = await db.query(
          `
          SELECT 
            p.patient_id,
            CONCAT(u.first_name, ' ', u.last_name) AS full_name,
            p.medical_record_number,
            u.profile_picture
          FROM technician_patient_assignments tpa
          JOIN patients p ON p.patient_id = tpa.patient_id
          JOIN users u ON u.patient_id = p.patient_id
          WHERE tpa.technician_id = ? 
            AND p.medical_record_number LIKE ?
          `,
          [user.technician_id, `%${query}%`]
        );
      } else {
        [patients] = await db.query(
          `
          SELECT 
            p.patient_id,
            CONCAT(u.first_name, ' ', u.last_name) AS full_name,
            p.medical_record_number,
            u.profile_picture
          FROM technician_patient_assignments tpa
          JOIN patients p ON p.patient_id = tpa.patient_id
          JOIN users u ON u.patient_id = p.patient_id
          WHERE tpa.technician_id = ? 
            AND (u.first_name LIKE ? OR u.last_name LIKE ?)
          `,
          [user.technician_id, `${query}%`, `${query}%`]
        );
      }
    }

    console.log(`Found ${patients.length} patients`);

    return NextResponse.json({
      status: "ok",
      patients: patients.map(p => ({
        patient_id: p.patient_id,
        full_name: p.full_name,
        medical_record_number: p.medical_record_number,
        profile_picture: p.profile_picture
      }))
    });

  } catch (err) {
    console.error("SEARCH ERROR:", err);
    return NextResponse.json(
      { status: "error", message: "Server error" },
      { status: 500 }
    );
  }
}