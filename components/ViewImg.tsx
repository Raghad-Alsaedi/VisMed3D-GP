"use client";
import Footer from "./Footer";
import Img from "./Img";
import Header from "./Header";

const ViewImg = () => {
  return (
    <div className="viewimg-page-container">
      <div className="viewimg-header-section">
        <Header />
      </div>

      <div className="viewimg-content-card">
        <Img />
        <h2 className="viewimg-fps-overlay"> 30 FPS</h2>
      </div>

      <div className="viewimg-footer-section">
        <Footer />
      </div>
    </div>
  );
};

export default ViewImg;