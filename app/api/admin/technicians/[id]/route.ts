import { NextResponse } from "next/server";
import { db } from "@/database/db";

export async function GET(
  _req: Request,
  context: any
) {
  try {
    const { id } = await context.params;

    const [rows]: any = await db.query(
      `SELECT
         u.id,
         u.first_name          AS firstName,
         u.middle_name         AS middleName,
         u.last_name           AS lastName,
         u.gender,
         u.is_active           AS isActive,
         u.username,
         u.email,
         u.phone,
         u.profile_picture     AS profilePicture,
         u.created_at          AS createdAt,
         u.updated_at          AS updatedAt,
         COALESCE(tp.technician_code,  '') AS technicianCode,
         COALESCE(tp.specialty,        '') AS specialty,
         COALESCE(tp.license_number,   '') AS licenseNumber,
         COALESCE(tp.years_experience,  0) AS yearsExperience
       FROM users u
       LEFT JOIN technicians t          ON u.technician_id = t.technician_id
       LEFT JOIN technician_profiles tp ON t.technician_id = tp.technician_id
       WHERE u.id = ? AND u.role = 'technician'
       LIMIT 1`,
      [id]
    );

    if (!rows.length)
      return NextResponse.json(
        { status: "error", message: "Technician not found" },
        { status: 404 }
      );

    return NextResponse.json({ status: "ok", user: { ...rows[0], role: "technician" } });
  } catch (err) {
    console.error("Technician GET error:", err);
    return NextResponse.json(
      { status: "error", message: "Failed to fetch technician" },
      { status: 500 }
    );
  }
}