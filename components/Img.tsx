"use client";
import React, { Suspense, useState, useRef, useEffect } from 'react';
import { useSearchParams } from "next/navigation";

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
      {isLoading && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#0D1A2D] rounded-md pointer-events-none">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 rounded-full border-2 border-white/10" />
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#17387C] border-r-[#17387C] animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-[#17387C] animate-pulse" />
            </div>
          </div>
          <span className="mt-3 text-white/40 text-[10px] font-mono tracking-widest uppercase">
            Loading scan...
          </span>
        </div>
      )}
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