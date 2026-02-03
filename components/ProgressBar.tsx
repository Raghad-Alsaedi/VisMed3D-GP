import React from 'react';

interface ProgressBarProps {
  progress: number;
  className?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress, className = '' }) => {
  return (
    <div className={`progressbar-container ${className}`}>
      <div className="progressbar-track">
        <div
          className="progressbar-fill"
          style={{ width: `${progress}%` }}
        />
      </div>
      
      <div className="progressbar-text">
        {Math.round(progress)}%
      </div>
    </div>
  );
};

export default ProgressBar;