import { NextRequest, NextResponse } from "next/server";
import { ResultSetHeader } from "mysql2";
import { db } from "@/database/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";

export async function POST(request: NextRequest) {
  let conn: any = null;

  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    const body = await request.json();

    const volumeId: number = Number(body.volumeId);
    const byteSize: number = Number(body.byteSize);

    if (!Number.isFinite(volumeId) || volumeId <= 0) {
      return NextResponse.json(
        { success: false, error: "Invalid volumeId" },
        { status: 400 }
      );
    }

    if (!Number.isFinite(byteSize) || byteSize <= 0) {
      return NextResponse.json(
        { success: false, error: "Invalid byteSize" },
        { status: 400 }
      );
    }

    conn = await (db as any).getConnection();

    await conn.query(
      `UPDATE volumes SET byte_size = ? WHERE id = ?`,
      [byteSize, volumeId]
    ) as [ResultSetHeader, any];

    conn.release();

    return NextResponse.json({ success: true, volumeId });

  } catch (err: unknown) {
    try { if (conn) conn.release(); } catch {}

    const msg = err instanceof Error ? err.message : "Confirm failed";
    console.error("Upload confirm error:", msg);

    return NextResponse.json(
      { success: false, error: msg },
      { status: 500 }
    );
  }
}