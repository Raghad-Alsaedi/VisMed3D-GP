import { NextRequest, NextResponse } from "next/server";
import { RowDataPacket, ResultSetHeader } from "mysql2";
import { db } from "@/database/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";

interface VolumeExistsRow extends RowDataPacket {
  id: number;
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const volumeId = Number(id);

  if (!Number.isFinite(volumeId) || volumeId <= 0) {
    return NextResponse.json(
      { success: false, error: "Invalid volume id" },
      { status: 400 }
    );
  }

  let conn: any = null;

  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    const body        = await request.json();
    const accessionId = Number(body.accessionId);
    const processedPath: string | null = body.processedPath ?? null;

    if (!Number.isFinite(accessionId) || accessionId <= 0) {
      return NextResponse.json(
        { success: false, error: "Missing or invalid accessionId" },
        { status: 400 }
      );
    }

    conn = await (db as any).getConnection();

    const [rows] = await conn.query(
      `SELECT id FROM volumes WHERE id = ? LIMIT 1`,
      [volumeId]
    ) as [VolumeExistsRow[], any];

    if (!rows.length) {
      conn.release();
      return NextResponse.json(
        { success: false, error: "Volume not found" },
        { status: 404 }
      );
    }

    await conn.query(
      `UPDATE volumes
       SET status = 'READY',
           processed_storage_path = COALESCE(?, processed_storage_path)
       WHERE id = ?`,
      [processedPath, volumeId]
    ) as [ResultSetHeader, any];

    conn.release();

    return NextResponse.json({ success: true });

  } catch (err: unknown) {
    try { if (conn) conn.release(); } catch {}

    const msg = err instanceof Error ? err.message : "Save failed";
    console.error("Volume save error:", msg);

    return NextResponse.json(
      { success: false, error: msg },
      { status: 500 }
    );
  }
}