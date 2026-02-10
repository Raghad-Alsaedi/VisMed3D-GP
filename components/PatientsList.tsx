"use client";
import Link from "next/link";
import React, { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { Search, Upload_Action, Img, Report, ChevronRight } from "@/components/icons";

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
}

const PatientList = () => {
  const pathname = usePathname();

  const [searchQuery, setSearchQuery] = useState("");
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<PatientDetails | null>(
    null,
  );
  const [accessions, setAccessions] = useState<Accession[]>([]);
  const [showDetails, setShowDetails] = useState(false);
  
  // ✅ Add ref to track if user is on the page
  const isPageVisible = useRef(true);

  const isDoctor = pathname.startsWith("/doctor");
  const isTech = pathname.startsWith("/radio_tech");

  useEffect(() => {
    const savedSearchQuery = sessionStorage.getItem("patientList_searchQuery");
    const savedPatients = sessionStorage.getItem("patientList_patients");
    const savedSelectedPatient = sessionStorage.getItem(
      "patientList_selectedPatient",
    );
    const savedAccessions = sessionStorage.getItem("patientList_accessions");
    const savedShowDetails = sessionStorage.getItem("patientList_showDetails");

    if (savedSearchQuery) setSearchQuery(savedSearchQuery);
    if (savedPatients) setPatients(JSON.parse(savedPatients));
    if (savedSelectedPatient)
      setSelectedPatient(JSON.parse(savedSelectedPatient));
    if (savedAccessions) setAccessions(JSON.parse(savedAccessions));
    if (savedShowDetails) setShowDetails(savedShowDetails === "true");
  }, []);

  // ✅ Track page visibility
  useEffect(() => {
    const handleVisibilityChange = () => {
      isPageVisible.current = !document.hidden;
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  // ✅ Smart refresh - only updates report status when content changes
  useEffect(() => {
    if (!showDetails || !selectedPatient || !isDoctor) return;

    const interval = setInterval(async () => {
      // Only refresh if page is visible
      if (!isPageVisible.current) return;

      try {
        const res = await fetch(`/api/patientsList/${selectedPatient.id}`);
        const data = await res.json();

        if (data.status === "ok") {
          // ✅ Only update if report status actually changed
          const hasChanges = data.accessions.some((newAcc: Accession, index: number) => {
            const oldAcc = accessions[index];
            return oldAcc && (
              newAcc.report_status !== oldAcc.report_status ||
              newAcc.report_content !== oldAcc.report_content
            );
          });

          if (hasChanges) {
            setAccessions(data.accessions);
            sessionStorage.setItem(
              "patientList_accessions",
              JSON.stringify(data.accessions),
            );
          }
        }
      } catch (err) {
        console.error("Auto-refresh error:", err);
      }
    }, 200); // ✅ Check every 2 seconds (fast enough for real-time feel)

    return () => clearInterval(interval);
  }, [showDetails, selectedPatient, accessions, isDoctor]);

  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value.toLowerCase().trim();
    setSearchQuery(query);
    sessionStorage.setItem("patientList_searchQuery", query);

    if (!query) {
      setPatients([]);
      setShowDetails(false);
      sessionStorage.setItem("patientList_patients", JSON.stringify([]));
      sessionStorage.setItem("patientList_showDetails", "false");
      return;
    }

    try {
      const res = await fetch(`/api/search/patients?query=${query}`);
      const data = await res.json();

      if (data.status === "ok") {
        setPatients(data.patients);
        sessionStorage.setItem(
          "patientList_patients",
          JSON.stringify(data.patients),
        );
      }
    } catch (err) {
      console.error("Search error:", err);
    }
  };

  const handlePatientClick = async (patientId: number) => {
    try {
      const res = await fetch(`/api/patientsList/${patientId}`);
      const data = await res.json();

      if (data.status === "ok") {
        setSelectedPatient(data.patient);
        setAccessions(data.accessions);
        setShowDetails(true);

        sessionStorage.setItem(
          "patientList_selectedPatient",
          JSON.stringify(data.patient),
        );
        sessionStorage.setItem(
          "patientList_accessions",
          JSON.stringify(data.accessions),
        );
        sessionStorage.setItem("patientList_showDetails", "true");
      }
    } catch (err) {
      console.error("Fetch patient error:", err);
    }
  };

  const getReportStatusLabel = (reportStatus: string | undefined, reportContent: string | undefined) => {
    if (reportStatus === 'completed') {
      return { label: "Completed", bgColor: "bg-green-500" };
    }
    
    if (reportContent && reportContent.trim().length > 0) {
      return { label: "Completed", bgColor: "bg-green-500" };
    }
    
    return { label: "Draft", bgColor: "bg-gray-500" };
  };

  return (
    <>
      <style>{`
        .table-row-hover:hover {
          background-color: #0D1A2D !important;
        }
        
        .status-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 500;
          display: inline-block;
          color: white;
        }
        
        .status-completed {
          background-color: #22c55e;
        }
        
        .status-draft {
          background-color: #6b7280;
        }
      `}</style>

      <section className="patient-list-main-section">
        <div className="patient-list-flex-container">
          <div className="patient-list-left-column">
            <div className="patient-list-left-column-card">
              <h2 className="patient-list-title">Patients List</h2>
              <div className="patient-list-search-wrapper">
                <Search className="patient-list-search-icon" />
                <input
                  type="text"
                  className="patient-list-search-input patient-list-search-border"
                  placeholder="Search by Name or MRN"
                  value={searchQuery}
                  onChange={handleSearch}
                />
              </div>

              {patients.map((patient) => (
                <div
                  key={patient.patient_id}
                  className="patient-card patient-list-card patient-list-card-border"
                  onClick={() => handlePatientClick(patient.patient_id)}
                  style={{ cursor: "pointer" }}
                >
                  <div className="patient-list-avatar">
                    <img
                      src={
                        patient.profile_picture ||
                        "/uploads/profiles/default-avatar.png"
                      }
                      alt={patient.full_name}
                      className="patient-list-avatar-img"
                    />
                  </div>
                  <div className="patient-list-info-wrapper">
                    <div className="patient-name patient-list-name">
                      {patient.full_name}
                    </div>
                    <div className="patient-mrn patient-list-mrn">
                      {patient.medical_record_number}
                    </div>
                  </div>
                  <div className="patient-list-chevron">
                    <ChevronRight />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Vertical Separator */}
          {showDetails && (
            <div className="vertical-separator patient-list-separator patient-list-separator-bg"></div>
          )}

          {/* Right Column - Basic Information and Files */}
          {showDetails && selectedPatient && (
            <div className="right-column patient-list-right-column">
              {/* Basic Information */}
              <div className="patient-list-basic-info-card patient-list-basic-info-border">
                <h2 className="patient-list-basic-info-title">
                  Basic Information
                </h2>
                <div className="patient-list-basic-info-row patient-list-info-row-border">
                  <span className="patient-list-basic-info-label">
                    National ID
                  </span>
                  <span className="patient-list-basic-info-value">
                    {selectedPatient.national_id}
                  </span>
                </div>
                <div className="patient-list-basic-info-row patient-list-info-row-border">
                  <span className="patient-list-basic-info-label">MRN</span>
                  <span className="patient-list-basic-info-value">
                    {selectedPatient.mrn}
                  </span>
                </div>
                <div className="patient-list-basic-info-row patient-list-info-row-border">
                  <span className="patient-list-basic-info-label">Age</span>
                  <span className="patient-list-basic-info-value">
                    {selectedPatient.age}
                  </span>
                </div>
                <div className="patient-list-basic-info-row patient-list-info-row-border">
                  <span className="patient-list-basic-info-label">Gender</span>
                  <span className="patient-list-basic-info-value">
                    {selectedPatient.gender}
                  </span>
                </div>
                <div className="patient-list-basic-info-row-last">
                  <span className="patient-list-basic-info-label">Phone</span>
                  <span className="patient-list-basic-info-value">
                    {selectedPatient.phone}
                  </span>
                </div>
              </div>

              {/* Files Table */}
              <div className="patient-list-files-card patient-list-files-border">
                <h2 className="patient-list-files-title">Files</h2>
                <div className="patient-list-files-wrapper">
                  <table className="patient-list-files-table">
                    <thead className="patient-list-files-thead">
                      <tr>
                        <th className="patient-list-files-th">Accession</th>
                        <th className="patient-list-files-th">Date</th>
                        {isTech && (
                          <th className="patient-list-files-th">Modality</th>
                        )}
                        {isDoctor && (
                          <th className="patient-list-files-th">Report Status</th>
                        )}
                        <th className="patient-list-files-th">
                          {isTech ? "Actions" : "Action"}
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {accessions.length > 0 ? (
                        accessions.map((acc) => {
                          const reportStatus = isDoctor ? getReportStatusLabel(acc.report_status, acc.report_content) : null;
                          
                          return (
                            <tr
                              key={acc.accession_id}
                              className="patient-list-files-tr"
                            >
                              <td className="patient-list-files-td">
                                {acc.accession_number}
                              </td>
                              <td className="patient-list-files-td">
                                {acc.exam_date}
                              </td>
                              {isTech && (
                                <td className="patient-list-files-td">
                                  {acc.modality}
                                </td>
                              )}
                              {isDoctor && reportStatus && (
                                <td className="patient-list-files-td">
                                  <span className={`status-badge status-${reportStatus.label.toLowerCase()}`}>
                                    {reportStatus.label}
                                  </span>
                                </td>
                              )}
                              <td className="patient-list-files-td">
                                {isTech ? (
                                  <div className="patient-list-actions-wrapper">
                                    <Link
                                      href="/radio_tech/dropfile"
                                      className="patient-list-upload-link"
                                      title="Upload File"
                                    >
                                      <Upload_Action className="patient-list-upload-icon" />
                                    </Link>
                                    <Link
                                      href="/viewimg"
                                      className="patient-list-view-link"
                                      title="View Image"
                                    >
                                      <Img className="patient-list-view-icon" />
                                    </Link>
                                  </div>
                                ) : isDoctor ? (
                                  <div className="patient-list-actions-wrapper" style={{ display: 'flex', gap: '0 rem' }}>
                                    <Link
                                      href="/viewimg"
                                      className="patient-list-view-link"
                                      title="View Image"
                                      style={{ marginRight: '-0.25rem' }}
                                    >
                                      <Img className="patient-list-view-icon" style={{ fontSize: '1.5rem' }} />
                                    </Link>
                                    <Link
                                      href={`/doctor/writingReport?accession_id=${acc.accession_id}`}
                                      className="patient-list-view-link"
                                      title="View Report"
                                    >
                                      <Report className="patient-list-view-icon" style={{ fontSize: '1.5rem' }} />
                                    </Link>
                                  </div>
                                ) : null}
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr className="patient-list-files-tr">
                          <td
                            colSpan={4}
                            className="patient-list-files-td text-center"
                          >
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