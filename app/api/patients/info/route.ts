import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/database/db';
import { RowDataPacket } from 'mysql2';

interface PatientInfoRow extends RowDataPacket {
  full_name: string;
  medical_record_number: string;
  national_id: string;
  age: number;
  gender: string;
  exam_date: Date;
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

    const [rows] = await db.query<PatientInfoRow[]>(
      `
      SELECT 
        CONCAT(u.first_name, ' ', COALESCE(u.middle_name, ''), ' ', u.last_name) AS full_name,
        p.medical_record_number,
        p.national_id,
        TIMESTAMPDIFF(YEAR, p.date_of_birth, CURDATE()) AS age,
        u.gender,
        a.exam_date
      FROM accession a
      INNER JOIN patients p ON a.patient_id = p.patient_id
      INNER JOIN users u ON u.patient_id = p.patient_id
      WHERE a.accession_id = ?
      LIMIT 1
      `,
      [accessionId]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { status: 'error', message: 'Patient not found' },
        { status: 404 }
      );
    }

    const patient = rows[0];

    return NextResponse.json({
      status: 'ok',
      patient: {
        fullName: patient.full_name.trim(),
        medicalRecordNumber: patient.medical_record_number,
        nationalId: patient.national_id,
        age: patient.age,
        gender: patient.gender === 'male' ? 'Male' : 'Female',
        examDate: new Date(patient.exam_date).toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }),
      },
    });
  } catch (error) {
    console.error('Error fetching patient info:', error);
    return NextResponse.json(
      { status: 'error', message: 'Failed to fetch patient information' },
      { status: 500 }
    );
  }
}