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
      <div className="report-readonly">
        {reportText || "No report available"}
      </div>
    );
  }

  return (
    <textarea
      className="report-editable"
      placeholder="Write the report here..."
      value={reportText}
      onChange={(e) => setReportText(e.target.value)}
    />
  );
};

export default Report;