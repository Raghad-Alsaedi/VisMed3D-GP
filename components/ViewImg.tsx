"use client";
import { useEffect, useState } from "react";
import Footer from "./Footer";
import Img from "./Img";
import Header from "./Header";

const ViewImg = () => {
  
  const [fps, setFps] = useState(0);

useEffect(() => {
  let last = performance.now();
  let frames = 0;

  function loop() {
    const now = performance.now();
    frames++;

    if (now - last >= 1000) {
      setFps(frames);
      frames = 0;
      last = now;
    }

    requestAnimationFrame(loop);
  }

  loop();
}, []);

  return (
    <div className="h-screen bg-[#040A16] flex flex-col p-4">
      <div className="flex-shrink-0">
        <Header />
      </div>

      <div className="mt-4 flex-1 bg-[#0D1A2D] border border-white/20 rounded-lg flex items-center justify-center relative min-h-0">
        <Img />
        <h2 className="text-white/30 font-medium bottom-0 left-0 absolute m-2 text-[14px]">
        {fps} FPS
</h2>

      </div>

      <div className="flex-shrink-0">
        <Footer />
      </div>
    </div>
  );
};

export default ViewImg;
