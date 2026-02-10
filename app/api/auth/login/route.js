import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/database/db.js";

export async function GET() {
  return NextResponse.json({ status: "ok", message: "Use POST to login" });
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { userName, password, role } = body;

    if (!userName || !password) {
      return NextResponse.json(
        { status: "error", message: "Missing userName or password" },
        { status: 400 }
      );
    }

    const [rows] = await db.query(
      `
      SELECT
        u.user_id,
        u.username,
        u.password_hash,
        u.role,
        u.is_active,
        u.first_name,
        u.last_name,
        u.doctor_id,
        u.patient_id,
        u.technician_id
      FROM users u
      WHERE u.username = ?
      LIMIT 1
      `,
      [userName]
    );

    if (!rows.length) {
      return NextResponse.json(
        { status: "error", message: "Invalid credentials" },
        { status: 401 }
      );
    }

    const user = rows[0];

    if (!user.is_active) {
      return NextResponse.json(
        { status: "error", message: "User is not active" },
        { status: 403 }
      );
    }

    const roleMap = {
      "/doctor": "doctor",
      "/patients": "patient",
      "/radio_tech": "technician",
    };

    if (role) {
      const expected = roleMap[role] || role;
      if (expected !== user.role) {
        return NextResponse.json(
          { status: "error", message: "Role mismatch" },
          { status: 403 }
        );
      }
    }

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      return NextResponse.json(
        { status: "error", message: "Invalid credentials" },
        { status: 401 }
      );
    }

    const response = NextResponse.json({
      status: "ok",
      user: {
        id: user.user_id,
        userName: user.username,
        role: user.role,
        firstName: user.first_name,
        lastName: user.last_name,
        doctorId: user.doctor_id,
        patientId: user.patient_id,
        technicianId: user.technician_id,
      },
    });

    response.cookies.set("user_id", user.user_id.toString(), {
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    return NextResponse.json(
      { status: "error", message: "Server error" },
      { status: 500 }
    );
  }
}