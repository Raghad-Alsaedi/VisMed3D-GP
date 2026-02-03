"use client";
import { useRouter } from "next/navigation";
import { useState, useRef } from "react";
import axios from "axios";
import Footer from "./Footer";
import ProgressBar from "../components/ProgressBar";
import { Upload, ArrowL, Error, Success } from "./icons";

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
    
    if (!file.name.toLowerCase().endsWith('.raw')) {
      setErrorMessage('File must be in RAW format only');
      return false;
    }
    
    if (file.size === 0) {
      setErrorMessage('File is empty, please select a valid file');
      return false;
    }
    
    return true;
  };

  const uploadFile = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      formData.append('patientName', 'Nasser Saeed');
      formData.append('accountNumber', 'ACC-321');
      formData.append('temporary', 'true');
      
      setIsUploading(true);
      setUploadProgress(0);
      setErrorMessage(null);
      setSuccessMessage(null);
      
      const response = await axios.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(percentCompleted);
          }
        },
      });

      if (response.data.success) {
        setUploadProgress(100);
        setSuccessMessage('File uploaded successfully');
        
        localStorage.setItem('tempFileId', response.data.fileId);
        
        setTimeout(() => {
          router.push(`/viewimg?fileId=${response.data.fileId}&fromUpload=true`);
        }, 1500);
      }
      
    } catch (error: any) {
      console.error('Upload error:', error);
      setErrorMessage(
        error.response?.data?.error || 'An error occurred while uploading the file'
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
        setSuccessMessage('File validated successfully');
        
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
        setSuccessMessage('File validated successfully');
        
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
    <div className="page-container">
      <header className="header-wrapper">
        <button
          className="btn-back"
          onClick={() => router.push("/radio_tech/uploadFile")}
        >
          <ArrowL />
        </button>

        <div className="header-title-centered">
          <h1 className="header-title">Nasser Saeed</h1>
          <p className="header-subtitle">ACC-321</p>
        </div>

        <div className="spacer"></div>
      </header>

      <div className="content-area">
        {!isUploading ? (
          <div
            className={`card-dark card-dropzone ${
              isDragging
                ? 'border-cyan-400 bg-bg-secondary/80'
                : 'border-[#FFFFFF]/30'
            }`}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onDragLeave={handleDragLeave}
            onClick={handleClick}
          >
            
            <Upload className={`icon-upload ${
                isDragging ? 'scale-110' : ''
              }`} />
            <h1 className="text-dropzone-title">Drop File Here</h1>
            <h3 className="text-dropzone-subtitle">
              Drag & Drop your .raw file here or click to browse
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
          <div className="card-dark card-upload-progress">
            <div className={uploadProgress < 100 ? 'text-upload-primary' : 'text-upload-primary-complete'}>
              {uploadProgress < 100 ? 'Uploading...' : 'Complete'}
            </div>
            
            <h2 className="text-upload-secondary">
              {uploadProgress < 100
                ? 'Uploading scan data'
                : 'Upload successful'}
            </h2>
            
            <p className="text-upload-tertiary">
              {uploadProgress < 100 ? 'Please wait' : 'Redirecting to viewer'}
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