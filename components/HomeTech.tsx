import React from "react";

const HomeTech = () => {
  return (
    <section className="main-section-container">
      <div className="content-wrapper">
        {/* Technician Profile Card */}
        <div className="profile-card-container">
          {/* Mobile Layout: Photo and Name at top, info below */}
          <div className="profile-layout-mobile">
            {/* Photo and Name */}
            <div className="profile-photo-section">
              <div className="profile-photo-mobile">
                <img
                  src="doctor-photo.jpg"
                  alt="Sara Ahmed"
                  className="profile-photo-img"
                />
              </div>

              <div className="text-center">
                <h1 className="profile-name-mobile">
                  Sara Ahmed
                </h1>
                <p className="profile-role-subtitle">Radiology Technician</p>
              </div>
            </div>

            {/* Technician Information - Mobile */}
            <div className="profile-info-wrapper-mobile">
              {/* Technician ID */}
              <div className="profile-info-item-mobile">
                <span className="profile-info-icon-wrapper">
                  <svg
                    className="w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"
                    />
                  </svg>
                </span>
                <span className="profile-info-label-mobile">
                  Technician ID
                </span>
                <span className="profile-info-value-mobile">T001</span>
              </div>

              {/* License Number */}
              <div className="profile-info-item-mobile">
                <span className="profile-info-icon-wrapper">
                  <svg
                    className="w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </span>
                <span className="profile-info-label-mobile">
                  License Number
                </span>
                <span className="profile-info-value-mobile">SCFHS-987654</span>
              </div>

              {/* Years of Experience */}
              <div className="profile-info-item-mobile">
                <span className="profile-info-icon-wrapper">
                  <svg
                    className="w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </span>
                <span className="profile-info-label-mobile">
                  Years of Experience
                </span>
                <span className="profile-info-value-mobile">10</span>
              </div>

              {/* Gender */}
              <div className="profile-info-item-mobile">
                <span className="profile-info-icon-wrapper">
                  <svg
                    className="w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </span>
                <span className="profile-info-label-mobile">
                  Gender
                </span>
                <span className="profile-info-value-mobile">Female</span>
              </div>

              {/* Phone */}
              <div className="profile-info-item-mobile">
                <span className="profile-info-icon-wrapper">
                  <svg
                    className="w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                </span>
                <span className="profile-info-label-mobile">
                  Phone
                </span>
                <span className="profile-info-value-mobile">+966 5 1234 5678</span>
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
                  alt="Sara Ahmed"
                  className="profile-photo-img"
                />
              </div>

              <div className="text-center">
                <h1 className="profile-name-desktop">
                  Sara Ahmed
                </h1>
                <p className="profile-role-subtitle-desktop">Radiology Technician</p>
              </div>
            </div>

            {/* Right Column - Technician Information */}
            <div className="profile-info-grid-desktop">
              {/* Technician ID */}
              <div className="profile-info-item-desktop">
                <span className="profile-info-icon-wrapper">
                  <svg
                    className="w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"
                    />
                  </svg>
                </span>
                <span className="profile-info-label-desktop">
                  Technician ID
                </span>
                <span className="profile-info-value-desktop">T001</span>
              </div>

              {/* License Number */}
              <div className="profile-info-item-desktop">
                <span className="profile-info-icon-wrapper">
                  <svg
                    className="w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </span>
                <span className="profile-info-label-desktop">
                  License Number
                </span>
                <span className="profile-info-value-desktop">
                  SCFHS-987654
                </span>
              </div>

              {/* Years of Experience */}
              <div className="profile-info-item-desktop">
                <span className="profile-info-icon-wrapper">
                  <svg
                    className="w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </span>
                <span className="profile-info-label-desktop">
                  Years of Experience
                </span>
                <span className="profile-info-value-desktop">10</span>
              </div>

              {/* Gender */}
              <div className="profile-info-item-desktop">
                <span className="profile-info-icon-wrapper">
                  <svg
                    className="w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </span>
                <span className="profile-info-label-desktop">
                  Gender
                </span>
                <span className="profile-info-value-desktop">Female</span>
              </div>

              {/* Phone */}
              <div className="profile-info-item-desktop">
                <span className="profile-info-icon-wrapper">
                  <svg
                    className="w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                </span>
                <span className="profile-info-label-desktop">
                  Phone
                </span>
                <span className="profile-info-value-desktop">
                  +966 5 1234 5678
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Upload File Table Card */}
        <div className="data-table-card">
          <h3 className="data-table-title">
            Recent Upload File
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
                    Modality
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
                    CT
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

export default HomeTech;