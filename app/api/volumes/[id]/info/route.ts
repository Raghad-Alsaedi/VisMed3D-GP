import { NextRequest, NextResponse } from "next/server";
import { RowDataPacket } from "mysql2";
import { db } from "@/database/db";
import supabaseAdmin from "@/database/supabaseAdmin";

interface VolumeInfoRow extends RowDataPacket {
  storagePath:    string;
  processedPath:  string | null;
  width:          number;
  height:         number;
  depth:          number;
  status:         string;
}

export async function GET(
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
    conn = await (db as any).getConnection();

    const [rows] = await conn.query(
      `SELECT storage_path           AS storagePath,
              processed_storage_path AS processedPath,
              width, height, depth, status
       FROM volumes
       WHERE id = ?
       LIMIT 1`,
      [volumeId]
    ) as [VolumeInfoRow[], any];

    conn.release();

    if (!rows.length) {
      return NextResponse.json(
        { success: false, error: "Volume not found" },
        { status: 404 }
      );
    }

    const { storagePath, processedPath, width, height, depth, status } = rows[0];

    if (status === "READY") {
      const { data, error } = await supabaseAdmin
        .storage
        .from("patient-volumes")
        .createSignedUrl(processedPath!, 3600);

      if (error || !data) throw new Error(`Signed URL error: ${error?.message}`);

      return NextResponse.json({
        success:      true,
        processedUrl: data.signedUrl,
        isReady:      true,
        width, height, depth,
      });
    }

    const { data, error } = await supabaseAdmin
      .storage
      .from("patient-volumes")
      .createSignedUrl(storagePath, 3600);

    if (error || !data) throw new Error(`Signed URL error: ${error?.message}`);

    return NextResponse.json({
      success:   true,
      signedUrl: data.signedUrl,
      isReady:   false,
      width, height, depth,
    });

  } catch (err: unknown) {
    try { if (conn) conn.release(); } catch {}
    const msg = err instanceof Error ? err.message : "Failed to get volume info";
    console.error("Volume info error:", msg);
    return NextResponse.json(
      { success: false, error: msg },
      { status: 500 }
    );
  }
}