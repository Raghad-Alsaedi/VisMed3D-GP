import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { db } from "@/database/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const techId = (session.user as any).technician_id;
    if (!techId) {
      return NextResponse.json({ message: "Technician ID not found" }, { status: 400 });
    }

    const [rows]: any = await db.query(
      `
      SELECT
        v.id                       AS studyId,
        CONCAT(u.first_name, ' ',
               u.last_name)        AS patientName,
        a.accession_number         AS accession,
        p.medical_record_number    AS mrn,
        v.modality,
        v.uploaded_at              AS uploadedAt
      FROM volumes v
      JOIN accession a ON a.accession_id = v.accession_id
      JOIN patients  p ON p.patient_id   = a.patient_id
      JOIN users     u ON u.patient_id   = p.patient_id
      WHERE v.uploaded_by = ?
        AND v.uploaded_at = (
          SELECT MAX(v2.uploaded_at)
          FROM volumes v2
          JOIN accession a2 ON a2.accession_id = v2.accession_id
          WHERE a2.patient_id = p.patient_id
            AND v2.uploaded_by = ?
        )
      ORDER BY v.uploaded_at DESC
      LIMIT 20
      `,
      [techId, techId]
    );

    return NextResponse.json({ uploads: rows });
  } catch (error) {
    console.error("Error in /api/technician/recent-uploads:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}