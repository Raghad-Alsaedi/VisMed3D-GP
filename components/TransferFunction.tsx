"use client";

import { usePathname } from "next/navigation";


const TransferFunction = () => {
  let userRole = null;
const pathname= usePathname();
  if (typeof window !== "undefined") {
    userRole = localStorage.getItem("userRole");
  }

  if (userRole === "/radio_tech" || pathname === "/doctor/writingReport") {
    return null;
  }

  return (
    <div className="absolute top-4 right-4 bg-[#040A16] border border-white/50 rounded p-3 flex flex-col gap-2">
      <span className="text-white font-semibold text-sm">
        Transfer Function Mode:
      </span>
      <label className="flex items-center gap-2 text-white cursor-pointer">
        <input
          type="radio"
          name="TFMode"
          className="accent-green-500"
          defaultChecked
        />
        Auto
      </label>
      <label className="flex items-center gap-2 text-white cursor-pointer">
        <input type="radio" name="TFMode" className="accent-white" />
        Manual
      </label>
    </div>
  );
};

export default TransferFunction;
