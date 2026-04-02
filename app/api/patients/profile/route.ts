import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { db } from '@/database/db';
import { RowDataPacket } from 'mysql2';

interface PatientRow extends RowDataPacket {
  id: number;
  firstName: string;
  middleName: string | null;
  lastName: string;
  gender: 'male' | 'female';
  phone: string;
  profilePicture: string | null;
  nationalId: string;
  dateOfBirth: Date;
  patientId: number;
  medicalRecordNumber: string;
  age: number;
}

interface StudyRow extends RowDataPacket {
  id: number;
  createdAt: Date;
  bodyPart: string | null;
  reportStatus: 'Draft' | 'completed' | null;
  doctorName: string;
}

function stripHtmlTags(html: string | null): string {
  if (!html) return 'N/A';
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
    if (!session?.user) {
      return NextResponse.json({ status: 'error', message: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    if (!userId) {
      return NextResponse.json({ status: 'error', message: 'User ID not found' }, { status: 400 });
    }

    const [patientRows] = await db.query<PatientRow[]>(
      `
      SELECT
        u.id,
        u.first_name             AS firstName,
        u.middle_name            AS middleName,
        u.last_name              AS lastName,
        u.phone,
        u.profile_picture        AS profilePicture,
        u.gender,
        p.national_id            AS nationalId,
        p.date_of_birth          AS dateOfBirth,
        p.patient_id             AS patientId,
        p.medical_record_number  AS medicalRecordNumber,
        TIMESTAMPDIFF(YEAR, p.date_of_birth, CURDATE()) AS age
      FROM users u
      INNER JOIN patients p ON u.patient_id = p.patient_id
      WHERE u.id = ? AND u.role = 'patient'
      LIMIT 1
      `,
      [userId]
    );

    if (!patientRows.length) {
      return NextResponse.json({ status: 'error', message: 'Patient not found' }, { status: 404 });
    }

    const patient = patientRows[0];

    const [studyRows] = await db.query<StudyRow[]>(
      `
      SELECT DISTINCT
        a.accession_id   AS id,
        a.exam_date      AS createdAt,
        r.body_part      AS bodyPart,
        r.report_status  AS reportStatus,
        COALESCE(
          CONCAT(du.first_name, ' ', du.last_name),
          'Not Assigned'
        ) AS doctorName
      FROM accession a
      LEFT JOIN reports r                    ON r.accession_id  = a.accession_id
      LEFT JOIN doctor_patient_assignments dpa ON dpa.patient_id = a.patient_id
      LEFT JOIN doctors d                    ON d.doctor_id     = dpa.doctor_id
      LEFT JOIN users du                     ON du.doctor_id    = d.doctor_id
      WHERE a.patient_id = ?
      ORDER BY a.exam_date DESC
      `,
      [patient.patientId]
    );

    return NextResponse.json({
      status: 'ok',
      patient: {
        id:             patient.id,
        firstName:      patient.firstName,
        middleName:     patient.middleName,
        lastName:       patient.lastName,
        nationalId:     patient.nationalId,
        age:            patient.age,
        gender:         patient.gender,
        phone:          patient.phone,
        profilePicture: patient.profilePicture,
      },
      studies: studyRows.map((study, index) => ({
        number:       index + 1,
        id:           study.id,
        date:         new Date(study.createdAt).toLocaleDateString('en-GB', {
          day: '2-digit', month: 'short', year: 'numeric',
        }),
        doctorName:   study.doctorName,
        bodyPart:     study.reportStatus === 'completed' ? stripHtmlTags(study.bodyPart) : '-',
        reportStatus: study.reportStatus || 'Draft',
      })),
    });

  } catch (error) {
    console.error('Error fetching patient profile:', error);
    return NextResponse.json({ status: 'error', message: 'Failed to fetch patient data' }, { status: 500 });
  }
}