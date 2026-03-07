import { NextRequest, NextResponse } from "next/server";
import { db } from "@/database/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";

export async function POST(request: NextRequest) {
  let conn: any;

  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });
    }

    const { volumeId, byteSize } = await request.json();

    if (!volumeId || !byteSize) {
      return NextResponse.json({ success: false, error: "Missing volumeId or byteSize" }, { status: 400 });
    }

    conn = await (db as any).getConnection();

    await conn.query(
      `UPDATE volumes SET byte_size = ? WHERE id = ?`,
      [byteSize, volumeId]
    );

    conn.release();

    return NextResponse.json({ success: true, volumeId });

  } catch (err: any) {
    try { if (conn) conn.release(); } catch {}
    console.error("Upload confirm error:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Confirm failed" },
      { status: 500 }
    );
  }
}