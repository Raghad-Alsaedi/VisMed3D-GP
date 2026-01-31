import React from "react";
import ViewImg from "./ViewImg";
import Link from "next/link";

const HomeDoctor = () => {
  return (
    <section className="bg-[#0D1A2D] min-h-screen overflow-y-auto p-8 pl-[250px] md:pl-[270px]">
      <div className="space-y-6 max-w-[1000px] mx-auto">
        <div className="py-5 px-6 rounded-[20px] border border-[#FFFFFF]/30 bg-[#040A16]">
          <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-5 md:gap-12 text-white">
            <div className="flex flex-col items-center space-y-3">
              <div className="w-[120px] h-[120px] md:w-[140px] md:h-[140px] rounded-[8px] bg-gray-600 overflow-hidden">
                <img
                  src="doctor-photo.jpg"
                  alt="Dr. Ahmed Al-Ahmadi"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="text-center">
                <h1 className="text-base md:text-lg font-bold text-white mb-1">
                  Dr. Ahmed Al-Ahmadi
                </h1>
                <p className="text-xs md:text-sm text-gray-400">Orthopedist</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 content-center pl-0">
              <div className="flex items-center gap-4">
                <span className="flex-shrink-0">
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
                <span className="text-base md:text-lg text-white min-w-[150px] font-medium">
                  Doctor ID
                </span>
                <span className="text-base md:text-lg text-white">
                  DOC-0015
                </span>
              </div>

              <div className="flex items-center gap-4">
                <span className="flex-shrink-0">
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
                <span className="text-base md:text-lg text-white min-w-[150px] font-medium">
                  License Number
                </span>
                <span className="text-base md:text-lg text-white">
                  SCFHS-123456
                </span>
              </div>

              <div className="flex items-center gap-4">
                <span className="flex-shrink-0">
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
                <span className="text-base md:text-lg text-white min-w-[150px] font-medium">
                  Years of Experience
                </span>
                <span className="text-base md:text-lg text-white">9</span>
              </div>

              <div className="flex items-center gap-4">
                <span className="flex-shrink-0">
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
                <span className="text-base md:text-lg text-white min-w-[150px] font-medium">
                  Gender
                </span>
                <span className="text-base md:text-lg text-white">Male</span>
              </div>

              <div className="flex items-center gap-4">
                <span className="flex-shrink-0">
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
                <span className="text-base md:text-lg text-white min-w-[150px] font-medium">
                  Phone
                </span>
                <span className="text-base md:text-lg text-white">
                  +966 55 123 4567
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="py-5 px-6 rounded-[20px] border border-[#FFFFFF]/30 bg-[#040A16]">
          <h3 className="text-white font-semibold text-lg mb-4">My Patients</h3>

          <div className="overflow-x-auto border border-[#FFFFFF]/30 rounded-lg">
            <table className="w-full text-white">
              <thead className="border-b border-[#FFFFFF]/20">
                <tr>
                  <th className="py-3 px-3 text-sm md:text-base font-medium text-center">
                    #
                  </th>
                  <th className="py-3 px-3 text-sm md:text-base font-medium text-center">
                    Patient_Name
                  </th>
                  <th className="py-3 px-3 text-sm md:text-base font-medium text-center">
                    Accession
                  </th>
                  <th className="py-3 px-3 text-sm md:text-base font-medium text-center">
                    MRN
                  </th>
                  <th className="py-3 px-3 text-sm md:text-base font-medium text-center">
                    Image and Report
                  </th>
                </tr>
              </thead>

              <tbody>
                <tr className="border-b border-[#FFFFFF]/20">
                  <td className="py-3 px-3 text-sm md:text-base text-center">
                    1
                  </td>
                  <td className="py-3 px-3 text-sm md:text-base text-center">
                    Nasser Saeed
                  </td>
                  <td className="py-3 px-3 text-sm md:text-base text-center">
                    ACC-321
                  </td>
                  <td className="py-3 px-3 text-sm md:text-base text-center">
                    004523
                  </td>
                  <td className="py-3 px-3 text-sm md:text-base text-center">
                    <Link href="/viewimg" className="hover:text-blue-300 cursor-pointer">view</Link>
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
