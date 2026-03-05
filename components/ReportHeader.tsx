"use client";
import { useState } from "react";
import dynamic from "next/dynamic";
import { Attach_Image, Save } from "@/components/icons";
import { DoctorInfo, PatientInfo } from "@/components/DownloadPDF";

if (typeof window !== "undefined") {
  import("@/components/PDFPreview").catch(() => {});
}

const PDFPreviewModal = dynamic(() => import("@/components/PDFPreview"), { ssr: false });

interface ReportHeaderProps {
  reportStatus: string;
  uploadingImage: boolean;
  isSaving: boolean;
  canSave: boolean;
  capturedImageUrl: string | null;
  accessionId: string | null;
  reportData: {
    bodyPart: string;
    clinicalIndication: string;
    technique: string;
    finding: string;
    impression: string;
  };
  onAttachImage: () => void;
  onConfirmSave: () => void;
}

const ReportHeader = ({
  reportStatus,
  uploadingImage,
  isSaving,
  canSave,
  capturedImageUrl,
  accessionId,
  reportData,
  onAttachImage,
  onConfirmSave,
}: ReportHeaderProps) => {
  const [showPreview, setShowPreview]       = useState(false);
  const [doctorInfo, setDoctorInfo]         = useState<DoctorInfo | null>(null);
  const [patientInfo, setPatientInfo]       = useState<PatientInfo | null>(null);
  const [generating, setGenerating]         = useState(false);
  const [warningShown, setWarningShown]     = useState(false);
  const [warningVisible, setWarningVisible] = useState(false);
  const [isSaved, setIsSaved]               = useState(false);

  const openPdfPreview = async () => {
    setGenerating(true);
    try {
      const [doctorRes, patientRes] = await Promise.all([
        accessionId ? fetch(`/api/doctor/info?accession_id=${accessionId}`) : Promise.resolve(null),
        accessionId ? fetch(`/api/patients/info?accession_id=${accessionId}`) : Promise.resolve(null),
        import("@/components/PDFPreview").catch(() => {}),
      ]);
      let fetchedDoctor: DoctorInfo | null = null;
      let fetchedPatient: PatientInfo | null = null;
      if (doctorRes) {
        const d = await doctorRes.json();
        if (d.status === "ok" && d.doctor) fetchedDoctor = d.doctor;
      }
      if (patientRes) {
        const p = await patientRes.json();
        if (p.status === "ok" && p.patient) fetchedPatient = p.patient;
      }
      setDoctorInfo(fetchedDoctor);
      setPatientInfo(fetchedPatient);
    } catch (e) {
      console.error(e);
      setDoctorInfo(null);
      setPatientInfo(null);
    } finally {
      setGenerating(false);
      setShowPreview(true);
    }
  };

  const handleSaveClick = async () => {
    if (!canSave || isSaving || generating) return;
    if (!capturedImageUrl && !warningShown) {
      setWarningShown(true);
      setWarningVisible(true);
      setTimeout(() => setWarningVisible(false), 3000);
      return;
    }
    setWarningShown(false);
    await openPdfPreview();
  };

  const handleConfirm = () => {
    setShowPreview(false);
    setDoctorInfo(null);
    setPatientInfo(null);
    setIsSaved(true);
    onConfirmSave();
  };

  const handleCancelPreview = () => {
    setShowPreview(false);
    setDoctorInfo(null);
    setPatientInfo(null);
  };

  return (
    <>
      <header className="hidden md:flex sticky top-0 z-50 bg-[#0D1A2D] flex-shrink-0 px-4 pt-4 pb-3 justify-between items-center">

        <div className="flex items-center gap-3">
          <div className={`h-8 lg:h-10 px-5 lg:px-8 rounded-[20px] flex items-center justify-center min-w-[100px] lg:min-w-[120px] ${
            reportStatus === "completed" ? "bg-[#1F9C3E]" : "bg-[#6E6E6E]"
          }`}>
            <span className="text-white text-xs lg:text-sm font-semibold">
              {reportStatus === "completed" ? "Completed" : "Draft"}
            </span>
          </div>
        </div>

        <div className="flex gap-3 items-center">
          {warningVisible && (
            <span className="text-white/60 text-xs font-mono">
              No screenshot attached. Press Save again to continue without one.
            </span>
          )}

          <button
            onClick={() => onAttachImage()}
            disabled={uploadingImage || !canSave}
            className={`bg-transparent border border-white/30 h-8 lg:h-10 px-3 lg:px-4 rounded-[12px] flex items-center justify-center gap-2 transition-colors ${
              uploadingImage || !canSave
                ? "opacity-50 cursor-not-allowed"
                : "hover:border-white/60 cursor-pointer"
            }`}
            title="Attach image from 3D viewer"
          >
            <span className="text-white text-xs lg:text-sm whitespace-nowrap">
              {uploadingImage ? "Uploading..." : "Attach Image"}
            </span>
            <Attach_Image className="w-4 h-4 text-white" />
          </button>

          <button
            onClick={handleSaveClick}
            disabled={!canSave || isSaving || generating}
            className={`h-8 lg:h-10 px-4 lg:px-6 rounded-[12px] flex items-center justify-center gap-2 transition-colors border ${
              !canSave || isSaving || generating
                ? "bg-[#6E6E6E]/40 border-white/20 cursor-not-allowed opacity-50"
                : isSaved
                ? "bg-[#2563EB] hover:bg-[#1D4ED8] border-blue-400/50 cursor-pointer"
                : "bg-[#6E6E6E] hover:bg-[#555] border-white/20 cursor-pointer"
            }`}
          >
            {generating ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span className="text-white text-xs lg:text-sm font-medium">Preparing...</span>
              </>
            ) : (
              <>
                <span className="text-white text-xs lg:text-sm font-medium">
                  {isSaving ? "Saving..." : reportStatus === "completed" ? "Saved" : "Save"}
                </span>
                <Save className="w-4 h-4 text-white" />
              </>
            )}
          </button>
        </div>
      </header>

      <div className="md:hidden sticky top-0 z-50 bg-[#0D1A2D] w-full pb-2 pt-2 px-4">
        {warningVisible && (
          <p className="text-white/60 text-[9px] font-mono text-right mb-1 leading-tight">
            No screenshot attached. Press Save again to continue.
          </p>
        )}

        <div className="flex flex-row items-center justify-between gap-2">
          <div className="flex flex-row items-center gap-1 min-w-0 overflow-hidden">
            <div className={`rounded-[8px] flex items-center justify-center px-3 h-7 flex-shrink-0 ${
              reportStatus === "completed" ? "bg-green-600" : "bg-[#6E6E6E]"
            }`}>
              <span className="text-white font-semibold text-xs whitespace-nowrap">
                {reportStatus === "completed" ? "Completed" : "Draft"}
              </span>
            </div>
          </div>

          <div className="flex flex-row items-center gap-2 flex-shrink-0 pr-1">
            <button
              onClick={() => onAttachImage()}
              disabled={uploadingImage || !canSave}
              className={`border border-white/30 rounded-[8px] flex flex-row items-center gap-1.5 px-3 h-7 bg-transparent transition-colors ${
                uploadingImage || !canSave
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:border-white/60 cursor-pointer"
              }`}
            >
              <span className="text-white text-xs whitespace-nowrap">
                {uploadingImage ? "Uploading..." : "Attach Image"}
              </span>
              <Attach_Image className="text-white w-3 h-3 flex-shrink-0" />
            </button>

            <button
              onClick={handleSaveClick}
              disabled={!canSave || isSaving || generating}
              className={`rounded-[8px] flex flex-row items-center gap-1.5 px-3 h-7 border transition-colors ${
                !canSave || isSaving || generating
                  ? "bg-[#6E6E6E]/40 border-white/20 cursor-not-allowed opacity-50"
                  : isSaved
                  ? "bg-[#2563EB] hover:bg-[#1D4ED8] border-blue-400/50 cursor-pointer"
                  : "bg-[#6E6E6E] hover:bg-[#555] border-white/20 cursor-pointer"
              }`}
            >
              {generating ? (
                <>
                  <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin flex-shrink-0" />
                  <span className="text-white text-xs whitespace-nowrap">Preparing...</span>
                </>
              ) : (
                <>
                  <span className="text-white font-medium text-xs whitespace-nowrap">
                    {isSaving ? "Saving..." : reportStatus === "completed" ? "Saved" : "Save"}
                  </span>
                  <Save className="text-white w-3 h-3 flex-shrink-0" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {showPreview && (
        <PDFPreviewModal
          reportData={{
            bodyPart: reportData.bodyPart,
            clinicalIndication: reportData.clinicalIndication,
            technique: reportData.technique,
            finding: reportData.finding,
            impression: reportData.impression,
            imageUrl: capturedImageUrl,
          }}
          doctorInfo={doctorInfo}
          patientInfo={patientInfo}
          role="doctor"
          isSaving={isSaving}
          onConfirm={handleConfirm}
          onCancel={handleCancelPreview}
        />
      )}
    </>
  );
};

export default ReportHeader;