"use client";
import { NAV_LINKS_TECH } from "@/constant";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import LogOutButton from "./LogOutButton";

const SideBarTech = () => {
  const pathname = usePathname();

  if (
    pathname === "/logout" ||
    pathname === "/radio_tech/dropfile" ||
    pathname === "/radio_tech/uploadPage"
  ) {
    return null;
  }
  return (
    <div className="w-[250px] h-screen bg-[#040A16] flex flex-col fixed top-0 left-0 ">
      <div className="mx-4 mt-4 mb-10 w-40 overflow-hidden ">
        <Image
          src="/logo.png"
          alt="Logo"
          width={160}
          height={160}
          className="w-auto h-auto object-contain"
        />
      </div>

      <div>
        {NAV_LINKS_TECH.map((link) => {
          const isActive = pathname === link.href;

          return (
            <Link
              href={link.href}
              key={link.Key}
              className={`my-2 h-12 rounded-l-full ml-2 py-2.5 flex items-center justify-center gap-2 ${
                isActive
                  ? "bg-[#0D1A2D] text-white font-semibold"
                  : "text-gray-300 hover:text-white hover:bg-gray-900"
              }`}
            >
              <svg
                width={24}
                height={24}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d={link.icon}
                />
              </svg>
              {link.label}
            </Link>
          );
        })}
      </div>

      <div className="mt-60">
        {" "}
        <LogOutButton />{" "}
      </div>
    </div>
  );
};

export default SideBarTech;
