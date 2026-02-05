"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ID,
  License_Number,
  Years_of_Experience,
  Gender,
  Phone,
} from "@/components/icons";

const HomeProfile = () => {
  const pathname = usePathname();
  
  const isDoctor = pathname.startsWith("/doctor");

  return (
    <section className="main-section-container">
      <div className="content-wrapper">
        {/* Profile Card */}
        <div className="profile-card-container">
          {/* Mobile Layout */}
          <div className="profile-layout-mobile">
            {/* Photo and Name */}
            <div className="profile-photo-section">
              <div className="profile-photo-mobile">
                <img
                  src="doctor-photo.jpg"
                  alt={isDoctor ? "Dr. Ahmed Al-Ahmadi" : "Sara Ahmed"}
                  className="profile-photo-img"
                />
              </div>

              <div className="text-center">
                <h1 className="profile-name-mobile">
                  {isDoctor ? "Dr. Ahmed Al-Ahmadi" : "Sara Ahmed"}
                </h1>
                <p className="profile-role-subtitle">
                  {isDoctor ? "Orthopedist" : "Radiology Technician"}
                </p>
              </div>
            </div>

            {/* Information - Mobile */}
            <div className="profile-info-wrapper-mobile">
              {/* ID */}
              <div className="profile-info-item-mobile">
                <span className="profile-info-icon-wrapper">
                  <ID className="w-5 h-5 text-gray-400" />
                </span>
                <span className="profile-info-label-mobile">
                  {isDoctor ? "Doctor ID" : "Technician ID"}
                </span>
                <span className="profile-info-value-mobile">
                  {isDoctor ? "DOC-0015" : "T001"}
                </span>
              </div>

              {/* License Number */}
              <div className="profile-info-item-mobile">
                <span className="profile-info-icon-wrapper">
                  <License_Number className="w-5 h-5 text-gray-400" />
                </span>
                <span className="profile-info-label-mobile">
                  License Number
                </span>
                <span className="profile-info-value-mobile">
                  {isDoctor ? "SCFHS-123456" : "SCFHS-987654"}
                </span>
              </div>

              {/* Years of Experience */}
              <div className="profile-info-item-mobile">
                <span className="profile-info-icon-wrapper">
                  <Years_of_Experience className="w-5 h-5 text-gray-400" />
                </span>
                <span className="profile-info-label-mobile">
                  Years of Experience
                </span>
                <span className="profile-info-value-mobile">
                  {isDoctor ? "9" : "10"}
                </span>
              </div>

              {/* Gender */}
              <div className="profile-info-item-mobile">
                <span className="profile-info-icon-wrapper">
                  <Gender className="w-5 h-5 text-gray-400" />
                </span>
                <span className="profile-info-label-mobile">
                  Gender
                </span>
                <span className="profile-info-value-mobile">
                  {isDoctor ? "Male" : "Female"}
                </span>
              </div>

              {/* Phone */}
              <div className="profile-info-item-mobile">
                <span className="profile-info-icon-wrapper">
                  <Phone className="w-5 h-5 text-gray-400" />
                </span>
                <span className="profile-info-label-mobile">
                  Phone
                </span>
                <span className="profile-info-value-mobile">
                  {isDoctor ? "+966 55 123 4567" : "+966 5 1234 5678"}
                </span>
              </div>
            </div>
          </div>

          {/* Desktop Layout */}
          <div className="profile-layout-desktop">
            {/* Left Column - Photo and Name */}
            <div className="profile-photo-section">
              <div className="profile-photo-desktop">
                <img
                  src="doctor-photo.jpg"
                  alt={isDoctor ? "Dr. Ahmed Al-Ahmadi" : "Sara Ahmed"}
                  className="profile-photo-img"
                />
              </div>

              <div className="text-center">
                <h1 className="profile-name-desktop">
                  {isDoctor ? "Dr. Ahmed Al-Ahmadi" : "Sara Ahmed"}
                </h1>
                <p className="profile-role-subtitle-desktop">
                  {isDoctor ? "Orthopedist" : "Radiology Technician"}
                </p>
              </div>
            </div>

            {/* Right Column - Information */}
            <div className="profile-info-grid-desktop">
              {/* ID */}
              <div className="profile-info-item-desktop">
                <span className="profile-info-icon-wrapper">
                  <ID className="w-5 h-5 text-gray-400" />
                </span>
                <span className="profile-info-label-desktop">
                  {isDoctor ? "Doctor ID" : "Technician ID"}
                </span>
                <span className="profile-info-value-desktop">
                  {isDoctor ? "DOC-0015" : "T001"}
                </span>
              </div>

              {/* License Number */}
              <div className="profile-info-item-desktop">
                <span className="profile-info-icon-wrapper">
                  <License_Number className="w-5 h-5 text-gray-400" />
                </span>
                <span className="profile-info-label-desktop">
                  License Number
                </span>
                <span className="profile-info-value-desktop">
                  {isDoctor ? "SCFHS-123456" : "SCFHS-987654"}
                </span>
              </div>

              {/* Years of Experience */}
              <div className="profile-info-item-desktop">
                <span className="profile-info-icon-wrapper">
                  <Years_of_Experience className="w-5 h-5 text-gray-400" />
                </span>
                <span className="profile-info-label-desktop">
                  Years of Experience
                </span>
                <span className="profile-info-value-desktop">
                  {isDoctor ? "9" : "10"}
                </span>
              </div>

              {/* Gender */}
              <div className="profile-info-item-desktop">
                <span className="profile-info-icon-wrapper">
                  <Gender className="w-5 h-5 text-gray-400" />
                </span>
                <span className="profile-info-label-desktop">
                  Gender
                </span>
                <span className="profile-info-value-desktop">
                  {isDoctor ? "Male" : "Female"}
                </span>
              </div>

              {/* Phone */}
              <div className="profile-info-item-desktop">
                <span className="profile-info-icon-wrapper">
                  <Phone className="w-5 h-5 text-gray-400" />
                </span>
                <span className="profile-info-label-desktop">
                  Phone
                </span>
                <span className="profile-info-value-desktop">
                  {isDoctor ? "+966 55 123 4567" : "+966 5 1234 5678"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Table Card */}
        <div className="data-table-card">
          <h3 className="data-table-title">
            {isDoctor ? "My Patients" : "Recent Upload File"}
          </h3>

          <div className="data-table-wrapper">
            <table className="data-table-base">
              <thead className="data-table-header">
                <tr>
                  <th className="data-table-header-cell">#</th>
                  <th className="data-table-header-cell">Patient_Name</th>
                  <th className="data-table-header-cell">Accession</th>
                  <th className="data-table-header-cell">MRN</th>
                  <th className="data-table-header-cell">
                    {isDoctor ? "Image and Report" : "Modality"}
                  </th>
                </tr>
              </thead>

              <tbody>
                <tr className="data-table-row">
                  <td className="data-table-cell">1</td>
                  <td className="data-table-cell">Nasser Saeed</td>
                  <td className="data-table-cell">ACC-321</td>
                  <td className="data-table-cell">004523</td>
                  <td className="data-table-cell">
                    {isDoctor ? (
                      <Link href="/viewimg" className="data-table-link">
                        view
                      </Link>
                    ) : (
                      "CT"
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomeProfile;