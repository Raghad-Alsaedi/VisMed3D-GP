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
         u.first_name          AS firstName,
         u.middle_name         AS middleName,
         u.last_name           AS lastName,
         u.gender,
         u.is_active           AS isActive,
         u.email,
         u.phone,
         u.profile_picture     AS profilePicture,
         p.medical_record_number AS mrn,
         p.national_id         AS nationalId,
         p.date_of_birth       AS dateOfBirth,
         dpa.created_at        AS assignedAt
       FROM users doc_user
       INNER JOIN doctors d
               ON doc_user.doctor_id = d.doctor_id
       INNER JOIN doctor_patient_assignments dpa
               ON dpa.doctor_id = d.doctor_id
       INNER JOIN patients p
               ON p.patient_id = dpa.patient_id
       INNER JOIN users u
               ON u.patient_id = p.patient_id
       WHERE doc_user.id = ?
         AND doc_user.role = 'doctor'
       GROUP BY u.id
       ORDER BY dpa.created_at DESC`,
      [id]
    );

    return NextResponse.json({ status: "ok", patients: rows });
  } catch (err) {
    console.error("Doctor patients GET error:", err);
    return NextResponse.json(
      { status: "error", message: "Failed to fetch patients" },
      { status: 500 }
    );
  }
}

//  DELETE  unassign a patient from a doctor

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id }           = await params;
    const { searchParams } = new URL(req.url);
    const patientUserId    = searchParams.get("patient_id");

    if (!patientUserId)
      return NextResponse.json(
        { status: "error", message: "patient_id required" },
        { status: 400 }
      );

    const [[docRow]]: any = await db.query(
      `SELECT doctor_id FROM users WHERE id = ? AND role = 'doctor' LIMIT 1`,
      [id]
    );
    if (!docRow?.doctor_id)
      return NextResponse.json(
        { status: "error", message: "Doctor not found" },
        { status: 404 }
      );

    const [[patRow]]: any = await db.query(
      `SELECT patient_id FROM users WHERE id = ? AND role = 'patient' LIMIT 1`,
      [patientUserId]
    );
    if (!patRow?.patient_id)
      return NextResponse.json(
        { status: "error", message: "Patient not found" },
        { status: 404 }
      );

    await db.query(
      `DELETE FROM doctor_patient_assignments WHERE doctor_id = ? AND patient_id = ?`,
      [docRow.doctor_id, patRow.patient_id]
    );

    return NextResponse.json({ status: "ok" });
  } catch (err) {
    console.error("Doctor patient DELETE error:", err);
    return NextResponse.json(
      { status: "error", message: "Failed to remove assignment" },
      { status: 500 }
    );
  }
}