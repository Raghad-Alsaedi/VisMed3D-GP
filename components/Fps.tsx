"use client";
import { useEffect, useRef, useState } from "react";

const Fps = () => {
  const [fps, setFps] = useState(0);
  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());
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
    return () => { if (requestRef.current !== null) cancelAnimationFrame(requestRef.current); };
  }, []);

  return (
    <div className="absolute bottom-4 left-4 z-50 flex items-center gap-3 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 shadow-lg">
      <div className="flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full ${fps > 50 ? "bg-emerald-500" : "bg-yellow-500"} animate-pulse`} />
        <span className="text-[11px] uppercase tracking-tighter text-white/40 font-bold">Live FPS</span>
      </div>
      <div className="h-4 w-[1px] bg-white/10" />
      <h2 className="text-white font-mono text-[14px] font-semibold">{fps}</h2>
    </div>
  );
};

export default Fps;