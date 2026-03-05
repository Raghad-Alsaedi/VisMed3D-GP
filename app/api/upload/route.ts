import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/database/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";

const CHUNK_SIZE = 1024 * 1024;

function toInt(v: FormDataEntryValue | null, field: string) {
  const n = Number(v);
  if (!Number.isFinite(n) || n <= 0) throw new Error(`Invalid ${field}`);
  return Math.floor(n);
}

function toStr(v: FormDataEntryValue | null, fallback = "") {
  return typeof v === "string" && v.trim() ? v.trim() : fallback;
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

    const file        = formData.get("file") as File | null;
    const patientId   = toInt(formData.get("patientId"),   "patientId");
    const accessionId = toInt(formData.get("accessionId"), "accessionId");
    const datasetName = toStr(formData.get("datasetName"), "Uploaded RAW");
    const modality    = toStr(formData.get("modality"),    "CT");
    const fileFormat  = "RAW";
    const width       = toInt(formData.get("width"),  "width");
    const height      = toInt(formData.get("height"), "height");
    const depth       = toInt(formData.get("depth"),  "depth");

    if (!file) {
      return NextResponse.json({ success: false, error: "No file attached" }, { status: 400 });
    }
    if (!file.name.toLowerCase().endsWith(".raw")) {
      return NextResponse.json({ success: false, error: "File must be RAW only" }, { status: 400 });
    }
    if (file.size === 0) {
      return NextResponse.json({ success: false, error: "File is empty" }, { status: 400 });
    }

    const bytesPerVoxel = 2;
    const expected = width * height * depth * bytesPerVoxel;
    if (expected !== file.size) {
      return NextResponse.json(
        { success: false, error: `Size mismatch. Expected ${expected} bytes but got ${file.size} bytes` },
        { status: 400 }
      );
    }

    const ab         = await file.arrayBuffer();
    const buffer     = Buffer.from(ab);
    const totalBytes = buffer.length;
    const checksum   = crypto.createHash("sha256").update(buffer).digest("hex");

    conn = await (db as any).getConnection();
    await conn.beginTransaction();

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

    const accessionNumber = aRows[0].accession_number;
    const startIndex      = 1;
    const endIndex        = depth;

    const [vRes]: any = await conn.query(
      `INSERT INTO volumes
        (accession_id, dataset_name, modality, file_format,
         width, height, depth,
         storage_path, file_prefix,
         start_index, end_index,
         checksum_sha256, status, rejection_reason,
         uploaded_by, uploaded_at, byte_size, chunk_size)
       VALUES
        (?, ?, ?, ?,
         ?, ?, ?,
         ?, ?,
         ?, ?,
         ?, 'PROCESSING', NULL,
         ?, NOW(), ?, ?)`,
      [
        accessionId,
        datasetName,
        modality,
        fileFormat,
        width,
        height,
        depth,
        "DB:volume_chunks",
        file.name,
        startIndex,
        endIndex,
        checksum,
        uploadedBy,
        totalBytes,
        CHUNK_SIZE,
      ]
    );

    const volumeId   = vRes.insertId as number;
    const chunkCount = Math.ceil(totalBytes / CHUNK_SIZE);
    const BATCH      = 50;

    for (let base = 0; base < chunkCount; base += BATCH) {
      const placeholders: string[] = [];
      const values: any[]          = [];

      for (let i = base; i < Math.min(base + BATCH, chunkCount); i++) {
        const start = i * CHUNK_SIZE;
        const end   = Math.min(start + CHUNK_SIZE, totalBytes);
        const chunk = buffer.subarray(start, end);
        placeholders.push("(?, ?, ?)");
        values.push(volumeId, i, chunk);
      }

      await conn.query(
        `INSERT INTO volume_chunks (volume_id, chunk_index, data)
         VALUES ${placeholders.join(",")}`,
        values
      );
    }

    await conn.query(`UPDATE volumes SET status='READY' WHERE id=?`, [volumeId]);
    await conn.commit();

    return NextResponse.json({
      success:        true,
      message:        "RAW saved in DB (chunks) successfully",
      volumeId,
      accessionId,
      accessionNumber,
      patientId,
      uploadedBy,
      checksum_sha256: checksum,
      byteSize:        totalBytes,
      chunkSize:       CHUNK_SIZE,
      chunkCount,
      dims: { width, height, depth, bytesPerVoxel },
    });

  } catch (err: any) {
    try {
      if (conn) await conn.rollback();
    } catch {}

    console.error("Upload(DB) error:", err);

    const msg          = String(err?.message || "Upload failed");
    const isBadRequest =
      msg.startsWith("Invalid ") ||
      msg === "Patient not found"                          ||
      msg === "Accession not found"                        ||
      msg === "Accession does not belong to this patient";

    return NextResponse.json(
      { success: false, error: msg },
      { status: isBadRequest ? 400 : 500 }
    );
  } finally {
    try {
      if (conn) conn.release();
    } catch {}
  }
}