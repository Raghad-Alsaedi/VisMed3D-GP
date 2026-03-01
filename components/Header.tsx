"use client";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { ArrowL } from "./icons";

const Header = () => {
  const router       = useRouter();
  const pathname     = usePathname();
  const searchParams = useSearchParams();

  const { data: session } = useSession();
  const tokenRole = (session?.user as any)?.role as string | undefined;

  const isTech   = tokenRole === "technician";
  const isDoctor = tokenRole === "doctor";

  const [isSaving, setIsSaving]               = useState(false);
  const [mounted, setMounted]                 = useState(false);
  const [patientName, setPatientName]         = useState<string>("");
  const [accessionNumber, setAccessionNumber] = useState<string>("");

  const isReport    = pathname.includes("/writingReport");
  const isViewImage = pathname.includes("/viewimg") || pathname === "/manualTF";
  const isManualTF  = pathname === "/manualTF";
  const isDropFile  = pathname.includes("/dropfile");
  const fromUpload  = searchParams.get("fromUpload") === "true";
  const accessionId = searchParams.get("accession_id");

  useEffect(() => {
    setMounted(true);
  }, []);

  const resolvedAccessionId =
    accessionId ||
    (isViewImage && typeof window !== "undefined"
      ? sessionStorage.getItem("viewimg_accession_id")
      : null);

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
      const tempFileId = localStorage.getItem("tempFileId");
      if (!tempFileId) { alert("No file to save"); return; }
      const response = await fetch("/api/save-file", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ fileId: tempFileId }),
      });
      const data = await response.json();
      if (data.success) {
        localStorage.removeItem("tempFileId");
        localStorage.setItem("currentScanId", tempFileId);
        alert("File saved successfully");
        router.push("/radio_tech/patientsList");
      }
    } catch (error) {
      console.error("Save error:", error);
      alert("Failed to save file");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = async () => {
    try {
      const tempFileId = localStorage.getItem("tempFileId");
      if (tempFileId) {
        await fetch("/api/delete-temp-file", {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({ fileId: tempFileId }),
        });
        localStorage.removeItem("tempFileId");
      }
      router.push(`/radio_tech/dropfile?accession_id=${accessionId}`);
    } catch (error) {
      console.error("Cancel error:", error);
      router.push(`/radio_tech/dropfile?accession_id=${accessionId}`);
    }
  };

  const showBackArrow = () => {
    if (!mounted)   return false;
    if (isManualTF) return false;
    if (isDropFile) return true;
    if (isViewImage) return !fromUpload;
    if (isReport)    return true;
    return false;
  };

  const handleBack = () => {
    if (isDropFile) {
      router.push("/radio_tech/uploadFile");
    } else if (isReport) {
      router.push("/doctor/patients");
    } else if (isViewImage && resolvedAccessionId) {
      if (isDoctor)    router.push(`/doctor/writingReport?accession_id=${resolvedAccessionId}`);
      else if (isTech) router.push("/radio_tech/uploadFile");
      else             router.back();
    } else {
      router.back();
    }
  };

  const showSaveCancelButtons = mounted && isTech && isViewImage && fromUpload;
  const showResetButton       = isViewImage || isReport;
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

      <div className="flex-1 flex justify-end gap-1.5 sm:gap-2 md:gap-3 items-center flex-wrap">

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
              {isSaving ? "Saving..." : "Save"}
            </button>
          </>
        )}

        {showResetButton && (
          <button
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