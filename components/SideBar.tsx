"use client";
import { NAV_LINKS_DOCTOR, NAV_LINKS_TECH } from "@/constant";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import LogOutButton from "./LogOutButton";
import { useState, useEffect } from "react";
import { Menu } from "@/components/icons";
import { MdClose } from "react-icons/md";

const SideBar = () => {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const isDoctor = pathname.startsWith("/doctor");
  const navLinks = isDoctor ? NAV_LINKS_DOCTOR : NAV_LINKS_TECH;
  
  const hiddenPages = isDoctor
    ? ["/logout", "/doctor/writingReport", "/doctor/viewimg"]
    : ["/logout", "/radio_tech/dropfile", "/radio_tech/uploadPage"];

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

  if (hiddenPages.includes(pathname)) {
    return null;
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={toggleSidebar}
        className="menu-toggle-btn sidebar-menu-toggle-btn"
      >
        <Menu className="sidebar-menu-icon" />
      </button>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <div
        className={`sidebar-container sidebar-container-base ${
          isMobile
            ? isSidebarOpen
              ? "translate-x-0"
              : "-translate-x-full"
            : "translate-x-0"
        }`}
      >
        {/* Logo and Close Button */}
        <div className="sidebar-logo-wrapper">
          <div className="sidebar-logo-image-wrapper">
            <Image
              src="/logo.png"
              alt="Logo"
              width={160}
              height={160}
              className="sidebar-logo-image"
            />
          </div>

          {/* Close button for mobile */}
          <button
            onClick={closeSidebar}
            className="sidebar-close-btn"
          >
            <MdClose className="sidebar-close-icon" />
          </button>
        </div>

        {/* Navigation Links */}
        <div>
          {navLinks.map((link) => {
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
                className={`sidebar-nav-link-base ${
                  isActive
                    ? "sidebar-nav-link-active"
                    : "sidebar-nav-link-inactive"
                }`}
              >
                <IconComponent className="sidebar-nav-icon" />
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Logout Button */}
        <div className="sidebar-logout-wrapper">
          <LogOutButton />
        </div>
      </div>
    </>
  );
};

export default SideBar;