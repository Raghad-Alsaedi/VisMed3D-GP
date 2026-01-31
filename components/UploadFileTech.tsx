import Link from "next/link";

const UploadFileTech = () => {


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
        <div className="ml-[250px] p-4 md:p-8 min-h-screen pt-8" style={{ backgroundColor: '#0D1A2D' }}>
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
                  <table className="w-full border-collapse table-auto">
                    <thead className="bg-[#040A16]">
                      <tr>
                        <th className="px-2 md:px-4 py-3 md:py-4 text-left font-semibold text-white text-xs md:text-sm border-b" style={{ borderColor: '#FFFFFF' }}>Accession</th>
                        <th className="px-2 md:px-4 py-3 md:py-4 text-left font-semibold text-white text-xs md:text-sm border-b" style={{ borderColor: '#FFFFFF' }}>Date</th>
                        <th className="px-2 md:px-4 py-3 md:py-4 text-left font-semibold text-white text-xs md:text-sm border-b" style={{ borderColor: '#FFFFFF' }}>Modality</th>
                        <th className="px-2 md:px-4 py-3 md:py-4 text-left font-semibold text-white text-xs md:text-sm border-b" style={{ borderColor: '#FFFFFF' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="transition-colors table-row-hover bg-[#040A16]">
                        <td className="px-2 md:px-4 py-3 md:py-4 text-xs md:text-sm text-white border-b" style={{ borderColor: '#FFFFFF' }}>ACC-321</td>
                        <td className="px-2 md:px-4 py-3 md:py-4 text-xs md:text-sm text-white border-b" style={{ borderColor: '#FFFFFF' }}>12 Mar 2023</td>
                        <td className="px-2 md:px-4 py-3 md:py-4 text-xs md:text-sm text-white border-b" style={{ borderColor: '#FFFFFF' }}>CT</td>
                        <td className="px-2 md:px-4 py-3 md:py-4 text-xs md:text-sm border-b" style={{ borderColor: '#FFFFFF' }}>
                          <div className="flex items-center gap-2 justify-center">
                            <Link href="/radio_tech/dropfile" className="p-2 hover:bg-[#0D1A2D] transition rounded cursor-pointer">
                              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" className="text-white" viewBox="0 0 16 16">
                                <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/>
                                <path d="M7.646 1.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 2.707V11.5a.5.5 0 0 1-1 0V2.707L5.354 4.854a.5.5 0 1 1-.708-.708l3-3z"/>
                              </svg>
                            </Link>
                            <Link href="/viewimg" className="p-2 hover:bg-[#0D1A2D] transition rounded cursor-pointer">
                              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" className="text-white" viewBox="0 0 16 16">
                                <path d="M6.002 5.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/>
                                <path d="M2.002 1a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2h-12zm12 1a1 1 0 0 1 1 1v6.5l-3.777-1.947a.5.5 0 0 0-.577.093l-3.71 3.71-2.66-1.772a.5.5 0 0 0-.63.062L1.002 12V3a1 1 0 0 1 1-1h12z"/>
                              </svg>
                            </Link>
                          </div>
                        </td>
                      </tr>
                      <tr className="transition-colors table-row-hover bg-[#040A16]">
                        <td className="px-2 md:px-4 py-3 md:py-4 text-xs md:text-sm text-white border-b" style={{ borderColor: '#FFFFFF' }}></td>
                        <td className="px-2 md:px-4 py-3 md:py-4 text-xs md:text-sm text-white border-b" style={{ borderColor: '#FFFFFF' }}></td>
                        <td className="px-2 md:px-4 py-3 md:py-4 text-xs md:text-sm text-white border-b" style={{ borderColor: '#FFFFFF' }}></td>
                        <td className="px-2 md:px-4 py-3 md:py-4 text-xs md:text-sm border-b" style={{ borderColor: '#FFFFFF' }}></td>
                      </tr>
                      <tr className="transition-colors table-row-hover bg-[#040A16]">
                        <td className="px-2 md:px-4 py-3 md:py-4 text-xs md:text-sm text-white border-b" style={{ borderColor: '#FFFFFF' }}></td>
                        <td className="px-2 md:px-4 py-3 md:py-4 text-xs md:text-sm text-white border-b" style={{ borderColor: '#FFFFFF' }}></td>
                        <td className="px-2 md:px-4 py-3 md:py-4 text-xs md:text-sm text-white border-b" style={{ borderColor: '#FFFFFF' }}></td>
                        <td className="px-2 md:px-4 py-3 md:py-4 text-xs md:text-sm border-b" style={{ borderColor: '#FFFFFF' }}></td>
                      </tr>
                      <tr className="transition-colors table-row-hover bg-[#040A16]">
                        <td className="px-2 md:px-4 py-3 md:py-4 text-xs md:text-sm text-white border-b" style={{ borderColor: '#FFFFFF' }}></td>
                        <td className="px-2 md:px-4 py-3 md:py-4 text-xs md:text-sm text-white border-b" style={{ borderColor: '#FFFFFF' }}></td>
                        <td className="px-2 md:px-4 py-3 md:py-4 text-xs md:text-sm text-white border-b" style={{ borderColor: '#FFFFFF' }}></td>
                        <td className="px-2 md:px-4 py-3 md:py-4 text-xs md:text-sm border-b" style={{ borderColor: '#FFFFFF' }}></td>
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

export default UploadFileTech;