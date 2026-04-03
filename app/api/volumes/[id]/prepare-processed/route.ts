import { NextRequest, NextResponse } from "next/server";
import { RowDataPacket } from "mysql2";
import { db } from "@/database/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import supabaseAdmin from "@/database/supabaseAdmin";
import { v4 as uuidv4 } from "uuid";

interface VolumeRow extends RowDataPacket {
  accessionId: number;
  patientId:   number;
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
      `SELECT v.accession_id AS accessionId, a.patient_id AS patientId
       FROM volumes v
       JOIN accession a ON a.accession_id = v.accession_id
       WHERE v.id = ? LIMIT 1`,
      [volumeId]
    ) as [VolumeRow[], any];

    conn.release();

    if (!rows.length) {
      return NextResponse.json(
        { success: false, error: "Volume not found" },
        { status: 404 }
      );
    }

    const { accessionId, patientId } = rows[0];
    const uuid          = uuidv4();
    const processedPath = `patient-volumes/${patientId}/${accessionId}/processed_${uuid}.raw`;

    const { data, error } = await supabaseAdmin
      .storage
      .from("patient-volumes")
      .createSignedUploadUrl(processedPath);

    if (error || !data) throw new Error(`Failed to create signed URL: ${error?.message}`);

    return NextResponse.json({
      success:       true,
      signedUrl:     data.signedUrl,
      processedPath,
    });

  } catch (err: unknown) {
    try { if (conn) conn.release(); } catch {}
    const msg = err instanceof Error ? err.message : "Failed";
    console.error("Prepare processed error:", msg);
    return NextResponse.json(
      { success: false, error: msg },
      { status: 500 }
    );
  }
}