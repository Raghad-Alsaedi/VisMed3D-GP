import { NextResponse } from "next/server";
import { db } from "@/database/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { RowDataPacket } from "mysql2";

interface AccessionRow extends RowDataPacket {
  accession_number: string;
  patient_name: string;
  volume_id: number | null;
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { status: "error", message: "Not authenticated" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const accessionId = searchParams.get("accession_id");

    if (!accessionId) {
      return NextResponse.json(
        { status: "error", message: "accession_id is required" },
        { status: 400 }
      );
    }

    const [rows] = await db.query<AccessionRow[]>(
      `
      SELECT
        a.accession_number,
        CONCAT(u.first_name, ' ', COALESCE(u.middle_name, ''), ' ', u.last_name) AS patient_name,
        v.id AS volume_id
      FROM accession a
      JOIN patients p ON p.patient_id = a.patient_id
      JOIN users u ON u.patient_id = p.patient_id
      LEFT JOIN volumes v ON v.accession_id = a.accession_id AND v.status = 'READY'
      WHERE a.accession_id = ?
      ORDER BY v.uploaded_at DESC
      LIMIT 1
      `,
      [accessionId]
    );

    if (!rows.length) {
      return NextResponse.json(
        { status: "error", message: "Accession not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      status:          "ok",
      patientName:     rows[0].patient_name.replace(/\s+/g, " ").trim(),
      accessionNumber: rows[0].accession_number,
      volumeId:        rows[0].volume_id ?? null,
    });
  } catch (err) {
    console.error("GET ACCESSION ERROR:", err);
    return NextResponse.json(
      { status: "error", message: "Server error" },
      { status: 500 }
    );
  }
}