export interface ReportData {
  body_part: string;
  clinical_indication: string;
  technique: string;
  finding: string;
  impression: string;
}

export interface SavedReportData extends ReportData {
  report_status: string;
  reportText?: string;
  images?: any;
}

// Removes all HTML tags from a string - used when a field should show plain text only
export const stripHtmlTags = (html: string): string => {
  if (!html) return "";
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
};

// Fetches the report from the database using the accession ID.
// We check autosave_text first because it holds the most recent structured
// content saved automatically by the editor (stored as JSON).
// If autosave_text is missing, we fall back to report_text which is an older
// format that stored the entire report as one plain-text block.
export const fetchReport = async (accessionId: string) => {
  console.log(' fetchReport called for accessionId:', accessionId);
  
  const response = await fetch(`/api/reports?accession_id=${accessionId}`);
  const data = await response.json();

  console.log(' API Response:', data);

  if (data.status !== "ok" || !data.report) {
    console.log(' No report found in API response');
    return null;
  }

  const report = data.report;
  console.log(' Report object:', report);
  
  let autosaveData = null;
  if (report.autosave_text) {
    try {
      if (typeof report.autosave_text === 'string') {
        autosaveData = JSON.parse(report.autosave_text);
        console.log(' Parsed autosave_text from string:', autosaveData);
      } else {
        autosaveData = report.autosave_text;
        console.log(' Autosave_text is already object:', autosaveData);
      }
    } catch (e) {
      console.error(" Error parsing autosave_text:", e);
      console.log('Raw autosave_text:', report.autosave_text);
    }
  } else {
    console.log('No autosave_text found in report');
  }

  let bodyPartContent = "";
  let clinicalIndicationContent = "";
  let techniqueContent = "";
  let findingContent = "";
  let impressionContent = "";
  let imageUrl = null;
  let imageAlreadyCaptured = false;

  if (autosaveData) {
    console.log('Using autosave data');
    bodyPartContent            = autosaveData.body_part || "";
    clinicalIndicationContent  = autosaveData.clinical_indication || "";
    techniqueContent           = autosaveData.technique || "";
    findingContent             = autosaveData.finding || "";
    impressionContent          = autosaveData.impression || "";
    console.log('Body Part from autosave:', bodyPartContent);
    console.log('Clinical Indication from autosave:', clinicalIndicationContent);
  } 
  else if (report.reportText || report.report_text) {
    // Older reports stored everything as one big text block - extract each section by name
    console.log('No autosave data, trying to extract from report_text');
    const reportText = report.reportText || report.report_text;
    
    const extractSection = (sectionName: string): string => {
      const regex = new RegExp(
        `${sectionName}:\\s*([\\s\\S]*?)(?=\\n(?:Body Part|Clinical Indication|Technique|Finding|Impression):|$)`, 
        'i'
      );
      const match = reportText.match(regex);
      const extracted = match ? match[1].trim() : "";
      console.log(`Extracted ${sectionName}:`, extracted);
      return extracted;
    };
    
    bodyPartContent            = stripHtmlTags(extractSection("Body Part"));
    clinicalIndicationContent  = extractSection("Clinical Indication");
    techniqueContent           = extractSection("Technique");
    findingContent             = extractSection("Finding");
    impressionContent          = extractSection("Impression");
  } else {
    console.log(' No reportText or autosave_text found');
  }

  // If a scan screenshot was previously attached, load its URL
  if (report.images) {
    try {
      let imagesData;
      if (typeof report.images === 'string') {
        imagesData = JSON.parse(report.images);
      } else {
        imagesData = report.images;
      }
      if (imagesData && imagesData.imageUrl) {
        imageUrl = imagesData.imageUrl;
        imageAlreadyCaptured = true;
        console.log('Image found:', imageUrl);
      }
    } catch (e) {
      console.error("Error parsing images:", e);
    }
  }

  const result = {
    bodyPart: bodyPartContent,
    clinicalIndication: clinicalIndicationContent,
    technique: techniqueContent,
    finding: findingContent,
    impression: impressionContent,
    reportStatus: report.report_status || "Draft",
    reportText: report.reportText || report.report_text || "",
    imageUrl,
    imageAlreadyCaptured,
  };
  
  console.log('Returning fetched report data:', result);
  return result;
};

// Saves the current editor content as a draft - called automatically every 10 seconds
// and whenever the doctor leaves a field
export const saveDraft = async (
  accessionId: string,
  data: ReportData,
  currentStatus: string
) => {
  console.log('Saving draft...', { accessionId, data, currentStatus });
  const response = await fetch("/api/reports/autosave-draft", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      accession_id: accessionId,
      body_part: data.body_part,
      clinical_indication: data.clinical_indication,
      technique: data.technique,
      finding: data.finding,
      impression: data.impression,
      current_status: currentStatus,
    }),
  });
  const result = await response.json();
  console.log('Draft save result:', result);
  return result;
};

// Saves the report as "completed" — called when the doctor confirms the PDF preview
export const saveFinal = async (accessionId: string, data: ReportData) => {
  console.log('Saving final report...', { accessionId, data });
  const response = await fetch("/api/reports/save-final", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      accession_id: accessionId,
      body_part: data.body_part,
      clinical_indication: data.clinical_indication,
      technique: data.technique,
      finding: data.finding,
      impression: data.impression,
    }),
  });
  const result = await response.json();
  console.log('Final save result:', result);
  return result;
};