"use client";
import Footer from "./Footer";
import Img from "./Img";
import Header from "./Header";
import Report from "./Report";

const WritingReport = () => {
  return (
    <div className="min-h-screen bg-[#040A16] flex flex-col items-center justify-start p-4">
      <Header />

      <div className="w-full flex-1 bg-[#0D1A2D] border border-white/20 rounded-lg flex gap-4 p-4 mt-4 h-full">
        <div className="flex-1 bg-[#040A16] rounded-md flex items-center justify-center border border-white/20 hover:border-white/30 relative">
          <Img />
        </div>

        <div className="flex-1 bg-[#040A16] rounded-md p-4 flex flex-col border border-white/20">
          <Report />
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default WritingReport;
