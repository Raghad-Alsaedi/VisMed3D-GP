"use client";
// ممكن احذفها
import React from "react";
import Footer from "./Footer";
import { usePathname, useRouter } from "next/navigation";

const UploadPage = () => {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#040A16] flex flex-col items-center justify-start p-4">
      <header className="w-full flex justify-between items-center py-2 px-4 bg-[#040A16] rounded-md">
        <button
          className="text-white cursor-pointer hover:opacity-80 rounded-2xl border border-white/30 p-3 hover:bg-gray-800 bg-[#0D1A2D] flex items-center justify-center"
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
        <h1 className="text-white font-semibold text-center flex-1">
          Nasser Saeed
        </h1>
        <div className="flex gap-2">
          <button className="w-9 h-9 flex items-center justify-center bg-[#0D1A2D] text-white rounded-md border border-white/20 hover:border-red-400 hover:opacity-90">
            🗑️
          </button>
          <button className="bg-[#0D1A2D] text-white px-3 py-1 rounded cursor-pointer border border-white/20 hover:border-white/70 hover:opacity-90">
            Reset The View
          </button>
        </div>
      </header>

      <div className="mt-4 w-full max-w-3xl h-[500px] bg-[#0D1A2D] border border-white/20 rounded-lg flex items-center justify-center">
        <span className="text-white/50">3D Model </span>
      </div>

      <Footer />
    </div>
  );
};

export default UploadPage;
