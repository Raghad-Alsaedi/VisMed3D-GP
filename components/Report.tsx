"use client";
import { useState, useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";

const Report = () => {
  const [reportText, setReportText] = useState("");
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  // ✅ جديد: نجيب study_id من URL
  const studyId = searchParams.get("study_id");
  
  // ✅ جديد: متغيرات للـ auto-save
  const [lastSavedText, setLastSavedText] = useState("");
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isSavingRef = useRef(false);

  const isPatientView = pathname === "/patients/reportPatients";
  const isDoctorView = pathname === "/doctor/writingReport";

  // ✅ تعديل: بدل localStorage، نجيب من API
  useEffect(() => {
    const fetchReport = async () => {
      if (!studyId) return;
      
      try {
        const response = await fetch(`/api/reports?study_id=${studyId}`);
        const data = await response.json();
        
        if (data.status === "ok" && data.report) {
          const text = data.report.reportText || "";
          setReportText(text);
          setLastSavedText(text);
        } else {
          setReportText("");
          setLastSavedText("");
        }
      } catch (error) {
        console.error("Error fetching report:", error);
        setReportText("");
      }
    };
    
    fetchReport();
  }, [studyId]);

  // ✅ جديد: دالة الحفظ للـ API
  const saveToDatabase = async () => {
    if (isSavingRef.current) return;
    if (!studyId) return;
    if (reportText === lastSavedText) return;
    
    try {
      isSavingRef.current = true;
      
      const response = await fetch("/api/reports/autosave", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          study_id: studyId,
          report_text: reportText,
        }),
      });
      
      const data = await response.json();
      
      if (data.status === "ok") {
        setLastSavedText(reportText);
        console.log("✅ Report saved");
      }
    } catch (error) {
      console.error("💥 Save error:", error);
    } finally {
      isSavingRef.current = false;
    }
  };

  // ✅ تعديل: بدل localStorage، نحفظ في Database بعد 10 ثواني
  useEffect(() => {
    if (isDoctorView) {
      // Clear previous timer
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      
      // Set new timer for 10 seconds
      saveTimeoutRef.current = setTimeout(() => {
        saveToDatabase();
      }, 10000); // 10 seconds
      
      return () => {
        if (saveTimeoutRef.current) {
          clearTimeout(saveTimeoutRef.current);
        }
      };
    }
  }, [reportText, isDoctorView]);

  // ✅ جديد: حفظ عند الخروج من textarea (onBlur)
  const handleBlur = () => {
    if (isDoctorView && reportText !== lastSavedText) {
      saveToDatabase();
    }
  };

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
      onBlur={handleBlur}
    />
  );
};

export default Report;