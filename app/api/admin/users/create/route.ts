import { NextResponse } from "next/server";
import { db } from "@/database/db";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const type        = formData.get("type")            as string;
    const firstName   = formData.get("firstName")       as string;
    const middleName  = formData.get("middleName")      as string | null;
    const lastName    = formData.get("lastName")        as string;
    const gender      = formData.get("gender")          as string;
    const username    = formData.get("username")        as string;
    const password    = formData.get("password")        as string;
    const email       = formData.get("email")           as string;
    const phone       = formData.get("phone")           as string;
    const isActive    = formData.get("isActive") as string ?? "1";
    const imageFile   = formData.get("profilePicture")  as File | null;

    const bcrypt       = await import("bcrypt");
    const passwordHash = await bcrypt.hash(password, 10);

    const prefix =
      type === "doctor"     ? "doctor"  :
      type === "technician" ? "tech"    : "patient";

    const saveImage = async (roleId: number): Promise<string | null> => {
      if (!imageFile || imageFile.size === 0) return null;
      const ext      = imageFile.name.split(".").pop()?.toLowerCase() ?? "jpg";
      const fileId   = `${prefix}_${roleId}`;
      const fileName = `${fileId}.${ext}`;
      const dir      = path.join(process.cwd(), "picture", "profiles");
      await mkdir(dir, { recursive: true });
      const buffer   = Buffer.from(await imageFile.arrayBuffer());
      await writeFile(path.join(dir, fileName), buffer);
      return `api/images/${fileId}`;
    };

    if (type === "patient") {
      const nationalId   = formData.get("nationalId")   as string;
      const dateOfBirth  = formData.get("dateOfBirth")  as string;
      const assignDoctor = formData.get("assignDoctor") as string | null;
      const assignTech   = formData.get("assignTech")   as string | null;

      const patientCode = `P-${Date.now()}`;

      const [patResult]: any = await db.query(
        `INSERT INTO patients (medical_record_number, national_id, date_of_birth, patient_code)
         VALUES (NULL, ?, ?, ?)`,
        [nationalId, dateOfBirth, patientCode]
      );
      const patientId = patResult.insertId;

      const profilePicture = await saveImage(patientId);

      await db.query(
        `INSERT INTO users (username, password_hash, role, first_name, middle_name, last_name, gender, email, phone, profile_picture, is_active, patient_id)
         VALUES (?, ?, 'patient', ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [username, passwordHash, firstName, middleName || null, lastName, gender, email, phone, profilePicture, isActive, patientId]
      );

      if (assignDoctor) {
        const [[docUser]]: any = await db.query(
          `SELECT doctor_id FROM users WHERE id = ? LIMIT 1`, [assignDoctor]
        );
        if (docUser?.doctor_id) {
          await db.query(
            `INSERT IGNORE INTO doctor_patient_assignments (doctor_id, patient_id) VALUES (?, ?)`,
            [docUser.doctor_id, patientId]
          );
        }
      }

      if (assignTech) {
        const [[techUser]]: any = await db.query(
          `SELECT technician_id FROM users WHERE id = ? LIMIT 1`, [assignTech]
        );
        if (techUser?.technician_id) {
          await db.query(
            `INSERT IGNORE INTO technician_patient_assignments (technician_id, patient_id) VALUES (?, ?)`,
            [techUser.technician_id, patientId]
          );
        }
      }

    } else if (type === "doctor") {
      const code            = formData.get("code")            as string;
      const specialty       = formData.get("specialty")       as string;
      const licenseNumber   = formData.get("licenseNumber")   as string;
      const yearsExperience = formData.get("yearsExperience") as string;

      const [docResult]: any = await db.query(
        `INSERT INTO doctors (can_annotate_volume, can_upload_volume) VALUES (1, 0)`
      );
      const doctorId = docResult.insertId;

      await db.query(
        `INSERT INTO doctor_profiles (doctor_id, doctor_code, license_number, years_experience, specialty)
         VALUES (?, ?, ?, ?, ?)`,
        [doctorId, code, licenseNumber, Number(yearsExperience), specialty]
      );

      const profilePicture = await saveImage(doctorId);

      await db.query(
        `INSERT INTO users (username, password_hash, role, first_name, middle_name, last_name, gender, email, phone, profile_picture, is_active, doctor_id)
         VALUES (?, ?, 'doctor', ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [username, passwordHash, firstName, middleName || null, lastName, gender, email, phone, profilePicture, isActive, doctorId]
      );

    } else if (type === "technician") {
      const code            = formData.get("code")            as string;
      const specialty       = formData.get("specialty")       as string;
      const licenseNumber   = formData.get("licenseNumber")   as string;
      const yearsExperience = formData.get("yearsExperience") as string;

      const [techResult]: any = await db.query(
        `INSERT INTO technicians (can_upload_volume) VALUES (1)`
      );
      const technicianId = techResult.insertId;

      await db.query(
        `INSERT INTO technician_profiles (technician_id, technician_code, license_number, years_experience, specialty)
         VALUES (?, ?, ?, ?, ?)`,
        [technicianId, code, licenseNumber, Number(yearsExperience), specialty]
      );

      const profilePicture = await saveImage(technicianId);

      await db.query(
        `INSERT INTO users (username, password_hash, role, first_name, middle_name, last_name, gender, email, phone, profile_picture, is_active, technician_id)
         VALUES (?, ?, 'technician', ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [username, passwordHash, firstName, middleName || null, lastName, gender, email, phone, profilePicture, isActive, technicianId]
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