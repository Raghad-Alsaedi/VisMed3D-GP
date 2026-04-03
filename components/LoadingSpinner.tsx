const LoadingSpinner = () => {
  return (
    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#0D1A2D] rounded-md pointer-events-none">
      <div className="w-7 h-7 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      <p className="text-white/40 text-[11px] mt-3 font-mono tracking-widest uppercase">Loading</p>
    </div>
  );
};

export default LoadingSpinner;