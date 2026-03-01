import { NextResponse } from "next/server";
import { db } from "@/database/db.js";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { status: "error", message: "Not authenticated" },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(req.url);
    const accessionId = searchParams.get("accession_id");

    console.log('GET REPORT API');
    console.log('Fetching report for accessionId:', accessionId);
    console.log('User ID:', session.user.id);

    if (!accessionId) {
      return NextResponse.json(
        { status: "error", message: "accession_id is required" },
        { status: 400 },
      );
    }

    const [rows] = await db.query(
      `
      SELECT 
        r.report_id,
        r.accession_id,
        r.doctor_id,
        r.report_text,
        r.body_part,
        r.autosave_text,
        r.images,
        r.report_status,
        r.created_at,
        r.updated_at,
        CONCAT(du.first_name, ' ', du.last_name) AS doctor_name,
        a.accession_number,
        a.exam_date,
        a.modality,
        a.patient_id,
        CONCAT(pu.first_name, ' ', pu.last_name) AS patient_name
      FROM reports r
      JOIN accession a ON a.accession_id = r.accession_id
      JOIN doctors d ON d.doctor_id = r.doctor_id
      JOIN users du ON du.doctor_id = d.doctor_id
      JOIN patients p ON p.patient_id = a.patient_id
      JOIN users pu ON pu.patient_id = p.patient_id
      WHERE r.accession_id = ?
      LIMIT 1
      `,
      [accessionId],
    );

    if (!rows.length) {
      console.log('No report found for accessionId:', accessionId);
      return NextResponse.json({
        status: "ok",
        report: null,
        message: "No report found",
      });
    }

    const report = rows[0];
    
    console.log('Report found:', {
      report_id: report.report_id,
      status: report.report_status,
      has_autosave: !!report.autosave_text,
      has_images: !!report.images
    });

    return NextResponse.json({
      status: "ok",
      report: {
        id: report.report_id,
        accessionId: report.accession_id,
        doctorId: report.doctor_id,
        doctorName: report.doctor_name,
        patientName: report.patient_name,
        accessionNumber: report.accession_number,
        examDate: report.exam_date,
        modality: report.modality,
        bodyPart: report.body_part,
        reportText: report.report_text,
        autosave_text: report.autosave_text,
        images: report.images,
        report_status: report.report_status,
        createdAt: report.created_at,
        updatedAt: report.updated_at,
      },
    });
  } catch (err) {
    console.error("GET REPORT ERROR");
    console.error("Error details:", err);
    return NextResponse.json(
      { status: "error", message: "Server error" },
      { status: 500 },
    );
  }
}