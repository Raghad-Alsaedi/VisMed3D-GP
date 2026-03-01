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
          u.first_name,
          u.middle_name,
          u.last_name,
          u.gender,
          u.is_active,
          u.username,
          u.email,
          u.phone,
          u.profile_picture,
          u.created_at,
          u.updated_at,
          COALESCE(p.medical_record_number, '') AS mrn,
          COALESCE(p.national_id, '')           AS national_id,
          COALESCE(p.date_of_birth, '')         AS date_of_birth,
          COALESCE(
            (SELECT CONCAT(du.first_name, ' ', du.last_name)
             FROM doctor_patient_assignments dpa
             JOIN users du ON du.doctor_id = dpa.doctor_id
             WHERE dpa.patient_id = p.patient_id
             LIMIT 1), '—'
          ) AS doctor_name,
          COALESCE(
            (SELECT CONCAT(tu.first_name, ' ', tu.last_name)
             FROM technician_patient_assignments tpa
             JOIN users tu ON tu.technician_id = tpa.technician_id
             WHERE tpa.patient_id = p.patient_id
             LIMIT 1), '—'
          ) AS tech_name
        FROM users u
        LEFT JOIN patients p ON u.patient_id = p.patient_id
        WHERE u.role = 'patient'
        ORDER BY u.id DESC`;

    } else if (role === "doctor") {
      sql = `
        SELECT
          u.id,
          u.first_name,
          u.middle_name,
          u.last_name,
          u.gender,
          u.is_active,
          u.username,
          u.email,
          u.phone,
          u.profile_picture,
          u.created_at,
          u.updated_at,
          COALESCE(dp.specialty,        '') AS specialty,
          COALESCE(dp.doctor_code,      '') AS doctor_code,
          COALESCE(dp.license_number,   '') AS license_number,
          COALESCE(dp.years_experience,  0) AS years_experience
        FROM users u
        LEFT JOIN doctors d          ON u.doctor_id = d.doctor_id
        LEFT JOIN doctor_profiles dp ON d.doctor_id = dp.doctor_id
        WHERE u.role = 'doctor'
        ORDER BY u.id DESC`;

    } else if (role === "technician") {
      sql = `
        SELECT
          u.id,
          u.first_name,
          u.middle_name,
          u.last_name,
          u.gender,
          u.is_active,
          u.username,
          u.email,
          u.phone,
          u.profile_picture,
          u.created_at,
          u.updated_at,
          COALESCE(tp.specialty,        '') AS specialty,
          COALESCE(tp.technician_code,  '') AS technician_code,
          COALESCE(tp.license_number,   '') AS license_number,
          COALESCE(tp.years_experience,  0) AS years_experience
        FROM users u
        LEFT JOIN technicians t          ON u.technician_id = t.technician_id
        LEFT JOIN technician_profiles tp ON t.technician_id = tp.technician_id
        WHERE u.role = 'technician'
        ORDER BY u.id DESC`;

    } else {
      sql = `
        SELECT
          u.id, u.first_name, u.last_name, u.gender, u.is_active, u.role,
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

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("id");
    if (!userId)
      return NextResponse.json({ status: "error", message: "User ID required" }, { status: 400 });

    const [[user]]: any = await db.query(
      `SELECT role, patient_id, doctor_id, technician_id FROM users WHERE id = ? AND role != 'admin'`,
      [userId]
    );

    if (!user)
      return NextResponse.json({ status: "error", message: "User not found" }, { status: 404 });

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
    const body                          = await req.json();
    const { id, role, password, ...fields } = body;

    if (!id || !role)
      return NextResponse.json(
        { status: "error", message: "id and role are required" },
        { status: 400 }
      );

    const allowedUserFields = ["first_name", "middle_name", "last_name", "gender", "email", "phone", "is_active", "username"];
    const userUpdates: Record<string, unknown> = {};
    allowedUserFields.forEach((f) => { if (f in fields) userUpdates[f] = fields[f]; });

    if (password && String(password).trim() !== "") {
      const bcrypt              = await import("bcrypt");
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
        const allowed = ["national_id", "date_of_birth"];
        const upd: Record<string, unknown> = {};
        allowed.forEach((f) => { if (f in fields) upd[f] = fields[f]; });
        if (Object.keys(upd).length > 0) {
          const set = Object.keys(upd).map((k) => `${k} = ?`).join(", ");
          await db.query(`UPDATE patients SET ${set} WHERE patient_id = ?`, [...Object.values(upd), row.patient_id]);
        }
      }

    } else if (role === "doctor") {
      const [[row]]: any = await db.query(`SELECT doctor_id FROM users WHERE id = ? LIMIT 1`, [id]);
      if (row?.doctor_id) {
        const allowed = ["doctor_code", "specialty", "license_number", "years_experience"];
        const upd: Record<string, unknown> = {};
        allowed.forEach((f) => { if (f in fields) upd[f] = fields[f]; });
        if (Object.keys(upd).length > 0) {
          const set = Object.keys(upd).map((k) => `${k} = ?`).join(", ");
          await db.query(`UPDATE doctor_profiles SET ${set} WHERE doctor_id = ?`, [...Object.values(upd), row.doctor_id]);
        }
      }

    } else if (role === "technician") {
      const [[row]]: any = await db.query(`SELECT technician_id FROM users WHERE id = ? LIMIT 1`, [id]);
      if (row?.technician_id) {
        const allowed = ["technician_code", "specialty", "license_number", "years_experience"];
        const upd: Record<string, unknown> = {};
        allowed.forEach((f) => { if (f in fields) upd[f] = fields[f]; });
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