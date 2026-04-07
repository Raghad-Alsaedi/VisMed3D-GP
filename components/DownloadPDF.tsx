import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
  pdf,
  Font,
} from "@react-pdf/renderer";

// Register the Amiri font so Arabic text in the PDF header renders correctly.
// We load both regular and bold weights from Google Fonts CDN.
Font.register({
  family: 'Amiri',
  fonts: [
    {
      src: 'https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/amiri/Amiri-Regular.ttf',
      fontWeight: 400,
    },
    {
      src: 'https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/amiri/Amiri-Bold.ttf',
      fontWeight: 700,
    },
  ]
});

// All PDF styles are defined once here and referenced throughout the document.
// react-pdf uses its own layout engine (not CSS), so styles are written as JS objects.
const styles = StyleSheet.create({
  page: {
    padding: 40,
    paddingTop: 35,
    fontSize: 9,
    fontFamily: "Helvetica",
    backgroundColor: "#ffffff",
  },
  hospitalHeader: {
    marginBottom: 5,
    paddingBottom: 8,
    borderBottom: "2pt solid #17387C",
  },
  hospitalInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  hospitalInfoLeft: {
    flex: 1,
    alignItems: "flex-start",
    paddingRight: 10,
  },
  logoContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
  },
  hospitalLogo: {
    width: 90,
    height: 90,
    objectFit: "contain",
  },
  hospitalInfoRight: {
    flex: 1,
    alignItems: "flex-end",
    paddingLeft: 10,
  },
  universityNameArabic: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#17387C",
    marginBottom: 2,
    fontFamily: "Amiri",
    textAlign: "right",
  },
  hospitalNameArabic: {
    fontSize: 11.5,
    color: "#2c3e50",
    marginBottom: 1,
    fontFamily: "Amiri",
    textAlign: "right",
    lineHeight: 1.3,
  },
  departmentArabic: {
    fontSize: 10,
    color: "#6c757d",
    fontFamily: "Amiri",
    textAlign: "right",
  },
  universityNameEnglish: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#17387C",
    marginBottom: 2,
    textAlign: "left",
  },
  hospitalNameEnglish: {
    fontSize: 11.5,
    color: "#2c3e50",
    marginBottom: 1,
    textAlign: "left",
    lineHeight: 1.3,
  },
  departmentEnglish: {
    fontSize: 10,
    color: "#6c757d",
    textAlign: "left",
  },
  patientSection: {
    marginTop: 5,
    marginBottom: 8,
  },
  patientInfoGrid: {
    display: "flex",
    flexDirection: "row",
    borderBottom: "1pt solid #dee2e6",
    paddingBottom: 8,
    paddingTop: 2,
  },
  infoColumn: {
    flex: 1,
    paddingRight: 10,
    borderRight: "1pt solid #dee2e6",
  },
  doctorColumn: {
    flex: 1,
    paddingHorizontal: 10,
    borderRight: "1pt solid #dee2e6",
  },
  dateColumn: {
    flex: 1,
    paddingLeft: 10,
  },
  patientName: {
    fontSize: 13,
    fontWeight: "bold",
    fontFamily: "Helvetica-Bold",
    color: "#17387C",
    marginBottom: 2,
  },
  patientAge: {
    fontSize: 10,
    color: "#495057",
    marginBottom: 1,
  },
  patientGender: {
    fontSize: 9,
    color: "#6c757d",
  },
  doctorName: {
    fontSize: 13,
    fontWeight: "bold",
    fontFamily: "Helvetica-Bold",
    color: "#17387C",
    marginBottom: 2,
  },
  doctorLicenseSmall: {
    fontSize: 9,
    color: "#6c757d",
  },
  dateText: {
    fontSize: 10,
    color: "#495057",
    marginBottom: 2,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#17387C",
    marginTop: 8,
    marginBottom: 3,
    textTransform: "uppercase",
    borderBottom: "0.5pt solid #dee2e6",
    paddingBottom: 2,
  },
  sectionContent: {
    fontSize: 10,
    lineHeight: 1.5,
    color: "#212529",
    marginBottom: 8,
    textAlign: "justify",
  },
  paragraph: {
    fontSize: 10,
    lineHeight: 1.5,
    color: "#212529",
    marginBottom: 6,
    textAlign: "justify",
  },
  boldText: {
    fontFamily: "Helvetica-Bold",
    fontWeight: "bold",
  },
  italicText: {
    fontFamily: "Helvetica-Oblique",
    fontStyle: "italic",
  },
  underlineText: {
    textDecoration: "underline",
  },
  listItem: {
    fontSize: 10,
    lineHeight: 1.5,
    color: "#212529",
    marginBottom: 3,
    marginLeft: 15,
    flexDirection: "row",
  },
  listBullet: {
    width: 15,
    fontSize: 10,
  },
  listContent: {
    flex: 1,
    fontSize: 10,
    lineHeight: 1.5,
  },
  imageContainer: {
    marginTop: 8,
    marginBottom: 8,
    alignItems: "center",
    width: "100%",
  },
  image: {
    width: "40%",
    height: "auto",
    objectFit: "contain",
  },
  footerSection: {
    marginTop: 15,
    paddingTop: 12,
    borderTop: "1.5pt solid #17387C",
  },
  doctorInfo: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "flex-start",
  },
  signatureContainer: {
    alignItems: "center",
    minWidth: 140,
  },
  signatureImage: {
    width: 110,
    height: 55,
    marginBottom: 2,
  },
  signatureLine: {
    width: 110,
    borderTop: "1pt solid #17387C",
    marginBottom: 5,
  },
  signatureNameBelow: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#17387C",
    textAlign: "center",
    marginBottom: 1,
  },
  signatureSpecialtyBelow: {
    fontSize: 9,
    color: "#495057",
    textAlign: "center",
  },
  pageFooter: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    borderTop: "0.5pt solid #dee2e6",
    paddingTop: 10,
  },
  footerContact: {
    fontSize: 8,
    color: "#6c757d",
    textAlign: "center",
    marginBottom: 4,
  },
  pageNumber: {
    fontSize: 8,
    color: "#6c757d",
    textAlign: "center",
  },
});

// Interfaces shared with other files that need to pass doctor/patient data to the PDF.
export interface ReportData {
  bodyPart: string;
  clinicalIndication: string;
  technique: string;
  finding: string;
  impression: string;
  imageUrl?: string | null;
}

export interface PatientInfo {
  fullName: string;
  medicalRecordNumber: string;
  nationalId: string;
  age: number;
  gender: string;
  examDate: string;
}

export interface DoctorInfo {
  fullName: string;
  specialty: string;
  licenseNumber: string;
  signaturePath: string | null;
}

// Converts the HTML saved by the Tiptap editor into react-pdf elements.
// react-pdf cannot render HTML directly, so we parse it manually:
// ordered lists, unordered lists, and paragraphs with bold/italic inline styles.
const parseHtmlToReactPdf = (html: string) => {
  if (!html) return null;

  // Decode common HTML entities back to plain characters before processing.
  let cleanHtml = html
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");

  const elements: React.ReactElement[] = [];
  let key = 0;

  // Extract ordered lists (<ol>) first and replace them with placeholders,
  // so they don't get picked up again during paragraph parsing below.
  const olRegex = /<ol[^>]*>([\s\S]*?)<\/ol>/gi;
  let olMatch;
  while ((olMatch = olRegex.exec(cleanHtml)) !== null) {
    const listContent = olMatch[1];
    const items: React.ReactElement[] = [];
    let counter = 1;
    const liRegex = /<li[^>]*>([\s\S]*?)<\/li>/gi;
    let liMatch;
    while ((liMatch = liRegex.exec(listContent)) !== null) {
      const itemContent = liMatch[1].replace(/<[^>]*>/g, '').trim();
      items.push(
        <View key={`ol-${key++}`} style={styles.listItem}>
          <Text style={styles.listBullet}>{counter++}.</Text>
          <Text style={styles.listContent}>{itemContent}</Text>
        </View>
      );
    }
    elements.push(
      <View key={`ol-container-${key++}`} style={{ marginBottom: 6 }}>
        {items}
      </View>
    );
    cleanHtml = cleanHtml.replace(olMatch[0], `%%OL_PLACEHOLDER_${key}%%`);
  }

  // Extract unordered lists (<ul>) and replace them with placeholders as well.
  const ulRegex = /<ul[^>]*>([\s\S]*?)<\/ul>/gi;
  let ulMatch;
  while ((ulMatch = ulRegex.exec(cleanHtml)) !== null) {
    const listContent = ulMatch[1];
    const items: React.ReactElement[] = [];
    const liRegex = /<li[^>]*>([\s\S]*?)<\/li>/gi;
    let liMatch;
    while ((liMatch = liRegex.exec(listContent)) !== null) {
      const itemContent = liMatch[1].replace(/<[^>]*>/g, '').trim();
      items.push(
        <View key={`ul-${key++}`} style={styles.listItem}>
          <Text style={styles.listBullet}>•</Text>
          <Text style={styles.listContent}>{itemContent}</Text>
        </View>
      );
    }
    elements.push(
      <View key={`ul-container-${key++}`} style={{ marginBottom: 6 }}>
        {items}
      </View>
    );
    cleanHtml = cleanHtml.replace(ulMatch[0], `%%UL_PLACEHOLDER_${key}%%`);
  }

  // Split the remaining HTML into paragraphs and process inline formatting
  // (bold, italic) within each paragraph.
  const paragraphs = cleanHtml.split(/<\/p>|<br\s*\/?>/i).filter(p => p.trim());
  paragraphs.forEach((para, index) => {
    let content = para.replace(/<p[^>]*>/i, '').trim();
    if (!content || content.startsWith('%%')) return;

    const parts: React.ReactElement[] = [];
    let tempKey = 0;

    const boldRegex = /<(strong|b)[^>]*>([\s\S]*?)<\/(strong|b)>/gi;
    let lastIndex = 0;
    let match;

    // Recursively handles italic and underline styles that may be nested inside bold tags.
    const processText = (text: string, isBold = false, isItalic = false, isUnderline = false) => {
      if (!text) return;
      if (/<(em|i)[^>]*>/i.test(text)) {
        const italicRegex = /<(em|i)[^>]*>([\s\S]*?)<\/(em|i)>/gi;
        let italicLastIndex = 0;
        let italicMatch;
        while ((italicMatch = italicRegex.exec(text)) !== null) {
          if (italicMatch.index > italicLastIndex) {
            const beforeText = text.substring(italicLastIndex, italicMatch.index).replace(/<[^>]*>/g, '');
            if (beforeText) {
              parts.push(
                <Text key={`text-${tempKey++}`} style={isBold ? styles.boldText : undefined}>
                  {beforeText}
                </Text>
              );
            }
          }
          const italicText = italicMatch[2].replace(/<[^>]*>/g, '');
          const combinedStyle: any[] = [];
          if (isBold) combinedStyle.push(styles.boldText);
          combinedStyle.push(styles.italicText);
          parts.push(
            <Text key={`italic-${tempKey++}`} style={combinedStyle}>
              {italicText}
            </Text>
          );
          italicLastIndex = italicRegex.lastIndex;
        }
        if (italicLastIndex < text.length) {
          const remainingText = text.substring(italicLastIndex).replace(/<[^>]*>/g, '');
          if (remainingText) {
            parts.push(
              <Text key={`text-${tempKey++}`} style={isBold ? styles.boldText : undefined}>
                {remainingText}
              </Text>
            );
          }
        }
      } else {
        const cleanText = text.replace(/<[^>]*>/g, '');
        if (cleanText) {
          const style: any[] = [];
          if (isBold) style.push(styles.boldText);
          if (isItalic) style.push(styles.italicText);
          if (isUnderline) style.push(styles.underlineText);
          parts.push(
            <Text key={`text-${tempKey++}`} style={style.length > 0 ? style : undefined}>
              {cleanText}
            </Text>
          );
        }
      }
    };

    while ((match = boldRegex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        processText(content.substring(lastIndex, match.index));
      }
      processText(match[2], true);
      lastIndex = boldRegex.lastIndex;
    }
    if (lastIndex < content.length) {
      processText(content.substring(lastIndex));
    }
    if (parts.length > 0) {
      elements.push(
        <Text key={`para-${index}`} style={styles.paragraph}>
          {parts}
        </Text>
      );
    }
  });

  return elements.length > 0 ? <View>{elements}</View> : <Text style={styles.sectionContent}>{html}</Text>;
};

// The main PDF document component.
// Renders the full A4 report: hospital header, patient/doctor info, all report sections,
// the attached scan image (if any), doctor signature, and a page footer.
export const MedicalReportDocument = ({
  reportData,
  patientInfo,
  doctorInfo,
}: {
  reportData: ReportData;
  patientInfo: PatientInfo | null;
  doctorInfo: DoctorInfo | null;
}) => {
  const today = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Build the full URL for the doctor's signature image.
  // Handles three cases: already a full URL, a relative /api/ path, or just a filename.
  let signatureFullUrl: string | null = null;
  if (doctorInfo?.signaturePath) {
    const signaturePath = doctorInfo.signaturePath;
    if (signaturePath.startsWith('http://') || signaturePath.startsWith('https://')) {
      signatureFullUrl = signaturePath;
    } else if (signaturePath.startsWith('/api/')) {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
      signatureFullUrl = `${baseUrl}${signaturePath}`;
    } else {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
      signatureFullUrl = `${baseUrl}/api/signatures/${signaturePath}`;
    }
  }

  return (
    <Document>
      <Page size="A4" style={styles.page}>

        {/* HOSPITAL HEADER */}
        <View style={styles.hospitalHeader}>
          <View style={styles.hospitalInfoRow}>
            <View style={styles.hospitalInfoLeft}>
              <Text style={styles.universityNameEnglish}>Taibah University</Text>
              <Text style={styles.hospitalNameEnglish}>Madinah - University Medical Center</Text>
              <Text style={styles.departmentEnglish}>Department of Radiology and Medical Imaging</Text>
            </View>
            <View style={styles.logoContainer}>
              <Image src="/tu.jpg" style={styles.hospitalLogo} />
            </View>
            <View style={styles.hospitalInfoRight}>
              <Text style={styles.universityNameArabic}>جامعة طيبة</Text>
              <Text style={styles.hospitalNameArabic}>المدينة المنورة - المركز الطبي الجامعي</Text>
              <Text style={styles.departmentArabic}>قسم الأشعة والتصوير الطبي</Text>
            </View>
          </View>
        </View>

        {/* PATIENT INFORMATION — only rendered if both patient and doctor data are available */}
        {patientInfo && doctorInfo && (
          <View style={styles.patientSection}>
            <View style={styles.patientInfoGrid}>
              <View style={styles.infoColumn}>
                <Text style={styles.patientName}>{patientInfo.fullName}</Text>
                <Text style={styles.patientAge}>Age: {patientInfo.age} years</Text>
                <Text style={styles.patientGender}>Gender: {patientInfo.gender}</Text>
              </View>
              <View style={styles.doctorColumn}>
                <Text style={styles.doctorName}>Dr. {doctorInfo.fullName}</Text>
                <Text style={styles.doctorLicenseSmall}>License No: {doctorInfo.licenseNumber}</Text>
              </View>
              <View style={styles.dateColumn}>
                <Text style={styles.dateText}>Examination Date: {patientInfo.examDate}</Text>
                <Text style={styles.dateText}>Report Date: {today}</Text>
              </View>
            </View>
          </View>
        )}

        {/* REPORT CONTENT — each section is only rendered if it has content */}
        {reportData.bodyPart && (
          <View>
            <Text style={styles.sectionTitle}>Body Part</Text>
            {parseHtmlToReactPdf(reportData.bodyPart)}
          </View>
        )}
        {reportData.clinicalIndication && (
          <View>
            <Text style={styles.sectionTitle}>Clinical Indication</Text>
            {parseHtmlToReactPdf(reportData.clinicalIndication)}
          </View>
        )}
        {reportData.technique && (
          <View>
            <Text style={styles.sectionTitle}>Technique</Text>
            {parseHtmlToReactPdf(reportData.technique)}
          </View>
        )}
        {reportData.finding && (
          <View>
            <Text style={styles.sectionTitle}>Findings</Text>
            {parseHtmlToReactPdf(reportData.finding)}
          </View>
        )}
        {reportData.impression && (
          <View>
            <Text style={styles.sectionTitle}>Impression</Text>
            {parseHtmlToReactPdf(reportData.impression)}
          </View>
        )}

        {/* ATTACHED SCAN IMAGE — only shown if the doctor captured a screenshot */}
        {reportData.imageUrl && (
          <View style={styles.imageContainer}>
            <Image src={reportData.imageUrl} style={styles.image} />
          </View>
        )}

        {/* DOCTOR SIGNATURE — shows the signature image if available, otherwise a placeholder */}
        {doctorInfo && (
          <View style={styles.footerSection}>
            <View style={styles.doctorInfo}>
              <View style={styles.signatureContainer}>
                {signatureFullUrl ? (
                  <Image src={signatureFullUrl} style={styles.signatureImage} />
                ) : (
                  <View style={{ height: 55, width: 110 }}>
                    <Text style={{ fontSize: 8, color: '#999', textAlign: 'center' }}>
                      No signature
                    </Text>
                  </View>
                )}
                <View style={styles.signatureLine} />
                <Text style={styles.signatureNameBelow}>Dr. {doctorInfo.fullName}</Text>
                <Text style={styles.signatureSpecialtyBelow}>{doctorInfo.specialty}</Text>
              </View>
            </View>
          </View>
        )}

        {/* PAGE FOOTER — fixed at the bottom of every page, shows contact info and page number */}
        <View style={styles.pageFooter} fixed>
          <Text style={styles.footerContact}>
            King Faisal Road, Al-Madinah Al-Munawwarah 42351, Saudi Arabia | Tel: +966 14 861 8888 | Email: info@taibahmed.sa | Website: www.taibahmed.edu.sa
          </Text>
          <Text
            style={styles.pageNumber}
            render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
          />
        </View>

      </Page>
    </Document>
  );
};

// Generates the report as a downloadable PDF
// Called when the patient clicks the download button in PDFPreview
export async function generateMedicalReportPDF(
  reportData: ReportData,
  patientInfo: PatientInfo | null,
  doctorInfo: DoctorInfo | null
): Promise<Blob> {
  const blob = await pdf(
    <MedicalReportDocument
      reportData={reportData}
      patientInfo={patientInfo}
      doctorInfo={doctorInfo}
    />
  ).toBlob();
  return blob;
}