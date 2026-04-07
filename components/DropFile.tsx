"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import Footer from "./Footer";
import ProgressBar from "@/components/ProgressBar";
import { Upload, ArrowL, Error as ErrorIcon, Success } from "./icons";

type DimField = "width" | "height" | "depth";

interface Dims {
  width: string;
  height: string;
  depth: string;
}

interface PrepareResponse {
  success: boolean;
  signedUrl: string;
  volumeId: number;
  error?: string;
}

function parsePositiveInt(value: string | null): number | null {
  if (!value) return null;
  const num = Number(value);
  if (!Number.isFinite(num) || num <= 0) return null;
  return Math.floor(num);
}

const DropFile = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const patientId = useMemo(
    () => parsePositiveInt(searchParams.get("patientId")),
    [searchParams],
  );
  const accessionId = useMemo(
    () => parsePositiveInt(searchParams.get("accessionId")),
    [searchParams],
  );

  const [dims, setDims] = useState<Dims>({ width: "", height: "", depth: "" });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [estimatedTime, setEstimatedTime] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [patientName, setPatientName] = useState<string | null>(null);
  const [accessionNumber, setAccessionNumber] = useState<string | null>(null);

  const uploadStartTime = useRef<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!patientId || !accessionId) {
      setErrorMessage(
        "Missing patientId or accessionId in URL. Open from Patients List upload icon.",
      );
    } else {
      setErrorMessage(null);
    }
  }, [patientId, accessionId]);

  useEffect(() => {
    if (!accessionId) return;
    axios
      .get<{ status: string; patientName: string; accessionNumber: string }>(
        `/api/accession?accession_id=${accessionId}`,
      )
      .then((res) => {
        if (res.data.status === "ok") {
          setPatientName(res.data.patientName);
          setAccessionNumber(res.data.accessionNumber);
        }
      })
      .catch(() => {});
  }, [accessionId]);

  const onDimChange =
    (field: DimField) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setDims((prev) => ({ ...prev, [field]: e.target.value }));

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

    const parsedWidth = parsePositiveInt(dims.width);
    const parsedHeight = parsePositiveInt(dims.height);
    const parsedDepth = parsePositiveInt(dims.depth);

    if (!parsedWidth) {
      setErrorMessage("Invalid width. Please enter a positive number.");
      return false;
    }
    if (!parsedHeight) {
      setErrorMessage("Invalid height. Please enter a positive number.");
      return false;
    }
    if (!parsedDepth) {
      setErrorMessage("Invalid depth. Please enter a positive number.");
      return false;
    }

    const expected16Bit = parsedWidth * parsedHeight * parsedDepth * 2;
    const expected8Bit = parsedWidth * parsedHeight * parsedDepth * 1;

    if (file.size !== expected16Bit && file.size !== expected8Bit) {
      setErrorMessage(
        `Size mismatch: expected ${expected16Bit} (16-bit) or ${expected8Bit} (8-bit) bytes but file is ${file.size}.`,
      );
      return false;
    }

    return true;
  };

  const uploadFile = async (file: File) => {
    if (!patientId || !accessionId) {
      setErrorMessage("Missing patientId/accessionId in URL.");
      return;
    }

    const parsedWidth = parsePositiveInt(dims.width);
    const parsedHeight = parsePositiveInt(dims.height);
    const parsedDepth = parsePositiveInt(dims.depth);

    if (!parsedWidth || !parsedHeight || !parsedDepth) {
      setErrorMessage("Please enter valid dimensions first.");
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(0);
      setEstimatedTime(null);
      setErrorMessage(null);
      setSuccessMessage(null);
      uploadStartTime.current = Date.now();

      const prepareForm = new FormData();
      prepareForm.append("patientId", String(patientId));
      prepareForm.append("accessionId", String(accessionId));
      prepareForm.append("width", String(parsedWidth));
      prepareForm.append("height", String(parsedHeight));
      prepareForm.append("depth", String(parsedDepth));
      prepareForm.append("fileName", file.name);

      const prepareRes = await axios.post<PrepareResponse>(
        "/api/upload/prepare",
        prepareForm,
      );

      if (!prepareRes.data?.success) {
        throw new Error(prepareRes.data?.error || "Failed to prepare upload");
      }

      const { signedUrl, volumeId } = prepareRes.data;

      await axios.put(signedUrl, file, {
        headers: { "Content-Type": "application/octet-stream" },
        onUploadProgress: (evt) => {
          if (evt.total && evt.loaded > 0) {
            const progress = Math.round((evt.loaded * 100) / evt.total);
            const elapsedMs = Date.now() - uploadStartTime.current;
            const bytesPerMs = evt.loaded / elapsedMs;
            const remainingSec = Math.round(
              (evt.total - evt.loaded) / (bytesPerMs * 1000),
            );

            setUploadProgress(progress);
            setEstimatedTime(remainingSec > 0 ? remainingSec : 0);
          }
        },
      });

      await axios.post("/api/upload/confirm", {
        volumeId,
        byteSize: file.size,
      });

      setUploadProgress(100);
      setEstimatedTime(0);
      setSuccessMessage("File uploaded successfully");

      localStorage.setItem("lastVolumeId", String(volumeId));
      sessionStorage.setItem("userRole", "/radio_tech");
      setTimeout(() => {
        router.push(
          `/viewimg?volumeId=${volumeId}&fromUpload=true&patientId=${patientId}&accessionId=${accessionId}`,
        );
      }, 800);
    } catch (err: unknown) {
      const msg =
        (err as any)?.response?.data?.error ||
        (err instanceof Error
          ? err.message
          : "An error occurred while uploading the file");

      setErrorMessage(msg);
      setIsUploading(false);
      setUploadProgress(0);
      setEstimatedTime(null);
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

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };
  const handleClick = () => {
    if (!isUploading) fileInputRef.current?.click();
  };

  return (
    <div className="page-container">
      <header className="header-wrapper">
        <button
          className="btn-back"
          onClick={() =>
            router.push(`/radio_tech/uploadFile?patientId=${patientId}`)
          }
        >
          <ArrowL />
        </button>

        <div className="header-title-centered">
          <h1 className="header-title">Upload RAW</h1>
          <p className="header-subtitle">
            {patientName ?? "..."} | {accessionNumber ?? "..."}
          </p>
        </div>

        <div className="spacer" />
      </header>

      <div className="content-area">
        <div
          className="card-dark"
          style={{ padding: "14px", marginBottom: "12px" }}
        >
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            {(["width", "height", "depth"] as DimField[]).map((field) => (
              <div
                key={field}
                style={{ display: "flex", flexDirection: "column", gap: "6px" }}
              >
                <label
                  style={{
                    fontSize: 12,
                    opacity: 0.85,
                    textTransform: "capitalize",
                  }}
                >
                  {field}
                </label>
                <input
                  value={dims[field]}
                  onChange={onDimChange(field)}
                  inputMode="numeric"
                  placeholder={field === "depth" ? "e.g. 128" : "e.g. 256"}
                  className="patient-list-search-input patient-list-search-border"
                  style={{ width: 140 }}
                />
              </div>
            ))}
          </div>

          <div style={{ marginTop: 8, fontSize: 12, opacity: 0.8 }}>
            RAW has no header, so you must provide dimensions. File size must
            match w×h×d×2 (16-bit) or w×h×d×1 (8-bit).
          </div>
        </div>

        {!isUploading ? (
          <div
            className={`card-dark card-dropzone mb-2 ${
              isDragging
                ? "border-cyan-400 bg-bg-secondary/80"
                : "border-[#FFFFFF]/30"
            }`}
            style={{ maxHeight: "calc(100vh - 320px)", overflow: "hidden" }}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onDragLeave={handleDragLeave}
            onClick={handleClick}
          >
            <Upload
              className={`icon-upload ${isDragging ? "scale-110" : ""}`}
            />
            <h1 className="text-dropzone-title">Drop File Here</h1>
            <h3 className="text-dropzone-subtitle">
              Drag &amp; Drop your file here or click to browse
            </h3>

            <input
              ref={fileInputRef}
              type="file"
              accept=".raw"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        ) : (
          <div
            className="card-dark card-upload-progress"
            style={{
              marginBottom: "8px",
              maxHeight: "calc(100vh - 320px)",
              overflow: "hidden",
            }}
          >
            {" "}
            <h1
              style={{
                fontSize: "2.6rem",
                fontWeight: 700,
                color: "white",
                textAlign: "center",
                marginBottom: "4px",
              }}
            >
              {uploadProgress < 100 ? "Uploading..." : "Complete"}
            </h1>
            <p
              style={{
                color: "rgba(255,255,255,0.6)",
                fontSize: "16px",
                textAlign: "center",
                marginBottom: "28px",
              }}
            >
              {uploadProgress < 100
                ? estimatedTime !== null
                  ? `Estimated time: ${estimatedTime}s`
                  : "Calculating..."
                : "Redirecting to viewer"}
            </p>
            <div style={{ width: "100%", maxWidth: "560px" }}>
              <ProgressBar progress={uploadProgress} />
            </div>
            {selectedFile && (
              <div
                style={{
                  marginTop: "24px",
                  textAlign: "center",
                  color: "rgba(255,255,255,0.5)",
                  fontSize: "13px",
                  lineHeight: "1.8",
                }}
              >
                <p>file name: {selectedFile.name.replace(/\.[^.]+$/, "")}</p>
                <p>size: {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
              </div>
            )}
          </div>
        )}
      </div>

      {errorMessage && (
        <div className="alert-error">
          <div className="alert-icon-wrapper">
            <ErrorIcon className="icon-svg-sm" />
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
