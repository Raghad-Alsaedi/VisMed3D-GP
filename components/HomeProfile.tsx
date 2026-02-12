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

  // ✅ SINGLE useEffect - consolidated
  useEffect(() => {
    if (!isDoctor) {
      setLoading(false);
      return;
    }

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
      .then((res) => {
        console.log("🔵 Response status:", res.status);
        console.log("🔵 Response headers:", res.headers.get("content-type"));
        
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        
        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          throw new Error("Response is not JSON");
        }
        
        return res.json();
      })
      .then((data) => {
        console.log("🔵 Dashboard data:", data);
        
        if (data.error) {
          console.error("❌ API Error:", data.error);
          setDoctor(null);
          setPatients([]);
        } else {
          setDoctor(data.doctor || null);
          setPatients(data.patients || []);
        }
      })
      .catch((error) => {
        console.error("❌ Fetch error:", error);
        setDoctor(null);
        setPatients([]);
      })
      .finally(() => setLoading(false));
  }, [isDoctor, session, status]);

  // ===== Display states =====
  if (!isDoctor) {
    // Non-doctor page placeholder
    return null;
  }

  if (status === "loading") {
    return (
      <section className="main-section-container">
        <div className="content-wrapper">
          <div className="text-white p-6">Loading session...</div>
        </div>
      </section>
    );
  }

  if (!(session as any)?.user?.id) {
    return (
      <section className="main-section-container">
        <div className="content-wrapper">
          <div className="text-white p-6">Not signed in</div>
        </div>
      </section>
    );
  }

  if (loading) {
    return (
      <section className="main-section-container">
        <div className="content-wrapper">
          <div className="text-white p-6">Loading dashboard...</div>
        </div>
      </section>
    );
  }

  if (!doctor) {
    return (
      <section className="main-section-container">
        <div className="content-wrapper">
          <div className="text-white p-6">No doctor found</div>
        </div>
      </section>
    );
  }

  // ===== Display values =====
  const fullName = [doctor.firstName, doctor.middleName, doctor.lastName].filter(Boolean).join(" ");
  const roleTitle = doctor.specialty || "-";
  const profileImg = doctor.profile_image_url || (doctor.gender === "female" ? "/doctor_female.png" : "/doctor.png");
  const idValue = doctor.doctor_code || "-";
  const licenseValue = doctor.license_number || "-";
  const yearsValue = doctor.years_experience ?? "-";
  const genderValue = doctor.gender === "male" ? "Male" : doctor.gender === "female" ? "Female" : "-";
  const phoneValue = doctor.phone || "-";

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
                  alt={`Dr. ${fullName}`}
                  className="profile-photo-img"
                />
              </div>

              <div className="text-center">
                <h1 className="profile-name-mobile">{`Dr. ${fullName}`}</h1>
                <p className="profile-role-subtitle">{roleTitle}</p>
              </div>
            </div>

            <div className="profile-info-wrapper-mobile">
              <div className="profile-info-item-mobile">
                <span className="profile-info-icon-wrapper">
                  <ID className="w-5 h-5 text-gray-400" />
                </span>
                <span className="profile-info-label-mobile">Doctor ID</span>
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
                  alt={`Dr. ${fullName}`}
                  className="profile-photo-img"
                />
              </div>

              <div className="text-center">
                <h1 className="profile-name-desktop">{`Dr. ${fullName}`}</h1>
                <p className="profile-role-subtitle-desktop">{roleTitle}</p>
              </div>
            </div>

            <div className="profile-info-grid-desktop">
              <div className="profile-info-item-desktop">
                <span className="profile-info-icon-wrapper">
                  <ID className="w-5 h-5 text-gray-400" />
                </span>
                <span className="profile-info-label-desktop">Doctor ID</span>
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
          <h3 className="data-table-title">My Patients</h3>

          <div className="data-table-wrapper">
            <table className="data-table-base">
              <thead className="data-table-header">
                <tr>
                  <th className="data-table-header-cell">#</th>
                  <th className="data-table-header-cell">Patient_Name</th>
                  <th className="data-table-header-cell">Accession</th>
                  <th className="data-table-header-cell">MRN</th>
                  <th className="data-table-header-cell">Image and Report</th>
                </tr>
              </thead>

              <tbody>
                {patients.length ? (
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