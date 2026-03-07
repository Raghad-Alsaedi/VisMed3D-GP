import { NextRequest, NextResponse } from "next/server";
import { db } from "@/database/db";
import supabaseAdmin from "@/database/supabaseAdmin";

export async function GET(
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
    conn = await (db as any).getConnection();

    const [rows]: any = await conn.query(
      `SELECT storage_path, width, height, depth FROM volumes WHERE id = ? LIMIT 1`,
      [volumeId]
    );

    if (!rows?.length) {
      return NextResponse.json({ success: false, error: "Volume not found" }, { status: 404 });
    }

    const { storage_path, width, height, depth } = rows[0];

    conn.release();

    const { data, error } = await supabaseAdmin
      .storage
      .from("patient-volumes")
      .createSignedUrl(storage_path, 3600);

    if (error || !data) {
      throw new Error(`Failed to generate signed URL: ${error?.message}`);
    }

    return NextResponse.json({
      success:   true,
      signedUrl: data.signedUrl,
      width,
      height,
      depth,
    });

  } catch (err: any) {
    try { if (conn) conn.release(); } catch {}
    console.error("Volume info error:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to get volume info" },
      { status: 500 }
    );
  }
}