"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

type Tech = {
  id: number | string;
  userName: string;
  firstName: string;
  lastName: string;
  gender: "male" | "female" | null;
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
  const [uploads, setUploads] = useState<UploadRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      try {
        // 1) بيانات الفني
        const meRes = await fetch("/api/technician/me");
        if (!meRes.ok) throw new Error("Failed to load technician profile");
        const meData = await meRes.json();
        setTech(meData.tech);

        // 2) آخر الرفع
        const upRes = await fetch("/api/technician/recent-uploads");
        if (!upRes.ok) throw new Error("Failed to load recent uploads");
        const upData = await upRes.json();
        setUploads(upData.uploads || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    if (status !== "loading") run();
  }, [status]);

  if (loading) {
    return (
      <section className="bg-[#0D1A2D] min-h-screen p-8 pl-[250px] md:pl-[270px] text-white">
        Loading...
      </section>
    );
  }

  const fullName = tech ? `${tech.firstName} ${tech.lastName}` : "Technician";
  const imgSrc = tech?.profile_image_url || "/rt2001.png";
  const genderText =
    tech?.gender === "male" ? "Male" : tech?.gender === "female" ? "Female" : "N/A";

  return (
    <section className="bg-[#0D1A2D] min-h-screen overflow-y-auto p-8 pl-[250px] md:pl-[270px]">
      <div className="space-y-6 max-w-[1000px] mx-auto">
        <div className="py-5 px-6 rounded-[20px] border border-[#FFFFFF]/30 bg-[#040A16]">
          <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-5 md:gap-12 text-white">
            <div className="flex flex-col items-center space-y-3">
              <div className="w-[120px] h-[120px] md:w-[140px] md:h-[140px] rounded-[8px] bg-gray-600 overflow-hidden">
                <img
                  src={imgSrc}
                  alt={fullName}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="text-center">
                <h1 className="text-base md:text-lg font-bold text-white mb-1">
                  {fullName}
                </h1>
                <p className="text-xs md:text-sm text-gray-400">
                  Radiology Technician
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 content-center pl-0">
              <Row label="Technician ID" value={tech?.technician_code || "—"} />
              <Row label="License Number" value={tech?.license_number || "—"} />
              <Row
                label="Years of Experience"
                value={tech?.years_experience?.toString() || "—"}
              />
              <Row label="Gender" value={genderText} />
              <Row label="Phone" value={tech?.phone || "—"} />
            </div>
          </div>
        </div>

        <div className="py-5 px-6 rounded-[20px] border border-[#FFFFFF]/30 bg-[#040A16]">
          <h3 className="text-white font-semibold text-lg mb-4">
            Recent Upload File
          </h3>

          <div className="overflow-x-auto border border-[#FFFFFF]/30 rounded-lg">
            <table className="w-full text-white">
              <thead className="border-b border-[#FFFFFF]/20">
                <tr>
                  <th className="py-3 px-3 text-sm md:text-base font-medium text-center">#</th>
                  <th className="py-3 px-3 text-sm md:text-base font-medium text-center">Patient_Name</th>
                  <th className="py-3 px-3 text-sm md:text-base font-medium text-center">Accession</th>
                  <th className="py-3 px-3 text-sm md:text-base font-medium text-center">MRN</th>
                  <th className="py-3 px-3 text-sm md:text-base font-medium text-center">Modality</th>
                </tr>
              </thead>

              <tbody>
                {uploads.length === 0 ? (
                  <tr className="border-b border-[#FFFFFF]/20">
                    <td className="py-3 px-3 text-sm md:text-base text-center" colSpan={5}>
                      No uploads yet
                    </td>
                  </tr>
                ) : (
                  uploads.map((row, idx) => (
                    <tr key={row.study_id} className="border-b border-[#FFFFFF]/20">
                      <td className="py-3 px-3 text-sm md:text-base text-center">{idx + 1}</td>
                      <td className="py-3 px-3 text-sm md:text-base text-center">{row.patient_name}</td>
                      <td className="py-3 px-3 text-sm md:text-base text-center">{row.accession || "—"}</td>
                      <td className="py-3 px-3 text-sm md:text-base text-center">{row.mrn || "—"}</td>
                      <td className="py-3 px-3 text-sm md:text-base text-center">{row.modality || "—"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
};

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-4">
      <span className="text-base md:text-lg text-white min-w-[150px] font-medium">
        {label}
      </span>
      <span className="text-base md:text-lg text-white">{value}</span>
    </div>
  );
}

export default HomeTech;