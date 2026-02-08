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

const MedicalReportDocument = ({ 
  reportText 
}: { 
  reportText: string;
}) => {
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
        <Text style={styles.content}>{reportText || 'No report content'}</Text>

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
  
  const accessionId = searchParams.get("accession_id");
  
  const [reportText, setReportText] = useState("");
  const [loading, setLoading] = useState(true);

  // ✅ جلب التقرير النصي فقط من قاعدة البيانات
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
          setReportText(data.report.reportText || "");
        }
      } catch (err) {
        console.error("Error fetching report:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchReport();
  }, [accessionId]);

  const downloadPDF = async () => {
    if (!reportText) {
      alert("No report available");
      return;
    }

    try {
      const blob = await pdf(
        <MedicalReportDocument 
          reportText={reportText}
        />
      ).toBlob();
      
      saveAs(blob, `medical-report-${accessionId}.pdf`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("PDF Error:", err);
      alert("Error generating PDF: " + msg);
    }
  };

  return (
    <div className="page-container">
      <header className="show-report-header">
        <button className="btn-back" onClick={() => router.back()}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path fill="currentColor" d="m7.825 13l4.9 4.9q.3.3.288.7t-.313.7q-.3.275-.7.288t-.7-.288l-6.6-6.6q-.15-.15-.213-.325T4.426 12t.063-.375t.212-.325l6.6-6.6q-.275-.275.688-.275t.712.275q.3.3.3.713t-.3.712L7.825 11H19q.425 0 .713.288T20 12t-.288.713T19 13z"/>
          </svg>
        </button>
        <button
          className="btn-download"
          onClick={downloadPDF}
          disabled={loading || !reportText}
        >
          {loading ? "Loading..." : "Download PDF"}
        </button>
      </header>

      <div className="content-card">
        <div className="report-inner-card">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '20px' }}>Loading...</div>
          ) : (
            <Report />
          )}
        </div>
      </div>

      <div className="section-shrink">
        <Footer />
      </div>
    </div>
  );
};

export default ShowReport;