"use client";
import Link from "next/link";
import React, { useEffect } from "react";
import { usePathname } from "next/navigation";
import { Search, Upload_Action, Img } from "@/components/icons";
import { BsChevronRight } from "react-icons/bs";

const PatientList= () => {
  const pathname = usePathname();
  
  
  const isDoctor = pathname.startsWith("/doctor");
  const isTech = pathname.startsWith("/radio_tech");

  useEffect(() => {
    const searchInput = document.querySelector('input[placeholder="Search by Name or MRN"]');
    const patientCards = document.querySelectorAll('.patient-card');
    const rightColumn = document.querySelector('.right-column');
    const verticalSeparator = document.querySelector('.vertical-separator');

    // إخفاء الكروت والعمود الأيمن عند التحميل الأولي
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
                />
              </div>

              <div className="patient-card patient-list-card patient-list-card-border">
                <div className="patient-list-avatar">
                  <img
                    src="https://ui-avatars.com/api/?name=Nasser+Saeed&background=4A90E2&color=fff&size=50"
                    alt="Patient"
                    className="patient-list-avatar-img"
                  />
                </div>
                <div className="patient-list-info-wrapper">
                  <div className="patient-name patient-list-name">
                    Nasser Saeed
                  </div>
                  <div className="patient-mrn patient-list-mrn">
                    MRN-004523
                  </div>
                </div>
                <div className="patient-list-chevron">
                  <BsChevronRight />
                </div>
              </div>
            </div>
          </div>

          {/* Vertical Separator */}
          <div className="vertical-separator patient-list-separator patient-list-separator-bg"></div>

          {/* Right Column - Basic Information and Files */}
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
                  1098765432
                </span>
              </div>
              <div className="patient-list-basic-info-row patient-list-info-row-border">
                <span className="patient-list-basic-info-label">
                  MRN
                </span>
                <span className="patient-list-basic-info-value">
                  004523
                </span>
              </div>
              <div className="patient-list-basic-info-row patient-list-info-row-border">
                <span className="patient-list-basic-info-label">
                  Age
                </span>
                <span className="patient-list-basic-info-value">
                  35
                </span>
              </div>
              <div className="patient-list-basic-info-row patient-list-info-row-border">
                <span className="patient-list-basic-info-label">
                  Gender
                </span>
                <span className="patient-list-basic-info-value">
                  Male
                </span>
              </div>
              <div className="patient-list-basic-info-row-last">
                <span className="patient-list-basic-info-label">
                  Phone
                </span>
                <span className="patient-list-basic-info-value">
                  +966 54 987 2345
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
                        {/* 👇 عنوان ديناميكي بناءً على نوع المستخدم */}
                        {isTech ? "Actions" : "Image and Report"}
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    <tr className="patient-list-files-tr">
                      <td className="patient-list-files-td">
                        ACC-321
                      </td>
                      <td className="patient-list-files-td">
                        12 Mar 2023
                      </td>
                      <td className="patient-list-files-td">
                        CT
                      </td>
                      <td className="patient-list-files-td">
                        {/* 👇 محتوى ديناميكي بناءً على pathname - نفس منطق SideBar */}
                        {isTech ? (
                          // 🔧 عرض التقني: أيقونتان (Upload + View)
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
                          // 👨‍⚕️ عرض الطبيب: رابط نصي
                          <Link
                            href="/viewimg"
                            className="patient-list-doctor-link"
                          >
                            view
                          </Link>
                        ) : null}
                      </td>
                    </tr>

                    {/* Empty Rows للتصميم */}
                    {[1, 2, 3].map((_, index) => (
                      <tr 
                        key={index}
                        className="patient-list-files-tr"
                      >
                        <td className="patient-list-files-td"></td>
                        <td className="patient-list-files-td"></td>
                        <td className="patient-list-files-td"></td>
                        <td className="patient-list-files-td"></td>
                      </tr>
                    ))}
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

export default PatientList;