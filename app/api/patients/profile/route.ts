import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { db } from '@/database/db';
import { RowDataPacket } from 'mysql2';

interface PatientRow extends RowDataPacket {
  id: number;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  gender: 'male' | 'female';
  phone: string;
  profile_picture: string | null;
  national_id: string;
  date_of_birth: Date;
  age: number;
  patient_id: number;
  medical_record_number: string;
}

interface StudyRow extends RowDataPacket {
  id: number;
  created_at: Date;
  body_part: string | null;
  report_status: 'Draft' | 'completed' | null;
  doctor_name: string;
}

function stripHtmlTags(html: string | null): string {
  if (!html) return "N/A";

  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { status: 'error', message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = (session.user as any).id;

    if (!userId) {
      return NextResponse.json(
        { status: 'error', message: 'User ID not found' },
        { status: 400 }
      );
    }

    const [patientRows] = await db.query<PatientRow[]>(
      `
      SELECT 
        u.id,
        u.first_name,
        u.middle_name,
        u.last_name,
        u.phone,
        u.profile_picture,
        u.gender,
        p.national_id,
        p.date_of_birth,
        p.patient_id,
        p.medical_record_number,
        TIMESTAMPDIFF(YEAR, p.date_of_birth, CURDATE()) AS age
      FROM users u
      INNER JOIN patients p ON u.patient_id = p.patient_id
      WHERE u.id = ? AND u.role = 'patient'
      LIMIT 1
      `,
      [userId]
    );

    if (patientRows.length === 0) {
      return NextResponse.json(
        { status: 'error', message: 'Patient not found' },
        { status: 404 }
      );
    }

    const patient = patientRows[0];

    const [studyRows] = await db.query<StudyRow[]>(
      `
      SELECT DISTINCT
        a.accession_id AS id,
        a.exam_date AS created_at,
        r.body_part,
        r.report_status,
        COALESCE(
          CONCAT(du.first_name, ' ', du.last_name),
          'Not Assigned'
        ) AS doctor_name
      FROM accession a
      LEFT JOIN reports r ON r.accession_id = a.accession_id
      LEFT JOIN doctor_patient_assignments dpa ON dpa.patient_id = a.patient_id
      LEFT JOIN doctors d ON d.doctor_id = dpa.doctor_id
      LEFT JOIN users du ON du.doctor_id = d.doctor_id
      WHERE a.patient_id = ?
      ORDER BY a.exam_date DESC
      `,
      [patient.patient_id]
    );

    return NextResponse.json({
      status: 'ok',
      patient: {
        id: patient.id,
        first_name: patient.first_name,
        middle_name: patient.middle_name,
        last_name: patient.last_name,
        national_id: patient.national_id,
        age: patient.age,
        gender: patient.gender,          
        phone: patient.phone,
        profile_picture: patient.profile_picture,
      },
      studies: studyRows.map((study, index) => ({
        number: index + 1,
        id: study.id,
        date: new Date(study.created_at).toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }),
        doctorName: study.doctor_name,
        bodyPart: study.report_status === 'completed' ? stripHtmlTags(study.body_part) : '-',
        reportStatus: study.report_status || 'Draft',
      })),
    });
  } catch (error) {
    console.error('Error fetching patient profile:', error);
    return NextResponse.json(
      { status: 'error', message: 'Failed to fetch patient data' },
      { status: 500 }
    );
  }
}