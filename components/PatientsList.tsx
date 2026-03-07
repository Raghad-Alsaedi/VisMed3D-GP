"use client";

import Link from "next/link";
import React, { useState, useEffect, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Search, Upload_Action, Img, Report, ChevronRight, Success, Error as ErrorIcon } from "@/components/icons";

interface Patient {
  patient_id: number;
  full_name: string;
  medical_record_number: string;
  profile_picture: string | null;
}

interface PatientDetails {
  id: number;
  full_name: string;
  national_id: string;
  mrn: string;
  age: number;
  gender: string;
  phone: string;
}

interface Accession {
  accession_id: number;
  accession_number: string;
  exam_date: string;
  modality: string;
  body_part: string;
  report_content?: string;
  report_status?: string;
  volume_id: number | null;
}

const applyFilter = (patients: Patient[], query: string): Patient[] => {
  if (!query.trim()) return patients;
  const q = query.toLowerCase().trim();
  return patients.filter(
    (p) =>
      p.full_name.toLowerCase().includes(q) ||
      p.medical_record_number.toLowerCase().includes(q)
  );
};

const PatientList = () => {
  const pathname     = usePathname();
  const router       = useRouter();
  const searchParams = useSearchParams();
  const { status }   = useSession();

  const [searchQuery, setSearchQuery]           = useState("");
  const [allPatients, setAllPatients]           = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient]   = useState<PatientDetails | null>(null);
  const [accessions, setAccessions]             = useState<Accession[]>([]);
  const [showDetails, setShowDetails]           = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);
  const [savedToast, setSavedToast] = useState<"success" | "error" | null>(null);

  const allPatientsRef = useRef<Patient[]>([]);
  const searchQueryRef = useRef<string>("");

  const isDoctor = pathname.startsWith("/doctor");
  const isTech   = pathname.startsWith("/radio_tech");

  useEffect(() => { allPatientsRef.current = allPatients; }, [allPatients]);
  useEffect(() => { searchQueryRef.current = searchQuery; }, [searchQuery]);

  useEffect(() => {
    const checkToast = () => {
      const result = sessionStorage.getItem("upload_result");
      if (result === "success" || result === "error") {
        sessionStorage.removeItem("upload_result");
        setSavedToast(result as "success" | "error");
      }
    };
    checkToast();
    window.addEventListener("upload_result_set", checkToast);
    return () => window.removeEventListener("upload_result_set", checkToast);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (isDoctor)    localStorage.setItem("userRole", "/doctor");
      else if (isTech) localStorage.setItem("userRole", "/radio_tech");
    }
  }, [isDoctor, isTech]);

  useEffect(() => {
    if (status === "loading") return;
    const fetchAllPatients = async () => {
      try {
        const res  = await fetch(`/api/search/patients?query=`);
        const data = await res.json();
        if (data.status === "ok") {
          const patients: Patient[] = data.patients;
          setAllPatients(patients);
          setFilteredPatients(applyFilter(patients, searchQueryRef.current));
        }
      } catch (err) {
        console.error("Fetch all patients error:", err);
      }
    };
    fetchAllPatients();
  }, [status]);

  useEffect(() => {
    setFilteredPatients(applyFilter(allPatientsRef.current, searchQuery));
  }, [searchQuery]);

  useEffect(() => {
    const patientIdFromUrl = searchParams.get("patientId");
    if (patientIdFromUrl) {
      const id = parseInt(patientIdFromUrl);
      fetchPatient(id);
    }
  }, [searchParams]);

  const fetchPatient = async (patientId: number) => {
    try {
      const res  = await fetch(`/api/patientsList/${patientId}`);
      const data = await res.json();
      if (data.status === "ok") {
        setSelectedPatient(data.patient);
        setAccessions(data.accessions);
        setShowDetails(true);
        setSelectedPatientId(patientId);
      }
    } catch (err) {
      console.error("Fetch patient error:", err);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handlePatientClick = (patientId: number) => {
    if (selectedPatientId === patientId) {
      setSelectedPatient(null);
      setAccessions([]);
      setShowDetails(false);
      setSelectedPatientId(null);
      router.replace(pathname);
      return;
    }
    router.replace(`${pathname}?patientId=${patientId}`);
  };

  const getReportStatusLabel = (reportStatus: string | undefined) => {
    if (reportStatus === "completed") return { label: "Completed" };
    return { label: "Draft" };
  };

  return (
    <>
      <style>{`
        .status-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 500;
          display: inline-block;
          color: white;
        }
        .status-completed { background-color: #1F9C3E; }
        .status-draft     { background-color: #6E6E6E; }

        @media (min-width: 768px) {
          .hide-scrollbar-md::-webkit-scrollbar { display: none; }
          .hide-scrollbar-md { -ms-overflow-style: none; scrollbar-width: none; }
        }

        html, body {
          background-color: #0D1A2D !important;
        }

        @media (min-width: 600px) and (max-width: 850px) {
          .table-cell-wrap {
            white-space: nowrap !important;
            font-size: 9px !important;
            padding: 4px 3px !important;
          }
          .files-table {
            table-layout: auto;
            width: 100%;
          }
          .status-badge {
            font-size: 8px !important;
            padding: 0.15rem 0.4rem !important;
          }
        }
      `}</style>

      {savedToast && (
        <>
          <style>{`
            @keyframes toastFadeOut {
              0%   { opacity: 1; }
              70%  { opacity: 1; }
              100% { opacity: 0; }
            }
            .toast-fade-out {
              animation: toastFadeOut 2s ease forwards;
            }
          `}</style>
          <div
            className={`toast-fade-out fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white shadow-lg whitespace-nowrap ${
              savedToast === "success" ? "bg-[#1F9C3E]" : "bg-red-600"
            }`}
            onAnimationEnd={() => setSavedToast(null)}
          >
            {savedToast === "success"
              ? <><Success className="icon-svg-sm" /> Volume saved successfully</>
              : <><ErrorIcon className="icon-svg-sm" /> Failed to save volume</>
            }
          </div>
        </>
      )}

      <section className="bg-[#0D1A2D] overflow-y-auto overflow-x-hidden px-4 pt-16 pb-4 md:p-8 md:pl-[270px] md:pt-8" style={{ minHeight: "100dvh" }}>

        <div className="flex flex-col md:flex-row gap-4 md:gap-8 md:items-stretch">

          <div className="w-full min-w-0 md:w-5/12">

            <h2 className="text-xl md:text-2xl font-semibold text-white mb-4 md:mb-5 md:-mt-4">
              Patients List
            </h2>

            <div className="relative mb-4 md:mb-5">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                className="w-full max-w-full pl-11 pr-4 py-3 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder-gray-400 text-white bg-[#040A16]"
                style={{ border: "1.5px solid rgba(255, 255, 255, 0.3)", boxSizing: "border-box" }}
                placeholder="Search by Name or MRN"
                value={searchQuery}
                onChange={handleSearch}
              />
            </div>

            {filteredPatients.map((patient) => (
              <div
                key={patient.patient_id}
                className="w-full max-w-full rounded-lg p-3 md:p-4 mb-3 md:mb-4 flex items-center cursor-pointer transition-all duration-200 hover:shadow-lg"
                style={{
                  border: selectedPatientId === patient.patient_id
                    ? "3px solid #303A46"
                    : "1.5px solid rgba(255, 255, 255, 0.3)",
                  backgroundColor: "#040A16",
                  boxSizing: "border-box",
                }}
                onClick={() => handlePatientClick(patient.patient_id)}
              >
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gray-200 mr-3 md:mr-4 overflow-hidden flex-shrink-0">
                  <img
                    src={patient.profile_picture ? `/${patient.profile_picture}` : "/api/images/default"}
                    alt={patient.full_name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm md:text-base font-semibold text-white mb-1 truncate">
                    {patient.full_name}
                  </div>
                  <div className="text-xs md:text-sm text-gray-200 truncate">
                    {patient.medical_record_number}
                  </div>
                </div>
                <div className="text-white text-lg md:text-xl flex-shrink-0">
                  <ChevronRight />
                </div>
              </div>
            ))}

          </div>

          {showDetails && (
            <div
              className="hidden md:block flex-shrink-0 h-screen"
              style={{ width: "3px", backgroundColor: "#303A46" }}
            />
          )}

          {showDetails && selectedPatient && (
            <div className="w-full min-w-0 md:w-7/12 overflow-x-hidden">

              <div
                className="w-full max-w-full rounded-[10px] p-3 md:p-4 lg:p-6 mb-3 md:mb-4 lg:mb-8 shadow-sm bg-[#040A16]"
                style={{
                  border: "1.5px solid rgba(255, 255, 255, 0.3)",
                  boxSizing: "border-box",
                }}
              >
                <h2 className="text-base md:text-lg lg:text-xl font-semibold text-white mb-3 md:mb-3 lg:mb-5">
                  Basic Information
                </h2>
                {[
                  { label: "National ID", value: selectedPatient.national_id },
                  { label: "MRN",         value: selectedPatient.mrn         },
                  { label: "Age",         value: selectedPatient.age         },
                  { label: "Gender",      value: selectedPatient.gender      },
                  { label: "Phone",       value: selectedPatient.phone       },
                ].map(({ label, value }, i, arr) => (
                  <div
                    key={label}
                    className="flex justify-between py-2 md:py-2 lg:py-3"
                    style={i < arr.length - 1 ? { borderBottom: "1.5px solid #303A46" } : undefined}
                  >
                    <span className="font-medium text-gray-300 text-xs md:text-sm lg:text-base">{label}</span>
                    <span className="text-white font-medium text-xs md:text-sm lg:text-base">{value}</span>
                  </div>
                ))}
              </div>

              <div
                className="w-full max-w-full rounded-[10px] p-3 md:p-4 lg:p-6 shadow-sm bg-[#040A16]"
                style={{
                  border: "1.5px solid rgba(255, 255, 255, 0.3)",
                  boxSizing: "border-box",
                }}
              >
                <h2 className="text-base md:text-lg lg:text-xl font-semibold text-white mb-3 md:mb-3 lg:mb-5">
                  Files
                </h2>

                <div
                  className="hide-scrollbar-md w-full max-h-[300px] overflow-y-auto overflow-x-auto"
                  style={{ border: "1.5px solid #303A46", boxSizing: "border-box" }}
                >
                  <table className="files-table w-full border-collapse text-white">
                    <thead style={{ borderBottom: "1.5px solid #303A46" }}>
                      <tr>
                        <th className="py-1.5 px-1 md:py-2 md:px-1.5 lg:py-3 lg:px-3 text-[10px] md:text-[11px] lg:text-sm font-medium text-center table-cell-wrap">Accession</th>
                        <th className="py-1.5 px-1 md:py-2 md:px-1.5 lg:py-3 lg:px-3 text-[10px] md:text-[11px] lg:text-sm font-medium text-center table-cell-wrap">Date</th>
                        {isTech   && <th className="py-1.5 px-1 md:py-2 md:px-1.5 lg:py-3 lg:px-3 text-[10px] md:text-[11px] lg:text-sm font-medium text-center table-cell-wrap">Modality</th>}
                        {isDoctor && <th className="py-1.5 px-1 md:py-2 md:px-1.5 lg:py-3 lg:px-3 text-[10px] md:text-[11px] lg:text-sm font-medium text-center table-cell-wrap">Report Status</th>}
                        <th className="py-1.5 px-1 md:py-2 md:px-1.5 lg:py-3 lg:px-3 text-[10px] md:text-[11px] lg:text-sm font-medium text-center table-cell-wrap">
                          {isTech ? "Actions" : "Action"}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {accessions.length > 0 ? (
                        accessions.map((acc, idx) => {
                          const reportStatus = isDoctor ? getReportStatusLabel(acc.report_status) : null;
                          return (
                            <tr
                              key={`${acc.accession_id}-${idx}`}
                              className="transition-colors bg-[#040A16] hover:bg-[#0D1A2D]"
                              style={{ borderBottom: "1.5px solid #303A46" }}
                            >
                              <td className="py-1.5 px-1 md:py-2 md:px-1.5 lg:py-3 lg:px-3 text-[10px] md:text-[11px] lg:text-sm text-center table-cell-wrap">{acc.accession_number}</td>
                              <td className="py-1.5 px-1 md:py-2 md:px-1.5 lg:py-3 lg:px-3 text-[10px] md:text-[11px] lg:text-sm text-center table-cell-wrap">{acc.exam_date}</td>
                              {isTech && (
                                <td className="py-1.5 px-1 md:py-2 md:px-1.5 lg:py-3 lg:px-3 text-[10px] md:text-[11px] lg:text-sm text-center table-cell-wrap">{acc.modality}</td>
                              )}
                              {isDoctor && reportStatus && (
                                <td className="py-1.5 px-1 md:py-2 md:px-1.5 lg:py-3 lg:px-3 text-[10px] md:text-[11px] lg:text-sm text-center table-cell-wrap">
                                  <span className={`status-badge status-${reportStatus.label.toLowerCase()}`}>
                                    {reportStatus.label}
                                  </span>
                                </td>
                              )}
                              <td className="py-1.5 px-1 md:py-2 md:px-1.5 lg:py-3 lg:px-3 text-[10px] md:text-[11px] lg:text-sm text-center table-cell-wrap">
                                {isTech ? (
                                  <div className="flex items-center gap-1 md:gap-1.5 lg:gap-2 justify-center">
                                    <div className="relative group">
                                      <Link
                                        href={`/radio_tech/dropfile?patientId=${selectedPatient.id}&accessionId=${acc.accession_id}`}
                                        className="p-1.5 md:p-2 hover:bg-[#0D1A2D] transition rounded cursor-pointer block"
                                      >
                                        <Upload_Action className="text-lg text-white" />
                                      </Link>
                                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                        Upload File
                                      </div>
                                    </div>
                                    {acc.volume_id && (
                                      <div className="relative group">
                                        <Link
                                          href={`/viewimg?volumeId=${acc.volume_id}&accession_id=${acc.accession_id}`}
                                          className="p-1.5 md:p-2 hover:bg-[#0D1A2D] transition rounded cursor-pointer block"
                                        >
                                          <Img className="text-white text-lg" />
                                        </Link>
                                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                          View Image
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                ) : isDoctor ? (
                                  <div className="flex items-center gap-1 md:gap-1.5 lg:gap-2 justify-center">
                                    <div className="relative group">
                                      <Link
                                        href={`/doctor/writingReport?accession_id=${acc.accession_id}&from=patientlist&patientId=${selectedPatient.id}`}
                                        className="p-1.5 md:p-2 hover:bg-[#0D1A2D] transition rounded cursor-pointer block"
                                      >
                                        <Report className="text-white" style={{ fontSize: "1.5rem" }} />
                                      </Link>
                                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                        Write Report
                                      </div>
                                    </div>
                                  </div>
                                ) : null}
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr className="transition-colors bg-[#040A16] hover:bg-[#0D1A2D]" style={{ borderBottom: "1.5px solid #303A46" }}>
                          <td colSpan={4} className="py-1.5 px-1 md:py-2 md:px-1.5 lg:py-3 lg:px-3 text-[10px] md:text-[11px] lg:text-sm text-center whitespace-nowrap">
                            No records found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default PatientList;