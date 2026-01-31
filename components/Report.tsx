"use client";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

const Report = () => {
  const [reportText, setReportText] = useState("");
  const pathname = usePathname();

  const isPatientView = pathname === "/patients/reportPatients";
  const isDoctorView = pathname === "/doctor/writingReport";

  useEffect(() => {
    setReportText(localStorage.getItem("report") || "");
  }, []);

  useEffect(() => {
    if (isDoctorView) {
      const timer = setTimeout(() => {
        localStorage.setItem("report", reportText);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [reportText, isDoctorView]);

  if (isPatientView) {
    return (
      <div className="w-full flex-1 bg-[#040A16] text-white text-sm p-3 rounded-md border border-white/20 overflow-auto whitespace-pre-wrap">
        {reportText || "No report available"}
      </div>
    );
  }

  return (
    <textarea
      className="w-full flex-1 bg-[#040A16] text-white text-sm p-3 rounded-md border border-white/20 resize-none focus:outline-none focus:border-white/60 hover:border-white/40"
      placeholder="Write the report here..."
      value={reportText}
      onChange={(e) => setReportText(e.target.value)}
    />
  );
};

export default Report;
