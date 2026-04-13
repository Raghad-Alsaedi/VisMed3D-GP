import { NextResponse } from "next/server";
import { db } from "@/database/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const role = searchParams.get("role") || "";

    let sql = "";
    const params: string[] = [];

    if (role === "patient") {
      sql = `
        SELECT
          u.id,
          u.first_name         AS firstName,
          u.middle_name        AS middleName,
          u.last_name          AS lastName,
          u.gender,
          u.is_active          AS isActive,
          u.username,
          u.email,
          u.phone,
          u.profile_picture    AS profilePicture,
          u.created_at         AS createdAt,
          u.updated_at         AS updatedAt,
          COALESCE(p.medical_record_number, '') AS mrn,
          COALESCE(p.national_id, '')           AS nationalId,
          COALESCE(p.date_of_birth, '')         AS dateOfBirth,
          COALESCE(
            (SELECT CONCAT(du.first_name, ' ', du.last_name)
             FROM doctor_patient_assignments dpa
             JOIN users du ON du.doctor_id = dpa.doctor_id
             WHERE dpa.patient_id = p.patient_id
             LIMIT 1), '—'
          ) AS doctorName,
          COALESCE(
            (SELECT CONCAT(tu.first_name, ' ', tu.last_name)
             FROM technician_patient_assignments tpa
             JOIN users tu ON tu.technician_id = tpa.technician_id
             WHERE tpa.patient_id = p.patient_id
             LIMIT 1), '—'
          ) AS techName
        FROM users u
        LEFT JOIN patients p ON u.patient_id = p.patient_id
        WHERE u.role = 'patient'
        ORDER BY u.id DESC`;

    } else if (role === "doctor") {
      sql = `
        SELECT
          u.id,
          u.first_name         AS firstName,
          u.middle_name        AS middleName,
          u.last_name          AS lastName,
          u.gender,
          u.is_active          AS isActive,
          u.username,
          u.email,
          u.phone,
          u.profile_picture    AS profilePicture,
          u.created_at         AS createdAt,
          u.updated_at         AS updatedAt,
          COALESCE(dp.specialty,        '') AS specialty,
          COALESCE(dp.doctor_code,      '') AS doctorCode,
          COALESCE(dp.license_number,   '') AS licenseNumber,
          COALESCE(dp.years_experience,  0) AS yearsExperience
        FROM users u
        LEFT JOIN doctors d          ON u.doctor_id = d.doctor_id
        LEFT JOIN doctor_profiles dp ON d.doctor_id = dp.doctor_id
        WHERE u.role = 'doctor'
        ORDER BY u.id DESC`;

    } else if (role === "technician") {
      sql = `
        SELECT
          u.id,
          u.first_name         AS firstName,
          u.middle_name        AS middleName,
          u.last_name          AS lastName,
          u.gender,
          u.is_active          AS isActive,
          u.username,
          u.email,
          u.phone,
          u.profile_picture    AS profilePicture,
          u.created_at         AS createdAt,
          u.updated_at         AS updatedAt,
          COALESCE(tp.specialty,        '') AS specialty,
          COALESCE(tp.technician_code,  '') AS technicianCode,
          COALESCE(tp.license_number,   '') AS licenseNumber,
          COALESCE(tp.years_experience,  0) AS yearsExperience
        FROM users u
        LEFT JOIN technicians t          ON u.technician_id = t.technician_id
        LEFT JOIN technician_profiles tp ON t.technician_id = tp.technician_id
        WHERE u.role = 'technician'
        ORDER BY u.id DESC`;

    } else {
      sql = `
        SELECT
          u.id,
          u.first_name AS firstName,
          u.last_name  AS lastName,
          u.gender,
          u.is_active  AS isActive,
          u.role,
          COALESCE(p.medical_record_number, '') AS mrn
        FROM users u
        LEFT JOIN patients p ON u.patient_id = p.patient_id
        WHERE u.role != 'admin'
        ORDER BY u.id DESC`;
    }

    const [rows] = await db.query(sql, params);
    return NextResponse.json({ status: "ok", users: rows });
  } catch (err) {
    console.error("Admin users GET error:", err);
    return NextResponse.json({ status: "error", message: "Failed to fetch users" }, { status: 500 });
  }
}

// DELETE : remove a user and their role-specific record 

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("id");
    if (!userId)
      return NextResponse.json({ status: "error", message: "User ID required" }, { status: 400 });

    // Determine the user's role before deleting
    const [[user]]: any = await db.query(
      `SELECT role, patient_id, doctor_id, technician_id FROM users WHERE id = ? AND role != 'admin'`,
      [userId]
    );

    if (!user)
      return NextResponse.json({ status: "error", message: "User not found" }, { status: 404 });

    // Delete the role-specific record first (cascade handles the rest)
    if (user.role === "doctor" && user.doctor_id)
      await db.query(`DELETE FROM doctors WHERE doctor_id = ?`, [user.doctor_id]);
    else if (user.role === "technician" && user.technician_id)
      await db.query(`DELETE FROM technicians WHERE technician_id = ?`, [user.technician_id]);
    else if (user.role === "patient" && user.patient_id)
      await db.query(`DELETE FROM patients WHERE patient_id = ?`, [user.patient_id]);
    else
      await db.query(`DELETE FROM users WHERE id = ?`, [userId]);

    return NextResponse.json({ status: "ok", message: "User deleted successfully" });
  } catch (err) {
    console.error("Admin users DELETE error:", err);
    return NextResponse.json({ status: "error", message: "Failed to delete user" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, role, password, ...fields } = body;

    if (!id || !role)
      return NextResponse.json(
        { status: "error", message: "id and role are required" },
        { status: 400 }
      );

    const toSnake: Record<string, string> = {
      firstName:       "first_name",
      middleName:      "middle_name",
      lastName:        "last_name",
      isActive:        "is_active",
      email:           "email",
      phone:           "phone",
      gender:          "gender",
      username:        "username",
      dateOfBirth:     "date_of_birth",
      nationalId:      "national_id",
      doctorCode:      "doctor_code",
      technicianCode:  "technician_code",
      licenseNumber:   "license_number",
      yearsExperience: "years_experience",
      specialty:       "specialty",
    };

    const allowedUserFields = ["first_name", "middle_name", "last_name", "gender", "email", "phone", "is_active", "username"];
    const userUpdates: Record<string, unknown> = {};

    Object.entries(fields).forEach(([k, v]) => {
      const snake = toSnake[k] ?? k;
      if (allowedUserFields.includes(snake)) userUpdates[snake] = v;
    });

    if (password && String(password).trim() !== "") {
      const bcrypt = await import("bcrypt");
      userUpdates.password_hash = await bcrypt.hash(password, 10);
    }

    if (Object.keys(userUpdates).length > 0) {
      const set    = Object.keys(userUpdates).map((k) => `${k} = ?`).join(", ");
      const values = [...Object.values(userUpdates), id];
      await db.query(`UPDATE users SET ${set} WHERE id = ?`, values);
    }

    if (role === "patient") {
      const [[row]]: any = await db.query(`SELECT patient_id FROM users WHERE id = ? LIMIT 1`, [id]);
      if (row?.patient_id) {
        const allowedPatient = ["national_id", "date_of_birth"];
        const upd: Record<string, unknown> = {};
        Object.entries(fields).forEach(([k, v]) => {
          const snake = toSnake[k] ?? k;
          if (allowedPatient.includes(snake)) upd[snake] = v;
        });
        if (Object.keys(upd).length > 0) {
          const set = Object.keys(upd).map((k) => `${k} = ?`).join(", ");
          await db.query(`UPDATE patients SET ${set} WHERE patient_id = ?`, [...Object.values(upd), row.patient_id]);
        }
      }

    } else if (role === "doctor") {
      const [[row]]: any = await db.query(`SELECT doctor_id FROM users WHERE id = ? LIMIT 1`, [id]);
      if (row?.doctor_id) {
        const allowedDoctor = ["doctor_code", "specialty", "license_number", "years_experience"];
        const upd: Record<string, unknown> = {};
        Object.entries(fields).forEach(([k, v]) => {
          const snake = toSnake[k] ?? k;
          if (allowedDoctor.includes(snake)) upd[snake] = v;
        });
        if (Object.keys(upd).length > 0) {
          const set = Object.keys(upd).map((k) => `${k} = ?`).join(", ");
          await db.query(`UPDATE doctor_profiles SET ${set} WHERE doctor_id = ?`, [...Object.values(upd), row.doctor_id]);
        }
      }

    } else if (role === "technician") {
      const [[row]]: any = await db.query(`SELECT technician_id FROM users WHERE id = ? LIMIT 1`, [id]);
      if (row?.technician_id) {
        const allowedTech = ["technician_code", "specialty", "license_number", "years_experience"];
        const upd: Record<string, unknown> = {};
        Object.entries(fields).forEach(([k, v]) => {
          const snake = toSnake[k] ?? k;
          if (allowedTech.includes(snake)) upd[snake] = v;
        });
        if (Object.keys(upd).length > 0) {
          const set = Object.keys(upd).map((k) => `${k} = ?`).join(", ");
          await db.query(`UPDATE technician_profiles SET ${set} WHERE technician_id = ?`, [...Object.values(upd), row.technician_id]);
        }
      }
    }

    return NextResponse.json({ status: "ok", message: "Updated successfully" });
  } catch (err) {
    console.error("Admin users PATCH error:", err);
    return NextResponse.json({ status: "error", message: "Failed to update user" }, { status: 500 });
  }
}