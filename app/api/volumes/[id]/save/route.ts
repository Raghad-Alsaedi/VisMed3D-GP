import { NextRequest, NextResponse } from "next/server";
import { db } from "@/database/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const volumeId = Number(id);

  if (!Number.isFinite(volumeId) || volumeId <= 0) {
    return NextResponse.json({ success: false, error: "Invalid volume id" }, { status: 400 });
  }

  let conn: any;

  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });
    }

    const { accessionId } = await request.json();

    if (!accessionId) {
      return NextResponse.json({ success: false, error: "Missing accessionId" }, { status: 400 });
    }

    conn = await (db as any).getConnection();

    const [rows]: any = await conn.query(
      `SELECT id FROM volumes WHERE id = ? LIMIT 1`,
      [volumeId]
    );

    if (!rows?.length) {
      return NextResponse.json({ success: false, error: "Volume not found" }, { status: 404 });
    }

    await conn.query(
      `UPDATE volumes SET status = 'READY' WHERE id = ?`,
      [volumeId]
    );

    conn.release();

    return NextResponse.json({ success: true });

  } catch (err: any) {
    try { if (conn) conn.release(); } catch {}
    console.error("Volume save error:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Save failed" },
      { status: 500 }
    );
  }
}