import Link from "next/link";
import LogOutButton from "./LogOutButton";

const Patients = () => {
  return (
    <section className="h-screen bg-[#0D1A2D] flex flex-col">
      <nav className="h-16 flex flex-row-2 px-6 items-center justify-between flex-shrink-0">
        <div className="mt-4 h-10 lg:h-14 md:h-14 overflow-hidden">
          <img
            src="logo.png"
            alt="Logo"
            className="w-full h-full object-cover"
          />
        </div>
        <LogOutButton />
      </nav>

      <main className="flex-1 px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 min-h-0 overflow-y-auto">
        <div className="gap-6 lg:gap-8 max-w-[1400px] mx-auto flex flex-col lg:flex-row mt-4">
          <div className="py-6 px-5 sm:py-7 sm:px-6 md:p-8 rounded-[16px] sm:rounded-[20px] border border-[#FFFFFF]/30 bg-[#040A16] lg:flex-[3] lg:order-2">
            <div className="flex flex-col md:flex-row lg:flex-col items-center md:justify-center md:gap-20 lg:gap-4">
              <div className="flex flex-col items-center gap-3 flex-shrink-0">
                <div className="w-[110px] h-[110px] sm:w-[130px] sm:h-[130px] lg:w-[140px] lg:h-[140px] rounded-[8px] bg-gray-600 overflow-hidden">
                  <img
                    src="doctor-photo.jpg"
                    alt="Nasser Saeed"
                    className="w-full h-full object-cover"
                  />
                </div>

                <h1 className="text-base sm:text-lg font-bold text-white text-center lg:hidden">
                  Nasser Saeed
                </h1>
              </div>

              <div className="flex flex-col items-center md:items-start lg:items-center w-full md:w-auto mt-4 md:mt-0 lg:mt-0">
                <h1 className="text-xl font-bold text-white text-center hidden lg:block mb-4">
                  Nasser Saeed
                </h1>

                <div className="flex flex-col gap-4 w-fit mx-auto md:mx-0">
                  <div className="flex items-center gap-3">
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
                    <span className="text-sm sm:text-base text-white font-medium w-[100px] text-left">
                      National ID
                    </span>
                    <span className="text-sm sm:text-base text-white text-left">
                      1098765432
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
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
                    <span className="text-sm sm:text-base text-white font-medium w-[100px] text-left">
                      Age
                    </span>
                    <span className="text-sm sm:text-base text-white text-left">
                      35
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
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
                    <span className="text-sm sm:text-base text-white font-medium w-[100px] text-left">
                      Gender
                    </span>
                    <span className="text-sm sm:text-base text-white text-left">
                      Male
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
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
                    <span className="text-sm sm:text-base text-white font-medium w-[100px] text-left">
                      Phone
                    </span>
                    <span className="text-sm sm:text-base text-white text-left">
                      +966 54 987 2345
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="py-6 px-5 sm:py-7 sm:px-6 rounded-[16px] sm:rounded-[20px] border border-[#FFFFFF]/30 bg-[#040A16] lg:flex-[7] lg:order-1">
            <h4 className="text-white font-semibold text-lg sm:text-xl lg:text-2xl mb-4 sm:mb-5">
              My File
            </h4>
            <div className="overflow-x-auto border border-[#FFFFFF]/30 rounded-lg">
              <table className="w-full text-white">
                <thead className="border-b border-[#FFFFFF]/20">
                  <tr>
                    <th className="py-3 sm:py-4 px-3 sm:px-4 text-sm sm:text-base lg:text-lg font-medium text-center whitespace-nowrap">
                      #
                    </th>
                    <th className="py-3 sm:py-4 px-3 sm:px-4 text-sm sm:text-base lg:text-lg font-medium text-center whitespace-nowrap">
                      Date
                    </th>
                    <th className="py-3 sm:py-4 px-3 sm:px-4 text-sm sm:text-base lg:text-lg font-medium text-center whitespace-nowrap">
                      Doctor Name
                    </th>
                    <th className="py-3 sm:py-4 px-3 sm:px-4 text-sm sm:text-base lg:text-lg font-medium text-center whitespace-nowrap">
                      Body Part
                    </th>
                    <th className="py-3 sm:py-4 px-3 sm:px-4 text-sm sm:text-base lg:text-lg font-medium text-center whitespace-nowrap">
                      Report
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-[#FFFFFF]/20">
                    <td className="py-3 sm:py-4 px-3 sm:px-4 text-sm sm:text-base lg:text-lg text-center whitespace-nowrap">
                      1
                    </td>
                    <td className="py-3 sm:py-4 px-3 sm:px-4 text-sm sm:text-base lg:text-lg text-center whitespace-nowrap">
                      12 Mar 2023
                    </td>
                    <td className="py-3 sm:py-4 px-3 sm:px-4 text-sm sm:text-base lg:text-lg text-center whitespace-nowrap">
                      Dr. Ahmed Al-Ahmadi
                    </td>
                    <td className="py-3 sm:py-4 px-3 sm:px-4 text-sm sm:text-base lg:text-lg text-center whitespace-nowrap">
                      Foot
                    </td>
                    <td className="py-3 sm:py-4 px-3 sm:px-4 text-sm sm:text-base lg:text-lg text-center whitespace-nowrap">
                      <Link
                        href="/patients/reportPatients"
                        className="hover:text-blue-300 cursor-pointer transition-colors duration-200"
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