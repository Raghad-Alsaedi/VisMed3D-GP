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
         COALESCE(tp.technician_code,  '') AS technician_code,
         COALESCE(tp.specialty,        '') AS specialty,
         COALESCE(tp.license_number,   '') AS license_number,
         COALESCE(tp.years_experience,  0) AS years_experience
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
