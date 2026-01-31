"use client";
import React from "react";
import TransferFunction from "./TransferFunction";
import { useSearchParams } from "next/navigation";

const Img = () => {
  const searchParams = useSearchParams();
  const fileId = searchParams.get("fileId");

  const iframeSrc = fileId
    ? `/volumeRendering/index.html?fileId=${fileId}`
    : "/volumeRendering/index.html";

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      <div className="flex-1 min-h-0 flex items-center justify-center bg-gray-900">
        <iframe
          src={iframeSrc}
          className="w-full h-full border-none"
          style={{
            maxWidth: "100%",
            maxHeight: "100%",
            objectFit: "contain",
          }}
          title="3D Volume Rendering"
        />
      </div>

      <TransferFunction />
    </div>
  );
};

export default Img;
