"use client";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { ArrowL } from "./icons";

const Header = () => {
  const router       = useRouter();
  const pathname     = usePathname();
  const searchParams = useSearchParams();

  // Get the logged-in user's role from the session token
  const { data: session } = useSession();
  const tokenRole = (session?.user as any)?.role as string | undefined;

  const isTech   = tokenRole === "technician";
  const isDoctor = tokenRole === "doctor";

  const [isSaving, setIsSaving]                 = useState(false);
  const [mounted, setMounted]                   = useState(false);
  const [patientName, setPatientName]           = useState<string>("");
  const [accessionNumber, setAccessionNumber]   = useState<string>("");
  const [canSaveProcessed, setCanSaveProcessed] = useState(false);
  const [isManualMode, setIsManualMode]         = useState(false);
  // Holds the resolve function of the save promise so the iframe message can complete it
  const saveResolverRef = useRef<((path: string) => void) | null>(null);

  // Flags that tell which page the user is currently on
  const isReport    = pathname.includes("/writingReport");
  const isViewImage = pathname.includes("/viewimg") || pathname === "/manualTF";
  const isManualTF  = pathname === "/manualTF";
  const isDropFile  = pathname.includes("/dropfile");
  const fromUpload  = searchParams.get("fromUpload") === "true";
  const accessionId = searchParams.get("accession_id");
  const patientId   = searchParams.get("patientId");
  const urlAccessionId = searchParams.get("accessionId");

  // Wait until the component is on the browser before reading client-only values
  useEffect(() => {
    setMounted(true);
  }, []);

  // Detect if the viewer is currently in manual TF mode by checking the URL path
  useEffect(() => {
    if (!mounted) return;
    setIsManualMode(pathname === "/manualTF");
  }, [pathname, mounted]);

  // reset
  const resetView = () => {
    const iframe = document.querySelector('iframe') as HTMLIFrameElement;

    iframe?.contentWindow?.postMessage(
      { type: 'RESET_VIEW' },
      '*'
    );
  };

  // Watch for messages from the iframe to track when the volume is ready or done saving
  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;

      if (event.data.type === 'VOLUME_READY_TO_SAVE') {
        setCanSaveProcessed(true);
      }
      if (event.data.type === 'PROCESSED_SAVED') {
        saveResolverRef.current?.(event.data.processedPath);
      }
      if (event.data.type === 'PROCESSED_SAVE_ERROR') {
        saveResolverRef.current?.('');
      }
    };

    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

  const resolvedAccessionId =
    accessionId ||
    (isViewImage && typeof window !== "undefined"
      ? sessionStorage.getItem("viewimg_accession_id")
      : null);

  // Fetch the patient name and accession number, using sessionStorage as a local cache to avoid repeated server calls
  useEffect(() => {
    if (!resolvedAccessionId) return;
    if (!isReport && !isViewImage && !isDropFile) return;

    const cached = sessionStorage.getItem(`patient_${resolvedAccessionId}`);
    if (cached) {
      const { patientName: name, accessionNumber: acc } = JSON.parse(cached);
      setPatientName(name);
      setAccessionNumber(acc);
      return;
    }

    fetch(`/api/accession?accession_id=${resolvedAccessionId}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (data.status === "ok") {
          setPatientName(data.patientName || "");
          setAccessionNumber(data.accessionNumber || "");
          sessionStorage.setItem(
            `patient_${resolvedAccessionId}`,
            JSON.stringify({
              patientName:     data.patientName,
              accessionNumber: data.accessionNumber,
            })
          );
        }
      })
      .catch((err) => console.error("Header fetch error:", err));
  }, [resolvedAccessionId]);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const volumeId    = localStorage.getItem("lastVolumeId");
      const accessionId = searchParams.get("accessionId");
      if (!volumeId) { alert("No volume to save"); return; }

      let processedPath: string | null = null;

      // If the volume is processed and ready, ask the iframe to save it and wait for the file path
      if (canSaveProcessed) {
        processedPath = await new Promise<string>((resolve) => {
          saveResolverRef.current = resolve;
          const iframe = document.querySelector('iframe') as HTMLIFrameElement;
          iframe?.contentWindow?.postMessage(
            { type: 'REQUEST_SAVE_PROCESSED' },
            window.location.origin
          );
        });
      }

      // Send the processed image path and volume ID to the server to complete the save
      const response = await fetch(`/api/volumes/${volumeId}/save`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessionId, processedPath: processedPath || null }),
      });

      const data = await response.json();

      // Remove temp data and send the user to the right page
      if (data.success) {
        localStorage.removeItem("lastVolumeId");
        sessionStorage.removeItem("userRole");
        sessionStorage.setItem("upload_result", "success");
        window.dispatchEvent(new Event("upload_result_set"));
        router.push(`/radio_tech/uploadFile?patientId=${patientId}`);
      } else {
        sessionStorage.setItem("upload_result", "error");
        window.dispatchEvent(new Event("upload_result_set"));
        router.push(`/radio_tech/uploadFile?patientId=${patientId}`);
      }
    } catch (error) {
      console.error("Save error:", error);
      sessionStorage.setItem("upload_result", "error");
      window.dispatchEvent(new Event("upload_result_set"));
      router.push(`/radio_tech/uploadFile?patientId=${patientId}`);
    } finally {
      setIsSaving(false);
    }
  };

  // When the user clicks Cancel, tell the server to delete the volume and go back to the drop file page
  const handleCancel = async () => {
    try {
      const volumeId = localStorage.getItem("lastVolumeId");
      if (volumeId) {
        await fetch(`/api/volumes/${volumeId}/cancel`, {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
        });
        localStorage.removeItem("lastVolumeId");
      }
      sessionStorage.removeItem("userRole");
      router.push(`/radio_tech/dropfile?patientId=${patientId}&accessionId=${urlAccessionId}`);
    } catch (error) {
      console.error("Cancel error:", error);
      sessionStorage.removeItem("userRole");
      router.push(`/radio_tech/dropfile?patientId=${patientId}&accessionId=${urlAccessionId}`);
    }
  };

  // Decide whether to show the back arrow based on the current page and user state
  const showBackArrow = () => {
    if (!mounted)    return false;
    if (isManualTF)  return true;
    if (isDropFile)  return true;
    if (isViewImage) return !fromUpload;
    if (isReport)    return true;
    return false;
  };

  // Navigate back to the right page depending on the user's role and where they came from
  const handleBack = () => {
    // On manual TF mode, go directly to writingReport with the stored accession id
    if (isManualTF) {
      const id   = resolvedAccessionId;
      const from = typeof window !== "undefined" ? sessionStorage.getItem("viewimg_from") ?? "" : "";
      router.push(`/doctor/writingReport${id ? `?accession_id=${id}&from=${from}` : ""}`);
      return;
    }
    if (isViewImage && isDoctor) {
      const id   = resolvedAccessionId;
      const from = typeof window !== "undefined" ? sessionStorage.getItem("viewimg_from") ?? "" : "";
      router.push(`/doctor/writingReport${id ? `?accession_id=${id}&from=${from}` : ""}`);
      return;
    }
    if (isReport && isDoctor) {
      const from = searchParams.get("from");
      if (from === "patientlist") { router.push(`/doctor/patients?patientId=${searchParams.get("patientId")}`); return; }
      if (from === "homeprofile") { router.push("/doctor"); return; }
    }
    router.back();
  };

  // Save/Cancel show for technician after upload — Reset shows only on viewer page (not on report page)
  const showSaveCancelButtons = mounted && isTech && isViewImage && fromUpload;
  const showResetButton       = isViewImage && !isReport;
  const showName              = !!patientName;

  return (
    <header className="w-full flex justify-between items-center gap-2 md:gap-3">

      <div className="flex-1 flex justify-start">
        {showBackArrow() && (
          <button
            onClick={handleBack}
            className="text-white cursor-pointer rounded-xl md:rounded-2xl border border-white/30
                       p-1.5 sm:p-2 md:p-4 flex items-center justify-center transition-all
                       hover:border-white/60 bg-[#0D1A2D]"
          >
            <ArrowL />
          </button>
        )}
      </div>

      <div className="flex-1 flex justify-center">
        {showName && (
          <div className="text-center">
            <h1 className="text-white font-semibold leading-tight
                           text-sm sm:text-base md:text-xl lg:text-2xl">
              {patientName}
            </h1>
            <p className="text-gray-500 font-normal mt-0.5
                          text-[10px] sm:text-xs md:text-sm">
              {accessionNumber}
            </p>
          </div>
        )}
      </div>

      {/* All buttons always in one row */}
      <div className="flex-1 flex justify-end gap-1.5 sm:gap-2 md:gap-3 items-center">

        {showSaveCancelButtons && (
          <>
            <button
              onClick={handleCancel}
              disabled={isSaving}
              className="text-white rounded-xl md:rounded-2xl border border-white/30 transition-all
                         flex items-center gap-1 sm:gap-2 font-semibold bg-[#0D1A2D]
                         px-2 py-1.5 sm:px-4 sm:py-2 md:px-6 md:py-4
                         text-[10px] sm:text-sm md:text-base
                         hover:border-white/60 disabled:opacity-50
                         cursor-pointer disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="text-white rounded-xl md:rounded-2xl border border-white/30 transition-all
                         flex items-center gap-1 sm:gap-2 font-semibold bg-[#0D1A2D]
                         px-2 py-1.5 sm:px-4 sm:py-2 md:px-6 md:py-4
                         text-[10px] sm:text-sm md:text-base
                         hover:border-white/60 disabled:opacity-50
                         cursor-pointer disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  <span className="text-white/40 font-mono tracking-widest uppercase text-[10px]">Saving</span>
                </div>
              ) : "Save"}
            </button>
          </>
        )}

        {showResetButton && (
          <button
            onClick={resetView}
            className="text-white cursor-pointer rounded-xl md:rounded-2xl border border-white/30
                       transition-all font-semibold bg-[#0D1A2D]
                       px-2 py-1.5 sm:px-4 sm:py-2 md:px-6 md:py-4
                       text-[10px] sm:text-sm md:text-base
                       hover:border-white/60"
          >
            Reset The View
          </button>
        )}

      </div>
    </header>
  );
};

export default Header;