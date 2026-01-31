"use client";
import { IoCloudUploadOutline } from "react-icons/io5";
import { useRouter } from "next/navigation";
import { useState, useRef } from "react";
import axios from "axios";
import Footer from "./Footer";
import ProgressBar from "../components/ProgressBar";

const DropFile = () => {
  const router = useRouter();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): boolean => {
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!file.name.toLowerCase().endsWith(".raw")) {
      setErrorMessage("File must be in RAW format only");
      return false;
    }

    if (file.size === 0) {
      setErrorMessage("File is empty, please select a valid file");
      return false;
    }

    return true;
  };

  const uploadFile = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      formData.append("patientName", "Nasser Saeed");
      formData.append("accountNumber", "ACC-321");
      formData.append("temporary", "true");

      setIsUploading(true);
      setUploadProgress(0);
      setErrorMessage(null);
      setSuccessMessage(null);

      const response = await axios.post("/api/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total,
            );
            setUploadProgress(percentCompleted);
          }
        },
      });

      if (response.data.success) {
        setUploadProgress(100);
        setSuccessMessage("File uploaded successfully");

        localStorage.setItem("tempFileId", response.data.fileId);

        setTimeout(() => {
          router.push(
            `/viewimg?fileId=${response.data.fileId}&fromUpload=true`,
          );
        }, 1500);
      }
    } catch (error: any) {
      console.error("Upload error:", error);
      setErrorMessage(
        error.response?.data?.error ||
          "An error occurred while uploading the file",
      );
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);

      if (validateFile(file)) {
        setSuccessMessage("File validated successfully");

        setTimeout(() => {
          uploadFile(file);
        }, 800);
      }
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);

    const file = event.dataTransfer.files[0];
    if (file) {
      setSelectedFile(file);

      if (validateFile(file)) {
        setSuccessMessage("File validated successfully");

        setTimeout(() => {
          uploadFile(file);
        }, 800);
      }
    }
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleClick = () => {
    if (!isUploading) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className="h-screen bg-[#040A16] flex flex-col p-4">
      <header className="w-full flex justify-between items-center py-2 flex-shrink-0">
        <button
          className="text-white cursor-pointer rounded-2xl border border-white/30 p-3 sm:p-4 bg-[#0D1A2D] flex items-center justify-center transition-all hover:scale-110"
          onClick={() => router.back()}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
          >
            <path
              fill="currentColor"
              d="m7.825 13l4.9 4.9q.3.3.288.7t-.313.7q-.3.275-.7.288t-.7-.288l-6.6-6.6q-.15-.15-.213-.325T4.426 12t.063-.375t.212-.325l6.6-6.6q.275-.275.688-.275t.712.275q.3.3.3.713t-.3.712L7.825 11H19q.425 0 .713.288T20 12t-.288.713T19 13z"
            />
          </svg>
        </button>

        <div className="absolute left-1/2 transform -translate-x-1/2 text-center">
          <h1 className="text-white font-semibold text-2xl">Nasser Saeed</h1>
          <p className="text-white/60 text-sm">ACC-321</p>
        </div>

        <div className="w-12"></div>
      </header>

      <div className="mt-4 flex-1 min-h-0">
        {!isUploading ? (
          <div
            className={`h-full bg-[#0D1A2D] rounded-3xl border-2 ${
              isDragging
                ? "border-cyan-400 bg-[#0D1A2D]/80"
                : "border-[#FFFFFF]/30"
            } flex flex-col justify-center items-center text-white text-center cursor-pointer transition-all duration-200`}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onDragLeave={handleDragLeave}
            onClick={handleClick}
          >
            <svg
              className={`w-32 h-32 mb-6 stroke-white transition-transform duration-200 ${
                isDragging ? "scale-110" : ""
              }`}
              fill="none"
              strokeWidth="2"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <h1 className="text-3xl font-semibold mb-2">Drop File Here</h1>
            <h3 className="text-gray-400">
              Drag & Drop your .raw file here or click to browse
            </h3>

            {/* Hidden input */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".raw"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        ) : (
          <div className="h-full bg-[#0D1A2D] rounded-3xl border border-[#FFFFFF]/30 flex flex-col justify-center items-center p-20 text-white text-center">
            <div
              className={`text-6xl font-bold mb-8  ${
                uploadProgress < 100 ? "text-gray-400" : "text-white"
              }`}
            >
              {uploadProgress < 100 ? "Uploading..." : "Complete"}
            </div>

            <h2 className="text-2xl font-semibold mb-2 text-gray-400">
              {uploadProgress < 100
                ? "Uploading scan data"
                : "Upload successful"}
            </h2>

            <p className="text-gray-500 mb-8">
              {uploadProgress < 100 ? "Please wait" : "Redirecting to viewer"}
            </p>

            <div className="w-full max-w-md">
              <ProgressBar progress={uploadProgress} />
            </div>

            {selectedFile && (
              <div className="mt-6 text-sm text-gray-500">
                <p>File: {selectedFile.name}</p>
                <p>Size: {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
              </div>
            )}
          </div>
        )}
      </div>

      {errorMessage && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-red-500 text-gray-100 px-8 py-4 rounded-lg shadow-2xl z-50 border-2 border-red-300 min-w-[300px] text-center">
          <div className="flex items-center justify-center gap-2">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="font-semibold">{errorMessage}</span>
          </div>
        </div>
      )}

      {successMessage && !isUploading && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-green-500 text-gray-100 px-8 py-4 rounded-lg shadow-2xl z-50 border-2 border-green-300 min-w-[300px] text-center">
          <div className="flex items-center justify-center gap-2">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="font-semibold">{successMessage}</span>
          </div>
        </div>
      )}

      <div className="flex-shrink-0">
        <Footer />
      </div>
    </div>
  );
};

export default DropFile;
