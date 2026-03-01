"use client";
import { useState, useCallback } from "react";
import Footer from "./Footer";
import Img from "./Img";
import Header from "./Header";
import Report from "./Report";
import StatusBar from "@/components/Statusbar";
import { useRouter, useSearchParams } from "next/navigation";

const PaneSpinner = ({ label }: { label: string }) => (
  <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#0D1A2D] rounded-md pointer-events-none">
    <div className="relative w-12 h-12">
      <div className="absolute inset-0 rounded-full border-2 border-white/10" />
      <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#17387C] border-r-[#17387C] animate-spin" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-2 h-2 rounded-full bg-[#17387C] animate-pulse" />
      </div>
    </div>
    <span className="mt-3 text-white/40 text-[10px] font-mono tracking-widest uppercase">
      {label}
    </span>
  </div>
);

const WritingReport = () => {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const accessionId  = searchParams.get("accession_id");

  const navigateToViewer = () => {
    if (accessionId) sessionStorage.setItem("viewimg_accession_id", accessionId);
    router.push("/viewimg");
  };

  const [lastEvent,   setLastEvent]   = useState("");
  const [lastTime,    setLastTime]    = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const [reportLoading, setReportLoading] = useState(true);
  const [imgLoading,    setImgLoading]    = useState(true);

  const nowTime = () => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  };

  const handleStatusChange = useCallback(
    (message: string, time: string, uploading: boolean) => {
      const resolvedTime = time || nowTime();
      if (message) setLastEvent(message);
      setLastTime(resolvedTime);
      setIsUploading(uploading);
    },
    []
  );

  const handleDataLoaded = useCallback(() => setReportLoading(false), []);

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

  return (
    <>
      <div className="hidden md:flex h-screen flex-col p-4 bg-[var(--color-bg-primary)] overflow-hidden">
        <Header />

        <div className="flex flex-1 flex-row gap-4 mt-4 mb-4 overflow-hidden min-h-0">

          <div
            ref={viewerRef}
            className="flex-1 rounded-md flex items-start justify-center border border-white/20 hover:border-white/30 relative overflow-hidden bg-[var(--color-bg-primary)] cursor-pointer"
            onClick={() => navigateToViewer()}
          >
            {imgLoading && <PaneSpinner label="Loading viewer..." />}
            <Img />
            <div className="absolute inset-0 z-10" />
          </div>

          <div className="flex-1 rounded-md flex flex-col border border-white/20 bg-[var(--color-bg-secondary)] overflow-hidden">
            <div className="flex-1 overflow-hidden min-h-0 relative">
              {reportLoading && <PaneSpinner label="Loading report..." />}
              <Report onStatusChange={handleStatusChange} onDataLoaded={handleDataLoaded} />
            </div>
            <StatusBar message={lastEvent} lastSavedTime={lastTime} isUploading={isUploading} />
          </div>

        </div>

        <Footer />
      </div>

      <section className="md:hidden bg-[#040A16] min-h-screen overflow-y-auto overflow-x-hidden p-4">
        <div className="w-full flex flex-col gap-6">

          <div className="flex-shrink-0 w-full">
            <Header />
          </div>

          <div
            ref={viewerRef}
            className="w-full rounded-[10px] border border-white/30 bg-[#040A16] flex items-start justify-center relative overflow-hidden cursor-pointer"
            style={{ height: "220px" }}
            onClick={() => navigateToViewer()}
          >
            {imgLoading && <PaneSpinner label="Loading viewer..." />}
            <Img />
            <div className="absolute inset-0 z-10" />
          </div>

          <div className="w-full rounded-[10px] border border-white/30 bg-[#0D1A2D] flex flex-col overflow-hidden min-w-0 min-h-[350px]">
            <div className="flex-1 overflow-hidden min-h-0 relative">
              {reportLoading && <PaneSpinner label="Loading report..." />}
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