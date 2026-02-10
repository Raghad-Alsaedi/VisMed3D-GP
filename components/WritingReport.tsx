"use client";
import Footer from "./Footer";
import Img from "./Img";
import Header from "./Header";
import Report from "./Report";

const WritingReport = () => {
  return (
    <div className="writing-report-page">
      <Header />

      <div className="writing-report-container">
        <div className="writing-report-panel-viewer">
          <Img />
        </div>

        <div className="writing-report-panel-report">
          <Report />
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default WritingReport;
