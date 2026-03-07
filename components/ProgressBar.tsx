import React from "react";

interface ProgressBarProps {
  progress: number;
  className?: string;
}

const TOTAL_SEGMENTS = 20;

const ProgressBar: React.FC<ProgressBarProps> = ({ progress, className = "" }) => {
  const filledSegments = Math.round((progress / 100) * TOTAL_SEGMENTS);

  return (
    <div className={`w-full flex items-center gap-3 ${className}`}>
      <div className="flex-1 flex gap-[3px]">
        {Array.from({ length: TOTAL_SEGMENTS }).map((_, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: "28px",
              borderRadius: "3px",
              backgroundColor: i < filledSegments ? "#1746A2" : "rgba(255,255,255,0.08)",
              transition: "background-color 0.2s ease",
            }}
          />
        ))}
      </div>
      <span style={{ color: "white", fontWeight: 600, fontSize: "14px", minWidth: "40px", textAlign: "right" }}>
        {Math.round(progress)}%
      </span>
    </div>
  );
};

export default ProgressBar;