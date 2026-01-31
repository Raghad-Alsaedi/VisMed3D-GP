"use client"
import Link from 'next/link';
import React, { useEffect } from 'react';


const DoctorPatients = () => {


  return (
    <>
      <style>{`
        .table-row-hover:hover {
          background-color: #0D1A2D !important;
        }
        body {
          background-color: #0D1A2D;
          margin: 0;
          padding: 0;
        }
      `}</style>

      <div className="font-sans" style={{ backgroundColor: '#0D1A2D', minHeight: '100vh' }}>
        {/* Main Content */}
        <div className="ml-[250px] p-4 md:p-8 min-h-screen" style={{ backgroundColor: '#0D1A2D' }}>
          <div className="flex flex-col md:flex-row gap-4 md:gap-8">
            {/* Left Column - Patients List */}
            <div className="w-full md:w-5/12">
              <div className="rounded-xl p-4 md:p-6 mb-6 md:mb-8 shadow-sm" style={{ backgroundColor: '#0D1A2D' }}>
                <h2 className="text-xl md:text-2xl font-semibold text-white mb-4 md:mb-5 md:-mt-4">Patients List</h2>
                <div className="relative mb-4 md:mb-5">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" viewBox="0 0 16 16">
                    <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
                  </svg>
                  <input type="text" className="w-full pl-11 pr-4 py-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder-gray-400 text-white bg-[#040A16]" style={{ borderColor: '#FFFFFF' }} placeholder="MRN-004523" defaultValue="MRN-004523" />
                </div>
                <div className="border-2 rounded-lg p-3 md:p-4 mb-3 md:mb-4 flex items-center cursor-pointer transition-all duration-200 hover:shadow-lg bg-[#040A16]" style={{ borderColor: '#FFFFFF' }}>
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gray-200 mr-3 md:mr-4 overflow-hidden flex-shrink-0">
                    <img src="https://ui-avatars.com/api/?name=Nasser+Saeed&background=4A90E2&color=fff&size=50" alt="Patient" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm md:text-base font-semibold text-white mb-1 truncate">Nasser Saeed</div>
                    <div className="text-xs md:text-sm text-gray-200 truncate">MRN-004523</div>
                  </div>
                  <div className="text-white text-lg md:text-xl flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                      <path fillRule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Vertical Separator */}
            <div className="hidden md:block w-px self-stretch" style={{ backgroundColor: '#FFFFFF' }}></div>

            {/* Right Column - Basic Information and Files */}
            <div className="w-full md:w-7/12">
              {/* Basic Information */}
              <div className="rounded-xl p-4 md:p-6 mb-6 md:mb-8 shadow-sm border bg-[#040A16]" style={{ borderColor: '#FFFFFF' }}>
                <h2 className="text-lg md:text-xl font-semibold text-white mb-4 md:mb-5">Basic Information</h2>
                <div className="flex justify-between py-3 border-b" style={{ borderColor: '#0D1A2D' }}>
                  <span className="font-medium text-gray-300 text-sm md:text-base">National ID</span>
                  <span className="text-white font-medium text-sm md:text-base">1098765432</span>
                </div>
                <div className="flex justify-between py-3 border-b" style={{ borderColor: '#0D1A2D' }}>
                  <span className="font-medium text-gray-300 text-sm md:text-base">MRN</span>
                  <span className="text-white font-medium text-sm md:text-base">004523</span>
                </div>
                <div className="flex justify-between py-3 border-b" style={{ borderColor: '#0D1A2D' }}>
                  <span className="font-medium text-gray-300 text-sm md:text-base">Age</span>
                  <span className="text-white font-medium text-sm md:text-base">35</span>
                </div>
                <div className="flex justify-between py-3 border-b" style={{ borderColor: '#0D1A2D' }}>
                  <span className="font-medium text-gray-300 text-sm md:text-base">Gender</span>
                  <span className="text-white font-medium text-sm md:text-base">Male</span>
                </div>
                <div className="flex justify-between py-3">
                  <span className="font-medium text-gray-300 text-sm md:text-base">Phone</span>
                  <span className="text-white font-medium text-sm md:text-base">+966 54 987 2345</span>
                </div>
              </div>

              {/* Files */}
              <div className="rounded-xl p-4 md:p-6 shadow-sm border bg-[#040A16]" style={{ borderColor: '#FFFFFF' }}>
                <h2 className="text-lg md:text-xl font-semibold text-white mb-4 md:mb-5">Files</h2>
                <div className="overflow-x-auto border border-white">
                  <table className="w-full border-collapse min-w-full">
                    <thead className="bg-[#040A16]">
                      <tr>
                        <th className="px-2 md:px-4 py-3 md:py-4 text-left font-semibold text-white text-xs md:text-sm border-b-2" style={{ borderColor: '#FFFFFF' }}>Accession</th>
                        <th className="px-2 md:px-4 py-3 md:py-4 text-left font-semibold text-white text-xs md:text-sm border-b-2" style={{ borderColor: '#FFFFFF' }}>Date</th>
                        <th className="px-2 md:px-4 py-3 md:py-4 text-left font-semibold text-white text-xs md:text-sm border-b-2" style={{ borderColor: '#FFFFFF' }}>Modality</th>
                        <th className="px-2 md:px-4 py-3 md:py-4 text-left font-semibold text-white text-xs md:text-sm border-b-2" style={{ borderColor: '#FFFFFF' }}>Image and Report</th>
                        <th className="px-2 md:px-4 py-3 md:py-4 text-left font-semibold text-white text-xs md:text-sm border-b-2" style={{ borderColor: '#FFFFFF' }}>Report Status</th>
                        <th className="px-2 md:px-4 py-3 md:py-4 text-left font-semibold text-white text-xs md:text-sm border-b-2" style={{ borderColor: '#FFFFFF' }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="transition-colors table-row-hover bg-[#040A16]">
                        <td className="px-2 md:px-4 py-3 md:py-4 text-xs md:text-sm text-white border-b" style={{ borderColor: '#FFFFFF' }}>ACC-321</td>
                        <td className="px-2 md:px-4 py-3 md:py-4 text-xs md:text-sm text-white border-b" style={{ borderColor: '#FFFFFF' }}>12 Mar 2023</td>
                        <td className="px-2 md:px-4 py-3 md:py-4 text-xs md:text-sm text-white border-b" style={{ borderColor: '#FFFFFF' }}>CT</td>
                        <td className="px-2 md:px-4 py-3 md:py-4 text-xs md:text-sm border-b" style={{ borderColor: '#FFFFFF' }}>
                          <Link href="/viewimg" className="hover:text-blue-300 cursor-pointer text-white">view</Link>
                        </td>
                        <td className="px-2 md:px-4 py-3 md:py-4 text-xs md:text-sm border-b" style={{ borderColor: '#FFFFFF' }}>
                          <span className="bg-green-500 text-white px-2 md:px-3 py-1 rounded-full text-xs font-medium inline-block">Completed</span>
                        </td>
                        <td className="px-2 md:px-4 py-3 md:py-4 text-xs md:text-sm border-b" style={{ borderColor: '#FFFFFF' }}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="text-gray-400 cursor-pointer hover:text-white inline-block" viewBox="0 0 16 16">
                            <path d="M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z"/>
                          </svg>
                        </td>
                      </tr>
                      <tr className="transition-colors table-row-hover bg-[#040A16]">
                        <td className="px-2 md:px-4 py-3 md:py-4 text-xs md:text-sm text-white border-b" style={{ borderColor: '#FFFFFF' }}></td>
                        <td className="px-2 md:px-4 py-3 md:py-4 text-xs md:text-sm text-white border-b" style={{ borderColor: '#FFFFFF' }}></td>
                        <td className="px-2 md:px-4 py-3 md:py-4 text-xs md:text-sm text-white border-b" style={{ borderColor: '#FFFFFF' }}></td>
                        <td className="px-2 md:px-4 py-3 md:py-4 text-xs md:text-sm border-b" style={{ borderColor: '#FFFFFF' }}></td>
                        <td className="px-2 md:px-4 py-3 md:py-4 text-xs md:text-sm border-b" style={{ borderColor: '#FFFFFF' }}></td>
                        <td className="px-2 md:px-4 py-3 md:py-4 text-xs md:text-sm border-b" style={{ borderColor: '#FFFFFF' }}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="text-gray-400 cursor-pointer hover:text-white inline-block" viewBox="0 0 16 16">
                            <path d="M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z"/>
                          </svg>
                        </td>
                      </tr>
                      <tr className="transition-colors table-row-hover bg-[#040A16]">
                        <td className="px-2 md:px-4 py-3 md:py-4 text-xs md:text-sm text-white border-b" style={{ borderColor: '#FFFFFF' }}></td>
                        <td className="px-2 md:px-4 py-3 md:py-4 text-xs md:text-sm text-white border-b" style={{ borderColor: '#FFFFFF' }}></td>
                        <td className="px-2 md:px-4 py-3 md:py-4 text-xs md:text-sm text-white border-b" style={{ borderColor: '#FFFFFF' }}></td>
                        <td className="px-2 md:px-4 py-3 md:py-4 text-xs md:text-sm border-b" style={{ borderColor: '#FFFFFF' }}></td>
                        <td className="px-2 md:px-4 py-3 md:py-4 text-xs md:text-sm border-b" style={{ borderColor: '#FFFFFF' }}></td>
                        <td className="px-2 md:px-4 py-3 md:py-4 text-xs md:text-sm border-b" style={{ borderColor: '#FFFFFF' }}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="text-gray-400 cursor-pointer hover:text-white inline-block" viewBox="0 0 16 16">
                            <path d="M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z"/>
                          </svg>
                        </td>
                      </tr>
                      <tr className="transition-colors table-row-hover bg-[#040A16]">
                        <td className="px-2 md:px-4 py-3 md:py-4 text-xs md:text-sm text-white border-b" style={{ borderColor: '#FFFFFF' }}></td>
                        <td className="px-2 md:px-4 py-3 md:py-4 text-xs md:text-sm text-white border-b" style={{ borderColor: '#FFFFFF' }}></td>
                        <td className="px-2 md:px-4 py-3 md:py-4 text-xs md:text-sm text-white border-b" style={{ borderColor: '#FFFFFF' }}></td>
                        <td className="px-2 md:px-4 py-3 md:py-4 text-xs md:text-sm border-b" style={{ borderColor: '#FFFFFF' }}></td>
                        <td className="px-2 md:px-4 py-3 md:py-4 text-xs md:text-sm border-b" style={{ borderColor: '#FFFFFF' }}></td>
                        <td className="px-2 md:px-4 py-3 md:py-4 text-xs md:text-sm border-b" style={{ borderColor: '#FFFFFF' }}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="text-gray-400 cursor-pointer hover:text-white inline-block" viewBox="0 0 16 16">
                            <path d="M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z"/>
                          </svg>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DoctorPatients;