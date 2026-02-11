"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { ID, License_Number, Years_of_Experience, Gender, Phone } from "@/components/icons";

const HomeProfile = () => {
  const pathname = usePathname();
  const isDoctor = pathname.startsWith("/doctor");

  const { data: session, status } = useSession();

  const [doctor, setDoctor] = useState<any>(null);
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isDoctor) return;

    if (status === "loading") return;

    const doctorId = (session as any)?.user?.id;
    if (!doctorId) {
      setDoctor(null);
      setPatients([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    fetch(`/api/doctor/dashboard?doctorId=${doctorId}`)
      .then((res) => res.json())
      .then((data) => {
        setDoctor(data.doctor || null);
        setPatients(data.patients || []);
      })
      .catch(() => {
        setDoctor(null);
        setPatients([]);
      })
      .finally(() => setLoading(false));
  }, [isDoctor, session, status]);

  if (!isDoctor) {
    
  }

  if (isDoctor && status === "loading") {
    return (
      <section className="main-section-container">
        <div className="content-wrapper">
          <div className="text-white p-6">Loading session...</div>
        </div>
      </section>
    );
  }

  if (isDoctor && status !== "loading" && !(session as any)?.user?.id) {
    return (
      <section className="main-section-container">
        <div className="content-wrapper">
          <div className="text-white p-6">Not signed in</div>
        </div>
      </section>
    );
  }

  if (isDoctor && loading) {
    return (
      <section className="main-section-container">
        <div className="content-wrapper">
          <div className="text-white p-6">Loading dashboard...</div>
        </div>
      </section>
    );
  }

  if (isDoctor && !loading && !doctor) {
    return (
      <section className="main-section-container">
        <div className="content-wrapper">
          <div className="text-white p-6">No doctor found</div>
        </div>
      </section>
    );
  }

  const fullName =
    isDoctor && doctor
      ? [doctor.first_name, doctor.middle_name, doctor.last_name].filter(Boolean).join(" ")
      : "Sara Ahmed";

  const roleTitle = isDoctor && doctor ? doctor.specialty || "-" : "Radiology Technician";

  const profileImg =
    isDoctor && doctor
      ? doctor.profile_image_url || (doctor.gender === "female" ? "/doctor_female.png" : "/doctor.png")
      : "doctor-photo.jpg";

  const idLabel = isDoctor ? "Doctor ID" : "Technician ID";
  const idValue = isDoctor ? doctor?.doctor_code || "-" : "T001";

  const licenseValue = isDoctor ? doctor?.license_number || "-" : "SCFHS-987654";
  const yearsValue = isDoctor ? doctor?.years_experience ?? "-" : "10";

  const genderValue =
    isDoctor
      ? doctor?.gender === "male"
        ? "Male"
        : doctor?.gender === "female"
        ? "Female"
        : "-"
      : "Female";

  const phoneValue = isDoctor ? doctor?.phone || "-" : "+966 5 1234 5678";

  return (
    <section className="main-section-container">
      <div className="content-wrapper">
        {/* Profile Card */}
        <div className="profile-card-container">
          {/* Mobile Layout */}
          <div className="profile-layout-mobile">
            <div className="profile-photo-section">
              <div className="profile-photo-mobile">
                <img
                  src={profileImg}
                  alt={isDoctor ? `Dr. ${fullName} `: fullName}
                  className="profile-photo-img"
                />
              </div>

              <div className="text-center">
                <h1 className="profile-name-mobile">{isDoctor ? `Dr. ${fullName} `: fullName}</h1>
                <p className="profile-role-subtitle">{roleTitle}</p>
              </div>
            </div>

            <div className="profile-info-wrapper-mobile">
              <div className="profile-info-item-mobile">
                <span className="profile-info-icon-wrapper">
                  <ID className="w-5 h-5 text-gray-400" />
                </span>
                <span className="profile-info-label-mobile">{idLabel}</span>
                <span className="profile-info-value-mobile">{idValue}</span>
              </div>

              <div className="profile-info-item-mobile">
                <span className="profile-info-icon-wrapper">
                  <License_Number className="w-5 h-5 text-gray-400" />
                </span>
                <span className="profile-info-label-mobile">License Number</span>
                <span className="profile-info-value-mobile">{licenseValue}</span>
              </div>

              <div className="profile-info-item-mobile">
                <span className="profile-info-icon-wrapper">
                  <Years_of_Experience className="w-5 h-5 text-gray-400" />
                </span>
                <span className="profile-info-label-mobile">Years of Experience</span>
                <span className="profile-info-value-mobile">{yearsValue}</span>
              </div>

              <div className="profile-info-item-mobile">
                <span className="profile-info-icon-wrapper">
                  <Gender className="w-5 h-5 text-gray-400" />
                </span>
                <span className="profile-info-label-mobile">Gender</span>
                <span className="profile-info-value-mobile">{genderValue}</span>
              </div>

              <div className="profile-info-item-mobile">
                <span className="profile-info-icon-wrapper">
                  <Phone className="w-5 h-5 text-gray-400" />
                </span>
                <span className="profile-info-label-mobile">Phone</span>
                <span className="profile-info-value-mobile">{phoneValue}</span>
              </div>
            </div>
          </div>

          {/* Desktop Layout */}
          <div className="profile-layout-desktop">
            <div className="profile-photo-section">
              <div className="profile-photo-desktop">
                <img
                  src={profileImg}
                  alt={isDoctor ? `Dr. ${fullName}` : fullName}
                  className="profile-photo-img"
                />
              </div>

              <div className="text-center">
                <h1 className="profile-name-desktop">{isDoctor ? `Dr. ${fullName} `: fullName}</h1>
                <p className="profile-role-subtitle-desktop">{roleTitle}</p>
              </div>
            </div>

            <div className="profile-info-grid-desktop">
              <div className="profile-info-item-desktop">
                <span className="profile-info-icon-wrapper">
                  <ID className="w-5 h-5 text-gray-400" />
                </span>
                <span className="profile-info-label-desktop">{idLabel}</span>
                <span className="profile-info-value-desktop">{idValue}</span>
              </div>

              <div className="profile-info-item-desktop">
                <span className="profile-info-icon-wrapper">
                  <License_Number className="w-5 h-5 text-gray-400" />
                </span>
                <span className="profile-info-label-desktop">License Number</span>
                <span className="profile-info-value-desktop">{licenseValue}</span>
              </div>

              <div className="profile-info-item-desktop">
                <span className="profile-info-icon-wrapper">
                  <Years_of_Experience className="w-5 h-5 text-gray-400" />
                </span>
                <span className="profile-info-label-desktop">Years of Experience</span>
                <span className="profile-info-value-desktop">{yearsValue}</span>
              </div>

              <div className="profile-info-item-desktop">
                <span className="profile-info-icon-wrapper">
                  <Gender className="w-5 h-5 text-gray-400" />
                </span>
                <span className="profile-info-label-desktop">Gender</span>
                <span className="profile-info-value-desktop">{genderValue}</span>
              </div>

              <div className="profile-info-item-desktop">
                <span className="profile-info-icon-wrapper">
                  <Phone className="w-5 h-5 text-gray-400" />
                </span>
                <span className="profile-info-label-desktop">Phone</span>
                <span className="profile-info-value-desktop">{phoneValue}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Table Card */}
        <div className="data-table-card">
          <h3 className="data-table-title">{isDoctor ? "My Patients" : "Recent Upload File"}</h3>

          <div className="data-table-wrapper">
            <table className="data-table-base">
              <thead className="data-table-header">
                <tr>
                  <th className="data-table-header-cell">#</th>
                  <th className="data-table-header-cell">Patient_Name</th>
                  <th className="data-table-header-cell">Accession</th>
                  <th className="data-table-header-cell">MRN</th>
                  <th className="data-table-header-cell">{isDoctor ? "Image and Report" : "Modality"}</th>
                </tr>
              </thead>

              <tbody>
                {isDoctor ? (
                  patients.length ? (
                    patients.map((p, index) => (
                      <tr key={p.study_id} className="data-table-row">
                        <td className="data-table-cell">{index + 1}</td>
                        <td className="data-table-cell">{p.patient_name}</td>
                        <td className="data-table-cell">{p.accession}</td>
                        <td className="data-table-cell">{p.mrn}</td>
                        <td className="data-table-cell">
                          <Link href={`/viewimg?studyId=${p.study_id}`} className="data-table-link">
                            view
                          </Link>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr className="data-table-row">
                      <td className="data-table-cell" colSpan={5}>
                        No patients
                      </td>
                    </tr>
                  )
                ) : (
                  <tr className="data-table-row">
                    <td className="data-table-cell">1</td>
                    <td className="data-table-cell">—</td>
                    <td className="data-table-cell">—</td>
                    <td className="data-table-cell">—</td>
                    <td className="data-table-cell">CT</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomeProfile;