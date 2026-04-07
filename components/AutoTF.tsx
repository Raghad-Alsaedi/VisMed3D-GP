"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Bone } from "./icons";

interface Step {
  id: number;
  rangeValue: number;
  rangeStart: number;
  rangeEnd: number;
  color: string;
  opacity: number;
}

interface AutoTFProps {
  onTransferFunctionChange?: (steps: Step[]) => void;
}

const defaultSteps: Step[] = [
  { id: 1, rangeValue: 300, rangeStart: -1000, rangeEnd: -700, color: "#000000", opacity: 0.0 },
  { id: 2, rangeValue: 100, rangeStart: -700, rangeEnd: -600, color: "#999999", opacity: 0.0 },
  { id: 3, rangeValue: 30, rangeStart: -120, rangeEnd: -90, color: "#FFE099", opacity: 0.1932 },
  { id: 4, rangeValue: 20, rangeStart: -10, rangeEnd: 10, color: "#AED9E6", opacity: 0.2330 },
  { id: 5, rangeValue: 37, rangeStart: 13, rangeEnd: 50, color: "#CC2100", opacity: 0.1364 },
  { id: 6, rangeValue: 20, rangeStart: 35, rangeEnd: 55, color: "#C7A887", opacity: 0.2784 },
  { id: 7, rangeValue: 200, rangeStart: 100, rangeEnd: 300, color: "#E8B4B0", opacity: 0.0190 },
  { id: 8, rangeValue: 2300, rangeStart: 700, rangeEnd: 3000, color: "#F5F5F0", opacity: 1.0 },
  { id: 9, rangeValue: 0, rangeStart: 3001, rangeEnd: 0, color: "#FFFFFF", opacity: 1.0 },
];

const presets = [
  {
    key: "bone",
    label: "Bone",
    icon: Bone,
    filter: (step: Step) => step.rangeStart >= 700 && step.rangeEnd <= 3000,
  },
];

const AutoTF = ({ onTransferFunctionChange }: AutoTFProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const volumeId = searchParams.get('volumeId');
  const { data: session } = useSession();
  const role = (session?.user as any)?.role as string | undefined;

  const [isPanelVisible, setIsPanelVisible]       = useState(true);
  const [activePresets, setActivePresets]         = useState<Set<string>>(new Set());
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  useEffect(() => {
    if (onTransferFunctionChange) {
      const finalSteps = defaultSteps.map(step => {
        if (activePresets.size === 0) return { ...step };
        const isVisible = presets.some(
          preset => activePresets.has(preset.key) && preset.filter(step)
        );
        return { ...step, opacity: isVisible ? step.opacity : 0.0 };
      });
      onTransferFunctionChange(finalSteps);
    }
  }, [activePresets, onTransferFunctionChange]);

  if (role === "technician") return null;

  const handleToggle = (key: string) => {
    setActivePresets(prev => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  };

  const confirmReset = () => {
    setActivePresets(new Set());
    setShowConfirmDialog(false);
  };

  const cancelReset = () => {
    setShowConfirmDialog(false);
  };

  return (
    <>
      <button
        onClick={() => setIsPanelVisible(!isPanelVisible)}
        className="absolute top-2 right-1 z-20 rounded border border-white/20 bg-[#0D1A2D] p-1 sm:p-2 text-white hover:border-white/70 hover:opacity-90 transition"
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
            <label
              className="flex cursor-pointer items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-white"
onClick={() => {
  const accessionId = sessionStorage.getItem("viewimg_accession_id");
  router.push(`/manualTF?volumeId=${volumeId}${accessionId ? `&accession_id=${accessionId}` : ""}`);
}}            >
              <input type="radio" name="TFMode" className="peer hidden" />
              <span className="h-3 w-3 sm:h-4 sm:w-4 rounded-full border border-white peer-checked:border-[#1F9C3E] peer-checked:bg-[#1F9C3E]"></span>
              Manual
            </label>
          </div>
        </div>

        <div className="px-1.5 sm:px-2 pb-1.5 sm:pb-2 flex flex-col gap-2 flex-shrink-0">
          {presets.map(preset => {
            const Icon = preset.icon;
            return (
              <div
                key={preset.key}
                className="flex items-center justify-between bg-[#0D1A2D] border border-white/20 rounded-md px-2 sm:px-3 py-1.5 sm:py-2"
              >
                <span className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-white/80">
                  <Icon size={14} strokeWidth={1.5} />
                  {preset.label}
                </span>
                <button
                  onClick={() => handleToggle(preset.key)}
                  className={`relative w-9 h-5 sm:w-11 sm:h-6 rounded-full transition-colors duration-300 focus:outline-none ${
                    activePresets.has(preset.key) ? "bg-[#1F9C3E]" : "bg-gray-600"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-4 h-4 sm:w-5 sm:h-5 bg-white rounded-full shadow transition-transform duration-300 ${
                      activePresets.has(preset.key) ? "translate-x-4 sm:translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            );
          })}
        </div>

        <div className="px-1.5 sm:px-2 pb-1.5 sm:pb-2">
          <button
            onClick={() => setShowConfirmDialog(true)}
            className="w-full flex-1 text-[10px] sm:text-sm rounded border border-white/30 py-1 text-white hover:border-white bg-[#0D1A2D]"
          >
            Reset
          </button>
        </div>
      </div>

      {showConfirmDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-[#0D1A2D] border border-white/30 rounded-lg p-6 max-w-sm w-full mx-4">
            <p className="text-white text-center mb-6">
              Are you sure you want to delete all changes?
            </p>
            <div className="flex gap-3">
              <button
                onClick={confirmReset}
                className="flex-1 rounded border border-white/30 py-2 text-white hover:border-white bg-[#0D1A2D] transition"
              >
                Yes
              </button>
              <button
                onClick={cancelReset}
                className="flex-1 rounded border border-white/30 py-2 text-white hover:border-white bg-red-600 hover:bg-red-700 transition"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AutoTF;