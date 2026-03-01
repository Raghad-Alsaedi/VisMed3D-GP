"use client";
import { useEffect, useState, useRef } from "react";
import Footer from "./Footer";
import Img from "./Img";
import Header from "./Header";
import AutoTF from "./AutoTF";

const ViewImg = () => {
  const [fps, setFps] = useState<number>(0);
  
  const frameCount = useRef<number>(0);
  const lastTime = useRef<number>(performance.now());
  
  const requestRef = useRef<number | null>(null); 

  useEffect(() => {
    const loop = (now: number) => {
      frameCount.current++;
      const delta = now - lastTime.current;

      if (delta >= 1000) {
        setFps(Math.round((frameCount.current * 1000) / delta));
        frameCount.current = 0;
        lastTime.current = now;
      }

      requestRef.current = requestAnimationFrame(loop);
    };

    requestRef.current = requestAnimationFrame(loop);
    
    return () => {
      if (requestRef.current !== null) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, []);

  return (
    <div className="h-screen bg-[#040A16] flex flex-col p-4">
      <div className="flex-shrink-0">
        <Header />
      </div>

      <div className="mt-4 flex-1 bg-[#0D1A2D] border border-white/10 rounded-xl flex items-center justify-center relative overflow-hidden group">
        <Img />
        
        <div className="absolute bottom-4 left-4 flex items-center gap-3 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 shadow-lg">
           <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${fps > 50 ? 'bg-emerald-500' : 'bg-yellow-500'} animate-pulse`}></span>
              <span className="text-[11px] uppercase tracking-tighter text-white/40 font-bold">Live FPS</span>
           </div>
           <div className="h-4 w-[1px] bg-white/10"></div>
           <h2 className="text-white font-mono text-[14px] font-semibold">
            {fps}
           </h2>
          

        </div>
         <AutoTF />

      </div>

      <div className="flex-shrink-0">
        <Footer />
      </div>
    </div>
  );
};

export default ViewImg;