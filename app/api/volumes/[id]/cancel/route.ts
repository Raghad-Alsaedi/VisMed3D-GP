import { NextRequest, NextResponse } from "next/server";
import { RowDataPacket, ResultSetHeader } from "mysql2";
import { db } from "@/database/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import supabaseAdmin from "@/database/supabaseAdmin";

interface VolumePathRow extends RowDataPacket {
  storagePath: string;
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

    conn = await (db as any).getConnection();

    const [rows] = await conn.query(
      `SELECT storage_path AS storagePath FROM volumes WHERE id = ? LIMIT 1`,
      [volumeId]
    ) as [VolumePathRow[], any];

    if (!rows.length) {
      conn.release();
      return NextResponse.json(
        { success: false, error: "Volume not found" },
        { status: 404 }
      );
    }

    const { storagePath } = rows[0];

    const { error: deleteError } = await supabaseAdmin
      .storage
      .from("patient-volumes")
      .remove([storagePath]);

    if (deleteError) {
      console.error("Supabase delete error:", deleteError.message);
    }

    await conn.query(
      `DELETE FROM volumes WHERE id = ?`,
      [volumeId]
    ) as [ResultSetHeader, any];

    conn.release();

    return NextResponse.json({ success: true });

  } catch (err: unknown) {
    try { if (conn) conn.release(); } catch {}

    const msg = err instanceof Error ? err.message : "Cancel failed";
    console.error("Volume cancel error:", msg);

    return NextResponse.json(
      { success: false, error: msg },
      { status: 500 }
    );
  }
}