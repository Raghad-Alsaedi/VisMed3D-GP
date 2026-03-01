"use client";
import Link from "next/link";
import { useState, useEffect } from "react";

const AutoTF = () => {
  const [isPanelVisible, setIsPanelVisible] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    setUserRole(localStorage.getItem("userRole"));
  }, []);

  if (userRole === "/radio_tech") {
    return null;
  }

  return (
    <>
      <button
        onClick={() => setIsPanelVisible(!isPanelVisible)}
        className="absolute top-2 right-1 z-20 rounded border border-white/20 bg-[#0D1A2D] p-1 sm:p-2 text-white hover:border-white/70 hover:opacity-90 transition cursor-pointer"
      >
        <svg
          className="w-4 h-4 sm:w-5 sm:h-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path d={isPanelVisible ? "M9 5l7 7-7 7" : "M15 19l-7-7 7-7"} />
        </svg>
      </button>

      <div
        className={`absolute top-2 right-10 sm:right-12 flex w-44 sm:w-56 flex-col gap-2 overflow-hidden rounded-lg border border-white/50 bg-[#040A16] p-1.5 sm:p-2 transition-all duration-300 ${
          !isPanelVisible ? "opacity-0 pointer-events-none translate-x-full" : ""
        }`}
      >
        <div className="p-1.5 sm:p-2 flex-shrink-0">
          <span className="text-xs sm:text-sm font-semibold text-white">
            Transfer Function Mode :
          </span>

          <div className="flex flex-row justify-between mt-1.5 sm:mt-2">
            <label className="flex cursor-pointer items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-white">
              <input type="radio" name="TFMode" className="peer hidden" defaultChecked />
              <span className="h-3 w-3 sm:h-4 sm:w-4 rounded-full border border-white peer-checked:border-[#1F9C3E] peer-checked:bg-[#1F9C3E]"></span>
              Auto
            </label>

            <Link href="/manualTF" className="flex cursor-pointer items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-white">
              <input type="radio" name="TFMode" className="peer hidden" />
              <span className="h-3 w-3 sm:h-4 sm:w-4 rounded-full border border-white peer-checked:border-[#1F9C3E] peer-checked:bg-[#1F9C3E]"></span>
              Manual
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default AutoTF;