"use client";

import React, { useEffect, useState, useRef, useCallback, Fragment } from "react";
import { useSession } from "next-auth/react";
import { ID, License_Number, Years_of_Experience, Gender, Phone } from "@/components/icons";

const PAGE_SIZE = 20;

type Tech = {
  id: number | string;
  technician_id: number | null;
  firstName: string;
  middleName: string | null;
  lastName: string;
  gender: "male" | "female";
  phone: string | null;
  technician_code: string | null;
  license_number: string | null;
  years_experience: number | null;
  profile_image_url: string | null;
};

type UploadRow = {
  study_id: number;
  patient_name: string;
  accession: string | null;
  mrn: string | null;
  modality: string | null;
  uploaded_at: string;
};

const HomeTech = () => {
  const { status } = useSession();
  const [tech, setTech] = useState<Tech | null>(null);
  const [allUploads, setAllUploads] = useState<UploadRow[]>([]);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [loading, setLoading] = useState(true);

  const sentinelRef = useRef<HTMLTableRowElement | null>(null);

  useEffect(() => {
    const run = async () => {
      try {
        const meRes = await fetch("/api/technician/me");
        if (!meRes.ok) throw new Error("Failed to load technician profile");
        const meData = await meRes.json();
        setTech(meData.tech);

        const upRes = await fetch("/api/technician/recent-uploads");
        if (!upRes.ok) throw new Error("Failed to load recent uploads");
        const upData = await upRes.json();
        setAllUploads(upData.uploads || []);
        setVisibleCount(PAGE_SIZE);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    if (status !== "loading") run();
  }, [status]);

  const loadMore = useCallback(() => {
    setVisibleCount((c) => Math.min(c + PAGE_SIZE, allUploads.length));
  }, [allUploads.length]);

  useEffect(() => {
    if (!sentinelRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting) loadMore(); },
      { threshold: 0.1 }
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [loadMore, visibleCount]);

  if (loading) {
    return (
      <section
        className="bg-[#0D1A2D] overflow-y-auto overflow-x-hidden p-4 md:pl-[266px] md:pt-4 lg:pl-[290px] lg:pt-2"
        style={{ minHeight: "100dvh" }}
      >
        <div className="w-full flex items-center justify-center min-h-screen">
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin" />
            <p className="text-white text-sm">Loading dashboard...</p>
          </div>
        </div>
      </section>
    );
  }

  const fullName     = [tech?.firstName, tech?.middleName, tech?.lastName].filter(Boolean).join(" ") || "Technician";
  const imgSrc       = tech?.technician_id ? `/api/images/tech_${tech.technician_id}` : "/api/images/default";
  const idValue      = tech?.technician_code  || "—";
  const licenseValue = tech?.license_number   || "—";
  const yearsValue   = tech?.years_experience ?? "—";
  const genderValue  = tech?.gender === "male" ? "Male" : tech?.gender === "female" ? "Female" : "—";
  const phoneValue   = tech?.phone            || "—";

  const infoItems = [
    { icon: <ID className="w-4 h-4 text-gray-400" />,                  label: "Technician ID",       value: idValue },
    { icon: <License_Number className="w-4 h-4 text-gray-400" />,      label: "License Number",      value: licenseValue },
    { icon: <Years_of_Experience className="w-4 h-4 text-gray-400" />, label: "Years of Experience", value: String(yearsValue) },
    { icon: <Gender className="w-4 h-4 text-gray-400" />,              label: "Gender",              value: genderValue },
    { icon: <Phone className="w-4 h-4 text-gray-400" />,               label: "Phone",               value: phoneValue },
  ];

  const InfoGrid = () => (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", rowGap: "35px", columnGap: "4px" }}>
      {infoItems.map((item, i) => (
        <div key={i} style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <span style={{ opacity: 0.35, display: "flex" }}>{item.icon}</span>
            <span style={{ color: "#6b7280", fontSize: "14px", fontWeight: 500, letterSpacing: "0.03em" }}>
              {item.label}
            </span>
          </div>
          <span style={{ color: "#f1f5f9", fontSize: "18px", fontWeight: 600, lineHeight: 1.3 }}>
            {item.value}
          </span>
        </div>
      ))}
    </div>
  );

  const InfoList = () => (
    <div
      style={{
        display: "inline-grid",
        gridTemplateColumns: "18px auto auto",
        rowGap: "clamp(10px, 2.5vw, 14px)",
        columnGap: "8px",
        alignItems: "center",
      }}
    >
      {infoItems.map((item, i) => (
        <Fragment key={i}>
          <span style={{ opacity: 0.35, display: "flex", justifyContent: "center" }}>
            {item.icon}
          </span>
          <span style={{ color: "#6b7280", fontSize: "14px", fontWeight: 500, letterSpacing: "0.02em" }}>
            {item.label}
          </span>
          <span style={{ color: "#f1f5f9", fontSize: "14px", fontWeight: 600, lineHeight: 1.3, textAlign: "left" }}>
            {item.value}
          </span>
        </Fragment>
      ))}
    </div>
  );

  const visibleUploads = allUploads.slice(0, visibleCount);
  const hasMore        = visibleCount < allUploads.length;

  return (
    <section
      className="bg-[#0D1A2D] w-full overflow-y-auto overflow-x-hidden p-4 md:pl-[266px] md:pt-4 lg:pl-[290px] lg:pt-2"
      style={{
        minHeight: "100dvh",
        paddingBottom: "max(16px, env(safe-area-inset-bottom, 0px))",
      }}
    >
      <div className="w-full max-w-full mx-auto py-2 box-border">

        <div
          className="w-full rounded-[10px] border border-white/30 bg-[#040A16] shadow-sm mt-0 md:mt-6 mb-4 md:mb-6 lg:mb-4 overflow-hidden box-border flex items-center justify-center"
          style={{ padding: "clamp(12px, 3vw, 24px) clamp(10px, 2.5vw, 24px)" }}
        >
          <style>{`
            @media (min-width: 600px) { .mobile-card { display: none !important; } }
            @media (max-width: 599px) { .tablet-card { display: none !important; } .desktop-card { display: none !important; } }
            @media (min-width: 600px) and (max-width: 900px) { .desktop-card { display: none !important; } }
            @media (min-width: 901px) { .tablet-card { display: none !important; } }
          `}</style>

          {/* موبايل */}
          <div className="mobile-card flex flex-col items-center w-full" style={{ gap: "clamp(6px, 2vw, 12px)" }}>
            <div
              className="rounded-[8px] bg-gray-600 overflow-hidden flex-shrink-0"
              style={{ width: "clamp(85px, 25vw, 110px)", height: "clamp(85px, 25vw, 110px)" }}
            >
              <img src={imgSrc} alt={fullName} fetchPriority="high" className="w-full h-full object-cover" />
            </div>
            <div className="text-center" style={{ lineHeight: 1.2 }}>
              <h1 className="font-bold text-white break-words" style={{ fontSize: "clamp(13px, 4vw, 19px)", lineHeight: 1.2 }}>
                {fullName}
              </h1>
              <p style={{ color: "#9ca3af", fontSize: "14px", marginTop: "2px" }}>Radiology Technician</p>
            </div>
            <div style={{ height: "clamp(4px, 1.5vw, 8px)" }} />
            <div className="w-full flex justify-center"><InfoList /></div>
            <div style={{ height: "clamp(4px, 1.5vw, 8px)" }} />
          </div>

          {/* آيباد 600-900 */}
          <div className="tablet-card text-white w-full" style={{ display: "grid", gridTemplateColumns: "100px 1fr", gap: "16px", alignItems: "start" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
              <div style={{ width: "90px", height: "90px", borderRadius: "8px", overflow: "hidden", background: "#4b5563" }}>
                <img src={imgSrc} alt={fullName} fetchPriority="high" className="w-full h-full object-cover" />
              </div>
              <div style={{ textAlign: "center" }}>
                <h1 style={{ fontSize: "12px", fontWeight: 700, color: "white", lineHeight: 1.3, wordBreak: "break-word" }}>{fullName}</h1>
                <p style={{ fontSize: "11px", color: "#9ca3af", marginTop: "2px" }}>Radiology Technician</p>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", rowGap: "16px", columnGap: "8px" }}>
              {infoItems.map((item, i) => (
                <div key={i} style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <span style={{ opacity: 0.35, display: "flex" }}>{item.icon}</span>
                    <span style={{ color: "#6b7280", fontSize: "10px", fontWeight: 500 }}>{item.label}</span>
                  </div>
                  <span style={{ color: "#f1f5f9", fontSize: "12px", fontWeight: 600, lineHeight: 1.3 }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* لاب توب وما فوق */}
          <div className="desktop-card text-white w-full" style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: "32px", alignItems: "start" }}>
            <div className="flex flex-col items-center space-y-2 md:space-y-3">
              <div className="w-[120px] h-[120px] lg:w-[140px] lg:h-[140px] rounded-[8px] bg-gray-600 overflow-hidden">
                <img src={imgSrc} alt={fullName} fetchPriority="high" className="w-full h-full object-cover" />
              </div>
              <div className="text-center">
                <h1 className="text-base lg:text-lg font-bold text-white mb-0">{fullName}</h1>
                <p className="text-sm text-gray-400">Radiology Technician</p>
              </div>
            </div>
            <div className="w-full"><InfoGrid /></div>
          </div>
        </div>

        <div className="w-full rounded-[10px] border border-white/30 bg-[#040A16] mb-4 md:mb-6 lg:mb-8 box-border py-3 px-2 md:py-5 md:px-6">
          <h3
            className="text-white font-semibold"
            style={{ fontSize: "clamp(12px, 3.5vw, 18px)", marginBottom: "clamp(8px, 2.5vw, 16px)" }}
          >
            Recent Upload File
          </h3>

          <div
            className="overflow-x-auto border border-white/30 rounded-lg"
            style={{ maxHeight: "40vh", minHeight: "120px", overflowY: "auto", WebkitOverflowScrolling: "touch" }}
          >
            <table className="w-full text-white" style={{ tableLayout: "fixed", minWidth: "320px" }}>
              <colgroup>
                <col style={{ width: "8%" }} />
                <col style={{ width: "30%" }} />
                <col style={{ width: "20%" }} />
                <col style={{ width: "20%" }} />
                <col style={{ width: "22%" }} />
              </colgroup>

              <thead className="border-b border-white/20 sticky top-0 bg-[#040A16] z-10">
                <tr>
                  {["#", "Patient Name", "Accession", "MRN", "Modality"].map((h) => (
                    <th
                      key={h}
                      className="font-medium text-center"
                      style={{
                        fontSize: "clamp(11px, 3vw, 14px)",
                        padding: "clamp(4px, 1.5vw, 12px) clamp(2px, 1vw, 8px)",
                        whiteSpace: "normal",
                        wordBreak: "break-word",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {visibleUploads.length ? (
                  <>
                    {visibleUploads.map((row, index) => (
                      <tr
                        key={`${row.study_id}-${index}`}
                        className="border-b border-white/20 bg-[#040A16] hover:bg-[#0D1A2D] transition-colors"
                      >
                        {[
                          index + 1,
                          row.patient_name,
                          row.accession || "—",
                          row.mrn       || "—",
                          row.modality  || "—",
                        ].map((cell, ci) => (
                          <td
                            key={ci}
                            className="text-center"
                            style={{
                              fontSize:     "clamp(11px, 3vw, 14px)",
                              padding:      "clamp(4px, 1.5vw, 12px) clamp(2px, 1vw, 8px)",
                              whiteSpace:   "normal",
                              wordBreak:    "break-word",
                              overflowWrap: "anywhere",
                            }}
                          >
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}

                    {hasMore && (
                      <tr ref={sentinelRef} className="border-b border-white/20 bg-[#040A16]">
                        <td colSpan={5} className="text-center py-3">
                          <div className="inline-flex items-center gap-2 text-gray-400" style={{ fontSize: "clamp(11px, 3vw, 13px)" }}>
                            <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                            Loading more…
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ) : (
                  <tr className="border-b border-white/20 bg-[#040A16]">
                    <td colSpan={5} className="text-center" style={{ fontSize: "clamp(11px, 3vw, 14px)", padding: "clamp(4px, 1.5vw, 12px)" }}>
                      No uploads yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </section>
  );
};

export default HomeTech;