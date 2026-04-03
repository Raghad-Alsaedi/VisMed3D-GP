"use client";
import React, { Suspense, useState, useRef, useEffect } from 'react';
import { useSearchParams } from "next/navigation";
import LoadingSpinner from "./LoadingSpinner";

interface Step {
  id: number;
  rangeValue: number;
  rangeStart: number;
  rangeEnd: number;
  color: string;
  opacity: number;
  isOpen: boolean;
}

interface ImgProps {
  onTransferFunctionChange?: (steps: Step[]) => void;
  volumeId?: number | null;
}

const Img = ({ onTransferFunctionChange, volumeId: propVolumeId }: ImgProps) => {
  const searchParams = useSearchParams();
  const urlVolumeId  = searchParams.get('volumeId');

  const resolvedVolumeId = propVolumeId ?? urlVolumeId;

  const iframeRef    = useRef<HTMLIFrameElement>(null);
  const isWebGLReady = useRef(false);
  const [isLoading, setIsLoading] = useState(true);

  const iframeSrc = resolvedVolumeId
    ? `/volumeRendering/index.html?volumeId=${resolvedVolumeId}`
    : '/volumeRendering/index.html';

  useEffect(() => {
    setIsLoading(true);
  }, [iframeSrc]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.data.type === 'WEBGL_READY') {
        isWebGLReady.current = true;
        setIsLoading(false);
        const saved = sessionStorage.getItem("manualTF_steps");
        if (saved) {
          try {
            const steps = JSON.parse(saved);
            iframeRef.current?.contentWindow?.postMessage(
              { type: 'UPDATE_TRANSFER_FUNCTION', steps },
              window.location.origin
            );
          } catch {}
        }
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  useEffect(() => {
    if (onTransferFunctionChange) {
      (window as any).sendStepsToWebGL = (steps: Step[]) => {
        if (iframeRef.current && isWebGLReady.current) {
          iframeRef.current.contentWindow?.postMessage(
            { type: 'UPDATE_TRANSFER_FUNCTION', steps },
            window.location.origin
          );
        } else {
          console.warn('WebGL not ready yet');
        }
      };
    }
  }, [onTransferFunctionChange]);

  return (
    <div className="viewer-container" style={{ position: 'relative', width: '100%', height: '100%' }}>
      {isLoading && <LoadingSpinner />}
      <div className="viewer-iframe-wrapper">
        <iframe
          ref={iframeRef}
          src={iframeSrc}
          className="viewer-iframe"
          title="3D Volume Rendering"
        />
      </div>
    </div>
  );
};

export default Img;