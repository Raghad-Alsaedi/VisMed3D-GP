"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

interface Step {
  id: number;
  rangeValue: number;
  rangeStart: number;
  rangeEnd: number;
  color: string;
  opacity: number;
  isOpen: boolean; 
}

interface ManualTFProps {
  onTransferFunctionChange?: (steps: Step[]) => void;
  onPanelToggle?: (isOpen: boolean) => void;
}

const defaultSteps: Step[] = [
  { id: 1, rangeValue: 200, rangeStart: -1000, rangeEnd: -800, color: "#000000", opacity: 0, isOpen: true },
  { id: 2, rangeValue: 70, rangeStart: -150, rangeEnd: -80, color: "#FFE099", opacity: 0.15, isOpen: false },
  { id: 3, rangeValue: 20, rangeStart: 0, rangeEnd: 20, color: "#AED9E6", opacity: 0.20, isOpen: false },
  { id: 4, rangeValue: 15, rangeStart: 20, rangeEnd: 35, color: "#E8D7B0", opacity: 0.50, isOpen: false },
  { id: 5, rangeValue: 15, rangeStart: 35, rangeEnd: 50, color: "#C7A887", opacity: 0.55, isOpen: false },
  { id: 6, rangeValue: 30, rangeStart: 50, rangeEnd: 80, color: "#CC2100", opacity: 0.60, isOpen: false },
  { id: 7, rangeValue: 700, rangeStart: 300, rangeEnd: 1000, color: "#F5F5F0", opacity: 1.0, isOpen: false }
];




const ManualTF = ({ onTransferFunctionChange, onPanelToggle }: ManualTFProps) => {
  const [isPanelVisible, setIsPanelVisible] = useState(true);
  const [steps, setSteps] = useState<Step[]>(defaultSteps);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const TOTAL_RANGE = 2000; // -1000 to 1000 Hounsfield

  let userRole = null;

  if (typeof window !== "undefined") {
    userRole = localStorage.getItem("userRole");
  }

  if (userRole === "/radio_tech") {
    return null;
  }

  // إرسال التحديثات للـ Parent Component
  useEffect(() => {
    const updatedSteps = updateStepRanges();
    if (onTransferFunctionChange) {
      onTransferFunctionChange(updatedSteps);
    }
  }, [steps]);

  const updateStepRanges = () => {
    let currentStart = -1000; // نبدأ من -1000 HU
    return steps.map((step) => {
      const stepEnd = currentStart + step.rangeValue;
      const result = { ...step, rangeStart: currentStart, rangeEnd: stepEnd };
      currentStart = stepEnd;
      return result;
    });
  };

  const addStep = () => {
    const updatedSteps = updateStepRanges();
    const rangeStart = updatedSteps.length > 0 
      ? updatedSteps[updatedSteps.length - 1].rangeEnd 
      : -1000;
    
    const remainingRange = 1000 - rangeStart;
    
    if (remainingRange <= 0) {
      alert("The range is already full!");
      return;
    }

    const randomColor = '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
    
    const newStep = {
      id: Date.now(),
      rangeValue: Math.min(200, remainingRange),
      rangeStart: rangeStart,
      rangeEnd: Math.min(rangeStart + 200, 1000),
      color: randomColor,
      opacity: 0.5,
      isOpen: true
    };

    setSteps([...steps, newStep]);
  };

  const deleteStep = (id: number) => {
    setSteps(steps.filter(step => step.id !== id));
  };

  const updateStepRange = (id: number, newValue: string) => {
    setSteps(steps.map(step => 
      step.id === id ? { ...step, rangeValue: parseInt(newValue) } : step
    ));
  };

  const updateStepColor = (id: number, newColor: string) => {
    setSteps(steps.map(step => 
      step.id === id ? { ...step, color: newColor } : step
    ));
  };

  const updateStepOpacity = (id: number, newOpacity: string) => {
    setSteps(steps.map(step => 
      step.id === id ? { ...step, opacity: parseFloat(newOpacity) } : step
    ));
  };

  const toggleStep = (id: number) => {
    setSteps(steps.map(step => 
      step.id === id ? { ...step, isOpen: !step.isOpen } : step
    ));
  };

  const handleReset = () => {
    setShowConfirmDialog(true);
  };

  const confirmReset = () => {
    setSteps(defaultSteps);
    setShowConfirmDialog(false);
  };

  const cancelReset = () => {
    setShowConfirmDialog(false);
  };

  const updatedSteps = updateStepRanges();

  return (
    <>
      <button
        onClick={() => {
          const next = !isPanelVisible;
          setIsPanelVisible(next);
          onPanelToggle?.(next);
        }}
        className="absolute top-4 right-1 z-20 rounded border border-white/20 bg-[#0D1A2D] p-1 sm:p-1.5 lg:p-2 text-white hover:border-white/70 hover:opacity-90 transition cursor-pointer"
      >
        <svg
          className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path d={isPanelVisible ? "M9 5l7 7-7 7" : "M15 19l-7-7 7-7"} />
        </svg>
      </button>

      <div
        className={`absolute top-4 right-8 sm:right-10 lg:right-12 bottom-4 flex w-36 sm:w-44 lg:w-56 flex-col gap-2 overflow-hidden rounded-lg border border-white/50 bg-[#040A16] p-1.5 sm:p-2 transition-all duration-300 ${
          !isPanelVisible ? "opacity-0 pointer-events-none translate-x-full" : ""
        }`}>
 
        <div className="p-1 sm:p-1.5 lg:p-2 flex-shrink-0">
        <span className="text-[10px] sm:text-xs lg:text-sm font-semibold text-white">
          Transfer Function Mode :
        </span>

        <div className="flex flex-row justify-between mt-1.5 sm:mt-2">
          <Link href={"/viewimg"} className="flex cursor-pointer items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs lg:text-sm text-white">
            <input
              type="radio"
              name="TFMode"
              className="peer hidden"
            />
            <span className="h-3 w-3 sm:h-3.5 sm:w-3.5 lg:h-4 lg:w-4 rounded-full border border-white peer-checked:border-[#1F9C3E] peer-checked:bg-[#1F9C3E]"></span>
            Auto
          </Link>

          <label className="flex cursor-pointer items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs lg:text-sm text-white">
            <input type="radio" name="TFMode" className="peer hidden" defaultChecked />
            <span className="h-3 w-3 sm:h-3.5 sm:w-3.5 lg:h-4 lg:w-4 rounded-full border border-white peer-checked:border-[#1F9C3E] peer-checked:bg-[#1F9C3E]"></span>
            Manual
          </label>
        </div>
</div>

        <div className="flex-1 min-h-0 overflow-y-auto px-2 flex flex-col gap-2">
          <div className="h-full overflow-y-auto">
          {updatedSteps.map((step, index) => (
            <div
              key={step.id}
              className="step border border-white/20 rounded-md overflow-hidden mb-1"
            >
              <input
                type="checkbox"
                id={`step${step.id}`}
                className="peer hidden"
                checked={step.isOpen}
                onChange={() => toggleStep(step.id)}
              />
              <label
                htmlFor={`step${step.id}`}
                className="flex justify-between items-center px-2 sm:px-3 py-1.5 sm:py-2 cursor-pointer text-white text-[10px] sm:text-xs lg:text-sm bg-[#0D1A2D] border border-white/20 rounded-md"
              >
                <span className="flex items-center gap-1.5 sm:gap-2">
                  Step {index + 1}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      deleteStep(step.id);
                    }}
                    className="rounded border border-white/20 px-1 sm:px-1.5 py-0.5 text-[10px] sm:text-xs hover:border-white hover:opacity-80 transition cursor-pointer"
                  >
                    <span className="text-red-500 font-bold">&times;</span>
                  </button>
                </span>
                <svg
                  className={`w-4 h-4 transition-transform duration-300 ${
                    step.isOpen ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path d="M19 9l-7 7-7-7" />
                </svg>
              </label>

              <div
                className={`transition-all duration-300 px-2 sm:px-3 pb-2 sm:pb-3 space-y-1.5 sm:space-y-2 bg-[#0D1A2D] ${
                  step.isOpen ? "max-h-96" : "max-h-0 overflow-hidden"
                }`}
              >
                <div className="space-y-1">
                  <span className="text-[10px] sm:text-xs text-white/80">
                    Range: {step.rangeStart} HU - {step.rangeEnd} HU
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] sm:text-xs text-white/80">Range Size: {step.rangeValue} HU</span>
                  <input
                    type="range"
                    min="0"
                    max={step.rangeValue + (1000 - step.rangeEnd)}
                    value={step.rangeValue}
                    onChange={(e) => updateStepRange(step.id, e.target.value)}
                    className="w-full"
                  />
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-[10px] sm:text-xs text-white/80">Color</span>
                  <input
                    type="color"
                    value={step.color}
                    onChange={(e) => updateStepColor(step.id, e.target.value)}
                    className="w-6 h-5 sm:w-8 sm:h-6 rounded border border-white/30 cursor-pointer"
                  />
                </div>

                <div>
                  <span className="text-[10px] sm:text-xs text-white/80">Opacity: {step.opacity.toFixed(4)}</span>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.0001"
                    value={step.opacity}
                    onChange={(e) => updateStepOpacity(step.id, e.target.value)}
                    className="w-full mt-1"
                  />
                </div>
              </div>
            </div>
          ))}
          </div>
          
<div className="p-1 sm:p-1.5 lg:p-2 flex flex-col gap-1.5 sm:gap-2 flex-shrink-0">
          <button
            onClick={addStep}
            className="w-full flex items-center justify-center gap-1.5 sm:gap-2 rounded border border-white/30 py-1.5 sm:py-2 text-[10px] sm:text-xs lg:text-sm text-white hover:border-white/60 transition bg-[#0D1A2D] cursor-pointer"
          >
            <svg
              className="w-3 h-3 sm:w-4 sm:h-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
            Add Step...
          </button>
      
          <button
            onClick={handleReset}
            className="w-full flex-1 text-[10px] sm:text-xs lg:text-sm rounded border border-white/30 py-1 text-white hover:border-white/60 transition bg-[#0D1A2D] cursor-pointer"
          >
            Reset
          </button>
        </div>
        </div>
      </div>

      {showConfirmDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-[#0D1A2D] border border-white/30 rounded-lg p-6 max-w-sm w-full mx-4">
            <p className="text-white text-center mb-6">
              Are you sure you want to delete all steps?
            </p>
            <div className="flex gap-3">
              <button
                onClick={confirmReset}
                className="flex-1 rounded border border-white/60 py-2 text-white hover:border-white bg-[#0D1A2D] transition cursor-pointer"
              >
                Yes
              </button>
              <button
                onClick={cancelReset}
                className="flex-1 rounded border border-white/30 py-2 text-white bg-red-500 hover:bg-red-600 transition cursor-pointer"
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

export default ManualTF;