import { NextRequest, NextResponse } from "next/server";
import { db } from "@/database/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import supabaseAdmin from "@/database/supabaseAdmin";
import { v4 as uuidv4 } from "uuid";

function toInt(v: FormDataEntryValue | null, field: string) {
  const n = Number(v);
  if (!Number.isFinite(n) || n <= 0) throw new Error(`Invalid ${field}`);
  return Math.floor(n);
}

export async function POST(request: NextRequest) {
  let conn: any;

  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });
    }

    const uploadedBy = (session.user as any).technician_id;

    if (!uploadedBy) {
      return NextResponse.json({ success: false, error: "Only technicians can upload files" }, { status: 403 });
    }

    const formData = await request.formData();

    const patientId   = toInt(formData.get("patientId"),   "patientId");
    const accessionId = toInt(formData.get("accessionId"), "accessionId");
    const width       = toInt(formData.get("width"),       "width");
    const height      = toInt(formData.get("height"),      "height");
    const depth       = toInt(formData.get("depth"),       "depth");
    const fileName    = String(formData.get("fileName") || "volume.raw");

    conn = await (db as any).getConnection();

    const [pRows]: any = await conn.query(
      `SELECT patient_id FROM patients WHERE patient_id = ? LIMIT 1`,
      [patientId]
    );
    if (!pRows?.length) throw new Error("Patient not found");

    const [aRows]: any = await conn.query(
      `SELECT accession_id, accession_number, patient_id
       FROM accession
       WHERE accession_id = ?
       LIMIT 1`,
      [accessionId]
    );
    if (!aRows?.length) throw new Error("Accession not found");

    if (Number(aRows[0].patient_id) !== Number(patientId)) {
      throw new Error("Accession does not belong to this patient");
    }

    const uuid        = uuidv4();
    const storagePath = `patient-volumes/${patientId}/${accessionId}/${uuid}.raw`;

    const { data: signedData, error: signedError } = await supabaseAdmin
      .storage
     .from("patient-volumes")
      .createSignedUploadUrl(storagePath);

    if (signedError || !signedData) {
      throw new Error(`Failed to create signed upload URL: ${signedError?.message}`);
    }

    const [vRes]: any = await conn.query(
      `INSERT INTO volumes
        (accession_id, dataset_name, modality, file_format,
         width, height, depth,
         storage_path, file_prefix,
         start_index, end_index,
         status, uploaded_by, uploaded_at, byte_size, chunk_size)
       VALUES
        (?, ?, 'CT', 'RAW',
         ?, ?, ?,
         ?, ?,
         1, ?,
         'PROCESSING', ?, NOW(), 0, 0)`,
      [
        accessionId,
        fileName,
        width,
        height,
        depth,
        storagePath,
        fileName,
        depth,
        uploadedBy,
      ]
    );

    const volumeId = vRes.insertId as number;

    conn.release();

    return NextResponse.json({
      success:     true,
      volumeId,
      signedUrl:   signedData.signedUrl,
      storagePath,
      token:       signedData.token,
    });

  } catch (err: any) {
    try { if (conn) conn.release(); } catch {}
    console.error("Upload prepare error:", err);

    const msg          = String(err?.message || "Prepare failed");
    const isBadRequest =
      msg.startsWith("Invalid ") ||
      msg === "Patient not found" ||
      msg === "Accession not found" ||
      msg === "Accession does not belong to this patient";

    return NextResponse.json(
      { success: false, error: msg },
      { status: isBadRequest ? 400 : 500 }
    );
  }
}