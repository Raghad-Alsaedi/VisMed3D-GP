import React from "react";
import ViewImg from "./ViewImg";
import Link from "next/link";
import {
  ID,
  License_Number,
  Years_of_Experience,
  Gender,
  Phone,
} from "./icons";

const HomeDoctor = () => {
  return (
    <section className="main-section-container">
      <div className="content-wrapper">
        {/* Doctor Profile Card */}
        <div className="profile-card-container">
          {/* Mobile Layout: Photo and Name at top, info below */}
          <div className="profile-layout-mobile">
            {/* Photo and Name */}
            <div className="profile-photo-section">
              <div className="profile-photo-mobile">
                <img
                  src="doctor-photo.jpg"
                  alt="Dr. Ahmed Al-Ahmadi"
                  className="profile-photo-img"
                />
              </div>

              <div className="text-center">
                <h1 className="profile-name-mobile">
                  Dr. Ahmed Al-Ahmadi
                </h1>
                <p className="profile-role-subtitle">Orthopedist</p>
              </div>
            </div>

            {/* Doctor Information - Mobile */}
            <div className="profile-info-wrapper-mobile">
              {/* Doctor ID */}
              <div className="profile-info-item-mobile">
                <span className="profile-info-icon-wrapper">
                  <ID className="w-5 h-5 text-gray-400" />
                </span>
                <span className="profile-info-label-mobile">
                  Doctor ID
                </span>
                <span className="profile-info-value-mobile">DOC-0015</span>
              </div>

              {/* License Number */}
              <div className="profile-info-item-mobile">
                <span className="profile-info-icon-wrapper">
                  <License_Number className="w-5 h-5 text-gray-400" />
                </span>
                <span className="profile-info-label-mobile">
                  License Number
                </span>
                <span className="profile-info-value-mobile">SCFHS-123456</span>
              </div>

              {/* Years of Experience */}
              <div className="profile-info-item-mobile">
                <span className="profile-info-icon-wrapper">
                  <Years_of_Experience className="w-5 h-5 text-gray-400" />
                </span>
                <span className="profile-info-label-mobile">
                  Years of Experience
                </span>
                <span className="profile-info-value-mobile">9</span>
              </div>

              {/* Gender */}
              <div className="profile-info-item-mobile">
                <span className="profile-info-icon-wrapper">
                  <Gender className="w-5 h-5 text-gray-400" />
                </span>
                <span className="profile-info-label-mobile">
                  Gender
                </span>
                <span className="profile-info-value-mobile">Male</span>
              </div>

              {/* Phone */}
              <div className="profile-info-item-mobile">
                <span className="profile-info-icon-wrapper">
                  <Phone className="w-5 h-5 text-gray-400" />
                </span>
                <span className="profile-info-label-mobile">
                  Phone
                </span>
                <span className="profile-info-value-mobile">+966 55 123 4567</span>
              </div>
            </div>
          </div>

          {/* Desktop Layout: Side by side */}
          <div className="profile-layout-desktop">
            {/* Left Column - Photo and Name */}
            <div className="profile-photo-section">
              <div className="profile-photo-desktop">
                <img
                  src="doctor-photo.jpg"
                  alt="Dr. Ahmed Al-Ahmadi"
                  className="profile-photo-img"
                />
              </div>

              <div className="text-center">
                <h1 className="profile-name-desktop">
                  Dr. Ahmed Al-Ahmadi
                </h1>
                <p className="profile-role-subtitle-desktop">Orthopedist</p>
              </div>
            </div>

            {/* Right Column - Doctor Information */}
            <div className="profile-info-grid-desktop">
              {/* Doctor ID */}
              <div className="profile-info-item-desktop">
                <span className="profile-info-icon-wrapper">
                  <ID className="w-5 h-5 text-gray-400" />
                </span>
                <span className="profile-info-label-desktop">
                  Doctor ID
                </span>
                <span className="profile-info-value-desktop">
                  DOC-0015
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
                  SCFHS-123456
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
                <span className="profile-info-value-desktop">9</span>
              </div>

              {/* Gender */}
              <div className="profile-info-item-desktop">
                <span className="profile-info-icon-wrapper">
                  <Gender className="w-5 h-5 text-gray-400" />
                </span>
                <span className="profile-info-label-desktop">
                  Gender
                </span>
                <span className="profile-info-value-desktop">Male</span>
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
                  +966 55 123 4567
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Patients Table Card */}
        <div className="data-table-card">
          <h3 className="data-table-title">
            My Patients
          </h3>

          <div className="data-table-wrapper">
            <table className="data-table-base">
              <thead className="data-table-header">
                <tr>
                  <th className="data-table-header-cell">
                    #
                  </th>
                  <th className="data-table-header-cell">
                    Patient_Name
                  </th>
                  <th className="data-table-header-cell">
                    Accession
                  </th>
                  <th className="data-table-header-cell">
                    MRN
                  </th>
                  <th className="data-table-header-cell">
                    Image and Report
                  </th>
                </tr>
              </thead>

              <tbody>
                <tr className="data-table-row">
                  <td className="data-table-cell">
                    1
                  </td>
                  <td className="data-table-cell">
                    Nasser Saeed
                  </td>
                  <td className="data-table-cell">
                    ACC-321
                  </td>
                  <td className="data-table-cell">
                    004523
                  </td>
                  <td className="data-table-cell">
                    <Link
                      href="/viewimg"
                      className="data-table-link"
                    >
                      view
                    </Link>
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

export default HomeDoctor;