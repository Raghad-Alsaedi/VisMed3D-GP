"use client";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { useState } from "react";

const Header = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const [isSaving, setIsSaving] = useState(false);

  const isReport = pathname === "/doctor/writingReport";
  const fromUpload = searchParams.get('fromUpload') === 'true';

  let userRole = null;

  if (typeof window !== "undefined") {
    userRole = localStorage.getItem("userRole");
  }

  const isTech = userRole === "/radio_tech";
  const isDoctor = userRole === "/doctor";

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const tempFileId = localStorage.getItem('tempFileId');
      
      if (!tempFileId) {
        alert('No file to save');
        return;
      }

      const response = await axios.post('/api/save-file', {
        fileId: tempFileId
      });

      if (response.data.success) {
        localStorage.removeItem('tempFileId');
        localStorage.setItem('currentScanId', tempFileId);
        alert('File saved successfully');
        router.push('/radio_tech/uploadFile');
      }
    } catch (error) {
      console.error('Save error:', error);
      alert('Failed to save file');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = async () => {
    try {
      const tempFileId = localStorage.getItem('tempFileId');
      
      if (tempFileId) {
        await axios.post('/api/delete-temp-file', {
          fileId: tempFileId
        });
        localStorage.removeItem('tempFileId');
      }
      
      router.push('/radio_tech/dropfile');
    } catch (error) {
      console.error('Cancel error:', error);
      router.push('/radio_tech/dropfile');
    }
  };

  const handleBackToHome = () => {
    router.push('/radio_tech/uploadfile');
  };

  return (
    <header className="w-full flex flex-wrap justify-between items-center gap-2 md:gap-3">
      {!(isTech && fromUpload) && (
        <button
          className="text-white cursor-pointer rounded-xl md:rounded-2xl border border-white/30 p-2 sm:p-3 md:p-4 bg-[#0D1A2D] flex items-center justify-center transition-all hover:scale-110"
          onClick={() => router.back()}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            className="sm:w-6 sm:h-6"
          >
            <path
              fill="currentColor"
              d="m7.825 13l4.9 4.9q.3.3.288.7t-.313.7q-.3.275-.7.288t-.7-.288l-6.6-6.6q-.15-.15-.213-.325T4.426 12t.063-.375t.212-.325l6.6-6.6q.275-.275.688-.275t.712.275q.3.3.3.713t-.3.712L7.825 11H19q.425 0 .713.288T20 12t-.288.713T19 13z"
            />
          </svg>
        </button>
      )}

      {isTech && fromUpload && (
        <Link
          href={"/radio_tech/uploadFile"}
          className="bg-[#0D1A2D] text-white px-3 py-2 sm:px-4 sm:py-3 md:px-6 md:py-4 rounded-xl md:rounded-2xl border border-white/30 transition-all flex items-center gap-2 text-xs sm:text-sm md:text-base font-semibold hover:font-bold hover:scale-105 disabled:opacity-50"
        >
          <span className="hidden sm:inline">Back to Files</span>
          <span className="sm:hidden">Back</span>
        </Link>
      )}

      <h1 className="text-white font-semibold text-base sm:text-lg md:text-xl lg:text-2xl">
        Nasser Saeed
      </h1>

      <div className="flex gap-1.5 sm:gap-2 md:gap-3 items-center flex-wrap">
        {isTech && fromUpload && (
          <>
            <button 
              onClick={handleCancel}
              disabled={isSaving}
              className="bg-[#0D1A2D] text-white px-3 py-2 sm:px-4 sm:py-3 md:px-6 md:py-4 rounded-xl md:rounded-2xl border border-white/30 transition-all flex items-center gap-2 text-xs sm:text-sm md:text-base font-semibold hover:font-bold hover:scale-105 disabled:opacity-50"
            >
              Cancel
            </button>

            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="bg-[#0D1A2D] text-white px-3 py-2 sm:px-4 sm:py-3 md:px-6 md:py-4 rounded-xl md:rounded-2xl border border-white/30 transition-all flex items-center gap-2 text-xs sm:text-sm md:text-base font-semibold hover:font-bold hover:scale-105 disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          </>
        )}

        <button className="bg-[#0D1A2D] text-white px-3 py-2 sm:px-4 sm:py-3 md:px-6 md:py-4 rounded-xl md:rounded-2xl cursor-pointer border border-white/30 transition-all text-xs sm:text-sm md:text-base font-semibold hover:font-bold hover:scale-105">
          <span className="hidden sm:inline">Reset The View</span>
          <span className="sm:hidden">Reset</span>
        </button>

        {!isTech && !isReport && (
          <Link
            href="/doctor/writingReport"
            className="bg-[#0D1A2D] text-white px-3 py-2 sm:px-4 sm:py-3 md:px-6 md:py-4 rounded-xl md:rounded-2xl border border-white/30 transition-all flex items-center gap-2 text-xs sm:text-sm md:text-base font-semibold hover:font-bold hover:scale-105"
          >
            <span>Report</span>
          </Link>
        )}
      </div>
    </header>
  );
};

export default Header;