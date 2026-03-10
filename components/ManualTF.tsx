"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

interface Step {
  id: number;
  rangeValue: number;
  rangeStart: number;
  rangeEnd: number;
  color: string;
  opacity: number;
} 

interface ManualTFProps {
  onTransferFunctionChange?: (steps: Step[]) => void;
}

const defaultSteps: Step[] = [
  { id: 1, rangeValue: 300, rangeStart: -1000, rangeEnd: -700, color: "#000000", opacity: 0.0 },
  { id: 2, rangeValue: 100, rangeStart: -700, rangeEnd: -600, color: "#999999", opacity: 0.0 },
  { id: 3, rangeValue: 30, rangeStart: -120, rangeEnd: -90, color: "#FFE099", opacity: 0.1932 },
  { id: 4, rangeValue: 20, rangeStart: -10, rangeEnd: 10, color: "#AED9E6", opacity: 0.2330},
  { id: 5, rangeValue: 37, rangeStart: 13, rangeEnd: 50, color: "#CC2100", opacity: 0.1364},
  { id: 6, rangeValue: 20, rangeStart: 35, rangeEnd: 55, color: "#C7A887", opacity: 0.2784},
  { id: 7, rangeValue: 200, rangeStart: 100, rangeEnd: 300, color: "#E8B4B0", opacity: 0.0190},
  { id: 8, rangeValue: 2300, rangeStart: 700, rangeEnd: 3000, color: "#F5F5F0", opacity: 1.0 },
  { id: 9, rangeValue: 100, rangeStart: 3000, rangeEnd: 3100, color: "#FFFFFF", opacity: 1.0 },
]; 


const ManualTF = ({ onTransferFunctionChange }: ManualTFProps) => {
  const router = useRouter();
  const [isPanelVisible, setIsPanelVisible] = useState(true);
  const [steps, setSteps] = useState<Step[]>(defaultSteps);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [openSteps, setOpenSteps] = useState<Set<number>>(new Set([1]));

  let userRole = null;

  if (typeof window !== "undefined") {
    userRole = localStorage.getItem("userRole");
  }

  if (userRole === "/radio_tech") {
    return null;
  }
 
  const updateStepRanges = () => { 
    return steps.map((step) => {
      return {
        ...step,
    rangeEnd: step.rangeStart + step.rangeValue
      }; 
    });
  };

  const updatedSteps = updateStepRanges();
  // إرسال التحديثات للـ Parent Component
  useEffect(() => { 
    if (onTransferFunctionChange) {
      onTransferFunctionChange(updatedSteps);
    }
  }, [steps]);

 const MAX_RANGE = 3100; // الحد الأقصى للنطاق (مثلاً 3100 HU)
  const addStep = () => {
  // ✅ احسب مباشرة من steps بدون استدعاء updateStepRanges
  const lastStep = steps[steps.length - 1];
  const rangeStart = lastStep 
    ? lastStep.rangeStart + lastStep.rangeValue  // احسب الـ end مباشرة
    : -1000;

  const remainingRange = MAX_RANGE - rangeStart;

  if (remainingRange <= 0) {
    alert("The range is already full!");
    return;
  }

  const randomColor = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');

  const newStep: Step = {
    id: Date.now(),
    rangeValue: Math.min(200, remainingRange),
    rangeStart: rangeStart,
    rangeEnd: Math.min(rangeStart + 200, MAX_RANGE),
    color: randomColor,
    opacity: 0.5,
  };

  setSteps([...steps, newStep]);
};

  const deleteStep = (id: number) => {
    setSteps(steps.filter(step => step.id !== id));
  };

  const updateStepRange = (id: number, newValue: string) => {
  const newRangeValue = parseInt(newValue);
  
  setSteps(prev => {
    const updatedSteps = [...prev];
    const index = updatedSteps.findIndex(s => s.id === id);
    if (index === -1) return prev;

    updatedSteps[index] = {
      ...updatedSteps[index],
      rangeValue: newRangeValue,
      rangeEnd: updatedSteps[index].rangeStart + newRangeValue,
    };

    for (let i = index + 1; i < updatedSteps.length; i++) {
      const prevStep = updatedSteps[i - 1];
      const newStart = prevStep.rangeStart + prevStep.rangeValue;
      updatedSteps[i] = {
        ...updatedSteps[i],
        rangeStart: newStart,
        rangeEnd: newStart + updatedSteps[i].rangeValue,
      };
    }

    return updatedSteps;
  });
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
    setOpenSteps(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
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

 

  return (
    <>
      <button
        onClick={() => setIsPanelVisible(!isPanelVisible)}
        className="absolute top-17 right-1 z-20 rounded border border-white/20 bg-[#0D1A2D] p-2 text-white hover:border-white/70 hover:opacity-90 transition"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path d={isPanelVisible ? "M9 5l7 7-7 7" : "M15 19l-7-7 7-7"} />
        </svg>
      </button>

      <div
        className={`absolute top-17 right-12 bottom-6 flex w-56 flex-col gap-2 overflow-hidden rounded-lg border border-white/50 bg-[#040A16] p-2 transition-all duration-300 ${!isPanelVisible ? "opacity-0 pointer-events-none translate-x-full" : ""
          }`}>

        <div className="p-2 flex-shrink-0">
          <span className="text-sm font-semibold text-white">
            Transfer Function Mode :
          </span>

          <div className="flex flex-row justify-between mt-2">
            <label className="flex cursor-pointer items-center gap-2 text-white"
              onClick={() => router.push("/viewimg")}
            >
              <input
                type="radio"
                name="TFMode"
                className="peer hidden"
              />
              <span className="h-4 w-4 rounded-full border border-white peer-checked:border-[#1F9C3E] peer-checked:bg-[#1F9C3E]"></span>
              Auto
            </label>

            <label className="flex cursor-pointer items-center gap-2 text-white">
              <input type="radio" name="TFMode" className="peer hidden" defaultChecked />
              <span className="h-4 w-4 rounded-full border border-white peer-checked:border-[#1F9C3E] peer-checked:bg-[#1F9C3E]"></span>
              Manual
            </label>
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto px-2 flex flex-col gap-2">
          <div className="h-full overflow-y-auto">
            {updatedSteps.map((step, index) => (
              <div
                key={step.id}
                className="step border border-white/20 rounded-md overflow-hidden"
              >
                <input
                  type="checkbox"
                  id={`step${step.id}`}
                  className="peer hidden"
                  checked={openSteps.has(step.id)}   // ✅
                  onChange={() => toggleStep(step.id)}
                />
                <label
                  htmlFor={`step${step.id}`}
                  className="flex justify-between items-center px-3 py-2 cursor-pointer text-white text-sm bg-[#0D1A2D] border border-white/20 rounded-md"
                >
                   <span className="flex items-center gap-1 flex-wrap">
                    <span>Step {index + 1}</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        deleteStep(step.id);
                      }}
                      className="rounded border border-white/20 px-1.5 py-0.5 text-xs hover:border-white hover:opacity-80 transition"
                    >
                      <span className="text-red-500 font-bold">&times;</span>
                    </button>
                  </span>
                  <svg
                    className={`w-4 h-4 transition-transform duration-300 ${openSteps.has(step.id) ? "rotate-180" : ""
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
                  className={`transition-all duration-300 px-3 pb-3 space-y-2 bg-[#0D1A2D] ${openSteps.has(step.id) ? "max-h-96" : "max-h-0 overflow-hidden"
                    }`}
                >
                  <div className="space-y-1">
                    <span className="text-xs text-white/80">
                      Range: {step.rangeStart} HU - {step.rangeEnd} HU
                    </span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-xs text-white/80">Range Size: {step.rangeValue} HU</span>
                    <input
                      type="range"
                      min="0"
                      max={step.rangeValue + (3100 - step.rangeEnd)}
                      value={step.rangeValue}
                      onChange={(e) => updateStepRange(step.id, e.target.value)}
                      className="w-full"
                    />
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-xs text-white/80">Color</span>
                    <input
                      type="color"
                      value={step.color}
                      onChange={(e) => updateStepColor(step.id, e.target.value)}
                      className="w-8 h-6 rounded border border-white/30 cursor-pointer"
                    />
                  </div>

                  <div>
                    <span className="text-xs text-white/80">Opacity: {step.opacity.toFixed(4)}</span>
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

          <div className="p-2 flex flex-col gap-2 flex-shrink-0">
            <button
              onClick={addStep}
              className="w-full flex items-center justify-center gap-2 rounded border border-white/30 py-2 text-sm text-white hover:border-white hover:text-white transition bg-[#0D1A2D]"
            >
              <svg
                className="w-4 h-4"
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
              className="w-full flex-1 text-sm rounded border border-white/30 py-1 text-white hover:border-white bg-[#0D1A2D]"
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

export default ManualTF; 
