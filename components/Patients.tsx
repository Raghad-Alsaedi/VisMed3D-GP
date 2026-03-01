"use client";

import Link from "next/link";
import Image from "next/image";
import LogOutButton from "@/components/LogOutButton";
import { ID, Age, Gender, Phone } from "@/components/icons";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

interface Patient {
  id: number;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  national_id: string;
  age: number;
  gender: "male" | "female";
  phone: string;
  profile_picture: string | null;
}

interface Study {
  number: number;
  id: number;
  date: string;
  doctorName: string;
  bodyPart: string;
  reportStatus: string;
}

export default function Patients() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [patient, setPatient] = useState<Patient | null>(null);
  const [studies, setStudies] = useState<Study[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPatientData = async () => {
      if (status === "loading") return;

      if (status === "unauthenticated") {
        router.push("/");
        return;
      }

      if (!session?.user) {
        setError("User session not found");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        const response = await fetch("/api/patients/profile");
        const data = await response.json();

        if (data.status === "ok") {
          setPatient(data.patient);
          setStudies(data.studies);
        } else {
          setError(data.message || "Failed to load patient data");
        }
      } catch (err) {
        console.error("Error fetching patient data:", err);
        setError("Failed to load patient data");
      } finally {
        setLoading(false);
      }
    };

    fetchPatientData();
  }, [session, status, router]);

  if (status === "loading" || (loading && status === "authenticated")) {
    return (
      <section className="patients-page">
        <nav className="patients-nav">
          <div className="patients-nav-logo-wrapper">
            <Image src="/logo.png" alt="Logo" width={240} height={150} className="w-full h-full object-cover" />
          </div>
        </nav>
        <main className="patients-main">
          <div className="text-center text-white p-8">
            <div className="border-4 border-gray-300 border-t-blue-600 rounded-full w-10 h-10 animate-spin mx-auto"></div>
            <p className="mt-4">Loading...</p>
          </div>
        </main>
      </section>
    );
  }

  if (error || !patient) {
    return (
      <section className="patients-page">
        <nav className="patients-nav">
          <div className="patients-nav-logo-wrapper">
            <Image src="/logo.png" alt="Logo" width={240} height={150} className="w-full h-full object-cover" />
          </div>
          <LogOutButton />
        </nav>
        <main className="patients-main">
          <div className="text-center text-red-500 p-8">
            <h2 className="text-2xl font-bold mb-4">Error</h2>
            <p>{error || "Patient data not found"}</p>
            <Link href="/" className="text-blue-500 underline mt-4 block">Go to Login</Link>
          </div>
        </main>
      </section>
    );
  }

  const fullName   = [patient.first_name, patient.middle_name, patient.last_name].filter(Boolean).join(" ");
  const genderText = patient.gender === "male" ? "Male" : "Female";
  const profileImg = patient.profile_picture || "/api/images/default";

  return (
    <section className="patients-page">
      <nav className="patients-nav">
        <div className="patients-nav-logo-wrapper">
          <Image src="/logo.png" alt="Logo" width={240} height={150} className="w-full h-full object-cover" />
        </div>
        <LogOutButton />
      </nav>

      <main className="patients-main">
        <div className="patients-grid">

          <div className="patients-card-profile">
            <div className="flex flex-col md:flex-row lg:flex-col items-center md:justify-center md:gap-20 lg:gap-4">

              <div className="flex flex-col items-center gap-3 flex-shrink-0">
                <div className="profile-photo">
                  <Image
                    src={profileImg}
                    alt={fullName}
                    width={200}
                    height={200}
                    className="w-full h-full object-cover"
                    unoptimized
                  />
                </div>

                <h1 className="[@media(min-width:600px)_and_(max-width:1023px)]:block hidden text-white font-semibold text-lg text-center">
                  {fullName}
                </h1>
              </div>

              <div className="flex flex-col items-center md:items-start lg:items-center w-full md:w-auto mt-4 md:mt-0 lg:mt-0">

                <h1 className="profile-name-desktop block [@media(min-width:600px)_and_(max-width:1023px)]:!hidden">
                  {fullName}
                </h1>

                <div className="profile-info-list">
                  <div className="profile-info-row">
                    <span className="profile-info-icon"><ID /></span>
                    <span className="profile-info-label" style={{ fontSize: "14px" }}>National ID</span>
                    <span className="profile-info-value">{patient.national_id}</span>
                  </div>
                  <div className="profile-info-row">
                    <span className="profile-info-icon"><Age /></span>
                    <span className="profile-info-label" style={{ fontSize: "14px" }}>Age</span>
                    <span className="profile-info-value">{patient.age}</span>
                  </div>
                  <div className="profile-info-row">
                    <span className="profile-info-icon"><Gender /></span>
                    <span className="profile-info-label" style={{ fontSize: "14px" }}>Gender</span>
                    <span className="profile-info-value">{genderText}</span>
                  </div>
                  <div className="profile-info-row">
                    <span className="profile-info-icon"><Phone /></span>
                    <span className="profile-info-label" style={{ fontSize: "14px" }}>Phone</span>
                    <span className="profile-info-value">{patient.phone}</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

          
          <div className="patients-card-table">
            <h4 className="patients-table-title">My File</h4>

            <div className="patients-table-wrapper" style={{ maxHeight: "300px", overflowY: "auto" }}>
              <table className="w-full text-white">
                <thead className="table-head-row">
                  <tr>
                    <th className="py-1 px-1 text-[11px] sm:py-3 sm:px-3 sm:text-sm lg:text-base font-medium text-center whitespace-nowrap">#</th>
                    <th className="py-1 px-1 text-[11px] sm:py-3 sm:px-3 sm:text-sm lg:text-base font-medium text-center whitespace-nowrap">Date</th>
                    <th className="py-1 px-1 text-[11px] sm:py-3 sm:px-3 sm:text-sm lg:text-base font-medium text-center whitespace-nowrap">Doctor Name</th>
                    <th className="py-1 px-1 text-[11px] sm:py-3 sm:px-3 sm:text-sm lg:text-base font-medium text-center whitespace-nowrap">Body Part</th>
                    <th className="py-1 px-1 text-[11px] sm:py-3 sm:px-3 sm:text-sm lg:text-base font-medium text-center whitespace-nowrap">Report</th>
                  </tr>
                </thead>
                <tbody>
                  {studies && studies.length > 0 ? (
                    studies.map((study) => (
                      <tr key={study.id} className="table-row">
                        <td className="py-1 px-1 text-[11px] sm:py-3 sm:px-3 sm:text-sm lg:text-base text-center whitespace-nowrap">{study.number}</td>
                        <td className="py-1 px-1 text-[11px] sm:py-3 sm:px-3 sm:text-sm lg:text-base text-center whitespace-nowrap">{study.date}</td>
                        <td className="py-1 px-1 text-[11px] sm:py-3 sm:px-3 sm:text-sm lg:text-base text-center whitespace-nowrap">{study.doctorName}</td>
                        <td className="py-1 px-1 text-[11px] sm:py-3 sm:px-3 sm:text-sm lg:text-base text-center whitespace-nowrap">{study.bodyPart}</td>
                        <td className="py-1 px-1 text-[11px] sm:py-3 sm:px-3 sm:text-sm lg:text-base text-center whitespace-nowrap">
                          {study.reportStatus === "completed" ? (
                            <Link href={`/patients/reportPatients?accession_id=${study.id}`} className="table-link">
                              View Report
                            </Link>
                          ) : (
                            <span className="text-gray-400 cursor-not-allowed select-none">
                              Not available yet
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr className="table-row">
                      <td colSpan={5} className="table-cell text-center">No records found</td>
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