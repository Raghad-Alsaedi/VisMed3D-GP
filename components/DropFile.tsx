"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import Footer from "./Footer";
import ProgressBar from "../components/ProgressBar";
import { Upload, ArrowL, Error, Success } from "./icons";

type DimField = "width" | "height" | "depth";

function parsePositiveInt(v: string | null) {
  if (!v) return null;
  const n = Number(v);
  if (!Number.isFinite(n) || n <= 0) return null;
  return Math.floor(n);
}

const BYTES_PER_VOXEL = 2; // 16-bit RAW

const DropFile = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const patientId = useMemo(() => parsePositiveInt(searchParams.get("patientId")), [searchParams]);
  const accessionId = useMemo(() => parsePositiveInt(searchParams.get("accessionId")), [searchParams]);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const [dims, setDims] = useState<{ width: string; height: string; depth: string }>({
    width: "",
    height: "",
    depth: "",
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!patientId || !accessionId) {
      setErrorMessage("Missing patientId or accessionId in URL. Open from Patients List upload icon.");
    } else {
      setErrorMessage(null);
    }
  }, [patientId, accessionId]);

  const validateFile = (file: File): boolean => {
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!patientId || !accessionId) {
      setErrorMessage("Missing patientId/accessionId in URL.");
      return false;
    }

    if (!file.name.toLowerCase().endsWith(".raw")) {
      setErrorMessage("File must be in RAW format only (.raw)");
      return false;
    }

    if (file.size === 0) {
      setErrorMessage("File is empty, please select a valid file");
      return false;
    }

    const w = parsePositiveInt(dims.width);
    const h = parsePositiveInt(dims.height);
    const d = parsePositiveInt(dims.depth);
    if (!w) return setErr("width");
    if (!h) return setErr("height");
    if (!d) return setErr("depth");

    const expected = w * h * d * BYTES_PER_VOXEL;
    if (expected !== file.size) {
      setErrorMessage(
       ` Size mismatch: expected ${expected} bytes (w*h*d*${BYTES_PER_VOXEL}) but file is ${file.size} bytes.`
      );
      return false;
    }

    return true;

    function setErr(field: DimField) {
      setErrorMessage(`Invalid ${field}. Please enter a positive number.`);
      return false;
    }
  };

  const uploadFile = async (file: File) => {
    if (!patientId || !accessionId) {
      setErrorMessage("Missing patientId/accessionId in URL.");
      return;
    }

    const w = parsePositiveInt(dims.width);
    const h = parsePositiveInt(dims.height);
    const d = parsePositiveInt(dims.depth);
    if (!w || !h || !d) {
      setErrorMessage("Please enter valid dimensions first.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", file);

      formData.append("patientId", String(patientId));
      formData.append("accessionId", String(accessionId));

      formData.append("width", String(w));
      formData.append("height", String(h));
      formData.append("depth", String(d));

      formData.append("datasetName", file.name);
      formData.append("modality", "CT");

      setIsUploading(true);
      setUploadProgress(0);
      setErrorMessage(null);
      setSuccessMessage(null);


      const response = await axios.post("/api/upload", formData, {
        onUploadProgress: (evt) => {
          if (evt.total) {
            setUploadProgress(Math.round((evt.loaded * 100) / evt.total));
          }
        },
      });

      if (response.data?.success) {
        setUploadProgress(100);
        setSuccessMessage("File uploaded successfully");

        const volumeId = response.data.volumeId;
        localStorage.setItem("lastVolumeId", String(volumeId));
        localStorage.setItem("userRole", "/radio_tech");

        setTimeout(() => {
          router.push(`/viewimg?volumeId=${volumeId}&fromUpload=true`);
        }, 800);
      } else {
        setIsUploading(false);
        setUploadProgress(0);
        setErrorMessage(response.data?.error || "Upload failed");
      }
    } catch (err: any) {
      console.error("Upload error:", err);

      const msg =
        err?.response?.data?.error ||
        err?.message ||
        "An error occurred while uploading the file";

      setErrorMessage(msg);
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);

    if (validateFile(file)) {
      setSuccessMessage("File validated successfully");
      setTimeout(() => uploadFile(file), 200);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);

    const file = event.dataTransfer.files?.[0];
    if (!file) return;

    setSelectedFile(file);

    if (validateFile(file)) {
      setSuccessMessage("File validated successfully");
      setTimeout(() => uploadFile(file), 200);
    }
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleClick = () => {
    if (!isUploading) fileInputRef.current?.click();
  };

  const onDimChange = (k: DimField) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setDims((prev) => ({ ...prev, [k]: e.target.value }));
  };

  return (
    <div className="page-container">
      <header className="header-wrapper">
        <button className="btn-back" onClick={() => router.push("/radio_tech/uploadFile")}>
          <ArrowL />
        </button>

        <div className="header-title-centered">
          <h1 className="header-title">Upload RAW</h1>
          <p className="header-subtitle">
            Patient: {patientId ?? "?"} | Accession: {accessionId ?? "?"}
          </p>
        </div>

        <div className="spacer" />
      </header>

      <div className="content-area">
        <div className="card-dark" style={{ padding: "14px", marginBottom: "12px" }}>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: 12, opacity: 0.85 }}>Width</label>
              <input
                value={dims.width}
                onChange={onDimChange("width")}
                inputMode="numeric"
                placeholder="e.g. 256"
                className="patient-list-search-input patient-list-search-border"
                style={{ width: 140 }}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: 12, opacity: 0.85 }}>Height</label>
              <input
                value={dims.height}
                onChange={onDimChange("height")}
                inputMode="numeric"
                placeholder="e.g. 256"
                className="patient-list-search-input patient-list-search-border"
                style={{ width: 140 }}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: 12, opacity: 0.85 }}>Depth</label>
              <input
                value={dims.depth}
                onChange={onDimChange("depth")}
                inputMode="numeric"
                placeholder="e.g. 128"
                className="patient-list-search-input patient-list-search-border"
                style={{ width: 140 }}
              />
            </div>
          </div>

          <div style={{ marginTop: 8, fontSize: 12, opacity: 0.8 }}>
            RAW has no header, so you must provide dimensions. File size must match w*h*d*2 (16-bit).
          </div>
        </div>

        {!isUploading ? (
          <div
            className={`card-dark card-dropzone ${
              isDragging ? "border-cyan-400 bg-bg-secondary/80" : "border-[#FFFFFF]/30"
            }`}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onDragLeave={handleDragLeave}
            onClick={handleClick}
          >
            <Upload className={`icon-upload ${isDragging ? "scale-110" : ""}`} />
            <h1 className="text-dropzone-title">Drop File Here</h1>
            <h3 className="text-dropzone-subtitle">Drag & Drop your .raw file here or click to browse</h3>

            <input
              ref={fileInputRef}
              type="file"
              accept=".raw"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        ) : (
          <div className="card-dark card-upload-progress">
            <div className={uploadProgress < 100 ? "text-upload-primary" : "text-upload-primary-complete"}>
              {uploadProgress < 100 ? "Uploading..." : "Complete"}
            </div>

            <h2 className="text-upload-secondary">
              {uploadProgress < 100 ? "Uploading scan data" : "Upload successful"}
            </h2>

            <p className="text-upload-tertiary">
              {uploadProgress < 100 ? "Please wait" : "Redirecting to viewer"}
            </p>

            <div className="w-full max-w-md">
              <ProgressBar progress={uploadProgress} />
            </div>

            {selectedFile && (
              <div className="text-file-info">
                <p>File: {selectedFile.name}</p>
                <p>Size: {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
              </div>
            )}
          </div>
        )}
      </div>

      {errorMessage && (
        <div className="alert-error">
          <div className="alert-icon-wrapper">
            <Error className="icon-svg-sm" />
            <span className="font-semibold">{errorMessage}</span>
          </div>
        </div>
      )}

      {successMessage && !isUploading && (
        <div className="alert-success">
          <div className="alert-icon-wrapper">
            <Success className="icon-svg-sm" />
            <span className="font-semibold">{successMessage}</span>
          </div>
        </div>
      )}

      <div className="footer-wrapper">
        <Footer />
      </div>
    </div>
  );
};

export default DropFile;