"use client";

interface StatusBarProps {
  message: string;       
  lastSavedTime: string; 
  isUploading?: boolean;
}

const StatusBar = ({ message, lastSavedTime, isUploading = false }: StatusBarProps) => {
  const hasEvent = Boolean(message);
  const timeStr  = lastSavedTime || "—";

  return (
    <div className="flex-shrink-0 flex items-center gap-2 px-3 h-7 bg-[#040d1a] border-t border-white/20 select-none">
      <span
        className={`w-1.5 h-1.5 rounded-full flex-shrink-0 transition-colors duration-300 ${
          isUploading ? "bg-white/60 animate-pulse" : "bg-white/20"
        }`}
      />

      <span
        className="text-white/60 font-mono"
        style={{ fontSize: "clamp(9px, 1.8vw, 11px)" }}
      >
        {hasEvent ? (
          <>
            {message}
            <span className="mx-1.5 text-white/20">·</span>
            {timeStr}
          </>
        ) : (
          lastSavedTime ? `Last saved: ${timeStr}` : "Last saved: —"
        )}
      </span>
    </div>
  );
};

export default StatusBar;