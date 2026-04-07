"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { Toolbar } from "@/components/Toolbar";
import { useCustomEditor } from "@/components/useEditorConfig";
import { fetchReport, saveDraft, saveFinal, ReportData } from "@/components/reportApi";
import PatientView from "@/components/PatientView";
import ReportHeader from "@/components/ReportHeader";
import ReportEditorSection from "@/components/ReportEditorSection";

declare global {
  interface Window {
    triggerScreenshot?: (accessionId: string) => void;
    screenshotUploadTimeout?: NodeJS.Timeout;
  }
}

interface ReportProps {
  onStatusChange?: (message: string, time: string, uploading: boolean) => void;
  onDataLoaded?:   () => void;
}

const Report = ({ onStatusChange, onDataLoaded }: ReportProps) => {
  const [reportText, setReportText]                 = useState("");
  const [bodyPart, setBodyPart]                     = useState("");
  const [clinicalIndication, setClinicalIndication] = useState("");
  const [technique, setTechnique]                   = useState("");
  const [finding, setFinding]                       = useState("");
  const [impression, setImpression]                 = useState("");
  const [activeEditor, setActiveEditor]             = useState<any>(null);
  const [reportStatus, setReportStatus]             = useState("Draft");
  const [isSaving, setIsSaving]                     = useState(false);
  const [uploadingImage, setUploadingImage]         = useState(false);
  const [capturedImageUrl, setCapturedImageUrl]     = useState<string | null>(null);

  const [statusBarMessage, setStatusBarMessage] = useState("");
  const [lastSavedTime, setLastSavedTime]       = useState("");

  const pathname     = usePathname();
  const searchParams = useSearchParams();
  const accessionId  = searchParams.get("accession_id");

  // Tracks what was last saved to the database
  const [lastSavedData, setLastSavedData] = useState<ReportData>({
    body_part: "", clinical_indication: "", technique: "", finding: "", impression: "",
  });

  const isSavingRef    = useRef(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  // We store each field's value in a ref in addition to state, so the auto-save
  // interval always reads the latest value. Without refs, the interval would
  // capture a stale copy of the value from when it was first registered.
  const bodyPartRef           = useRef(bodyPart);
  const clinicalIndicationRef = useRef(clinicalIndication);
  const techniqueRef          = useRef(technique);
  const findingRef            = useRef(finding);
  const impressionRef         = useRef(impression);
  const reportStatusRef       = useRef(reportStatus);
  const lastSavedDataRef      = useRef(lastSavedData);
  const isDataLoadedRef       = useRef(isDataLoaded);
  const lastSavedTimeRef      = useRef(lastSavedTime);

  useEffect(() => { bodyPartRef.current           = bodyPart;           }, [bodyPart]);
  useEffect(() => { clinicalIndicationRef.current = clinicalIndication; }, [clinicalIndication]);
  useEffect(() => { techniqueRef.current          = technique;          }, [technique]);
  useEffect(() => { findingRef.current            = finding;            }, [finding]);
  useEffect(() => { impressionRef.current         = impression;         }, [impression]);
  useEffect(() => { reportStatusRef.current       = reportStatus;       }, [reportStatus]);
  useEffect(() => { lastSavedDataRef.current      = lastSavedData;      }, [lastSavedData]);
  useEffect(() => { isDataLoadedRef.current       = isDataLoaded;       }, [isDataLoaded]);
  useEffect(() => { lastSavedTimeRef.current      = lastSavedTime;      }, [lastSavedTime]);

  // If the URL is the patient report page, show the read-only view instead of the editor
  const isPatientView = pathname === "/patients/reportPatients";

  const getStorageKey = (id: string) => `statusBar_${id}`;

  // Updates the status bar message and persists it so it survives a page refresh
  const showStatusMessage = useCallback((msg: string) => {
    const time = lastSavedTimeRef.current;
    setStatusBarMessage(msg);
    if (accessionId) {
      try {
        localStorage.setItem(getStorageKey(accessionId), JSON.stringify({ event: msg, time }));
      } catch (e) {}
    }
    onStatusChange?.(msg, time, false);
  }, [onStatusChange, accessionId]);

  // Records the current time as the "last saved at" timestamp shown in the status bar
  const updateSavedTime = useCallback(() => {
    const now  = new Date();
    const hh   = String(now.getHours()).padStart(2, "0");
    const mm   = String(now.getMinutes()).padStart(2, "0");
    const time = `${hh}:${mm}`;
    setLastSavedTime(time);
    lastSavedTimeRef.current = time;
    onStatusChange?.("", time, false);
  }, [onStatusChange]);

  // Saves the current content as a draft — skips if nothing has changed since the last save
  const saveAsDraft = useCallback(async (triggeredByBlur = false) => {
    if (isSavingRef.current || !accessionId) return;
    const currentData: ReportData = {
      body_part: bodyPartRef.current, clinical_indication: clinicalIndicationRef.current,
      technique: techniqueRef.current, finding: findingRef.current, impression: impressionRef.current,
    };
    const hasChanges =
      currentData.body_part           !== lastSavedDataRef.current.body_part           ||
      currentData.clinical_indication !== lastSavedDataRef.current.clinical_indication ||
      currentData.technique           !== lastSavedDataRef.current.technique           ||
      currentData.finding             !== lastSavedDataRef.current.finding             ||
      currentData.impression          !== lastSavedDataRef.current.impression;
    if (!hasChanges) return;
    try {
      isSavingRef.current = true;
      const data = await saveDraft(accessionId, currentData, reportStatusRef.current);
      if (data.status === "ok") {
        setLastSavedData(currentData);
        updateSavedTime();
        if (triggeredByBlur) {
          showStatusMessage("Draft saved");
        } else if (accessionId) {
          const now  = new Date();
          const hh   = String(now.getHours()).padStart(2, "0");
          const mm   = String(now.getMinutes()).padStart(2, "0");
          const time = `${hh}:${mm}`;
          try {
            const stored = localStorage.getItem(getStorageKey(accessionId));
            const prev   = stored ? JSON.parse(stored) : {};
            localStorage.setItem(getStorageKey(accessionId), JSON.stringify({ ...prev, time }));
          } catch (e) { /* ignore */ }
        }
      }
    } catch (error) { console.error("Auto-save error:", error); }
    finally { isSavingRef.current = false; }
  }, [accessionId, showStatusMessage, updateSavedTime]);

  // A last-resort save triggered when the doctor closes the tab or navigates away. 
  const sendBeaconSave = useCallback(() => {
    if (!isDataLoadedRef.current || !accessionId) return;
    const currentData: ReportData = {
      body_part: bodyPartRef.current,
      clinical_indication: clinicalIndicationRef.current,
      technique: techniqueRef.current,
      finding: findingRef.current,
      impression: impressionRef.current,
    };
    const hasChanges =
      currentData.body_part           !== lastSavedDataRef.current.body_part           ||
      currentData.clinical_indication !== lastSavedDataRef.current.clinical_indication ||
      currentData.technique           !== lastSavedDataRef.current.technique           ||
      currentData.finding             !== lastSavedDataRef.current.finding             ||
      currentData.impression          !== lastSavedDataRef.current.impression;
    if (!hasChanges) return;
    const payload = JSON.stringify({
      accession_id: accessionId,
      ...currentData,
      current_status: reportStatusRef.current,
    });
    navigator.sendBeacon(
      "/api/reports/autosave-draft",
      new Blob([payload], { type: "application/json" })
    );
  }, [accessionId]);

  // We create one editor instance per report section.
  // Body Part is plain text only, while the remaining sections support rich formatting
  // (rich formatting = bold, italic, bullet lists, font size changes, etc.)
  const bodyPartEditor = useCustomEditor({
    content: bodyPart, placeholder: "",
    onUpdate: setBodyPart,
    onBlur: () => isDataLoaded && saveAsDraft(true),
    minHeight: "24px", maxHeight: "48px", isPlainText: true,
  });
  const clinicalIndicationEditor = useCustomEditor({
    content: clinicalIndication, placeholder: "",
    onUpdate: setClinicalIndication,
    onFocus: setActiveEditor,
    onBlur: () => isDataLoaded && saveAsDraft(true),
    minHeight: "40px",
  });
  const techniqueEditor = useCustomEditor({
    content: technique, placeholder: "",
    onUpdate: setTechnique,
    onFocus: setActiveEditor,
    onBlur: () => isDataLoaded && saveAsDraft(true),
    minHeight: "40px",
  });
  const findingEditor = useCustomEditor({
    content: finding, placeholder: "",
    onUpdate: setFinding,
    onFocus: setActiveEditor,
    onBlur: () => isDataLoaded && saveAsDraft(true),
    minHeight: "60px",
  });
  const impressionEditor = useCustomEditor({
    content: impression, placeholder: "",
    onUpdate: setImpression,
    onFocus: setActiveEditor,
    onBlur: () => isDataLoaded && saveAsDraft(true),
    minHeight: "40px",
  });

  // The toolbar always targets whichever section the doctor is currently typing in.
  // When the doctor moves to a different field, the toolbar switches to control that field.
  const editor = activeEditor || clinicalIndicationEditor;

  useEffect(() => {
    if (clinicalIndicationEditor && !activeEditor) setActiveEditor(clinicalIndicationEditor);
  }, [clinicalIndicationEditor, activeEditor]);

  // Listens for events fired by the 3D viewer iframe once it finishes
  // capturing and uploading a screenshot of the scan image.
  useEffect(() => {
    const handleSuccess = async (event: any) => {
      if ((window as any).screenshotUploadTimeout) clearTimeout((window as any).screenshotUploadTimeout);
      setUploadingImage(false);
      setCapturedImageUrl(event.detail.imageUrl);
      showStatusMessage("Image attached successfully");
      // Re-fetch the report to get the latest scan screenshot URL saved by the server,
      // since the URL is generated server-side and not available locally.
      try {
        const response = await fetch(`/api/reports?accession_id=${accessionId}`);
        const data = await response.json();
        if (data.status === "ok" && data.report?.images) {
          const imagesData = typeof data.report.images === "string"
            ? JSON.parse(data.report.images)
            : data.report.images;
          if (imagesData?.imageUrl) setCapturedImageUrl(imagesData.imageUrl);
        }
      } catch (error) { console.error("Error refreshing image data:", error); }
    };
    const handleError = (event: any) => {
      if ((window as any).screenshotUploadTimeout) clearTimeout((window as any).screenshotUploadTimeout);
      setUploadingImage(false);
      showStatusMessage(`Upload failed: ${event.detail.error}`);
    };
    window.addEventListener("screenshotUploaded", handleSuccess);
    window.addEventListener("screenshotError", handleError);
    return () => {
      window.removeEventListener("screenshotUploaded", handleSuccess);
      window.removeEventListener("screenshotError", handleError);
    };
  }, [accessionId, showStatusMessage]);

  // Fetches the report from the database when the page first loads
  // and fills all editor fields with the saved content.
  useEffect(() => {
    const loadReport = async () => {
      if (!accessionId) return;
      try {
        const data = await fetchReport(accessionId);
        if (data) {
          setBodyPart(data.bodyPart); setClinicalIndication(data.clinicalIndication);
          setTechnique(data.technique); setFinding(data.finding); setImpression(data.impression);
          setReportStatus(data.reportStatus); setReportText(data.reportText);
          setCapturedImageUrl(data.imageUrl);
          setLastSavedData({
            body_part: data.bodyPart, clinical_indication: data.clinicalIndication,
            technique: data.technique, finding: data.finding, impression: data.impression,
          });
          // Restore the last status bar message and timestamp from local storage
          try {
            const stored = localStorage.getItem(getStorageKey(accessionId));
            if (stored) {
              const { event, time } = JSON.parse(stored);
              if (time) { setLastSavedTime(time); lastSavedTimeRef.current = time; }
              onStatusChange?.(event || "", time || "", false);
            }
          } catch (e) { /* ignore */ }
        }
      } catch (error) { console.error("Error fetching report:", error); }
      finally { setIsDataLoaded(true); onDataLoaded?.(); }
    };
    loadReport();
  }, [accessionId]);

  // Once data is loaded, push it into the Tiptap editors so the content appears
  useEffect(() => {
    if (!isDataLoaded) return;
    bodyPartEditor?.commands.setContent(bodyPart);
    clinicalIndicationEditor?.commands.setContent(clinicalIndication);
    techniqueEditor?.commands.setContent(technique);
    findingEditor?.commands.setContent(finding);
    impressionEditor?.commands.setContent(impression);
  }, [isDataLoaded]);

  // Auto-saves the report every 10 seconds to prevent losing unsaved changes
  // if the doctor forgets to save manually or loses their connection.
  useEffect(() => {
    if (!isDataLoaded) return;
    const intervalId = setInterval(() => saveAsDraft(false), 10000);
    return () => clearInterval(intervalId);
  }, [isDataLoaded, saveAsDraft]);

  // Attaches the sendBeacon save to tab-close and page-hide events,
  // so any unsaved changes are sent to the server even if the doctor
  // closes the tab or navigates away without saving.
  useEffect(() => {
    if (!isDataLoaded || !accessionId) return;
    const handleUnload = () => sendBeaconSave();
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") sendBeaconSave();
    };
    window.addEventListener("beforeunload", handleUnload);
    window.addEventListener("pagehide", handleUnload);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      window.removeEventListener("beforeunload", handleUnload);
      window.removeEventListener("pagehide", handleUnload);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isDataLoaded, accessionId, sendBeaconSave]);

  // Save button is disabled until all five sections have content
  const stripHtml = (html: string) => html.replace(/<[^>]*>/g, "").trim();
  const canSave = stripHtml(bodyPart) !== "" && stripHtml(clinicalIndication) !== "" &&
    stripHtml(technique) !== "" && stripHtml(finding) !== "" && stripHtml(impression) !== "";

  // Saves the report as "completed" after the doctor confirms the PDF preview
  const handleConfirmSave = async () => {
    if (!accessionId || isSaving || !canSave) return;
    setIsSaving(true);
    try {
      const data = await saveFinal(accessionId, {
        body_part: bodyPart, clinical_indication: clinicalIndication,
        technique: technique, finding: finding, impression: impression,
      });
      if (data.status === "ok") {
        setReportStatus("completed");
        setLastSavedData({
          body_part: bodyPart, clinical_indication: clinicalIndication,
          technique: technique, finding: finding, impression: impression,
        });
        updateSavedTime();
        showStatusMessage("Report saved successfully");
        // Flags the patient list page to reload its data so the updated
        // report status (completed) appears without a manual page refresh.
        sessionStorage.setItem("patientList_shouldRefresh", "true");
      } else {
        showStatusMessage("Save failed — please try again");
      }
    } catch (error) {
      console.error("Save error:", error);
      showStatusMessage("Save failed — please try again");
    } finally {
      setIsSaving(false);
    }
  };

  // Asks the 3D viewer iframe to capture a screenshot of the current scan.
  // A 30-second timeout is set because the operation has two steps:
  // capturing the image inside the iframe, then uploading it to the server.
  // If both steps don't complete within 30 seconds, we treat it as a failure.
  const handleAttachImage = () => {
    if (!accessionId) { showStatusMessage("Accession ID not found"); return; }
    const iframe = document.querySelector('iframe[title="3D Volume Rendering"]') as HTMLIFrameElement;
    if (!iframe?.contentWindow) { showStatusMessage("Volume renderer not loaded yet"); return; }
    const iframeWindow = iframe.contentWindow as any;
    if (typeof iframeWindow.triggerScreenshot !== "function") {
      showStatusMessage("Volume renderer still loading, please wait...");
      return;
    }
    setUploadingImage(true);
    setStatusBarMessage("Capturing screenshot...");
    onStatusChange?.("Capturing screenshot...", lastSavedTime, true);
    const uploadTimeout = setTimeout(() => {
      setUploadingImage(false);
      onStatusChange?.("", lastSavedTime, false);
      showStatusMessage("Upload timeout — please try again");
    }, 30000);
    (window as any).screenshotUploadTimeout = uploadTimeout;
    try { iframeWindow.triggerScreenshot(accessionId); }
    catch (error) {
      clearTimeout(uploadTimeout);
      setUploadingImage(false);
      showStatusMessage("Failed to trigger screenshot");
    }
  };

  // If this page is opened by a patient, show a read-only version of the report
  if (isPatientView) {
    return (
      <PatientView
        reportText={reportText} bodyPart={bodyPart} clinicalIndication={clinicalIndication}
        technique={technique} finding={finding} impression={impression} capturedImageUrl={null}
      />
    );
  }

  return (
    <div className="w-full h-full flex flex-col bg-[#0D1A2D]">

      <ReportHeader
        reportStatus={reportStatus}
        uploadingImage={uploadingImage}
        isSaving={isSaving}
        canSave={canSave}
        capturedImageUrl={capturedImageUrl}
        accessionId={accessionId}
        reportData={{ bodyPart, clinicalIndication, technique, finding, impression }}
        onAttachImage={handleAttachImage}
        onConfirmSave={handleConfirmSave}
      />

      <div className="flex-1 overflow-y-auto bg-[#0D1A2D]">
        {/* Toolbar stays pinned at the top and always controls the focused editor section */}
        <div className="sticky top-0 z-40 px-4 pt-2 bg-[#0D1A2D]">
          <Toolbar editor={editor} />
        </div>

        <div className="px-4 pb-4">
          <div className="w-full bg-[#0D1A2D] border border-white/30 rounded-md overflow-hidden">
            <div className="divide-y divide-white/30">
              <ReportEditorSection title="Body Part"           editor={bodyPartEditor}           subtitle="(Plain text only)" />
              <ReportEditorSection title="Clinical Indication" editor={clinicalIndicationEditor} />
              <ReportEditorSection title="Technique"           editor={techniqueEditor}          />
              <ReportEditorSection title="Finding"             editor={findingEditor}            />
              <ReportEditorSection title="Impression"          editor={impressionEditor}         />
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .tiptap-editor {
          background: #0d1a2d;
          color: white;
          padding: 16px;
          font-size: 14px;
          line-height: 1.6;
          outline: none;
          width: 100%;
          box-sizing: border-box;
        }
        .body-part-editor {
          font-size: 16px;
          font-weight: 500;
          padding: 12px 16px;
        }
        .tiptap-editor:focus { outline: none; }
        .tiptap-editor p.is-editor-empty:first-child::before {
          color: rgba(156, 163, 175, 0.4);
          content: attr(data-placeholder);
          float: left;
          height: 0;
          pointer-events: none;
        }
        .tiptap-editor strong { font-weight: bold; }
        .tiptap-editor em { font-style: italic; }
        .tiptap-editor u { text-decoration: underline; }
        .tiptap-editor s { text-decoration: line-through; }
        .tiptap-editor ul, .tiptap-editor ol { padding-left: 1.5em; margin: 0.5em 0; }
        .tiptap-editor li { margin: 0.25em 0; }
        .tiptap-editor ul { list-style-type: disc; }
        .tiptap-editor ol { list-style-type: decimal; }
        .editor-section-wrapper { background: #0d1a2d; }
        .ProseMirror { width: 100%; box-sizing: border-box; }
      `}</style>
    </div>
  );
};

export default Report;