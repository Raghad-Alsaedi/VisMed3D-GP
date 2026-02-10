"use client";
import { useState, useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";

const Report = () => {
  const [reportText, setReportText] = useState("");
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const accessionId = searchParams.get("accession_id");

  const [lastSavedText, setLastSavedText] = useState("");
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isSavingRef = useRef(false);

  const isPatientView = pathname === "/patients/reportPatients";
  const isDoctorView = pathname === "/doctor/writingReport";

  useEffect(() => {
    const fetchReport = async () => {
      if (!accessionId) return;

      try {
        const response = await fetch(
          `/api/reports?accession_id=${accessionId}`,
        );
        const data = await response.json();

        if (data.status === "ok" && data.report) {
          const text = data.report.reportText || "";
          setReportText(text);
          setLastSavedText(text);
        }
      } catch (error) {
        console.error("Error fetching report:", error);
      }
    };

    fetchReport();
  }, [accessionId]);

  const saveToDatabase = async (text?: string) => {
    if (isSavingRef.current || !accessionId) return;

    const textToSave = text !== undefined ? text : reportText;

    if (textToSave === lastSavedText) {
      return;
    }

    try {
      isSavingRef.current = true;

      const response = await fetch("/api/reports/autosave", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accession_id: accessionId,
          report_content: textToSave,
        }),
      });

      const data = await response.json();

      if (data.status === "ok") {
        setLastSavedText(textToSave);
        console.log("Text report saved successfully");
      }
    } catch (error) {
      console.error("Save error:", error);
    } finally {
      isSavingRef.current = false;
    }
  };

  useEffect(() => {
    if (isDoctorView) {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      saveTimeoutRef.current = setTimeout(() => {
        saveToDatabase();
      }, 10000);

      return () => {
        if (saveTimeoutRef.current) {
          clearTimeout(saveTimeoutRef.current);
        }
      };
    }
  }, [reportText, isDoctorView]);

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
