"use client";
import Footer from "./Footer";
import Img from "./Img";
import Header from "./Header";

const ViewImg = () => {
  return (
    <div className="page-container">
      <div className="section-shrink">
        <Header />
      </div>

      <div className="content-card-viewer">
        <Img />
      </div>

      <div className="section-shrink">
        <Footer />
      </div>
    </div>
  );
};

export default ViewImg;