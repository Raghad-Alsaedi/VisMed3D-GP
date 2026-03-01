"use client";
import { NAV_LINKS_DOCTOR, NAV_LINKS_TECH, NAV_LINKS_ADMIN } from "@/constant";
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
  const isTech   = pathname.startsWith("/radio_tech");
  const isAdmin  = pathname.startsWith("/admin");

  const navLinks = isAdmin
    ? NAV_LINKS_ADMIN
    : isDoctor
    ? NAV_LINKS_DOCTOR
    : NAV_LINKS_TECH;

  const hiddenPages = isDoctor
    ? ["/logout", "/doctor/writingReport", "/doctor/viewimg", "/doctor/addSignature"]
    : isTech
    ? ["/logout", "/radio_tech/dropfile", "/radio_tech/uploadPage"]
    : ["/logout"];

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 767);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

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
    if (isSidebarOpen) document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [isSidebarOpen, isMobile]);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar  = () => setIsSidebarOpen(false);

  if (hiddenPages.includes(pathname)) return null;

  return (
    <>
      {isMobile && (
        <button
          onClick={toggleSidebar}
          className="menu-toggle-btn"
          style={{
            position: "fixed",
            top: "12px",
            left: "12px",
            zIndex: 50,
            background: "#040A16",
            color: "white",
            padding: "6px",
            borderRadius: "8px",
            boxShadow: "0 4px 6px rgba(0,0,0,0.4)",
            cursor: "pointer",
            border: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "background 0.2s",
          }}
          onMouseEnter={e => (e.currentTarget.style.background = "#1e293b")}
          onMouseLeave={e => (e.currentTarget.style.background = "#040A16")}
        >
          <Menu style={{ width: "20px", height: "20px" }} />
        </button>
      )}

      {isSidebarOpen && (
        <div
          onClick={closeSidebar}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            zIndex: 40,
          }}
        />
      )}

      <div
        className="sidebar-container"
        style={{
          width: "250px",
          minHeight: "100dvh",
          height: "100%",
          background: "#040A16",
          display: "flex",
          flexDirection: "column",
          position: "fixed",
          top: 0,
          left: 0,
          zIndex: 50,
          transition: "transform 0.3s",
          transform: isMobile
            ? isSidebarOpen ? "translateX(0)" : "translateX(-100%)"
            : "translateX(0)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            margin: "16px 16px 40px 16px",
          }}
        >
          <div style={{ width: "160px", overflow: "hidden" }}>
            <Image
              src="/logo.png"
              alt="Logo"
              width={160}
              height={160}
              priority
              style={{ width: "auto", height: "auto", objectFit: "contain" }}
            />
          </div>
          {isMobile && (
            <button
              onClick={closeSidebar}
              style={{
                background: "none",
                border: "none",
                color: "white",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
              }}
              onMouseEnter={e => (e.currentTarget.style.color = "#d1d5db")}
              onMouseLeave={e => (e.currentTarget.style.color = "white")}
            >
              <MdClose style={{ width: "20px", height: "20px" }} />
            </button>
          )}
        </div>

        <div>
          {navLinks.map((link) => {
            const isActive      = pathname === link.href;
            const IconComponent = link.icon;

            return (
              <Link
                href={link.href}
                key={link.Key}
                onClick={() => { if (isMobile) closeSidebar(); }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  margin: "8px 0 8px 8px",
                  height: "48px",
                  borderRadius: "9999px 0 0 9999px",
                  paddingTop: "10px",
                  paddingBottom: "10px",
                  textDecoration: "none",
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? "white" : "#d1d5db",
                  background: isActive ? "#0D1A2D" : "transparent",
                  transition: "background 0.2s, color 0.2s",
                }}
                onMouseEnter={e => {
                  if (!isActive) {
                    (e.currentTarget as HTMLElement).style.color = "white";
                    (e.currentTarget as HTMLElement).style.background = "#111827";
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive) {
                    (e.currentTarget as HTMLElement).style.color = "#d1d5db";
                    (e.currentTarget as HTMLElement).style.background = "transparent";
                  }
                }}
              >
                <IconComponent style={{ width: "24px", height: "24px" }} />
                {link.label}
              </Link>
            );
          })}
        </div>

        <div style={{ marginTop: "auto", marginBottom: "16px" }}>
          <LogOutButton />
        </div>
      </div>
    </>
  );
};

export default SideBar;