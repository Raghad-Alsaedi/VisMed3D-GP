"use client";
import Footer from "./Footer";
import Img from "./Img";
import Header from "./Header";

const ViewImg = () => {
  return (
    <div className="h-screen bg-[#040A16] flex flex-col p-4">
      <div className="flex-shrink-0">
        <Header />
      </div>

      <div className="mt-4 flex-1 bg-[#0D1A2D] border border-white/20 rounded-lg flex items-center justify-center relative min-h-0">
        <Img />
      </div>

      <div className="flex-shrink-0">
        <Footer />
      </div>
    </div>
  );
};

export default ViewImg;