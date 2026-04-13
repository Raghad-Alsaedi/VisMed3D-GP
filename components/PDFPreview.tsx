"use client";
import { useEffect, useRef } from "react";
import { PDFViewer } from "@react-pdf/renderer";
import {
  MedicalReportDocument,
  ReportData,
  DoctorInfo,
  PatientInfo,
  generateMedicalReportPDF,
} from "@/components/DownloadPDF";
import { saveAs } from "file-saver";
import { Download } from "./icons";

interface PDFPreviewModalProps {
  reportData: ReportData;
  doctorInfo: DoctorInfo | null;
  patientInfo: PatientInfo | null;
  role: "doctor" | "patient";
  accessionId?: string;
  isSaving?: boolean;
  onConfirm?: () => void;
  onCancel?: () => void;
  onBack?: () => void;
}

const PDFPreview = ({
  reportData,
  doctorInfo,
  patientInfo,
  role,
  accessionId,
  isSaving,
  onConfirm,
  onCancel,
  onBack,
}: PDFPreviewModalProps) => {
  const wrapperRef = useRef<HTMLDivElement>(null);

  // The PDF is displayed inside an iframe (a separate embedded page) created by react-pdf.
  // Since the iframe has its own isolated environment, we inject a custom scrollbar style
  // directly into it so it matches the dark theme of the rest of the app.
  useEffect(() => {
    const tryInject = () => {
      const iframe = wrapperRef.current?.querySelector("iframe");
      if (!iframe) return false;

      const injectStyle = () => {
        try {
          const doc = iframe.contentDocument;
          if (!doc) return;
          if (doc.getElementById("custom-scrollbar-style")) return;
          const style = doc.createElement("style");
          style.id = "custom-scrollbar-style";
          style.textContent = `
            ::-webkit-scrollbar { width: 8px !important; }
            ::-webkit-scrollbar-track { background: #0D1A2D !important; }
            ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2) !important; border-radius: 4px !important; }
            ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.35) !important; }
          `;
          doc.head?.appendChild(style);
        } catch {}
      };

      if (iframe.contentDocument?.readyState === "complete") {
        injectStyle();
      } else {
        iframe.addEventListener("load", injectStyle);
      }
      return true;
    };

    // We poll every 300ms waiting for the iframe to appear in the DOM,
    // because react-pdf creates it internally and we have no direct ref to it.
    let attempts = 0;
    const interval = setInterval(() => {
      if (tryInject() || attempts++ > 20) clearInterval(interval);
    }, 300);

    return () => clearInterval(interval);
  }, []);

  // Converts the PDF into a blob (file data held temporarily in browser memory),
  // then triggers a download with the accession ID as the filename.
  const handleDownload = async () => {
    if (!accessionId) return;
    try {
      const blob = await generateMedicalReportPDF(
        reportData,
        patientInfo,
        doctorInfo,
      );
      saveAs(blob, `medical-report-${accessionId}.pdf`);
    } catch (err) {
      console.error("Download error:", err);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#040A16]">
      <div
        className="
        bg-[#0D1A2D] border border-white/30 flex flex-col shadow-2xl overflow-hidden
        w-[95vw] h-[95vh] rounded-xl
        [@media(min-width:600px)_and_(max-width:1023px)]:w-[92vw]
        [@media(min-width:600px)_and_(max-width:1023px)]:h-[92vh]
        [@media(min-width:600px)_and_(max-width:1023px)]:rounded-2xl
        lg:w-[90vw] lg:max-w-4xl lg:h-[90vh] lg:rounded-2xl
      "
      >
        {/* ── Header: back button + title for patient / title + close for doctor ── */}
        <div
          className="
          flex items-center justify-between border-b border-white/30 flex-shrink-0 relative
          px-3 py-2
          [@media(min-width:600px)_and_(max-width:1023px)]:px-4 [@media(min-width:600px)_and_(max-width:1023px)]:py-3
          lg:px-6 lg:py-4
        "
        >
          {role === "patient" ? (
            <button
              onClick={onBack}
              className="rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all cursor-pointer w-7 h-7 [@media(min-width:600px)_and_(max-width:1023px)]:w-8 [@media(min-width:600px)_and_(max-width:1023px)]:h-8 lg:w-9 lg:h-9"
            >
              <svg
                className="text-white w-4 h-4 lg:w-5 lg:h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
          ) : (
            <div className="flex items-center gap-2 lg:gap-3">
              <div>
                <h2 className="text-white font-bold text-xs [@media(min-width:600px)_and_(max-width:1023px)]:text-sm lg:text-base">
                  Report Preview
                </h2>
                <p className="text-white/40 text-[10px] [@media(min-width:600px)_and_(max-width:1023px)]:text-xs lg:text-xs">
                  Review before confirming
                </p>
              </div>
            </div>
          )}

          {/* Title is centered for the patient view */}
          {role === "patient" && (
            <div className="absolute left-1/2 -translate-x-1/2 text-center">
              <h2 className="text-white font-bold text-xs [@media(min-width:600px)_and_(max-width:1023px)]:text-sm lg:text-base">
                Report Preview
              </h2>
            </div>
          )}

          {/* Patient gets a download button; doctor gets a close (X) button */}
          {role === "patient" ? (
            <button
              onClick={handleDownload}
              className="rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all cursor-pointer w-7 h-7 [@media(min-width:600px)_and_(max-width:1023px)]:w-8 [@media(min-width:600px)_and_(max-width:1023px)]:h-8 lg:w-9 lg:h-9"
            >
              <Download className="text-white" />
            </button>
          ) : null}
        </div>

        {/* The PDF is rendered as a live preview inside an iframe by react-pdf,
            meaning the user sees the actual PDF document without leaving the page. */}
        <div className="flex-1 min-h-0 bg-[#0D1A2D]">
          <div ref={wrapperRef} className="w-full h-full">
            <PDFViewer
              width="100%"
              height="100%"
              style={{ border: "none" }}
              showToolbar={false}
            >
              <MedicalReportDocument
                reportData={reportData}
                patientInfo={patientInfo}
                doctorInfo={doctorInfo}
              />
            </PDFViewer>
          </div>
        </div>

        {/* Doctor-only footer: Cancel goes back to editing, Confirm & Save finalizes the report */}
        {role === "doctor" && (
          <div className="flex gap-2 border-t border-white/30 flex-shrink-0 justify-end px-3 py-2 [@media(min-width:600px)_and_(max-width:1023px)]:px-4 [@media(min-width:600px)_and_(max-width:1023px)]:py-3 [@media(min-width:600px)_and_(max-width:1023px)]:gap-3 lg:px-6 lg:py-4 lg:gap-3">
            <button
              onClick={onCancel}
              className="rounded-[20px] border border-white/30 text-white hover:bg-white/10 transition-all font-medium cursor-pointer h-8 px-5 text-xs [@media(min-width:600px)_and_(max-width:1023px)]:h-9 [@media(min-width:600px)_and_(max-width:1023px)]:px-6 [@media(min-width:600px)_and_(max-width:1023px)]:text-sm lg:h-10 lg:px-8 lg:text-sm"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isSaving}
              className="rounded-[20px] bg-green-600 hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-all font-semibold cursor-pointer h-8 px-5 text-xs [@media(min-width:600px)_and_(max-width:1023px)]:h-9 [@media(min-width:600px)_and_(max-width:1023px)]:px-6 [@media(min-width:600px)_and_(max-width:1023px)]:text-sm lg:h-10 lg:px-8 lg:text-sm"
            >
              {isSaving ? "Saving..." : "Confirm & Save"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PDFPreview;
