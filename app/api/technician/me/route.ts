import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { db } from "@/database/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const techId = (session.user as any).technician_id;

    if (!techId) {
      return NextResponse.json({ message: "Technician ID not found" }, { status: 400 });
    }

    const [rows]: any = await db.query(
      `
      SELECT
        u.id,
        u.technician_id,
        u.username AS userName,
        u.first_name AS firstName,
        u.middle_name AS middleName,
        u.last_name AS lastName,
        u.gender,
        u.phone,
        tp.technician_code,
        tp.license_number,
        tp.years_experience,
        u.profile_picture
      FROM users u
      LEFT JOIN technician_profiles tp ON tp.technician_id = u.technician_id
      WHERE u.technician_id = ?
      LIMIT 1
      `,
      [techId]
    );

    const tech = rows?.[0];
    if (!tech) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ tech });
  } catch (error) {
    console.error("Error in /api/technician/me:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}