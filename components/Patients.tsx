"use client";

import Link from "next/link";
import Image from "next/image";
import LogOutButton from "@/components/LogOutButton";
import { ID, Age, Gender, Phone } from "@/components/icons";
import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";

type Patient = {
  id: number;
  firstName: string;
  middleName: string | null;
  lastName: string;
  nationalId: string;
  age: number;
  gender: "male" | "female";
  phone: string;
  profilePicture: string | null;
};

type Study = {
  number: number;
  id: number;
  date: string;
  doctorName: string;
  bodyPart: string;
  reportStatus: string;
};

type InfoItem = {
  icon: React.ReactNode;
  label: string;
  value: string;
};

const InfoList = ({ items }: { items: InfoItem[] }) => (
  <div className="profile-info-list">
    {items.map((item, i) => (
      <div key={i} className="profile-info-row">
        <span className="profile-info-icon">{item.icon}</span>
        <span className="profile-info-label" style={{ fontSize: "14px" }}>{item.label}</span>
        <span className="profile-info-value">{item.value}</span>
      </div>
    ))}
  </div>
);

export default function Patients() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [patient, setPatient] = useState<Patient | null>(null);
  const [studies, setStudies]  = useState<Study[]>([]);
  const [loading, setLoading]  = useState(false);
  const [error, setError]      = useState<string | null>(null);

  const fetchPatientData = useCallback(async () => {
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
    } catch {
      setError("Failed to load patient data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated") { router.push("/"); return; }
    fetchPatientData();
  }, [status, fetchPatientData, router]);

  if (status === "loading" || loading) {
    return (
      <section className="patients-page">
        <nav className="patients-nav">
          <div className="patients-nav-logo-wrapper">
            <Image src="/logo.png" alt="Logo" width={240} height={150} className="w-full h-full object-cover" />
          </div>
        </nav>
        <main className="patients-main">
          <div className="text-center text-white p-8">
            <div className="border-4 border-gray-300 border-t-blue-600 rounded-full w-10 h-10 animate-spin mx-auto" />
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

  const fullName  = [patient.firstName, patient.middleName, patient.lastName].filter(Boolean).join(" ");
  const profileImg = patient.profilePicture || "/api/images/default";

  const infoItems: InfoItem[] = [
    { icon: <ID />,     label: "National ID", value: patient.nationalId },
    { icon: <Age />,    label: "Age",         value: String(patient.age) },
    { icon: <Gender />, label: "Gender",      value: patient.gender === "male" ? "Male" : "Female" },
    { icon: <Phone />,  label: "Phone",       value: patient.phone },
  ];

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
                <InfoList items={infoItems} />
              </div>

            </div>
          </div>

          <div className="patients-card-table">
            <h4 className="patients-table-title">My File</h4>

            <div className="patients-table-wrapper" style={{ maxHeight: "300px", overflowY: "auto" }}>
              <table className="w-full text-white">
                <thead className="table-head-row">
                  <tr>
                    {["#", "Date", "Doctor Name", "Body Part", "Report"].map((h) => (
                      <th
                        key={h}
                        className="py-1 px-1 text-[11px] sm:py-3 sm:px-3 sm:text-sm lg:text-base font-medium text-center whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {studies.length ? (
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
                            <span className="text-gray-400 cursor-not-allowed select-none">Not available yet</span>
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