import Link from "next/link";
import Image from "next/image";
import LogOutButton from "@/components/LogOutButton";
import { ID, Age, Gender, Phone } from "@/components/icons";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/database/db";
import { RowDataPacket } from "mysql2"; // ✅ إضافة هذا

// ✅ تعريف الأنواع باستخدام RowDataPacket
interface PatientRow extends RowDataPacket {
  id: number;
  firstName: string;
  middleName: string | null;
  lastName: string;
  gender: "M" | "F";
  phone: string;
  profile_picture: string | null;
  patient_code: string;
  dob: Date;
  age: number;
}

interface StudyRow extends RowDataPacket {
  id: number;
  created_at: Date;
  body_part: string | null;
  doctor_name: string;
}

interface Patient {
  id: number;
  fullName: string;
  firstName: string;
  lastName: string;
  nationalId: string;
  age: number;
  gender: string;
  phone: string;
  profilePicture: string | null;
}

interface Study {
  number: number;
  id: number;
  date: string;
  doctorName: string;
  bodyPart: string;
}



// ✅ دالة لجلب بيانات المريض
async function getPatientData(userId: string): Promise<{
  patient: Patient;
  studies: Study[];
} | null> {
  try {
    // ✅ استخدام RowDataPacket
    const [rows] = await db.query<PatientRow[]>(
      `
      SELECT 
        u.id,
        u.firstName,
        u.middleName,
        u.lastName,
        u.gender,
        u.phone,
        u.profile_picture,
        p.patient_code,
        p.dob,
        TIMESTAMPDIFF(YEAR, p.dob, CURDATE()) AS age
      FROM users u
      JOIN patient_accounts pa ON pa.user_id = u.id
      JOIN patients p ON p.id = pa.patient_id
      WHERE u.id = ?
      LIMIT 1
      `,
      [userId]
    );

    if (!rows.length) return null;

    const patient = rows[0];

    // ✅ استخدام RowDataPacket
    const [studies] = await db.query<StudyRow[]>(
      `
      SELECT 
        s.id,
        s.created_at,
        s.body_part,
        CONCAT(doctor.firstName, ' ', doctor.lastName) AS doctor_name
      FROM studies s
      JOIN patient_accounts pa ON pa.patient_id = s.patient_id
      JOIN reports r ON r.study_id = s.id
      JOIN users doctor ON doctor.id = r.doctor_id
      WHERE pa.user_id = ?
      ORDER BY s.created_at DESC
      `,
      [userId]
    );

    return {
      patient: {
        id: patient.id,
        fullName: `${patient.firstName} ${patient.middleName || ""} ${patient.lastName}`.trim(),
        firstName: patient.firstName,
        lastName: patient.lastName,
        nationalId: patient.patient_code,
        age: patient.age,
        gender: patient.gender === "M" ? "Male" : "Female",
        phone: patient.phone,
        profilePicture: patient.profile_picture,
      },
      studies: studies.map((study, index) => ({
        number: index + 1,
        id: study.id,
        date: new Date(study.created_at).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
        doctorName: study.doctor_name,
        bodyPart: study.body_part || "N/A",
      })),
    };
  } catch (err) {
    console.error("💥 GET PATIENT DATA ERROR:", err);
    return null;
  }
}



export default async function PatientsPage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("user_id")?.value;

  if (!userId) {
    redirect("/");
  }

  console.log("🔍 Fetching patient data for user_id:", userId);

  const data = await getPatientData(userId);

  if (!data) {
    return (
      <section className="patients-page">
        <nav className="patients-nav">
          <div className="patients-nav-logo-wrapper">
            <Image
              src="/logo.png"
              alt="Logo"
              width={240}
              height={150}
              className="w-full h-full object-cover"
            />
          </div>
          <LogOutButton />
        </nav>
        <main className="patients-main">
          <div className="text-center text-red-500 p-8">
            <h2 className="text-2xl font-bold mb-4">Error</h2>
            <p>Patient data not found</p>
            <Link href="/" className="text-blue-500 underline mt-4 block">
              Go to Login
            </Link>
          </div>
        </main>
      </section>
    );
  }

  const { patient, studies } = data;

  return (
    <section className="patients-page">
      <nav className="patients-nav">
        <div className="patients-nav-logo-wrapper">
          <Image
            src="/logo.png"
            alt="Logo"
            width={240}
            height={150}
            className="w-full h-full object-cover"
          />
        </div>
        <LogOutButton />
      </nav>

      <main className="patients-main">
        <div className="patients-grid">

          <div className="patients-card-profile">
  <div className="profile-wrapper">
    <div className="profile-photo-wrapper">
      <div className="profile-photo">
        <Image
          src={
            patient.profilePicture
              ? `/profiles/${patient.profilePicture}`
              : "/profiles/default-avatar.png"
          }
          alt={patient.fullName}
          width={200}
          height={200}
          className="w-full h-full object-cover"
        />
      </div>

    </div>

    <div className="profile-details-wrapper">
      <h1 className="profile-name-desktop ">
        {patient.fullName}
      </h1>

      <div className="profile-info-list">

        <div className="profile-info-row">
          <span className="profile-info-icon">
            <ID />
          </span>
          <span className="profile-info-label">National ID</span>
          <span className="profile-info-value">{patient.nationalId}</span>
        </div>

        <div className="profile-info-row">
          <span className="profile-info-icon">
            <Age />
          </span>
          <span className="profile-info-label">Age</span>
          <span className="profile-info-value">{patient.age}</span>
        </div>

        <div className="profile-info-row">
          <span className="profile-info-icon">
            <Gender />
          </span>
          <span className="profile-info-label">Gender</span>
          <span className="profile-info-value">{patient.gender}</span>
        </div>

        <div className="profile-info-row">
          <span className="profile-info-icon">
            <Phone />
          </span>
          <span className="profile-info-label">Phone</span>
          <span className="profile-info-value">{patient.phone}</span>
        </div>

      </div>
    </div>
  </div>
</div>

          <div className="patients-card-table">
            <h4 className="patients-table-title">
              My File
            </h4>
            <div className="patients-table-wrapper">
              <table className="w-full text-white">
                <thead className="table-head-row">
                  <tr>
                    <th className="table-cell-head">#</th>
                    <th className="table-cell-head">Date</th>
                    <th className="table-cell-head">Doctor Name</th>
                    <th className="table-cell-head">Body Part</th>
                    <th className="table-cell-head">Report</th>
                  </tr>
                </thead>
                <tbody>
                  {studies && studies.length > 0 ? (
                    studies.map((study) => (
                      <tr key={study.id} className="table-row">
                        <td className="table-cell">{study.number}</td>
                        <td className="table-cell">{study.date}</td>
                        <td className="table-cell">{study.doctorName}</td>
                        <td className="table-cell">{study.bodyPart}</td>
                        <td className="table-cell">
                          <Link
                            href={`/patients/reportPatients?study_id=${study.id}`}
                            className="table-link"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr className="table-row">
                      <td colSpan={5} className="table-cell text-center">
                        No records found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </main>
    </section>
  );
}