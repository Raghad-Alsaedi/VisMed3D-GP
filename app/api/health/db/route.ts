import { NextResponse } from "next/server";
import { db } from "@/database/db";

export async function GET() {
  try {
    const [rows]: any = await db.query("SELECT 1 AS test");
    return NextResponse.json({ status: "ok", result: rows });
  } catch (err) {
    console.error("DB Test Error:", err);
    return NextResponse.json({ 
      status: "error", 
      message: err instanceof Error ? err.message : String(err) 
    }, { status: 500 });
  }
}
