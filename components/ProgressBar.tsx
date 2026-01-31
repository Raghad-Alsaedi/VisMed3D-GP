import React from 'react';

interface ProgressBarProps {
  progress: number; // 0-100
  className?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress, className = '' }) => {
  return (
    <div className={`w-full ${className}`}>
      <div className="w-full bg-gray-700/50 rounded-full h-2 overflow-hidden border border-white/10">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      
      <div className="text-center mt-2 text-white/80 text-sm font-medium">
        {Math.round(progress)}%
      </div>
    </div>
  );
};

export default ProgressBar;