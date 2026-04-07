import { NextResponse } from "next/server";
import { db } from "@/database/db";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const [rows]: any = await db.query(
      `SELECT
         a.accession_id           AS accessionId,
         a.accession_number       AS accessionNumber,
         a.exam_date              AS examDate,
         a.modality,
         a.created_at             AS createdAt,
         COALESCE(
           MAX(CASE WHEN v.status = 'READY'      THEN 'READY'
                    WHEN v.status = 'PROCESSING' THEN 'PROCESSING'
                    WHEN v.status = 'REJECTED'   THEN 'REJECTED'
                    ELSE NULL END),
           'NO VOLUME'
         ) AS volumeStatus
       FROM accession a
       LEFT JOIN volumes v ON v.accession_id = a.accession_id
       JOIN patients p     ON a.patient_id   = p.patient_id
       JOIN users u        ON u.patient_id   = p.patient_id
       WHERE u.id = ?
       GROUP BY a.accession_id
       ORDER BY a.created_at DESC`,
      [id]
    );

    return NextResponse.json({ status: "ok", accessions: rows });
  } catch (err) {
    console.error("Patient accessions GET error:", err);
    return NextResponse.json(
      { status: "error", message: "Failed to fetch accessions" },
      { status: 500 }
    );
  }
}

// POST  create a new accession for a patient 

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Verify the user exists and is a patient
    const [[userRow]]: any = await db.query(
      `SELECT patient_id FROM users WHERE id = ? AND role = 'patient' LIMIT 1`,
      [id]
    );

    if (!userRow?.patient_id) {
      return NextResponse.json(
        { status: "error", message: "Patient not found" },
        { status: 404 }
      );
    }

    const today = new Date().toISOString().slice(0, 10);

    // Insert a new accession with today's date and default modality
    const [result]: any = await db.query(
      `INSERT INTO accession (accession_number, patient_id, exam_date, modality)
       VALUES ('', ?, ?, 'CT')`,
      [userRow.patient_id, today]
    );

    // Return the newly created accession row
    const [[newRow]]: any = await db.query(
      `SELECT
         a.accession_id     AS accessionId,
         a.accession_number AS accessionNumber,
         a.exam_date        AS examDate,
         a.modality,
         a.created_at       AS createdAt,
         'NO VOLUME'        AS volumeStatus
       FROM accession a
       WHERE a.accession_id = ?`,
      [result.insertId]
    );

    return NextResponse.json({ status: "ok", accession: newRow });
  } catch (err) {
    console.error("Patient accessions POST error:", err);
    return NextResponse.json(
      { status: "error", message: "Failed to create accession" },
      { status: 500 }
    );
  }
}

// DELETE — remove an accession by ID 

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { searchParams } = new URL(req.url);
    const accessionId = searchParams.get("accession_id");
    if (!accessionId)
      return NextResponse.json({ status: "error", message: "accession_id required" }, { status: 400 });

    await db.query(`DELETE FROM accession WHERE accession_id = ?`, [accessionId]);
    return NextResponse.json({ status: "ok" });
  } catch (err) {
    console.error("Accession DELETE error:", err);
    return NextResponse.json({ status: "error", message: "Failed to delete accession" }, { status: 500 });
  }
}