"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import Report from "./Report";
import Footer from "./Footer";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  pdf,
} from "@react-pdf/renderer";
import { saveAs } from "file-saver";

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 11,
    fontFamily: "Helvetica",
  },
  header: {
    marginBottom: 20,
    borderBottom: "2pt solid #2563eb",
    paddingBottom: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    color: "#1e40af",
  },
  line: {
    borderBottom: "0.5pt solid #000",
    marginVertical: 10,
  },
  date: {
    fontSize: 10,
    color: "#475569",
    marginTop: 15,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#1e40af",
    marginTop: 15,
    marginBottom: 10,
  },
  content: {
    fontSize: 11,
    lineHeight: 1.6,
    textAlign: "justify",
    color: "#1e293b",
  },
  footer: {
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
    fontSize: 8,
    color: "#64748b",
    textAlign: "center",
  },
});

const MedicalReportDocument = ({ reportText }: { reportText: string }) => {
  const today = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Medical Report</Text>
        </View>

        <Text style={styles.date}>Date: {today}</Text>

        <Text style={styles.sectionTitle}>Report Details:</Text>

        <Text style={styles.content}>{reportText}</Text>

        <Text
          style={styles.footer}
          render={({ pageNumber, totalPages }) =>
            `Page ${pageNumber} of ${totalPages}`
          }
          fixed
        />
      </Page>
    </Document>
  );
};

const ShowReport = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // ✅ تغيير: من study_id إلى accession_id
  const accessionId = searchParams.get("accession_id");
  
  // ✅ state للتقرير
  const [reportText, setReportText] = useState("");

  // 🔍 DEBUG: Log when component renders
  console.log("🔄 DEBUG: ShowReport component rendered");
  console.log("🆔 DEBUG: Current accession_id:", accessionId || "NOT FOUND");
  console.log("📄 DEBUG: Current reportText length:", reportText.length);

  // ✅ جلب التقرير من Database
  useEffect(() => {
    const fetchReport = async () => {
      // 🔍 DEBUG: Check if accession_id exists
      if (!accessionId) {
        console.log("❌ DEBUG: No accession_id found in URL");
        return;
      }
      
      console.log("🔍 DEBUG: Fetching report for accession_id:", accessionId);
      
      try {
        const response = await fetch(`/api/reports?accession_id=${accessionId}`);
        
        console.log("📡 DEBUG: Response status:", response.status);
        
        const data = await response.json();
        
        console.log("📦 DEBUG: API Response data:", data);
        
        if (data.status === "ok" && data.report) {
          console.log("✅ DEBUG: Report found!");
          console.log("📝 DEBUG: Report text length:", data.report.reportText?.length || 0);
          console.log("👨‍⚕️ DEBUG: Doctor name:", data.report.doctorName);
          console.log("👤 DEBUG: Patient name:", data.report.patientName);
          console.log("📅 DEBUG: Exam date:", data.report.examDate);
          
          setReportText(data.report.reportText || "");
        } else {
          console.log("⚠️ DEBUG: No report found in response");
          console.log("💭 DEBUG: Possible reasons:");
          console.log("   - Report not created yet");
          console.log("   - Wrong accession_id");
          console.log("   - Database issue");
        }
      } catch (error) {
        console.error("💥 DEBUG: Error fetching report:", error);
      }
    };
    
    fetchReport();
  }, [accessionId]);

  // ✅ تحميل PDF
  const downloadPDF = async () => {
    if (!reportText) {
      console.log("⚠️ DEBUG: Cannot download - no report text available");
      alert("No report available to download");
      return;
    }

    console.log("📥 DEBUG: Starting PDF download for accession:", accessionId);
    
    const blob = await pdf(
      <MedicalReportDocument reportText={reportText} />,
    ).toBlob();
    saveAs(blob, `medical-report-accession-${accessionId}.pdf`);
    
    console.log("✅ DEBUG: PDF download initiated");
  };

  return (
    <div className="page-container">
      <header className="show-report-header">
        <button
          className="btn-back"
          onClick={() => router.back()}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
          >
            <path
              fill="currentColor"
              d="m7.825 13l4.9 4.9q.3.3.288.7t-.313.7q-.3.275-.7.288t-.7-.288l-6.6-6.6q-.15-.15-.213-.325T4.426 12t.063-.375t.212-.325l6.6-6.6q-.275-.275.688-.275t.712.275q.3.3.3.713t-.3.712L7.825 11H19q.425 0 .713.288T20 12t-.288.713T19 13z"
            />
          </svg>
        </button>
        <button
          className="btn-download"
          onClick={downloadPDF}
        >
          Download
        </button>
      </header>

      <div className="content-card">
        <div className="report-inner-card">
          <Report />
        </div>
      </div>

      <div className="section-shrink">
        <Footer />
      </div>
    </div>
  );
};

export default ShowReport;