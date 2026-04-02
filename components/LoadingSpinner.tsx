const LoadingSpinner = () => {
  return (
    <section
      className="bg-[#0D1A2D] overflow-y-auto overflow-x-hidden p-4 md:pl-[266px] md:pt-4 lg:pl-[290px] lg:pt-2"
      style={{ minHeight: "100dvh" }}
    >
      <div className="w-full flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin" />
          <p className="text-white text-sm">Loading ...</p>
        </div>
      </div>
    </section>
  );
};

export default LoadingSpinner;