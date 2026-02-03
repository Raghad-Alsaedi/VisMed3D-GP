import Link from "next/link";
import LogOutButton from "./LogOutButton";
import { ID, Age, Gender, Phone } from "./icons";

const Patients = () => {
  return (
    <section className="patients-page">
      <nav className="patients-nav">
        <div className="patients-nav-logo-wrapper">
          <img
            src="logo.png"
            alt="Logo"
            className="w-full h-full object-cover"
          />
        </div>
        <LogOutButton />
      </nav>

      <main className="patients-main">
        <div className="patients-grid">

          <div className="patients-card-profile">
            <div className="profile-wrapper">
              <div className="profile-photo-wrapper">
                <div className="profile-photo">
                  <img
                    src="doctor-photo.jpg"
                    alt="Nasser Saeed"
                    className="w-full h-full object-cover"
                  />
                </div>

                <h1 className="profile-name-mobile">
                  Nasser Saeed
                </h1>
              </div>

              <div className="profile-details-wrapper">
                <h1 className="profile-name-desktop">
                  Nasser Saeed
                </h1>

                <div className="profile-info-list">

                  <div className="profile-info-row">
                    <span className="profile-info-icon">
                      <ID />
                    </span>
                    <span className="profile-info-label">National ID</span>
                    <span className="profile-info-value">1098765432</span>
                  </div>

                  <div className="profile-info-row">
                    <span className="profile-info-icon">
                      <Age />
                    </span>
                    <span className="profile-info-label">Age</span>
                    <span className="profile-info-value">35</span>
                  </div>

                  <div className="profile-info-row">
                    <span className="profile-info-icon">
                      <Gender />
                    </span>
                    <span className="profile-info-label">Gender</span>
                    <span className="profile-info-value">Male</span>
                  </div>

                  <div className="profile-info-row">
                    <span className="profile-info-icon">
                      <Phone />
                    </span>
                    <span className="profile-info-label">Phone</span>
                    <span className="profile-info-value">+966 54 987 2345</span>
                  </div>

                </div>
              </div>
            </div>
          </div>

          <div className="patients-card-table">
            <h4 className="patients-table-title">
              My File
            </h4>
            <div className="patients-table-wrapper">
              <table className="w-full text-white">
                <thead className="table-head-row">
                  <tr>
                    <th className="table-cell-head">#</th>
                    <th className="table-cell-head">Date</th>
                    <th className="table-cell-head">Doctor Name</th>
                    <th className="table-cell-head">Body Part</th>
                    <th className="table-cell-head">Report</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="table-row">
                    <td className="table-cell">1</td>
                    <td className="table-cell">12 Mar 2023</td>
                    <td className="table-cell">Dr. Ahmed Al-Ahmadi</td>
                    <td className="table-cell">Foot</td>
                    <td className="table-cell">
                      <Link
                        href="/patients/reportPatients"
                        className="table-link"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </main>
    </section>
  );
};

export default Patients;