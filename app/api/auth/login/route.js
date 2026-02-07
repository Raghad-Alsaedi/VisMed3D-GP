import { NextResponse } from "next/server";
import { db } from "@/database/db.js";
const bcrypt = require("bcryptjs");

export async function GET() {
  return NextResponse.json({ status: "ok", message: "Use POST to login" });
}

export async function POST(req) {
  try {
    console.log("✅ API Login called");
    
    const body = await req.json();
    console.log("📦 Body:", body);
    
    const { userName, password, role } = body;

    if (!userName || !password) {
      return NextResponse.json(
        { status: "error", message: "Missing userName or password" },
        { status: 400 }
      );
    }

    console.log("🔍 Querying database for:", userName);

    // ✅ استعلام من جدول users الموحد
    const [rows] = await db.query(
      `
      SELECT
        user_id,
        username,
        password_hash,
        role,
        is_active,
        doctor_id,
        patient_id,
        technician_id
      FROM users
      WHERE username = ?
      LIMIT 1
      `,
      [userName]
    );

    console.log("📊 Rows found:", rows.length);
    if (rows.length > 0) {
      console.log("👤 User role from DB:", rows[0].role);
    }

    if (!rows.length) {
      return NextResponse.json(
        { status: "error", message: "Invalid credentials" },
        { status: 401 }
      );
    }

    const user = rows[0];

    // ✅ التحقق من تفعيل الحساب
    if (!user.is_active) {
      return NextResponse.json(
        { status: "error", message: "User account is disabled" },
        { status: 403 }
      );
    }

    // ✅ مطابقة الدور
    const roleMap = {
      "/doctor": "doctor",
      "/patients": "patient",
      "/radio_tech": "technician",
    };

    if (role) {
      const expected = roleMap[role] || role;
      console.log("🔐 Role check - Expected:", expected, "| Got:", user.role);
      
      if (expected !== user.role) {
        return NextResponse.json(
          { status: "error", message: "Role mismatch - Please select the correct role" },
          { status: 403 }
        );
      }
    }

    console.log("🔑 Checking password...");
    
    const ok = await bcrypt.compare(password, user.password_hash);
    
    console.log("🔑 Password match:", ok);
    
    if (!ok) {
      return NextResponse.json(
        { status: "error", message: "Invalid credentials" },
        { status: 401 }
      );
    }

    console.log("✅ Login successful");

    const response = NextResponse.json({
      status: "ok",
      user: {
        id: user.user_id,
        userName: user.username,
        role: user.role,
        doctor_id: user.doctor_id,
        patient_id: user.patient_id,
        technician_id: user.technician_id,
      },
    });

    response.cookies.set("user_id", user.user_id.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    response.cookies.set("user_role", user.role, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (err) {
    console.error("💥 LOGIN ERROR:", err);
    return NextResponse.json(
      { status: "error", message: "Server error" },
      { status: 500 }
    );
  }
}