"use client";
import Link from "next/link";
import React, { useEffect } from "react";
import { Search, Upload_Action, Img } from "@/components/icons";
import { BsChevronRight } from "react-icons/bs";

const UploadFileTech = () => {
  useEffect(() => {
    const searchInput = document.querySelector('input[placeholder="Search by Name or MRN"]');
    const patientCards = document.querySelectorAll('.patient-card');
    const rightColumn = document.querySelector('.right-column');
    const verticalSeparator = document.querySelector('.vertical-separator');

    // إخفاء الكروت والعمود الأيمن عند التحميل
    patientCards.forEach(card => {
      (card as HTMLElement).style.display = 'none';
    });
    if (rightColumn) (rightColumn as HTMLElement).style.display = 'none';
    if (verticalSeparator) (verticalSeparator as HTMLElement).style.display = 'none';

    const handleSearch = (e: Event) => {
      const target = e.target as HTMLInputElement;
      const query = target.value.toLowerCase().trim();

      // إخفاء العمود الأيمن والخط العمودي عند البحث
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
      <section className="bg-[#0D1A2D] min-h-screen overflow-y-auto p-4 md:p-8 pl-4 md:pl-[270px] pt-16 md:pt-8">
        <div className="flex flex-col md:flex-row gap-4 md:gap-8">
          {/* Left Column - Patients List */}
          <div className="w-full md:w-5/12">
            <div className="rounded-xl p-4 md:p-6 mb-6 md:mb-8 shadow-sm bg-[#0D1A2D]">
              <h2 className="text-xl md:text-2xl font-semibold text-white mb-4 md:mb-5 md:-mt-4">
                Patients List
              </h2>
              <div className="relative mb-4 md:mb-5">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  className="w-full pl-11 pr-4 py-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder-gray-400 text-white bg-[#040A16]"
                  style={{ borderColor: "#FFFFFF" }}
                  placeholder="Search by Name or MRN"
                />
              </div>

              <div
                className="patient-card border-2 rounded-lg p-3 md:p-4 mb-3 md:mb-4 flex items-center cursor-pointer transition-all duration-200 hover:shadow-lg hover:bg-[#0A1A2D] bg-[#040A16]"
                style={{ borderColor: "#FFFFFF" }}
              >
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gray-200 mr-3 md:mr-4 overflow-hidden flex-shrink-0">
                  <img
                    src="https://ui-avatars.com/api/?name=Nasser+Saeed&background=4A90E2&color=fff&size=50"
                    alt="Patient"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="patient-name text-sm md:text-base font-semibold text-white mb-1 truncate">
                    Nasser Saeed
                  </div>
                  <div className="patient-mrn text-xs md:text-sm text-gray-200 truncate">
                    MRN-004523
                  </div>
                </div>
                <div className="text-white text-lg md:text-xl flex-shrink-0">
                  <BsChevronRight />
                </div>
              </div>
            </div>
          </div>

          {/* Vertical Separator */}
          <div
            className="vertical-separator hidden md:block w-px self-stretch"
            style={{ backgroundColor: "#FFFFFF" }}
          ></div>

          {/* Right Column - Basic Information and Files */}
          <div className="right-column w-full md:w-7/12">
            {/* Basic Information */}
            <div
              className="rounded-xl p-4 md:p-6 mb-6 md:mb-8 shadow-sm border bg-[#040A16]"
              style={{ borderColor: "#FFFFFF" }}
            >
              <h2 className="text-lg md:text-xl font-semibold text-white mb-4 md:mb-5">
                Basic Information
              </h2>
              <div
                className="flex justify-between py-3 border-b"
                style={{ borderColor: "#0D1A2D" }}
              >
                <span className="font-medium text-gray-300 text-sm md:text-base">
                  National ID
                </span>
                <span className="text-white font-medium text-sm md:text-base">
                  1098765432
                </span>
              </div>
              <div
                className="flex justify-between py-3 border-b"
                style={{ borderColor: "#0D1A2D" }}
              >
                <span className="font-medium text-gray-300 text-sm md:text-base">
                  MRN
                </span>
                <span className="text-white font-medium text-sm md:text-base">
                  004523
                </span>
              </div>
              <div
                className="flex justify-between py-3 border-b"
                style={{ borderColor: "#0D1A2D" }}
              >
                <span className="font-medium text-gray-300 text-sm md:text-base">
                  Age
                </span>
                <span className="text-white font-medium text-sm md:text-base">
                  35
                </span>
              </div>
              <div
                className="flex justify-between py-3 border-b"
                style={{ borderColor: "#0D1A2D" }}
              >
                <span className="font-medium text-gray-300 text-sm md:text-base">
                  Gender
                </span>
                <span className="text-white font-medium text-sm md:text-base">
                  Male
                </span>
              </div>
              <div className="flex justify-between py-3">
                <span className="font-medium text-gray-300 text-sm md:text-base">
                  Phone
                </span>
                <span className="text-white font-medium text-sm md:text-base">
                  +966 54 987 2345
                </span>
              </div>
            </div>

            {/* Files */}
            <div
              className="rounded-xl p-4 md:p-6 shadow-sm border bg-[#040A16]"
              style={{ borderColor: "#FFFFFF" }}
            >
              <h2 className="text-lg md:text-xl font-semibold text-white mb-4 md:mb-5">
                Files
              </h2>
              <div className="max-h-[300px] overflow-y-auto overflow-x-auto border border-white">
                <table className="w-full border-collapse text-white">
                  <thead className="border-b border-[#FFFFFF]/20">
                    <tr>
                      <th className="py-3 px-2 md:px-3 text-xs md:text-sm font-medium text-center whitespace-nowrap">
                        Accession
                      </th>
                      <th className="py-3 px-2 md:px-3 text-xs md:text-sm font-medium text-center whitespace-nowrap">
                        Date
                      </th>
                      <th className="py-3 px-2 md:px-3 text-xs md:text-sm font-medium text-center whitespace-nowrap">
                        Modality
                      </th>
                      <th className="py-3 px-2 md:px-3 text-xs md:text-sm font-medium text-center whitespace-nowrap">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    <tr className="border-b border-[#FFFFFF]/20 transition-colors bg-[#040A16] hover:bg-[#0D1A2D]">
                      <td className="py-3 px-2 md:px-3 text-xs md:text-sm text-center whitespace-nowrap">
                        ACC-321
                      </td>
                      <td className="py-3 px-2 md:px-3 text-xs md:text-sm text-center whitespace-nowrap">
                        12 Mar 2023
                      </td>
                      <td className="py-3 px-2 md:px-3 text-xs md:text-sm text-center whitespace-nowrap">
                        CT
                      </td>
                      <td className="py-3 px-2 md:px-3 text-xs md:text-sm text-center whitespace-nowrap">
                        <div className="flex items-center gap-2 justify-center">
                          <Link href="/radio_tech/dropfile" className="p-2 hover:bg-[#0D1A2D] transition rounded cursor-pointer">
                            <Upload_Action className="text-lg text-white" />
                          </Link>
                          <Link href="/viewimg" className="p-2 hover:bg-[#0D1A2D] transition rounded cursor-pointer">
                            <Img className="text-white text-lg" />
                          </Link>
                        </div>
                      </td>
                    </tr>

                    <tr className="border-b border-[#FFFFFF]/20 transition-colors bg-[#040A16] hover:bg-[#0D1A2D]">
                      <td className="py-3 px-2 md:px-3 text-xs md:text-sm text-center whitespace-nowrap">
                      </td>
                      <td className="py-3 px-2 md:px-3 text-xs md:text-sm text-center whitespace-nowrap">
                      </td>
                      <td className="py-3 px-2 md:px-3 text-xs md:text-sm text-center whitespace-nowrap">
                      </td>
                      <td className="py-3 px-2 md:px-3 text-xs md:text-sm text-center whitespace-nowrap">
                      </td>
                    </tr>

                    <tr className="border-b border-[#FFFFFF]/20 transition-colors bg-[#040A16] hover:bg-[#0D1A2D]">
                      <td className="py-3 px-2 md:px-3 text-xs md:text-sm text-center whitespace-nowrap">
                      </td>
                      <td className="py-3 px-2 md:px-3 text-xs md:text-sm text-center whitespace-nowrap">
                      </td>
                      <td className="py-3 px-2 md:px-3 text-xs md:text-sm text-center whitespace-nowrap">
                      </td>
                      <td className="py-3 px-2 md:px-3 text-xs md:text-sm text-center whitespace-nowrap">
                      </td>
                    </tr>

                    <tr className="border-b border-[#FFFFFF]/20 transition-colors bg-[#040A16] hover:bg-[#0D1A2D]">
                      <td className="py-3 px-2 md:px-3 text-xs md:text-sm text-center whitespace-nowrap">
                      </td>
                      <td className="py-3 px-2 md:px-3 text-xs md:text-sm text-center whitespace-nowrap">
                      </td>
                      <td className="py-3 px-2 md:px-3 text-xs md:text-sm text-center whitespace-nowrap">
                      </td>
                      <td className="py-3 px-2 md:px-3 text-xs md:text-sm text-center whitespace-nowrap">
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

export default UploadFileTech;