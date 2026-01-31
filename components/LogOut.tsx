"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";

const LogOut = () => {
  const router = useRouter();
  return (
    <div className="bg-[#040A16] min-h-screen">
      <h1 className="text-white text-center text-3xl font-semibold pt-8 pb-4 sticky top-0 bg-[#040A16] z-10">
        Log out
      </h1>

      <div className="flex justify-center items-center min-h-[calc(100vh-96px)] px-4">
        <div className="bg-[#0D1A2D] border border-[#FFFFFF]/30 rounded-[20px] p-6 md:p-8 text-white text-center max-w-md w-full">
          <h2 className="font-semibold text-lg md:text-xl lg:text-2xl mb-12 md:mb-16">
            Are you sure you want to log out?
          </h2>
          <div className="flex flex-col sm:flex-row justify-center gap-6 md:gap-8">
            <button
              className="bg-[#17387C] py-3 px-10 md:py-3.5 md:px-12 border border-white/30 rounded-[10px] cursor-pointer hover:bg-[#092664]  hover:font-bold transition-all text-base md:text-lg"
              onClick={() => router.back()}
            >
              Cancel
            </button>

            <Link
              href="/login"
              className="bg-[#8D1717] py-3 px-10 md:py-3.5 md:px-12 rounded-[10px] inline-block hover:bg-[#711111]  hover:font-bold transition-all text-base md:text-lg"
            >
              Log out
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogOut;
