import { NextResponse } from "next/server";
import { db } from "@/database/db";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const [rows]: any = await db.query(
      `SELECT
         u.id,
         u.first_name            AS firstName,
         u.middle_name           AS middleName,
         u.last_name             AS lastName,
         u.gender,
         u.is_active             AS isActive,
         u.email,
         u.phone,
         u.profile_picture       AS profilePicture,
         p.medical_record_number AS mrn,
         p.national_id           AS nationalId,
         p.date_of_birth         AS dateOfBirth,
         tpa.created_at          AS assignedAt
       FROM users tech_user
       INNER JOIN technicians t
               ON tech_user.technician_id = t.technician_id
       INNER JOIN technician_patient_assignments tpa
               ON tpa.technician_id = t.technician_id
       INNER JOIN patients p
               ON p.patient_id = tpa.patient_id
       INNER JOIN users u
               ON u.patient_id = p.patient_id
       WHERE tech_user.id = ?
         AND tech_user.role = 'technician'
       ORDER BY tpa.created_at DESC`,
      [id]
    );

    return NextResponse.json({ status: "ok", patients: rows });
  } catch (err) {
    console.error("Technician patients GET error:", err);
    return NextResponse.json(
      { status: "error", message: "Failed to fetch patients" },
      { status: 500 }
    );
  }
}


export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id }           = await params;
    const { searchParams } = new URL(req.url);
    const patientUserId    = searchParams.get("patientId");
    if (!patientUserId)
      return NextResponse.json({ status: "error", message: "patient_id required" }, { status: 400 });

    const [[techRow]]: any = await db.query(
      `SELECT technician_id FROM users WHERE id = ? AND role = 'technician' LIMIT 1`, [id]
    );
    if (!techRow?.technician_id)
      return NextResponse.json({ status: "error", message: "Technician not found" }, { status: 404 });

    const [[patRow]]: any = await db.query(
      `SELECT patient_id FROM users WHERE id = ? AND role = 'patient' LIMIT 1`, [patientUserId]
    );
    if (!patRow?.patient_id)
      return NextResponse.json({ status: "error", message: "Patient not found" }, { status: 404 });

    await db.query(
      `DELETE FROM technician_patient_assignments WHERE technician_id = ? AND patient_id = ?`,
      [techRow.technician_id, patRow.patient_id]
    );
    return NextResponse.json({ status: "ok" });
  } catch (err) {
    console.error("Technician patient DELETE error:", err);
    return NextResponse.json({ status: "error", message: "Failed to remove assignment" }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { patientUserId } = await req.json();

    if (!patientUserId)
      return NextResponse.json({ status: "error", message: "patientUserId required" }, { status: 400 });

    const [[techRow]]: any = await db.query(
      `SELECT technician_id FROM users WHERE id = ? AND role = 'technician' LIMIT 1`, [id]
    );
    if (!techRow?.technician_id)
      return NextResponse.json({ status: "error", message: "Technician not found" }, { status: 404 });

    const [[patRow]]: any = await db.query(
      `SELECT patient_id FROM users WHERE id = ? AND role = 'patient' LIMIT 1`, [patientUserId]
    );
    if (!patRow?.patient_id)
      return NextResponse.json({ status: "error", message: "Patient not found" }, { status: 404 });

    await db.query(
      `INSERT IGNORE INTO technician_patient_assignments (technician_id, patient_id) VALUES (?, ?)`,
      [techRow.technician_id, patRow.patient_id]
    );

    return NextResponse.json({ status: "ok" });
  } catch (err) {
    console.error("Technician patient POST error:", err);
    return NextResponse.json({ status: "error", message: "Failed to assign" }, { status: 500 });
  }
}