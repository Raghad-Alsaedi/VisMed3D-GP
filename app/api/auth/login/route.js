import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

// ✅ المسار الصحيح حسب مشروعك (route.js داخل app/api/auth/login)
import { db } from "../../../../database/db.js";

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

    // نجيب المستخدم + دوره
    const [rows] = await db.query(
      `
      SELECT
        u.id,
        u.userName,
        u.password_hash,
        u.is_active,
        u.must_change_password,
        r.name AS role_name
      FROM users u
      JOIN user_roles ur ON ur.user_id = u.id
      JOIN roles r ON r.id = ur.role_id
      WHERE u.userName = ?
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

    // ✅ تحويل المسار إلى role_name الحقيقي في DB
    const roleMap = {
      "/doctor": "DOCTOR",
      "/patients": "PATIENT",
      "/radio_tech": "RADIOLOGY TECHNICIAN",
      "/admin": "ADMIN",
    };

    if (role) {
      const expected = roleMap[role] || role;
      if (expected !== user.role_name) {
        return NextResponse.json(
          { status: "error", message: "Role mismatch" },
          { status: 403 }
        );
      }
    }

    // ✅ bcrypt compare
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      return NextResponse.json(
        { status: "error", message: "Invalid credentials" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      status: "ok",
      user: {
        id: user.id,
        userName: user.userName,
        role: user.role_name,
        must_change_password: !!user.must_change_password,
      },
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    return NextResponse.json(
      { status: "error", message: "Server error" },
      { status: 500 }
    );
  }
}