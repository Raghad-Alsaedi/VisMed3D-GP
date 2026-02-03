"use client";
import React from 'react';
import TransferFunction from './TransferFunction';
import { useSearchParams } from 'next/navigation';

const Img = () => {
  const searchParams = useSearchParams();
  const fileId = searchParams.get('fileId');

  const iframeSrc = fileId 
    ? `/volumeRendering/index.html?fileId=${fileId}`
    : '/volumeRendering/index.html';

  return (
    <div className="viewer-container">
      <div className="viewer-iframe-wrapper">
        <iframe 
          src={iframeSrc}
          className="viewer-iframe"
          title="3D Volume Rendering"
        />
      </div>

      <TransferFunction /> 
    </div>
  );
};

export default Img;