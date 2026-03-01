"use client";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { ReportData, PatientInfo, DoctorInfo } from "@/components/DownloadPDF";
import PDFPreview from "@/components/PDFPreview";

const convertHtmlToFormattedText = (html: string): string => {
  if (!html) return "";
  
  let text = html;
  
  text = text.replace(/<ol[^>]*>([\s\S]*?)<\/ol>/gi, (match, content) => {
    let counter = 1;
    const items = content.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, (_: any, item: string) => {
      const cleanItem = item.replace(/<[^>]*>/g, '').trim();
      return `${counter++}. ${cleanItem}\n`;
    });
    return `\n${items}`;
  });
  
  text = text.replace(/<ul[^>]*>([\s\S]*?)<\/ul>/gi, (match, content) => {
    const items = content.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, (_: any, item: string) => {
      const cleanItem = item.replace(/<[^>]*>/g, '').trim();
      return `• ${cleanItem}\n`;
    });
    return `\n${items}`;
  });
  
  text = text.replace(/<h[1-6][^>]*>([\s\S]*?)<\/h[1-6]>/gi, (match, content) => `\n${content.trim()}\n`);
  text = text.replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, (match, content) => `${content.trim()}\n\n`);
  text = text.replace(/<br\s*\/?>/gi, '\n');
  text = text.replace(/<[^>]*>/g, '');
  text = text
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
  text = text.replace(/\n{3,}/g, '\n\n');
  
  return text.trim();
};

const ShowReport = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const accessionId = searchParams.get("accession_id");

  const [reportData, setReportData] = useState<ReportData>({
    bodyPart: "",
    clinicalIndication: "",
    technique: "",
    finding: "",
    impression: "",
    imageUrl: null,
  });
  const [patientInfo, setPatientInfo] = useState<PatientInfo | null>(null);
  const [doctorInfo, setDoctorInfo] = useState<DoctorInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      if (!accessionId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        const response = await fetch(`/api/reports?accession_id=${accessionId}`);
        const data = await response.json();

        if (data.status === "ok" && data.report) {
          const report = data.report;

          let autosaveData = null;
          if (report.autosave_text) {
            try {
              autosaveData = JSON.parse(report.autosave_text);
            } catch (e) {
              console.error("Error parsing autosave_text:", e);
            }
          }

          if (autosaveData) {
            setReportData({
              bodyPart: convertHtmlToFormattedText(autosaveData.body_part || ""),
              clinicalIndication: convertHtmlToFormattedText(autosaveData.clinical_indication || ""),
              technique: convertHtmlToFormattedText(autosaveData.technique || ""),
              finding: convertHtmlToFormattedText(autosaveData.finding || ""),
              impression: convertHtmlToFormattedText(autosaveData.impression || ""),
              imageUrl: null,
            });
          }

          if (report.images) {
            try {
              const imagesData =
                typeof report.images === "string" ? JSON.parse(report.images) : report.images;
              if (imagesData?.imageUrl) {
                const fullUrl = imagesData.imageUrl.startsWith("http")
                  ? imagesData.imageUrl
                  : `${window.location.origin}${imagesData.imageUrl}`;
                setReportData((prev) => ({ ...prev, imageUrl: fullUrl }));
              }
            } catch (e) {
              console.error("Error parsing images:", e);
            }
          }
        }

        try {
          const patientRes = await fetch(`/api/patients/info?accession_id=${accessionId}`);
          const patientData = await patientRes.json();
          if (patientData.status === "ok" && patientData.patient) {
            setPatientInfo(patientData.patient);
          }
        } catch (err) {
          console.error("Error fetching patient info:", err);
        }

        try {
          const doctorRes = await fetch(`/api/doctor/info?accession_id=${accessionId}`);
          const doctorData = await doctorRes.json();
          if (doctorData.status === "ok" && doctorData.doctor) {
            if (doctorData.doctor.signaturePath) {
              doctorData.doctor.signaturePath = `${window.location.origin}/api/signatures/${doctorData.doctor.signaturePath}`;
            }
            setDoctorInfo(doctorData.doctor);
          }
        } catch (err) {
          console.error("Error fetching doctor info:", err);
        }

      } catch (err) {
        console.error("Error fetching report:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [accessionId]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-[#040A16] flex items-center justify-center">
        <div className="text-center text-white">
          <div
            style={{
              border: "4px solid #f3f3f3",
              borderTop: "4px solid #2563eb",
              borderRadius: "50%",
              width: 40,
              height: 40,
              animation: "spin 1s linear infinite",
              margin: "0 auto",
            }}
          />
          <p className="mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <PDFPreview
      reportData={reportData}
      patientInfo={patientInfo}
      doctorInfo={doctorInfo}
      role="patient"
      accessionId={accessionId ?? undefined}
      onBack={() => router.push("/patients")}
    />
  );
};

export default ShowReport;