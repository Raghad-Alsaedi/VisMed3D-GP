import { NextResponse } from "next/server";
import { db } from "@/database/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const field = searchParams.get("field");
    const value = searchParams.get("value");

    if (!field || !value || !["username", "email"].includes(field)) {
      return NextResponse.json({ status: "error", message: "Invalid request" }, { status: 400 });
    }

    const [rows]: any = await db.query(
      `SELECT id FROM users WHERE ${field} = ? LIMIT 1`,
      [value]
    );

    return NextResponse.json({ status: "ok", exists: rows.length > 0 });
  } catch (err) {
    console.error("Check field error:", err);
    return NextResponse.json({ status: "error", message: "Server error" }, { status: 500 });
  }
}