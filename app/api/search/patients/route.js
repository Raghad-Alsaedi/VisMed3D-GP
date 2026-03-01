import { NextResponse } from "next/server";
import { db } from "@/database/db.js";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions"; 

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query");
    
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json(
        { status: "error", message: "Not authenticated" },
        { status: 401 }
      );
    }

    console.log(" Query:", query);

    const [userRows] = await db.query(
      `SELECT role, doctor_id, technician_id FROM users WHERE id = ?`,
      [userId]
    );

    if (!userRows.length) {
      return NextResponse.json(
        { status: "error", message: "User not found" },
        { status: 404 }
      );
    }

    const user = userRows[0];
    console.log("User:", { role: user.role, doctor_id: user.doctor_id, technician_id: user.technician_id });
    
    let patients = [];

    if (!query || query.trim() === "") {
      if (user.role === "doctor" && user.doctor_id) {
        [patients] = await db.query(
          `
          SELECT 
            p.patient_id,
            CONCAT(u.first_name, ' ', u.last_name) AS full_name,
            p.medical_record_number,
            u.profile_picture
          FROM doctor_patient_assignments dpa
          INNER JOIN patients p ON p.patient_id = dpa.patient_id
          INNER JOIN users u ON u.patient_id = p.patient_id
          WHERE dpa.doctor_id = ?
          ORDER BY p.patient_id ASC
          `,
          [user.doctor_id]
        );
      } else if (user.role === "technician" && user.technician_id) {
        [patients] = await db.query(
          `
          SELECT 
            p.patient_id,
            CONCAT(u.first_name, ' ', u.last_name) AS full_name,
            p.medical_record_number,
            u.profile_picture
          FROM technician_patient_assignments tpa
          INNER JOIN patients p ON p.patient_id = tpa.patient_id
          INNER JOIN users u ON u.patient_id = p.patient_id
          WHERE tpa.technician_id = ?
          ORDER BY p.patient_id ASC
          `,
          [user.technician_id]
        );
      }
    } else {
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
            INNER JOIN patients p ON p.patient_id = dpa.patient_id
            INNER JOIN users u ON u.patient_id = p.patient_id
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
            INNER JOIN patients p ON p.patient_id = dpa.patient_id
            INNER JOIN users u ON u.patient_id = p.patient_id
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
            INNER JOIN patients p ON p.patient_id = tpa.patient_id
            INNER JOIN users u ON u.patient_id = p.patient_id
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
            INNER JOIN patients p ON p.patient_id = tpa.patient_id
            INNER JOIN users u ON u.patient_id = p.patient_id
            WHERE tpa.technician_id = ? 
              AND (u.first_name LIKE ? OR u.last_name LIKE ?)
            `,
            [user.technician_id, `${query}%`, `${query}%`]
          );
        }
      }
    }

    console.log(`get ${patients.length} patient`);
    
    patients.forEach((patient, index) => {
      console.log(`patient ${index + 1}:`, {
        id: patient.patient_id,
        name: patient.full_name,
        mrn: patient.medical_record_number,
        picture: patient.profile_picture || " NULL"
      });
    });

    return NextResponse.json({
      status: "ok",
      patients: patients.map(p => ({
        patient_id: p.patient_id,
        full_name: p.full_name,
        medical_record_number: p.medical_record_number,
        profile_picture: p.profile_picture || "picture/profiles/default-avatar.png"
      }))
    });

  } catch (err) {
    console.error(" Error: ", err);
    return NextResponse.json(
      { status: "error", message: "Server error", error: err.message },
      { status: 500 }
    );
  }
}