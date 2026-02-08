"use client";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Search, Upload_Action, Img } from "@/components/icons";
import { BsChevronRight } from "react-icons/bs";

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
}

const PatientList = () => {
  const pathname = usePathname();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<PatientDetails | null>(null);
  const [accessions, setAccessions] = useState<Accession[]>([]);
  const [showDetails, setShowDetails] = useState(false);
  
  const isDoctor = pathname.startsWith("/doctor");
  const isTech = pathname.startsWith("/radio_tech");

  useEffect(() => {
    const savedSearchQuery = sessionStorage.getItem("patientList_searchQuery");
    const savedPatients = sessionStorage.getItem("patientList_patients");
    const savedSelectedPatient = sessionStorage.getItem("patientList_selectedPatient");
    const savedAccessions = sessionStorage.getItem("patientList_accessions");
    const savedShowDetails = sessionStorage.getItem("patientList_showDetails");

    if (savedSearchQuery) setSearchQuery(savedSearchQuery);
    if (savedPatients) setPatients(JSON.parse(savedPatients));
    if (savedSelectedPatient) setSelectedPatient(JSON.parse(savedSelectedPatient));
    if (savedAccessions) setAccessions(JSON.parse(savedAccessions));
    if (savedShowDetails) setShowDetails(savedShowDetails === "true");
  }, []);

  //  البحث عن المرضى
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
        sessionStorage.setItem("patientList_patients", JSON.stringify(data.patients));
      }
    } catch (err) {
      console.error("Search error:", err);
    }
  };

  // after clic on pat card
  const handlePatientClick = async (patientId: number) => {
    try {
     const res = await fetch(`/api/patientsList/${patientId}`);
      const data = await res.json();
      
      if (data.status === "ok") {
        setSelectedPatient(data.patient);
        setAccessions(data.accessions);
        setShowDetails(true);
        
        
        sessionStorage.setItem("patientList_selectedPatient", JSON.stringify(data.patient));
        sessionStorage.setItem("patientList_accessions", JSON.stringify(data.accessions));
        sessionStorage.setItem("patientList_showDetails", "true");
      }
    } catch (err) {
      console.error("Fetch patient error:", err);
    }
  };

  return (
    <>
      <style>{`
        .table-row-hover:hover {
          background-color: #0D1A2D !important;
        }
      `}</style>

      {/* Main Content */}
      <section className="patient-list-main-section">
        <div className="patient-list-flex-container">
          {/* Left Column - Patients List */}
          <div className="patient-list-left-column">
            <div className="patient-list-left-column-card">
              <h2 className="patient-list-title">
                Patients List
              </h2>
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

              {/* نتائج البحث */}
              {patients.map((patient) => (
                <div 
                  key={patient.patient_id}
                  className="patient-card patient-list-card patient-list-card-border"
                  onClick={() => handlePatientClick(patient.patient_id)}
                  style={{ cursor: 'pointer' }}
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
                    <BsChevronRight />
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
                  <span className="patient-list-basic-info-label">
                    MRN
                  </span>
                  <span className="patient-list-basic-info-value">
                    {selectedPatient.mrn}
                  </span>
                </div>
                <div className="patient-list-basic-info-row patient-list-info-row-border">
                  <span className="patient-list-basic-info-label">
                    Age
                  </span>
                  <span className="patient-list-basic-info-value">
                    {selectedPatient.age}
                  </span>
                </div>
                <div className="patient-list-basic-info-row patient-list-info-row-border">
                  <span className="patient-list-basic-info-label">
                    Gender
                  </span>
                  <span className="patient-list-basic-info-value">
                    {selectedPatient.gender}
                  </span>
                </div>
                <div className="patient-list-basic-info-row-last">
                  <span className="patient-list-basic-info-label">
                    Phone
                  </span>
                  <span className="patient-list-basic-info-value">
                    {selectedPatient.phone}
                  </span>
                </div>
              </div>

              {/* Files Table */}
              <div className="patient-list-files-card patient-list-files-border">
                <h2 className="patient-list-files-title">
                  Files
                </h2>
                <div className="patient-list-files-wrapper">
                  <table className="patient-list-files-table">
                    <thead className="patient-list-files-thead">
                      <tr>
                        <th className="patient-list-files-th">
                          Accession
                        </th>
                        <th className="patient-list-files-th">
                          Date
                        </th>
                        <th className="patient-list-files-th">
                          Modality
                        </th>
                        <th className="patient-list-files-th">
                          {isTech ? "Actions" : "Image and Report"}
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {accessions.length > 0 ? (
                        accessions.map((acc) => (
                          <tr key={acc.accession_id} className="patient-list-files-tr">
                            <td className="patient-list-files-td">
                              {acc.accession_number}
                            </td>
                            <td className="patient-list-files-td">
                              {acc.exam_date}
                            </td>
                            <td className="patient-list-files-td">
                              {acc.modality}
                            </td>
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
                                <Link
                                  href={`/doctor/writingReport?accession_id=${acc.accession_id}`}
                                  className="patient-list-doctor-link"
                                >
                                  view
                                </Link>
                              ) : null}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr className="patient-list-files-tr">
                          <td colSpan={4} className="patient-list-files-td text-center">
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