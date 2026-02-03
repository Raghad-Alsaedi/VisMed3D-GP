"use client";
import { NAV_LINKS_TECH } from "@/constant";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import LogOutButton from "./LogOutButton";
import { useState, useEffect } from "react";
import { Menu } from "@/components/icons";
import { MdClose } from "react-icons/md";

const SideBarTech = () => {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        isMobile &&
        isSidebarOpen &&
        !(e.target as Element).closest(".sidebar-container") &&
        !(e.target as Element).closest(".menu-toggle-btn")
      ) {
        setIsSidebarOpen(false);
      }
    };

    if (isSidebarOpen) {
      document.addEventListener("click", handleClickOutside);
    }

    return () => document.removeEventListener("click", handleClickOutside);
  }, [isSidebarOpen, isMobile]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  // Check if we should hide sidebar on certain pages - AFTER all hooks
  if (
    pathname === "/logout" ||
    pathname === "/radio_tech/dropfile" ||
    pathname === "/radio_tech/uploadPage"
  ) {
    return null;
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={toggleSidebar}
        className="menu-toggle-btn fixed top-4 left-4 z-50 md:hidden bg-[#040A16] text-white p-2 rounded-lg shadow-lg hover:bg-slate-700 transition-colors"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <div
        className={`sidebar-container w-[250px] h-screen bg-[#040A16] flex flex-col fixed top-0 left-0 z-50 transition-transform duration-300 ${
          isMobile
            ? isSidebarOpen
              ? "translate-x-0"
              : "-translate-x-full"
            : "translate-x-0"
        }`}
      >
        {/* Logo and Close Button */}
        <div className="flex items-center justify-between mx-4 mt-4 mb-10">
          <div className="w-40 overflow-hidden">
            <Image
              src="/logo.png"
              alt="Logo"
              width={160}
              height={160}
              className="w-auto h-auto object-contain"
            />
          </div>

          {/* Close button for mobile */}
          <button
            onClick={closeSidebar}
            className="md:hidden text-white hover:text-gray-300"
          >
            <MdClose className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation Links */}
        <div>
          {NAV_LINKS_TECH.map((link) => {
            const isActive = pathname === link.href;
            const IconComponent = link.icon;

            return (
              <Link
                href={link.href}
                key={link.Key}
                onClick={() => {
                  if (isMobile) {
                    closeSidebar();
                  }
                }}
                className={`my-2 h-12 rounded-l-full ml-2 py-2.5 flex items-center justify-center gap-2 ${
                  isActive
                    ? "bg-[#0D1A2D] text-white font-semibold"
                    : "text-gray-300 hover:text-white hover:bg-gray-900"
                }`}
              >
                <IconComponent className="w-6 h-6" />
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Logout Button */}
        <div className="mt-auto mb-4">
          <LogOutButton />
        </div>
      </div>
    </>
  );
};

export default SideBarTech;