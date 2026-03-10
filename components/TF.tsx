"use client";
import React, {useEffect, Suspense, useState } from 'react';
import Header from './Header';
import Img from './Img';
import ManualTF from './ManualTF';
import Footer from './Footer';

interface Step {
  id: number;
  rangeValue: number;
  rangeStart: number;
  rangeEnd: number;
  color: string;
  opacity: number;
}

const TF = () => {
  const [isPanelOpen, setIsPanelOpen] = useState(true);

  const handleTransferFunctionChange = (steps: Step[]) => {
    if ((window as any).sendStepsToWebGL) {
      (window as any).sendStepsToWebGL(steps);
    }
  };

  return (
   <div className="h-screen bg-[#040A16] flex flex-col p-4">
      <div className="flex-shrink-0">
        <Header />
      </div>
      
      <div className="mt-4 flex-1 bg-[#0D1A2D] border border-white/20 rounded-lg flex items-center justify-center relative min-h-0">
        <div
          className={`w-full h-full transition-all duration-300 sm:translate-x-0 ${
            isPanelOpen ? "-translate-x-10" : "translate-x-0"
          }`}
        >
          <Suspense fallback={<div>Loading...</div>}>
            <Img onTransferFunctionChange={handleTransferFunctionChange} />
          </Suspense>
        </div>

        <ManualTF
          onTransferFunctionChange={handleTransferFunctionChange}
        
        />
      </div>

      <div className="flex-shrink-0">
        <Footer />
      </div>
    </div>
  );
};

export default TF;
