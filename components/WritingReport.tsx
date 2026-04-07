"use client";
import { useState, useCallback, useEffect } from "react";
import Footer from "./Footer";
import Img from "./Img";
import Header from "./Header";
import Report from "./Report";
import StatusBar from "@/components/Statusbar";
import LoadingSpinner from "./LoadingSpinner";
import { useRouter, useSearchParams } from "next/navigation";

const WritingReport = () => {
  const router       = useRouter();
  const searchParams = useSearchParams();
  // Grab the accession ID from the URL — this is the unique ID for each scan
  const accessionId  = searchParams.get("accession_id");

  const [volumeId, setVolumeId]           = useState<number | null>(null);
  // Tracks whether we've finished checking if a 3D scan exists for this report
  const [volumeChecked, setVolumeChecked] = useState(false);
  const [savedTFSteps, setSavedTFSteps]   = useState<any[] | null>(null);

  // When the page loads, ask the server if there's a 3D scan linked to this report
  useEffect(() => {
    if (!accessionId) return;
    fetch(`/api/accession?accession_id=${accessionId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "ok" && data.volumeId) {
          setVolumeId(data.volumeId);
        }
        setVolumeChecked(true);
      })
      .catch((err) => {
        console.error("Failed to fetch volumeId:", err);
        setVolumeChecked(true);
      });

    fetch(`/api/manual-tf?accession_id=${accessionId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.steps && data.steps.length > 0) {
          const steps = data.steps.map((s: any, index: number) => ({
            id: index + 1,
            rangeValue: s.rangeValue,
            rangeStart: s.rangeStart,
            rangeEnd:   s.rangeEnd,
            color:      s.color,
            opacity:    s.opacity,
            isOpen:     false,
          }));
          sessionStorage.setItem("manualTF_steps", JSON.stringify(steps));
          setSavedTFSteps(steps);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch manual TF steps:", err);
      });
  }, [accessionId]);

  // When the doctor clicks the scan preview, take them to the full 3D viewer
  const navigateToViewer = () => {
    if (!volumeId) return;
    if (accessionId) sessionStorage.setItem("viewimg_accession_id", accessionId);
    const from = searchParams.get("from");
    if (from) sessionStorage.setItem("viewimg_from", from);
    router.push(`/viewimg?volumeId=${volumeId}`);
  };

  const [lastEvent,   setLastEvent]   = useState("");
  const [lastTime,    setLastTime]    = useState("");
  const [isUploading, setIsUploading] = useState(false);

  // These track whether the report data is still being fetched from the database,
  // and whether the scan image (rendered inside an iframe) has finished loading
  const [reportLoading, setReportLoading] = useState(true);
  const [imgLoading,    setImgLoading]    = useState(true);

  // Returns the current time as HH:MM — shown in the status bar at the bottom
  // of the report panel to tell the doctor when the last save happened
  const nowTime = () => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  };

  // Called by the Report component whenever something happens (saving, uploading, etc.)
  const handleStatusChange = useCallback(
    (message: string, time: string, uploading: boolean) => {
      const resolvedTime = time || nowTime();
      if (message) setLastEvent(message);
      setLastTime(resolvedTime);
      setIsUploading(uploading);
    },
    []
  );

  // Called by the Report component once it's done loading its data
  const handleDataLoaded = useCallback(() => setReportLoading(false), []);

  // While the scan image is being fetched from the database, a loading spinner
  // is shown on top of the panel. This ref watches for the iframe to finish loading
  // and then hides the spinner so the scan becomes visible
  const viewerRef = useCallback((node: HTMLDivElement | null) => {
    if (!node) return;
    const attach = () => {
      const iframe = node.querySelector("iframe");
      if (!iframe) return false;
      if (iframe.contentDocument?.readyState === "complete") {
        setImgLoading(false);
        return true;
      }
      iframe.addEventListener("load", () => setImgLoading(false), { once: true });
      return true;
    };
    if (!attach()) {
      const mo = new MutationObserver(() => { if (attach()) mo.disconnect(); });
      mo.observe(node, { childList: true, subtree: true });
    }
  }, []);

  // Placeholder shown when no scan is linked to this report yet
  const noScanPane = (height?: string) => (
    <div
      className="absolute inset-0 z-20 flex items-center justify-center bg-[#0D1A2D] rounded-md"
      style={height ? { height } : undefined}
    >
      <p className="text-white/40 text-sm font-mono tracking-widest uppercase text-center px-4">
        Scan not ready yet
      </p>
    </div>
  );

  return (
    <>
      {/* Desktop layout: scan on the left, report editor on the right */}
      <div className="hidden md:flex h-screen flex-col p-4 bg-[var(--color-bg-primary)] overflow-hidden">
        <Header />

        <div className="flex flex-1 flex-row gap-4 mt-4 mb-4 overflow-hidden min-h-0">

          {/* Left panel: clickable scan preview — clicking opens the 3D viewer */}
          <div
            ref={volumeId ? viewerRef : undefined}
            className={`flex-1 rounded-md flex items-start justify-center border border-white/20 hover:border-white/30 relative overflow-hidden bg-[var(--color-bg-primary)] ${volumeId ? "cursor-pointer" : "cursor-not-allowed"}`}
            onClick={volumeId ? navigateToViewer : undefined}
          >
            {!volumeChecked && <LoadingSpinner />}
            {volumeChecked && !volumeId && noScanPane()}
            {volumeChecked && volumeId && imgLoading && <LoadingSpinner />}
            {volumeChecked && volumeId && <Img volumeId={volumeId} savedSteps={savedTFSteps} />}
            {/*
              The scan is inside an iframe, which normally captures all mouse clicks for itself.
              This invisible div sits on top of the entire panel and intercepts those clicks,
              so when the doctor clicks anywhere on the scan, we can run navigateToViewer()
              and take them to the 3D viewer
            */}
            {volumeChecked && volumeId && <div className="absolute inset-0 z-10" />}
          </div>

          {/* Right panel: the report writing form + status bar at the bottom */}
          <div className="flex-1 rounded-md flex flex-col border border-white/20 bg-[var(--color-bg-secondary)] overflow-hidden">
            <div className="flex-1 overflow-hidden min-h-0 relative">
              {reportLoading && <LoadingSpinner />}
              <Report onStatusChange={handleStatusChange} onDataLoaded={handleDataLoaded} />
            </div>
            <StatusBar message={lastEvent} lastSavedTime={lastTime} isUploading={isUploading} />
          </div>

        </div>

        <Footer />
      </div>

      {/* Mobile layout: everything stacked vertically */}
      <section className="md:hidden bg-[#040A16] min-h-screen overflow-y-auto overflow-x-hidden p-4">
        <div className="w-full flex flex-col gap-6">

          <div className="flex-shrink-0 w-full">
            <Header />
          </div>

          {/* Scan thumbnail — fixed height on mobile */}
          <div
            ref={volumeId ? viewerRef : undefined}
            className={`w-full rounded-[10px] border border-white/30 bg-[#040A16] flex items-start justify-center relative overflow-hidden ${volumeId ? "cursor-pointer" : "cursor-not-allowed"}`}
            style={{ height: "220px" }}
            onClick={volumeId ? navigateToViewer : undefined}
          >
            {!volumeChecked && <LoadingSpinner />}
            {volumeChecked && !volumeId && noScanPane("220px")}
            {volumeChecked && volumeId && imgLoading && <LoadingSpinner />}
            {volumeChecked && volumeId && <Img volumeId={volumeId} savedSteps={savedTFSteps} />}
            {volumeChecked && volumeId && <div className="absolute inset-0 z-10" />}
          </div>

          {/* Report editor below the scan on mobile */}
          <div className="w-full rounded-[10px] border border-white/30 bg-[#0D1A2D] flex flex-col overflow-hidden min-w-0 min-h-[350px]">
            <div className="flex-1 overflow-hidden min-h-0 relative">
              {reportLoading && <LoadingSpinner />}
              <Report onStatusChange={handleStatusChange} onDataLoaded={handleDataLoaded} />
            </div>
            <StatusBar message={lastEvent} lastSavedTime={lastTime} isUploading={isUploading} />
          </div>

          <div className="flex-shrink-0 w-full">
            <Footer />
          </div>

        </div>
      </section>
    </>
  );
};

export default WritingReport;