"use client";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { useState } from "react";
import { ArrowL } from "./icons";

const Header = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [isSaving, setIsSaving] = useState(false);

  const isReport = pathname === "/doctor/writingReport";
  const fromUpload = searchParams.get("fromUpload") === "true";

  let userRole = null;

  if (typeof window !== "undefined") {
    userRole = localStorage.getItem("userRole");
  }

  const isTech = userRole === "/radio_tech";
  
  const isDoctor = userRole === "/doctor";

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const tempFileId = localStorage.getItem("tempFileId");

      if (!tempFileId) {
        alert("No file to save");
        return;
      }

      const response = await axios.post("/api/save-file", {
        fileId: tempFileId,
      });

      if (response.data.success) {
        localStorage.removeItem("tempFileId");
        localStorage.setItem("currentScanId", tempFileId);
        alert("File saved successfully");
        router.push("/radio_tech/uploadFile");
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
        await axios.post("/api/delete-temp-file", {
          fileId: tempFileId,
        });
        localStorage.removeItem("tempFileId");
      }

      router.push("/radio_tech/dropfile");
    } catch (error) {
      console.error("Cancel error:", error);
      router.push("/radio_tech/dropfile");
    }
  };

  const handleBackToHome = () => {
    router.push("/radio_tech/uploadfile");
  };

  return (
    <header className="header-container">
      {/* Left Section */}
      <div className="header-left-section">
        {!(isTech && fromUpload) && (
          <button className="header-back-button" onClick={() => router.back()}>
            <ArrowL />
          </button>
        )}
      </div>

      {/* Center Section - Name */}
      <div className="header-center-section">
        <h1 className="header-title">Nasser Saeed</h1>
      </div>

      {/* Right Section */}
      <div className="header-right-section">
        {isTech && fromUpload && (
          <>
            <button
              onClick={handleCancel}
              disabled={isSaving}
              className="header-cancel-button"
            >
              Cancel
            </button>

            <button
              onClick={handleSave}
              disabled={isSaving}
              className="header-save-button"
            >
              {isSaving ? "Saving..." : "Save"}
            </button>
          </>
        )}
{isReport &&(
          <button className="header-reset-button">
          <span className="header-reset-text-full">Capture Image</span>
          <span className="header-reset-text-short">Capture</span>
        </button>
        )}

        <button className="header-reset-button">
          <span className="header-reset-text-full">Reset The View</span>
          <span className="header-reset-text-short">Reset</span>
        </button>

        
        {!isTech && !isReport && (
          <Link href="/doctor/writingReport" className="header-report-link">
            <span>Report</span>
          </Link>
        )}
      </div>
    </header>
  );
};

export default Header;
