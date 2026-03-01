import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/database/db';
import { RowDataPacket } from 'mysql2';

interface DoctorInfoRow extends RowDataPacket {
  full_name: string;
  specialty: string;
  license_number: string;
  signature_path: string | null;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const accessionId = searchParams.get('accession_id');

    if (!accessionId) {
      return NextResponse.json(
        { status: 'error', message: 'Accession ID is required' },
        { status: 400 }
      );
    }

    const [rows] = await db.query<DoctorInfoRow[]>(
      `
      SELECT 
        CONCAT(u.first_name, ' ', COALESCE(u.middle_name, ''), ' ', u.last_name) AS full_name,
        COALESCE(dp.specialty, 'General Practitioner') AS specialty,
        COALESCE(dp.license_number, 'N/A') AS license_number,
        dp.signature_path
      FROM reports r
      INNER JOIN doctors d ON r.doctor_id = d.doctor_id
      INNER JOIN users u ON u.doctor_id = d.doctor_id
      LEFT JOIN doctor_profiles dp ON dp.doctor_id = d.doctor_id
      WHERE r.accession_id = ?
      ORDER BY r.created_at DESC
      LIMIT 1
      `,
      [accessionId]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { status: 'error', message: 'Doctor not found for this report' },
        { status: 404 }
      );
    }

    const doctor = rows[0];

    const fullName = doctor.full_name
      .replace(/\s+/g, ' ')
      .trim();

    return NextResponse.json({
      status: 'ok',
      doctor: {
        fullName: fullName,
        specialty: doctor.specialty,
        licenseNumber: doctor.license_number,
        signaturePath: doctor.signature_path,
      },
    });
  } catch (error) {
    console.error('Error fetching doctor info:', error);
    return NextResponse.json(
      { status: 'error', message: 'Failed to fetch doctor information' },
      { status: 500 }
    );
  }
}