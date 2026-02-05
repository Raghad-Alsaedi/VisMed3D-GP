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

    const [rows] = await db.query(
      `
      SELECT
        u.id,
        u.userName,
        u.password_hash,
        u.is_active,
        r.name AS role_name
      FROM users u
      JOIN user_roles ur ON ur.user_id = u.id
      JOIN roles r ON r.id = ur.role_id
      WHERE u.userName = ?
      LIMIT 1
      `,
      [userName]
    );

    console.log("📊 Rows found:", rows.length);
    if (rows.length > 0) {
      console.log("👤 User role from DB:", rows[0].role_name);
    }

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
      "/admin": "admin",
    };

    if (role) {
      const expected = roleMap[role] || role;
      console.log("🔐 Role check - Expected:", expected, "| Got:", user.role_name);
      
      if (expected !== user.role_name) {
        return NextResponse.json(
          { status: "error", message: "Role mismatch" },
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

    // ✨✨✨ الإضافة الوحيدة: تغيير NextResponse.json إلى response ✨✨✨
    const response = NextResponse.json({
      status: "ok",
      user: {
        id: user.id,
        userName: user.userName,
        role: user.role_name,
      },
    });

    // ✨✨✨ إضافة: حفظ user_id في Cookie ✨✨✨
    response.cookies.set("user_id", user.id.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // أسبوع
      path: "/",
    });

    // ✨✨✨ إضافة: حفظ role في Cookie ✨✨✨
    response.cookies.set("user_role", user.role_name, {
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