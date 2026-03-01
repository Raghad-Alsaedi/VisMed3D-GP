"use client";
import React, { useRef, useEffect } from 'react'; 
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
}

const Img = ({ onTransferFunctionChange }: ImgProps) => {
  const searchParams = useSearchParams();
  const fileId = searchParams.get('fileId');
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const isWebGLReady = useRef(false);

  const iframeSrc = fileId 
    ? `/volumeRendering/index.html?fileId=${fileId}`
    : '/volumeRendering/index.html';

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      
      if (event.data.type === 'WEBGL_READY') {
        isWebGLReady.current = true;
        console.log('WebGL is ready to receive data');
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
            {
              type: 'UPDATE_TRANSFER_FUNCTION',
              steps: steps
            },
            window.location.origin
          );
          console.log('Sent steps to WebGL:', steps);
        } else {
          console.warn('WebGL not ready yet');
        }
      };
    }
  }, [onTransferFunctionChange]);

  return (
    <div className="viewer-container">
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

export default Img