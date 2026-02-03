"use client";
import Link from "next/link";
import React, { useEffect } from "react";
import { Search } from "@/components/icons";
import { BsChevronRight, BsThreeDotsVertical } from "react-icons/bs";

const DoctorPatients = () => {
  useEffect(() => {
    const searchInput = document.querySelector('input[placeholder="Search by Name or MRN"]');
    const patientCards = document.querySelectorAll('.patient-card');
    const rightColumn = document.querySelector('.right-column');
    const verticalSeparator = document.querySelector('.vertical-separator');

    patientCards.forEach(card => {
      (card as HTMLElement).style.display = 'none';
    });
    if (rightColumn) (rightColumn as HTMLElement).style.display = 'none';
    if (verticalSeparator) (verticalSeparator as HTMLElement).style.display = 'none';

    const handleSearch = (e: Event) => {
      const target = e.target as HTMLInputElement;
      const query = target.value.toLowerCase().trim();

      if (rightColumn) (rightColumn as HTMLElement).style.display = 'none';
      if (verticalSeparator) (verticalSeparator as HTMLElement).style.display = 'none';

      patientCards.forEach(card => {
        const nameEl = card.querySelector('.patient-name');
        const mrnEl = card.querySelector('.patient-mrn');

        const name = nameEl ? nameEl.textContent?.toLowerCase() || '' : '';
        let mrn = '';
        if (mrnEl) {
          const mrnText = mrnEl.textContent?.trim() || '';
          const parts = mrnText.split('-');
          mrn = parts[1] ? parts[1].toLowerCase() : '';
        }

        if (!query) {
          (card as HTMLElement).style.display = 'none';
        } else if (name.startsWith(query) || mrn.startsWith(query)) {
          (card as HTMLElement).style.display = 'flex';
        } else {
          (card as HTMLElement).style.display = 'none';
        }
      });
    };

    const handleCardClick = () => {
      if (rightColumn) (rightColumn as HTMLElement).style.display = 'block';
      if (verticalSeparator) (verticalSeparator as HTMLElement).style.display = 'block';
    };

    if (searchInput) {
      searchInput.addEventListener('input', handleSearch);
    }

    patientCards.forEach(card => {
      card.addEventListener('click', handleCardClick);
    });

    // Cleanup
    return () => {
      if (searchInput) {
        searchInput.removeEventListener('input', handleSearch);
      }
      patientCards.forEach(card => {
        card.removeEventListener('click', handleCardClick);
      });
    };
  }, []);

  const toggleMenu = (e: React.MouseEvent<HTMLButtonElement>) => {
    const button = e.currentTarget;
    
    // إغلاق كل القوائم المفتوحة
    document.querySelectorAll('.dropdown-menu').forEach(menu => {
      if (menu !== button.nextElementSibling) {
        menu.classList.add('hidden');
      }
    });

    // فتح/إغلاق القائمة الحالية
    const menu = button.nextElementSibling;
    menu?.classList.toggle('hidden');
  };

  useEffect(() => {
    // إغلاق القائمة عند الضغط خارجها
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.relative')) {
        document.querySelectorAll('.dropdown-menu').forEach(menu => {
          menu.classList.add('hidden');
        });
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <>
      <style>{`
        .table-row-hover:hover {
          background-color: #0D1A2D !important;
        }
      `}</style>

      {/* Main Content */}
      <section className="main-section-container">
        <div className="layout-flex-container">
          {/* Left Column - Patients List */}
          <div className="layout-left-column">
            <div className="data-table-card">
              <h2 className="patient-list-title">
                Patients List
              </h2>
              <div className="search-input-wrapper">
                <Search className="search-input-icon" />
                <input
                  type="text"
                  className="search-input-field"
                  placeholder="Search by Name or MRN"
                />
              </div>

              <div className="patient-card patient-card-container">
                <div className="patient-avatar">
                  <img
                    src="https://ui-avatars.com/api/?name=Nasser+Saeed&background=4A90E2&color=fff&size=50"
                    alt="Patient"
                    className="patient-avatar-img"
                  />
                </div>
                <div className="patient-info-wrapper">
                  <div className="patient-name patient-name-text">
                    Nasser Saeed
                  </div>
                  <div className="patient-mrn patient-mrn-text">
                    MRN-004523
                  </div>
                </div>
                <div className="patient-chevron-icon">
                  <BsChevronRight />
                </div>
              </div>
            </div>
          </div>

          {/* Vertical Separator */}
          <div className="vertical-separator vertical-divider"></div>

          {/* Right Column - Basic Information and Files */}
          <div className="right-column layout-right-column">
            {/* Basic Information */}
            <div className="basic-info-card">
              <h2 className="basic-info-title">
                Basic Information
              </h2>
              <div className="basic-info-row">
                <span className="basic-info-label">
                  National ID
                </span>
                <span className="basic-info-value">
                  1098765432
                </span>
              </div>
              <div className="basic-info-row">
                <span className="basic-info-label">
                  MRN
                </span>
                <span className="basic-info-value">
                  004523
                </span>
              </div>
              <div className="basic-info-row">
                <span className="basic-info-label">
                  Age
                </span>
                <span className="basic-info-value">
                  35
                </span>
              </div>
              <div className="basic-info-row">
                <span className="basic-info-label">
                  Gender
                </span>
                <span className="basic-info-value">
                  Male
                </span>
              </div>
              <div className="basic-info-row-last">
                <span className="basic-info-label">
                  Phone
                </span>
                <span className="basic-info-value">
                  +966 54 987 2345
                </span>
              </div>
            </div>

            {/* Files */}
            <div className="files-card">
              <h2 className="files-title">
                Files
              </h2>
              <div className="files-table-wrapper">
                <table className="files-table-base">
                  <thead className="files-table-header">
                    <tr>
                      <th className="files-table-header-cell">
                        Accession
                      </th>
                      <th className="files-table-header-cell">
                        Date
                      </th>
                      <th className="files-table-header-cell">
                        Modality
                      </th>
                      <th className="files-table-header-cell">
                        Image and Report
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    <tr className="files-table-row">
                      <td className="files-table-cell">
                        ACC-321
                      </td>
                      <td className="files-table-cell">
                        12 Mar 2023
                      </td>
                      <td className="files-table-cell">
                        CT
                      </td>
                      <td className="files-table-cell">
                        <Link
                          href="/viewimg"
                          className="data-table-link"
                        >
                          view
                        </Link>
                      </td>
                    </tr>

                    <tr className="files-table-row">
                      <td className="files-table-cell">
                      </td>
                      <td className="files-table-cell">
                      </td>
                      <td className="files-table-cell">
                      </td>
                      <td className="files-table-cell">
                      </td>
                    </tr>

                    <tr className="files-table-row">
                      <td className="files-table-cell">
                      </td>
                      <td className="files-table-cell">
                      </td>
                      <td className="files-table-cell">
                      </td>
                      <td className="files-table-cell">
                      </td>
                    </tr>

                    <tr className="files-table-row">
                      <td className="files-table-cell">
                      </td>
                      <td className="files-table-cell">
                      </td>
                      <td className="files-table-cell">
                      </td>
                      <td className="files-table-cell">
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default DoctorPatients;