// app/api/admin/users/create/route.ts
import { NextResponse } from "next/server";
import { db } from "@/database/db";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const type             = formData.get("type")            as string;
    const first_name       = formData.get("first_name")      as string;
    const middle_name      = formData.get("middle_name")     as string | null;
    const last_name        = formData.get("last_name")       as string;
    const gender           = formData.get("gender")          as string;
    const username         = formData.get("username")        as string;
    const password         = formData.get("password")        as string;
    const email            = formData.get("email")           as string;
    const phone            = formData.get("phone")           as string;
    const is_active        = formData.get("is_active") as string ?? "1";
    const imageFile        = formData.get("profile_picture") as File | null;

    const bcrypt        = await import("bcrypt");
    const password_hash = await bcrypt.hash(password, 10);

    const prefix =
      type === "doctor"     ? "doctor"  :
      type === "technician" ? "tech"    : "patient";

    // ── Helper: save image using role-specific ID ──────────
    // Called AFTER we get the insertId so filename = e.g. doctor_3, patient_5
    const saveImage = async (roleId: number): Promise<string | null> => {
      if (!imageFile || imageFile.size === 0) return null;
      const ext      = imageFile.name.split(".").pop()?.toLowerCase() ?? "jpg";
      const fileId   = `${prefix}_${roleId}`;               // e.g. doctor_3, patient_5, tech_2
      const fileName = `${fileId}.${ext}`;
      const dir      = path.join(process.cwd(), "picture", "profiles");
      await mkdir(dir, { recursive: true });
      const buffer   = Buffer.from(await imageFile.arrayBuffer());
      await writeFile(path.join(dir, fileName), buffer);
      return `api/images/${fileId}`;
    };

    // ── Patient ────────────────────────────────────────────
    if (type === "patient") {
      const national_id   = formData.get("national_id")   as string;
      const date_of_birth = formData.get("date_of_birth") as string;
      const assign_doctor = formData.get("assign_doctor") as string | null;
      const assign_tech   = formData.get("assign_tech")   as string | null;

      const patient_code = `P-${Date.now()}`;

      const [patResult]: any = await db.query(
        `INSERT INTO patients (medical_record_number, national_id, date_of_birth, patient_code)
         VALUES (NULL, ?, ?, ?)`,
        [national_id, date_of_birth, patient_code]
      );
      const patient_id = patResult.insertId;

      // Save image now that we have patient_id → filename: patient_5.jpg
      const profile_picture = await saveImage(patient_id);

      await db.query(
        `INSERT INTO users (username, password_hash, role, first_name, middle_name, last_name, gender, email, phone, profile_picture, is_active, patient_id)
         VALUES (?, ?, 'patient', ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [username, password_hash, first_name, middle_name || null, last_name, gender, email, phone, profile_picture, is_active, patient_id]
      );

      if (assign_doctor) {
        const [[docUser]]: any = await db.query(
          `SELECT doctor_id FROM users WHERE id = ? LIMIT 1`, [assign_doctor]
        );
        if (docUser?.doctor_id) {
          await db.query(
            `INSERT IGNORE INTO doctor_patient_assignments (doctor_id, patient_id) VALUES (?, ?)`,
            [docUser.doctor_id, patient_id]
          );
        }
      }

      if (assign_tech) {
        const [[techUser]]: any = await db.query(
          `SELECT technician_id FROM users WHERE id = ? LIMIT 1`, [assign_tech]
        );
        if (techUser?.technician_id) {
          await db.query(
            `INSERT IGNORE INTO technician_patient_assignments (technician_id, patient_id) VALUES (?, ?)`,
            [techUser.technician_id, patient_id]
          );
        }
      }

    // ── Doctor ─────────────────────────────────────────────
    } else if (type === "doctor") {
      const code             = formData.get("code")             as string;
      const specialty        = formData.get("specialty")        as string;
      const license_number   = formData.get("license_number")   as string;
      const years_experience = formData.get("years_experience") as string;

      const [docResult]: any = await db.query(
        `INSERT INTO doctors (can_annotate_volume, can_upload_volume) VALUES (1, 0)`
      );
      const doctor_id = docResult.insertId;

      await db.query(
        `INSERT INTO doctor_profiles (doctor_id, doctor_code, license_number, years_experience, specialty)
         VALUES (?, ?, ?, ?, ?)`,
        [doctor_id, code, license_number, Number(years_experience), specialty]
      );

      // Save image now that we have doctor_id → filename: doctor_3.jpg
      const profile_picture = await saveImage(doctor_id);

      await db.query(
        `INSERT INTO users (username, password_hash, role, first_name, middle_name, last_name, gender, email, phone, profile_picture, is_active, doctor_id)
         VALUES (?, ?, 'doctor', ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [username, password_hash, first_name, middle_name || null, last_name, gender, email, phone, profile_picture, is_active, doctor_id]
      );

    // ── Technician ─────────────────────────────────────────
    } else if (type === "technician") {
      const code             = formData.get("code")             as string;
      const specialty        = formData.get("specialty")        as string;
      const license_number   = formData.get("license_number")   as string;
      const years_experience = formData.get("years_experience") as string;

      const [techResult]: any = await db.query(
        `INSERT INTO technicians (can_upload_volume) VALUES (1)`
      );
      const technician_id = techResult.insertId;

      await db.query(
        `INSERT INTO technician_profiles (technician_id, technician_code, license_number, years_experience, specialty)
         VALUES (?, ?, ?, ?, ?)`,
        [technician_id, code, license_number, Number(years_experience), specialty]
      );

      // Save image now that we have technician_id → filename: tech_2.jpg
      const profile_picture = await saveImage(technician_id);

      await db.query(
        `INSERT INTO users (username, password_hash, role, first_name, middle_name, last_name, gender, email, phone, profile_picture, is_active, technician_id)
         VALUES (?, ?, 'technician', ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [username, password_hash, first_name, middle_name || null, last_name, gender, email, phone, profile_picture, is_active, technician_id]
      );
    }

    return NextResponse.json({ status: "ok", message: "User created successfully" });

  } catch (err: any) {
    console.error("Create user error:", err);
    if (err.code === "ER_DUP_ENTRY") {
      return NextResponse.json(
        { status: "error", message: "Username, email, or national ID already exists" },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { status: "error", message: "Failed to create user" },
      { status: 500 }
    );
  }
}