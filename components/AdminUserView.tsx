"use client";
import { ArrowLeft, SquarePen, Check, X, Eye, EyeOff, Search, Plus } from "lucide-react";
import { Delete } from "@/components/icons";
import { useEffect, useState, useRef } from "react";


export type UserRole = "patient" | "doctor" | "technician";

interface BaseUser {
  id: number;
  firstName: string;
  middleName?: string;
  lastName: string;
  gender: string;
  isActive: number;
  username: string;
  email: string;
  phone: string;
  profilePicture?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface PatientUser extends BaseUser {
  role: "patient";
  mrn: string;
  nationalId: string;
  dateOfBirth: string;
  doctorName?: string;
  techName?: string;
}

export interface DoctorUser extends BaseUser {
  role: "doctor";
  doctorCode: string;
  specialty: string;
  licenseNumber: string;
  yearsExperience: number;
}

export interface TechnicianUser extends BaseUser {
  role: "technician";
  technicianCode: string;
  specialty: string;
  licenseNumber: string;
  yearsExperience: number;
}

export type AnyUser = PatientUser | DoctorUser | TechnicianUser;

interface Report {
  reportId: number;
  accessionNumber: string;
  bodyPart: string;
  doctorName: string;
  modality: string;
  examDate: string;
  reportStatus: "Draft" | "completed";
  createdAt: string;
  signedAt?: string;
}

interface AssignedPatient {
  id: number;
  firstName: string;
  middleName?: string;
  lastName: string;
  gender: string;
  isActive: number;
  email: string;
  phone: string;
  profilePicture?: string;
  mrn: string;
  nationalId: string;
  dateOfBirth: string;
  assignedAt: string;
}

interface Accession {
  accessionId: number;
  accessionNumber: string;
  examDate: string;
  modality: string;
  createdAt: string;
  volumeStatus: "READY" | "PROCESSING" | "REJECTED" | "NO VOLUME";
}

interface AdminUserViewProps {
  user: AnyUser;
  onClose: () => void;
}

const tooltipStyles = `
  .dt-tooltip {
    position: absolute;
    bottom: calc(100% + 8px);
    left: 50%;
    transform: translateX(-50%);
    padding: 4px 10px;
    background: #1f2937;
    color: #ffffff;
    font-size: 11px;
    font-weight: 500;
    border-radius: 6px;
    white-space: nowrap;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.15s ease;
    box-shadow: 0 4px 12px rgba(0,0,0,0.5);
    z-index: 9999;
  }
  .dt-tooltip::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    border: 4px solid transparent;
    border-top-color: #1f2937;
  }
  .dt-group:hover .dt-tooltip { opacity: 1; }

  .custom-scroll::-webkit-scrollbar              { width: 3px; height: 3px; }
  .custom-scroll::-webkit-scrollbar-track        { background: #040A16; border-radius: 10px; }
  .custom-scroll::-webkit-scrollbar-thumb        { background: #303A46; border-radius: 10px; }
  .custom-scroll::-webkit-scrollbar-thumb:hover  { background: #4a5568; }

  @media (max-width: 480px) {
    .auv-table-wrap { overflow-x: auto !important; }
  }

  .auv-section-title { font-size: 0.85rem; }
  .auv-field-label   { font-size: 0.72rem; }
  .auv-field-value   { font-size: 0.82rem; }

  @media (min-width: 768px) and (max-width: 1023px) {
    .auv-header-title  { font-size: 1.1rem !important; }
    .auv-section-title { font-size: 0.76rem !important; }
    .auv-field-label   { font-size: 0.64rem !important; }
    .auv-field-value   { font-size: 0.76rem !important; }
    .auv-input         { font-size: 0.72rem !important; padding: 4px 8px !important; }
    .auv-select        { font-size: 0.72rem !important; padding: 4px 8px !important; }
    .auv-card          { padding: 0.9rem !important; }
    .auv-avatar-wrap   { width: 130px !important; min-width: 130px !important; flex-shrink: 0 !important; }
    .auv-avatar        { width: 100% !important; height: auto !important; aspect-ratio: 1/1; }
    .auv-badge         { font-size: 0.6rem !important; padding: 2px 7px !important; }
    .auv-row-gap       { gap: 1rem !important; }
    .auv-grid-gap      { gap: 0.65rem !important; }
    .auv-btn-text      { font-size: 0.65rem !important; }
    .auv-section-icon  { width: 12px !important; height: 12px !important; }
  }

  @media (max-width: 767px) {
    .auv-page-wrap      { padding-left: 0.5rem !important; padding-right: 0.5rem !important; padding-top: 0.6rem !important; padding-bottom: 1rem !important; }
    .auv-header-title   { font-size: 0.9rem !important; }
    .auv-card           { padding: 0.65rem !important; }
    .auv-row-gap        { gap: 0.65rem !important; }
    .auv-grid-gap       { gap: 0.45rem !important; }
    .auv-avatar-wrap    { width: 108px !important; min-width: 108px !important; flex-shrink: 0 !important; }
    .auv-avatar         { width: 100% !important; height: 130px !important; aspect-ratio: unset !important; }
    .auv-avatar-initials{ font-size: 1.2rem !important; }
    .auv-section-title  { font-size: 0.65rem !important; }
    .auv-field-label    { font-size: 0.58rem !important; }
    .auv-field-value    { font-size: 0.67rem !important; white-space: nowrap !important; overflow: hidden !important; text-overflow: ellipsis !important; }
    .auv-input          { font-size: 0.64rem !important; padding: 3px 6px !important; }
    .auv-select         { font-size: 0.64rem !important; padding: 3px 6px !important; }
    .auv-badge          { font-size: 0.52rem !important; padding: 1px 5px !important; }
    .auv-btn-text       { font-size: 0.58rem !important; }
    .auv-section-icon   { width: 10px !important; height: 10px !important; }
    .auv-personal-grid  { grid-template-columns: repeat(3, 1fr) !important; gap: 0.35rem 0.45rem !important; }
    .auv-medical-grid   { grid-template-columns: 1fr !important; gap: 0.38rem !important; }
    .auv-account-grid   { grid-template-columns: 1fr !important; gap: 0.38rem !important; }
    .auv-row2-grid      { grid-template-columns: repeat(2, 1fr) !important; gap: 0.5rem !important; }
    .auv-search-input   { font-size: 0.65rem !important; padding-top: 5px !important; padding-bottom: 5px !important; }
  }
`;

/* ============================================================
   CONFIRM DIALOG
============================================================ */
function ConfirmDialog({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60">
      <div className="bg-[#0D1A2D] border border-white/20 rounded-2xl p-6 w-80 flex flex-col gap-5 shadow-2xl">
        <div className="flex flex-col gap-1">
          <h4 className="text-white font-semibold text-base">Save Changes?</h4>
          <p className="text-gray-400 text-sm">Are you sure you want to save these changes? This will update the database.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-2 rounded-lg border border-white/20 text-gray-300 text-sm hover:bg-white/5 transition-colors cursor-pointer">Cancel</button>
          <button onClick={onConfirm} className="flex-1 py-2 rounded-lg bg-[#17387C] text-white text-sm font-semibold hover:bg-[#1e4a9e] transition-colors cursor-pointer">Yes, Save</button>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   SHARED UI
============================================================ */
const formatDate = (date?: string) => {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
};

const Field = ({ label, value }: { label: string; value?: string | number | null }) => (
  <div className="flex flex-col gap-1">
    <span className="auv-field-label text-gray-500 text-xs tracking-wide">{label}</span>
    <span className="auv-field-value text-white text-sm font-semibold">
      {value !== undefined && value !== null && value !== "" ? value : "—"}
    </span>
  </div>
);

const InputField = ({ label, value, onChange, type = "text" }: {
  label: string; value: string | number; onChange: (v: string) => void; type?: string;
}) => (
  <div className="flex flex-col gap-1">
    <span className="auv-field-label text-gray-500 text-xs tracking-wide">{label}</span>
    <input
      type={type}
      value={String(value ?? "")}
      onChange={(e) => onChange(e.target.value)}
      className="auv-input bg-[#040A16] border border-[#374151] focus:border-[#17387C] rounded-lg px-2 py-1.5 text-white text-sm outline-none transition-colors"
    />
  </div>
);

const SelectField = ({ label, value, onChange, options }: {
  label: string; value: string; onChange: (v: string) => void;
  options: { label: string; value: string }[];
}) => (
  <div className="flex flex-col gap-1">
    <span className="auv-field-label text-gray-500 text-xs tracking-wide">{label}</span>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="auv-select bg-[#040A16] border border-[#374151] focus:border-[#17387C] rounded-lg px-2 py-1.5 text-white text-sm outline-none transition-colors cursor-pointer"
    >
      {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  </div>
);

const StatusBadge = ({ active }: { active: number }) => (
  <span className={`auv-badge text-xs font-semibold w-fit px-3 py-1 rounded-full text-white ${active ? "bg-green-600/80" : "bg-[#6E6E6E]/60"}`}>
    {active ? "Active" : "Inactive"}
  </span>
);

const ReportStatusBadge = ({ status }: { status: "Draft" | "completed" }) => (
  <span className={`auv-badge text-xs font-semibold px-2 py-0.5 rounded-full text-white ${status === "completed" ? "bg-green-600/80" : "bg-[#6E6E6E]/60"}`}>
    {status === "completed" ? "Completed" : "Draft"}
  </span>
);

const VolumeStatusBadge = ({ status }: { status: Accession["volumeStatus"] }) => {
  const map: Record<Accession["volumeStatus"], { label: string; cls: string }> = {
    READY:       { label: "Ready",      cls: "bg-green-600/80"  },
    PROCESSING:  { label: "Processing", cls: "bg-yellow-600/80" },
    REJECTED:    { label: "Rejected",   cls: "bg-red-600/80"    },
    "NO VOLUME": { label: "No Volume",  cls: "bg-[#6E6E6E]/60"  },
  };
  const { label, cls } = map[status] ?? map["NO VOLUME"];
  return <span className={`auv-badge text-xs font-semibold px-2 py-0.5 rounded-full text-white ${cls}`}>{label}</span>;
};

type CardName = "personal" | "professional" | "medical" | "account";

const SectionTitle = ({ title, editing, onEdit, onConfirm, onCancel }: {
  title: string; editing: boolean; onEdit: () => void; onConfirm: () => void; onCancel: () => void;
}) => (
  <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-1">
    <h3 className="auv-section-title text-white font-semibold text-sm tracking-wide">{title}</h3>
    {editing ? (
      <div className="flex items-center gap-3">
        <button onClick={onConfirm} title="Save changes" className="flex items-center gap-1 auv-btn-text text-xs text-green-400 hover:text-green-300 transition-colors cursor-pointer">
          <Check className="auv-section-icon" size={13} /> Save
        </button>
        <button onClick={onCancel} title="Cancel editing" className="flex items-center gap-1 auv-btn-text text-xs text-red-400 hover:text-red-300 transition-colors cursor-pointer">
          <X className="auv-section-icon" size={13} /> Cancel
        </button>
      </div>
    ) : (
      <div className="relative dt-group">
        <button onClick={onEdit} className="text-gray-500 hover:text-white transition-colors cursor-pointer">
          <SquarePen className="auv-section-icon" size={14} />
        </button>
        <span className="dt-tooltip">Edit</span>
      </div>
    )}
  </div>
);

const tableWrapCls = "auv-table-wrap custom-scroll overflow-y-auto overflow-x-auto border border-white/30 rounded-lg";
const theadCls     = "sticky top-0 bg-[#040A16] z-10";
const thCls        = "py-2 px-2.5 sm:py-2.5 sm:px-3 md:py-2.5 md:px-3 lg:py-3 lg:px-4 text-[11px] sm:text-xs md:text-xs lg:text-sm font-semibold text-gray-100 text-left whitespace-nowrap";
const thCenterCls  = "py-2 px-2.5 sm:py-2.5 sm:px-3 md:py-2.5 md:px-3 lg:py-3 lg:px-4 text-[11px] sm:text-xs md:text-xs lg:text-sm font-semibold text-gray-100 text-center whitespace-nowrap w-px";
const trCls        = "hover:bg-[#132030] transition-colors";
const tdCls        = "py-1.5 px-2.5 sm:py-2 sm:px-3 md:py-2.5 md:px-3 lg:py-3 lg:px-4 text-[10px] sm:text-[11px] md:text-xs lg:text-sm whitespace-nowrap";

/* ============================================================
   ACCESSIONS TABLE
============================================================ */
function AccessionTable({ userId }: { userId: number }) {
  const [accessions, setAccessions] = useState<Accession[]>([]);
  const [loading, setLoading]       = useState(false);
  const [adding, setAdding]         = useState(false);
  const [addError, setAddError]     = useState<string | null>(null);
  const [error, setError]           = useState<string | null>(null);
  const [search, setSearch]         = useState("");

  useEffect(() => {
    setLoading(true); setError(null);
    fetch(`/api/admin/patients/${userId}/accessions`)
      .then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then((data) => { if (data.status === "ok") setAccessions(data.accessions ?? []); else setError(data.message || "Failed to load accessions"); })
      .catch((e) => setError(e.message || "Network error"))
      .finally(() => setLoading(false));
  }, [userId]);

  const handleAdd = async () => {
    setAdding(true); setAddError(null);
    try {
      const res = await fetch(`/api/admin/patients/${userId}/accessions`, { method: "POST" });
      const data = await res.json();
      if (data.status !== "ok") throw new Error(data.message || "Failed to create accession");
      setAccessions((prev) => [data.accession, ...prev]);
    } catch (e: any) { setAddError(e.message); }
    finally { setAdding(false); }
  };

  const handleDeleteAccession = async (accessionId: number) => {
    try {
      const res = await fetch(`/api/admin/patients/${userId}/accessions?accessionId=${accessionId}`, { method: "DELETE" });
      const data = await res.json();
      if (data.status !== "ok") throw new Error(data.message || "Failed to delete");
      setAccessions((prev) => prev.filter((a) => a.accessionId !== accessionId));
    } catch (e: any) { setAddError(e.message); }
  };

  const filtered = accessions.filter((a) => {
    const q = search.toLowerCase();
    return a.accessionNumber.toLowerCase().includes(q) || a.modality.toLowerCase().includes(q) || a.volumeStatus.toLowerCase().includes(q);
  });

  const columns = [
    { key: "accessionNumber", label: "Accession"     },
    { key: "modality",        label: "Modality"      },
    { key: "examDate",        label: "Exam Date"     },
    { key: "volumeStatus",    label: "Volume Status" },
    { key: "createdAt",       label: "Created At"    },
  ];

  return (
    <div className="auv-card bg-[#0D1A2D] border border-white/10 rounded-2xl p-4 sm:p-6 flex flex-col gap-4 min-w-0 overflow-hidden">
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <h3 className="auv-section-title text-white font-semibold text-sm tracking-wide">Accessions</h3>
          {!loading && !error && <span className="auv-badge ml-1 bg-[#17387C]/60 text-blue-300 text-xs font-semibold px-2 py-0.5 rounded-full">{accessions.length}</span>}
        </div>
      </div>
      <div className="flex items-center justify-between flex-shrink-0">
        <div className="relative w-36 sm:w-64 md:w-80">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="auv-search-input w-full bg-[#0D1A2D] border border-[#374151] rounded-lg py-2 pl-9 pr-3 text-white text-sm placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div className="relative dt-group">
          <button onClick={handleAdd} disabled={adding}
            className="bg-[#0D1A2D] border border-[#374151] rounded-lg p-2 flex items-center justify-center hover:bg-[#1a2a3a] transition-colors text-white cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
            {adding ? <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Plus size={16} />}
          </button>
          <span className="dt-tooltip">Add Accession</span>
        </div>
      </div>
      {loading && <div className="flex items-center gap-2 text-gray-500 text-sm py-4"><span className="inline-block w-4 h-4 border-2 border-[#17387C] border-t-transparent rounded-full animate-spin" />Loading accessions…</div>}
      {error && <div className="bg-red-900/20 border border-red-500/20 rounded-xl px-4 py-3 text-red-300 text-sm">{error}</div>}
      {addError && (
        <div className="bg-red-900/20 border border-red-500/20 rounded-xl px-4 py-3 text-red-300 text-sm flex items-center justify-between">
          <span>{addError}</span>
          <button onClick={() => setAddError(null)} className="text-red-400 hover:text-red-200 cursor-pointer"><X size={14} /></button>
        </div>
      )}
      {!loading && !error && (
        <div className={tableWrapCls} style={{ maxHeight: "calc(100vh - 20rem)", overflowX: "auto" }}>
          <table className="text-white" style={{ width: "max-content", minWidth: "100%", tableLayout: "auto", borderCollapse: "collapse" }}>
            <thead className={theadCls}>
              <tr className="border-b border-white/20">
                {columns.map((col) => <th key={col.key} className={thCls}>{col.label}</th>)}
                <th className={thCenterCls}>Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filtered.length === 0 ? (
                <tr><td colSpan={columns.length + 1} className="py-8 text-center text-gray-400 text-sm">{accessions.length === 0 ? "No accessions found." : "No results match your search."}</td></tr>
              ) : filtered.map((a) => (
                <tr key={a.accessionId} className={trCls}>
                  <td className={`${tdCls} text-white font-medium`}>{a.accessionNumber}</td>
                  <td className={`${tdCls} text-white`}>{a.modality}</td>
                  <td className={`${tdCls} text-white md:whitespace-nowrap`}>{formatDate(a.examDate)}</td>
                  <td className={tdCls}><VolumeStatusBadge status={a.volumeStatus} /></td>
                  <td className={`${tdCls} text-gray-400 md:whitespace-nowrap`}>{formatDate(a.createdAt)}</td>
                  <td className={`${tdCls} text-center w-px`}>
                    <div className="relative dt-group inline-flex">
                      <button onClick={() => handleDeleteAccession(a.accessionId)} className="p-1 rounded hover:bg-[#1a2a3a] transition-colors text-gray-400 hover:text-red-400 cursor-pointer">
                        <Delete size={12} className="md:w-[18px] md:h-[18px] w-3 h-3" />
                      </button>
                      <span className="dt-tooltip">Delete Accession</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ============================================================
   REPORTS TABLE
============================================================ */
function ReportsTable({ userId, role }: { userId: number; role: "patient" | "doctor" }) {
  const [reports, setReports]         = useState<Report[]>([]);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [search, setSearch]           = useState("");

  useEffect(() => {
    setLoading(true); setError(null);
    const url = role === "patient" ? `/api/admin/patients/${userId}/reports` : `/api/admin/doctors/${userId}/reports`;
    fetch(url)
      .then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then((data) => { if (data.status === "ok") setReports(data.reports ?? []); else setError(data.message || "Failed to load reports"); })
      .catch((e) => setError(e.message || "Network error"))
      .finally(() => setLoading(false));
  }, [userId, role]);

  const handleDeleteReport = async (reportId: number) => {
    setDeleteError(null);
    try {
      const res = await fetch(`/api/admin/reports/${reportId}`, { method: "DELETE" });
      const data = await res.json();
      if (data.status !== "ok") throw new Error(data.message || "Failed to delete");
      setReports((prev) => prev.filter((r) => r.reportId !== reportId));
    } catch (e: any) { setDeleteError(e.message); }
  };

  const filtered = reports.filter((r) => {
    const q = search.toLowerCase();
    return (
      r.accessionNumber.toLowerCase().includes(q) ||
      (r.bodyPart ?? "").toLowerCase().includes(q) ||
      r.doctorName.toLowerCase().includes(q) ||
      r.modality.toLowerCase().includes(q) ||
      r.reportStatus.toLowerCase().includes(q) ||
      ("patientName" in r ? String((r as any).patientName).toLowerCase().includes(q) : false)
    );
  });

  const isDoctor = role === "doctor";
  const columns = [
    { key: "accessionNumber", label: "Accession"  },
    { key: "bodyPart",        label: "Body Part"  },
    ...(isDoctor ? [{ key: "patientName", label: "Patient" }] : [{ key: "doctorName", label: "Doctor" }]),
    { key: "modality",     label: "Modality"   },
    { key: "examDate",     label: "Exam Date"  },
    { key: "reportStatus", label: "Status"     },
    { key: "createdAt",    label: "Created At" },
    { key: "signedAt",     label: "Signed At"  },
  ];

  return (
    <div className="auv-card bg-[#0D1A2D] border border-white/10 rounded-2xl p-4 sm:p-6 flex flex-col gap-4 min-w-0 overflow-hidden">
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <h3 className="auv-section-title text-white font-semibold text-sm tracking-wide">{isDoctor ? "Reports Written" : "Patient Reports"}</h3>
          {!loading && !error && <span className="auv-badge ml-1 bg-[#17387C]/60 text-blue-300 text-xs font-semibold px-2 py-0.5 rounded-full">{reports.length}</span>}
        </div>
      </div>
      <div className="flex items-center justify-between flex-shrink-0">
        <div className="relative w-36 sm:w-64 md:w-80">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="auv-search-input w-full bg-[#0D1A2D] border border-[#374151] rounded-lg py-2 pl-9 pr-3 text-white text-sm placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
      </div>
      {loading && <div className="flex items-center gap-2 text-gray-500 text-sm py-4"><span className="inline-block w-4 h-4 border-2 border-[#17387C] border-t-transparent rounded-full animate-spin" />Loading reports…</div>}
      {error && <div className="bg-red-900/20 border border-red-500/20 rounded-xl px-4 py-3 text-red-300 text-sm">{error}</div>}
      {deleteError && (
        <div className="bg-red-900/20 border border-red-500/20 rounded-xl px-4 py-3 text-red-300 text-sm flex items-center justify-between">
          <span>{deleteError}</span>
          <button onClick={() => setDeleteError(null)} className="text-red-400 hover:text-red-200 cursor-pointer"><X size={14} /></button>
        </div>
      )}
      {!loading && !error && (
        <div className={tableWrapCls} style={{ maxHeight: "calc(100vh - 20rem)", overflowX: "auto" }}>
          <table className="text-white" style={{ width: "max-content", minWidth: "100%", tableLayout: "auto", borderCollapse: "collapse" }}>
            <thead className={theadCls}>
              <tr className="border-b border-white/20">
                {columns.map((col) => <th key={col.key} className={thCls}>{col.label}</th>)}
                <th className={thCenterCls}>Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filtered.length === 0 ? (
                <tr><td colSpan={columns.length + 1} className="py-8 text-center text-gray-400 text-sm">{reports.length === 0 ? "No reports found." : "No results match your search."}</td></tr>
              ) : filtered.map((r) => (
                <tr key={r.reportId} className={trCls}>
                  <td className={`${tdCls} text-white font-medium`}>{r.accessionNumber}</td>
                  <td className={`${tdCls} text-white`}>{r.bodyPart || "—"}</td>
                  {isDoctor
                    ? <td className={`${tdCls} text-white md:whitespace-nowrap`}>{(r as any).patientName || "—"}</td>
                    : <td className={`${tdCls} text-white md:whitespace-nowrap`}>{r.doctorName}</td>
                  }
                  <td className={`${tdCls} text-white`}>{r.modality}</td>
                  <td className={`${tdCls} text-white md:whitespace-nowrap`}>{formatDate(r.examDate)}</td>
                  <td className={tdCls}><ReportStatusBadge status={r.reportStatus} /></td>
                  <td className={`${tdCls} text-gray-400 md:whitespace-nowrap`}>{formatDate(r.createdAt)}</td>
                  <td className={`${tdCls} text-gray-400 md:whitespace-nowrap`}>{formatDate(r.signedAt)}</td>
                  <td className={`${tdCls} text-center w-px`}>
                    <div className="relative dt-group inline-flex">
                      <button onClick={() => handleDeleteReport(r.reportId)} className="p-1 rounded hover:bg-[#1a2a3a] transition-colors text-gray-400 hover:text-red-400 cursor-pointer">
                        <Delete size={12} className="md:w-[18px] md:h-[18px] w-3 h-3" />
                      </button>
                      <span className="dt-tooltip">Delete Report</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ============================================================
   ASSIGNED PATIENTS TABLE
============================================================ */
function AssignedPatientsTable({ userId, role }: { userId: number; role: "doctor" | "technician" }) {
  const [patients, setPatients]       = useState<AssignedPatient[]>([]);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [search, setSearch]           = useState("");

  useEffect(() => {
    setLoading(true); setError(null);
    const url = role === "doctor" ? `/api/admin/doctors/${userId}/patients` : `/api/admin/technicians/${userId}/patients`;
    fetch(url)
      .then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then((data) => { if (data.status === "ok") setPatients(data.patients ?? []); else setError(data.message || "Failed to load patients"); })
      .catch((e) => setError(e.message || "Network error"))
      .finally(() => setLoading(false));
  }, [userId, role]);

  const handleDeletePatient = async (patientId: number) => {
    setDeleteError(null);
    try {
      const url = role === "doctor"
        ? `/api/admin/doctors/${userId}/patients?patientId=${patientId}`
        : `/api/admin/technicians/${userId}/patients?patientId=${patientId}`;
      const res = await fetch(url, { method: "DELETE" });
      const data = await res.json();
      if (data.status !== "ok") throw new Error(data.message || "Failed to remove");
      setPatients((prev) => prev.filter((p) => p.id !== patientId));
    } catch (e: any) { setDeleteError(e.message); }
  };

  const filtered = patients.filter((p) => {
    const q = search.toLowerCase();
    return (
      `${p.firstName} ${p.middleName ?? ""} ${p.lastName}`.toLowerCase().includes(q) ||
      (p.mrn ?? "").toLowerCase().includes(q) ||
      (p.nationalId ?? "").toLowerCase().includes(q) ||
      (p.email ?? "").toLowerCase().includes(q)
    );
  });

  const columns = [
    { key: "name",       label: "Name"          },
    { key: "mrn",        label: "MRN"           },
    { key: "nationalId", label: "National ID"   },
    { key: "dob",        label: "Date of Birth" },
    { key: "gender",     label: "Gender"        },
    { key: "phone",      label: "Phone"         },
    { key: "status",     label: "Status"        },
    { key: "assignedAt", label: "Assigned At"   },
  ];

  return (
    <div className="auv-card bg-[#0D1A2D] border border-white/10 rounded-2xl p-4 sm:p-6 flex flex-col gap-4 min-w-0 overflow-hidden">
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <h3 className="auv-section-title text-white font-semibold text-sm tracking-wide">Assigned Patients</h3>
          {!loading && !error && <span className="auv-badge ml-1 bg-[#17387C]/60 text-blue-300 text-xs font-semibold px-2 py-0.5 rounded-full">{patients.length}</span>}
        </div>
      </div>
      <div className="flex items-center justify-between flex-shrink-0">
        <div className="relative w-36 sm:w-64 md:w-80">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="auv-search-input w-full bg-[#0D1A2D] border border-[#374151] rounded-lg py-2 pl-9 pr-3 text-white text-sm placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
      </div>
      {loading && <div className="flex items-center gap-2 text-gray-500 text-sm py-4"><span className="inline-block w-4 h-4 border-2 border-[#17387C] border-t-transparent rounded-full animate-spin" />Loading patients…</div>}
      {error && <div className="bg-red-900/20 border border-red-500/20 rounded-xl px-4 py-3 text-red-300 text-sm">{error}</div>}
      {deleteError && (
        <div className="bg-red-900/20 border border-red-500/20 rounded-xl px-4 py-3 text-red-300 text-sm flex items-center justify-between">
          <span>{deleteError}</span>
          <button onClick={() => setDeleteError(null)} className="text-red-400 hover:text-red-200 cursor-pointer"><X size={14} /></button>
        </div>
      )}
      {!loading && !error && (
        <div className={tableWrapCls} style={{ maxHeight: "calc(100vh - 20rem)", overflowX: "auto" }}>
          <table className="text-white" style={{ width: "max-content", minWidth: "100%", tableLayout: "auto", borderCollapse: "collapse" }}>
            <thead className={theadCls}>
              <tr className="border-b border-white/20">
                {columns.map((col) => <th key={col.key} className={thCls}>{col.label}</th>)}
                <th className={thCenterCls}>Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filtered.length === 0 ? (
                <tr><td colSpan={columns.length + 1} className="py-8 text-center text-gray-400 text-sm">{patients.length === 0 ? "No patients assigned yet." : "No results match your search."}</td></tr>
              ) : filtered.map((p) => (
                <tr key={p.id} className={trCls}>
                  <td className={`${tdCls} text-white md:whitespace-nowrap`}>{[p.firstName, p.middleName, p.lastName].filter(Boolean).join(" ")}</td>
                  <td className={`${tdCls} text-white`}>{p.mrn || "—"}</td>
                  <td className={`${tdCls} text-white`}>{p.nationalId || "—"}</td>
                  <td className={`${tdCls} text-white`}>{formatDate(p.dateOfBirth)}</td>
                  <td className={`${tdCls} text-white capitalize`}>{p.gender}</td>
                  <td className={`${tdCls} text-white`}>{p.phone || "—"}</td>
                  <td className={tdCls}><StatusBadge active={p.isActive} /></td>
                  <td className={`${tdCls} text-gray-400`}>{formatDate(p.assignedAt)}</td>
                  <td className={`${tdCls} text-center w-px`}>
                    <div className="relative dt-group inline-flex">
                      <button onClick={() => handleDeletePatient(p.id)} className="p-1 rounded hover:bg-[#1a2a3a] transition-colors text-gray-400 hover:text-red-400 cursor-pointer">
                        <Delete size={12} className="md:w-[18px] md:h-[18px] w-3 h-3" />
                      </button>
                      <span className="dt-tooltip">Remove Assignment</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ============================================================
   MAIN COMPONENT
============================================================ */
export default function AdminUserView({ user: initialUser, onClose }: AdminUserViewProps) {
  const [user, setUser]                     = useState<AnyUser>(initialUser);
  const [editingCard, setEditingCard]       = useState<CardName | null>(null);
  const [draft, setDraft]                   = useState<Record<string, unknown>>({});
  const [pendingPayload, setPendingPayload] = useState<Record<string, unknown> | null>(null);
  const [saving, setSaving]                 = useState(false);
  const [saveError, setSaveError]           = useState<string | null>(null);
  const [showPassword, setShowPassword]     = useState(false);
  const [imgPreview, setImgPreview]         = useState<string | null>(null);
  const [imgError, setImgError]             = useState<string | null>(null);
  const [imgFile, setImgFile]               = useState<File | null>(null);
  const [availableDoctors,     setAvailableDoctors]     = useState<{ id: number; firstName: string; lastName: string }[]>([]);
  const [availableTechnicians, setAvailableTechnicians] = useState<{ id: number; firstName: string; lastName: string }[]>([]);
  const imgRef = useRef<HTMLInputElement>(null);

  const isPatient    = user.role === "patient";
  const isDoctor     = user.role === "doctor";
  const isTechnician = user.role === "technician";

  useEffect(() => {
    if (!isPatient) return;
    fetch("/api/admin/users?role=doctor")
      .then((r) => r.json())
      .then((d) => { if (d.status === "ok") setAvailableDoctors(d.users); });
    fetch("/api/admin/users?role=technician")
      .then((r) => r.json())
      .then((d) => { if (d.status === "ok") setAvailableTechnicians(d.users); });
  }, [isPatient]);

  const handleAvatarChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
    const file = ev.target.files?.[0] ?? null;
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) { setImgError("JPG, PNG or WEBP only"); return; }
    if (file.size > 5 * 1024 * 1024) { setImgError("Max file size is 5MB"); return; }
    setImgError(null); setImgFile(file); setImgPreview(URL.createObjectURL(file));
  };

  const saveAvatar = async () => {
    if (!imgFile) return;
    const fd = new FormData();
    fd.append("id", String(user.id));
    fd.append("role", user.role);
    fd.append("profile_picture", imgFile);
    try {
      const res = await fetch("/api/admin/users/avatar", { method: "POST", body: fd });
      const data = await res.json();
      if (data.status !== "ok") throw new Error(data.message);
      setUser((u) => ({ ...u, profilePicture: data.profilePicture }));
      setImgPreview(null); setImgFile(null);
    } catch (e: any) { setImgError(e.message); }
  };

  const openEdit = (card: CardName) => {
    setSaveError(null); setEditingCard(card);
    if (card === "personal") {
      setDraft({
        firstName:  user.firstName,
        middleName: user.middleName ?? "",
        lastName:   user.lastName,
        gender:     user.gender,
        ...(isPatient ? {
          dateOfBirth: (user as PatientUser).dateOfBirth?.slice(0, 10) ?? "",
          nationalId:  (user as PatientUser).nationalId ?? "",
        } : {}),
      });
    } else if (card === "medical" && isPatient) {
      const p = user as PatientUser;
      const currentDoctor = availableDoctors.find(
        (d) => `${d.firstName} ${d.lastName}` === p.doctorName
      );
      const currentTech = availableTechnicians.find(
        (t) => `${t.firstName} ${t.lastName}` === p.techName
      );
      setDraft({
        nationalId:     p.nationalId    ?? "",
        dateOfBirth:    p.dateOfBirth?.slice(0, 10) ?? "",
        assignDoctorId: currentDoctor?.id ?? "",
        assignTechId:   currentTech?.id   ?? "",
      });
    } else if (card === "professional") {
      if (isDoctor) {
        const d = user as DoctorUser;
        setDraft({ doctorCode: d.doctorCode, specialty: d.specialty, licenseNumber: d.licenseNumber, yearsExperience: d.yearsExperience });
      } else {
        const t = user as TechnicianUser;
        setDraft({ technicianCode: t.technicianCode, specialty: t.specialty, licenseNumber: t.licenseNumber, yearsExperience: t.yearsExperience });
      }
    } else if (card === "account") {
      setDraft({ username: user.username, email: user.email, phone: user.phone, isActive: user.isActive, password: "" });
    }
  };

  const cancelEdit  = () => { setEditingCard(null); setDraft({}); setSaveError(null); setShowPassword(false); };
  const set         = (key: string, value: unknown) => setDraft((d) => ({ ...d, [key]: value }));
  const requestSave = () => setPendingPayload({ ...draft });

  const confirmSave = async () => {
    if (!pendingPayload) return;
    setSaving(true); setSaveError(null);
    try {
      // Handle doctor assignment change
      if (isPatient && "assignDoctorId" in pendingPayload) {
        const newDoctorId = pendingPayload.assignDoctorId;
        const oldDoctor = availableDoctors.find(
          (d) => `${d.firstName} ${d.lastName}` === (user as PatientUser).doctorName
        );
        if (oldDoctor) {
          await fetch(`/api/admin/doctors/${oldDoctor.id}/patients?patientId=${user.id}`, { method: "DELETE" });
        }
        if (newDoctorId) {
          await fetch(`/api/admin/doctors/${newDoctorId}/patients`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ patientUserId: user.id }),
          });
        }
      }

      // Handle technician assignment change
      if (isPatient && "assignTechId" in pendingPayload) {
        const newTechId = pendingPayload.assignTechId;
        const oldTech = availableTechnicians.find(
          (t) => `${t.firstName} ${t.lastName}` === (user as PatientUser).techName
        );
        if (oldTech) {
          await fetch(`/api/admin/technicians/${oldTech.id}/patients?patientId=${user.id}`, { method: "DELETE" });
        }
        if (newTechId) {
          await fetch(`/api/admin/technicians/${newTechId}/patients`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ patientUserId: user.id }),
          });
        }
      }

      // Handle regular field updates
      const regularFields = Object.fromEntries(
        Object.entries(pendingPayload).filter(([k]) => !["assignDoctorId", "assignTechId"].includes(k))
      );

      if (Object.keys(regularFields).length > 0) {
        const body: Record<string, unknown> = { id: user.id, role: user.role };
        Object.entries(regularFields).forEach(([k, v]) => {
          if (k === "password" && (!v || String(v).trim() === "")) return;
          body[k] = v;
        });
        const res  = await fetch("/api/admin/users", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
        const data = await res.json();
        if (data.status !== "ok") throw new Error(data.message || "Save failed");
      }

      // Update local user state
      setUser((u) => {
        const updated = { ...u };
        Object.entries(pendingPayload).forEach(([k, v]) => {
          if (k === "password" || k === "assignDoctorId" || k === "assignTechId") return;
          (updated as any)[k] = k === "isActive" ? Number(v) : v;
        });
        if ("assignDoctorId" in pendingPayload) {
          const doc = availableDoctors.find((d) => d.id === Number(pendingPayload.assignDoctorId));
          (updated as any).doctorName = doc ? `${doc.firstName} ${doc.lastName}` : "";
        }
        if ("assignTechId" in pendingPayload) {
          const tech = availableTechnicians.find((t) => t.id === Number(pendingPayload.assignTechId));
          (updated as any).techName = tech ? `${tech.firstName} ${tech.lastName}` : "";
        }
        updated.updatedAt = new Date().toISOString();
        return updated as AnyUser;
      });

      setPendingPayload(null); setEditingCard(null); setDraft({}); setShowPassword(false);
    } catch (e: any) { setSaveError(e.message); setPendingPayload(null); }
    finally { setSaving(false); }
  };

  const roleLabel = isPatient ? "Patient" : isDoctor ? "Doctor" : "Technician";

  return (
    <div className="fixed inset-0 bg-[#040A16] z-50 overflow-y-auto">
      <style>{tooltipStyles}</style>
      {pendingPayload && <ConfirmDialog onConfirm={confirmSave} onCancel={() => setPendingPayload(null)} />}

      <div className="auv-page-wrap max-w-6xl mx-auto px-4 sm:px-6 md:px-10 pb-10 pt-6 flex flex-col min-h-screen">

        <div className="relative flex items-center mb-6">
          <button className="header-back-button" onClick={onClose} title="Go back"><ArrowLeft size={18} /></button>
          <h2 className="auv-header-title absolute left-1/2 -translate-x-1/2 text-white font-bold text-xl sm:text-2xl md:text-3xl whitespace-nowrap">
            {roleLabel} Details
          </h2>
        </div>

        {saveError && (
          <div className="mb-4 bg-red-900/30 border border-red-500/30 rounded-xl px-4 py-3 text-red-300 text-sm flex items-center justify-between">
            <span>{saveError}</span>
            <button onClick={() => setSaveError(null)} className="text-red-400 hover:text-red-200 cursor-pointer"><X size={14} /></button>
          </div>
        )}
        {saving && <div className="mb-4 bg-blue-900/20 border border-blue-500/20 rounded-xl px-4 py-3 text-blue-300 text-sm">Saving changes…</div>}

        <div className="auv-row-gap flex flex-col gap-5">

          {/* ROW 1: Profile + Personal Info */}
          <div className="auv-card bg-[#0D1A2D] border border-white/10 rounded-2xl p-4 sm:p-6 flex flex-row gap-4 sm:gap-8 items-start">
            <div className="auv-avatar-wrap flex-shrink-0 flex flex-col gap-1 items-start w-44">
              <div className="relative w-full overflow-visible">
                <div className="auv-avatar w-full aspect-square rounded-xl overflow-hidden relative bg-[#040A16] border border-white/10 z-0">
                  {imgPreview ? (
                    <img src={imgPreview} alt="preview" className="absolute inset-0 w-full h-full object-cover" />
                  ) : user.profilePicture ? (
                    <img src={`/api/images/${user.profilePicture.replace(/\/+$/, "").split("/").pop()}`} alt={user.firstName} className="absolute inset-0 w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="auv-avatar-initials text-3xl text-[#4A7ACA] font-bold">{user.firstName?.[0]}{user.lastName?.[0]}</span>
                    </div>
                  )}
                </div>
                <div className="dt-group absolute top-1.5 right-1.5 z-20">
                  <button onClick={() => imgRef.current?.click()}
                    className="w-6 h-6 rounded flex items-center justify-center bg-black/60 hover:bg-black/80 transition-colors cursor-pointer">
                    <SquarePen size={11} className="text-white" />
                  </button>
                  <span className="dt-tooltip">Change Photo</span>
                </div>
              </div>
              <input ref={imgRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleAvatarChange} />
              {imgError && <p className="text-red-400 text-[10px] text-center w-full">{imgError}</p>}
              {imgFile && !imgError && (
                <div className="flex gap-1.5 w-full">
                  <button onClick={saveAvatar} className="flex-1 flex items-center justify-center gap-1 text-xs py-1 rounded-lg bg-[#17387C] text-white hover:bg-[#1e4a9e] transition-colors cursor-pointer">
                    <Check size={11} /> Save
                  </button>
                  <button onClick={() => { setImgFile(null); setImgPreview(null); if (imgRef.current) imgRef.current.value = ""; }}
                    className="flex-1 flex items-center justify-center gap-1 text-xs py-1 rounded-lg border border-white/20 text-gray-400 hover:text-white transition-colors cursor-pointer">
                    <X size={11} /> Cancel
                  </button>
                </div>
              )}
            </div>

            <div className="flex-1 w-full min-w-0">
              <SectionTitle title="Personal Information" editing={editingCard === "personal"} onEdit={() => openEdit("personal")} onConfirm={requestSave} onCancel={cancelEdit} />
              {editingCard === "personal" ? (
                <div className="auv-personal-grid auv-grid-gap grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4">
                  <InputField label="First Name"  value={String(draft.firstName  ?? "")} onChange={(v) => set("firstName", v)} />
                  <InputField label="Middle Name" value={String(draft.middleName ?? "")} onChange={(v) => set("middleName", v)} />
                  <InputField label="Last Name"   value={String(draft.lastName   ?? "")} onChange={(v) => set("lastName", v)} />
                  <SelectField label="Gender" value={String(draft.gender ?? "male")} onChange={(v) => set("gender", v)}
                    options={[{ label: "Male", value: "male" }, { label: "Female", value: "female" }]} />
                  {isPatient && <>
                    <InputField label="Date of Birth" type="date" value={String(draft.dateOfBirth ?? "")} onChange={(v) => set("dateOfBirth", v)} />
                    <InputField label="National ID"   value={String(draft.nationalId ?? "")} onChange={(v) => set("nationalId", v)} />
                  </>}
                </div>
              ) : (
                <div className="auv-personal-grid auv-grid-gap grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-4">
                  <Field label="First Name"  value={user.firstName} />
                  <Field label="Middle Name" value={user.middleName} />
                  <Field label="Last Name"   value={user.lastName} />
                  <Field label="Gender"      value={user.gender ? user.gender.charAt(0).toUpperCase() + user.gender.slice(1) : undefined} />
                  {isPatient && <>
                    <Field label="Date of Birth"       value={formatDate((user as PatientUser).dateOfBirth)} />
                    <Field label="National ID / Iqama" value={(user as PatientUser).nationalId} />
                  </>}
                </div>
              )}
            </div>
          </div>

          <div className="auv-row2-grid auv-grid-gap grid grid-cols-1 md:grid-cols-2 gap-5">

            {(isDoctor || isTechnician) && (
              <div className={`auv-card bg-[#0D1A2D] border rounded-2xl p-4 sm:p-6 transition-colors ${editingCard === "professional" ? "border-[#17387C]/60" : "border-white/10"}`}>
                <SectionTitle title="Professional Information" editing={editingCard === "professional"} onEdit={() => openEdit("professional")} onConfirm={requestSave} onCancel={cancelEdit} />
                {editingCard === "professional" ? (
                  <div className="auv-prof-grid auv-grid-gap grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                    <InputField label={isDoctor ? "Doctor Code" : "Technician Code"}
                      value={String(isDoctor ? draft.doctorCode ?? "" : draft.technicianCode ?? "")}
                      onChange={(v) => set(isDoctor ? "doctorCode" : "technicianCode", v)} />
                    <InputField label="Specialty"        value={String(draft.specialty        ?? "")} onChange={(v) => set("specialty", v)} />
                    <InputField label="License Number"   value={String(draft.licenseNumber    ?? "")} onChange={(v) => set("licenseNumber", v)} />
                    <InputField label="Experience (yrs)" type="number" value={Number(draft.yearsExperience ?? 0)} onChange={(v) => set("yearsExperience", Number(v))} />
                  </div>
                ) : (
                  <div className="auv-prof-grid auv-grid-gap grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                    <Field label={isDoctor ? "Doctor Code" : "Technician Code"} value={isDoctor ? (user as DoctorUser).doctorCode : (user as TechnicianUser).technicianCode} />
                    <Field label="Specialty"      value={(user as DoctorUser | TechnicianUser).specialty} />
                    <Field label="License Number" value={(user as DoctorUser | TechnicianUser).licenseNumber} />
                    <Field label="Experience"     value={`${(user as DoctorUser | TechnicianUser).yearsExperience} yrs`} />
                  </div>
                )}
              </div>
            )}

            {isPatient && (
              <div className={`auv-card bg-[#0D1A2D] border rounded-2xl p-4 sm:p-6 flex flex-col gap-4 transition-colors ${editingCard === "medical" ? "border-[#17387C]/60" : "border-white/10"}`}>
                <SectionTitle title="Medical & Assignments" editing={editingCard === "medical"} onEdit={() => openEdit("medical")} onConfirm={requestSave} onCancel={cancelEdit} />
                {editingCard === "medical" ? (
                  <div className="auv-medical-grid auv-prof-grid auv-grid-gap grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                    <div className="flex flex-col gap-1">
                      <span className="auv-field-label text-gray-500 text-xs tracking-wide">MRN</span>
                      <input type="text" value={(user as PatientUser).mrn ?? "—"} readOnly
                        className="auv-input bg-[#040A16]/50 border border-[#374151]/50 rounded-lg px-2 py-1.5 text-gray-400 text-sm outline-none cursor-not-allowed select-none" />
                    </div>
                    <Field label="Created At" value={formatDate(user.createdAt)} />
                    <Field label="Updated At" value={formatDate(user.updatedAt)} />
                    <SelectField
                      label="Assigned Doctor"
                      value={String(draft.assignDoctorId ?? "")}
                      onChange={(v) => set("assignDoctorId", v)}
                      options={[
                        { label: "— None —", value: "" },
                        ...availableDoctors.map((d) => ({
                          label: `${d.firstName} ${d.lastName}`,
                          value: String(d.id),
                        })),
                      ]}
                    />
                    <SelectField
                      label="Assigned Technician"
                      value={String(draft.assignTechId ?? "")}
                      onChange={(v) => set("assignTechId", v)}
                      options={[
                        { label: "— None —", value: "" },
                        ...availableTechnicians.map((t) => ({
                          label: `${t.firstName} ${t.lastName}`,
                          value: String(t.id),
                        })),
                      ]}
                    />
                  </div>
                ) : (
                  <div className="auv-medical-grid auv-prof-grid auv-grid-gap grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                    <Field label="MRN"                 value={(user as PatientUser).mrn} />
                    <Field label="Created At"          value={formatDate(user.createdAt)} />
                    <Field label="Updated At"          value={formatDate(user.updatedAt)} />
                    <Field label="Assigned Doctor"     value={(user as PatientUser).doctorName} />
                    <Field label="Assigned Technician" value={(user as PatientUser).techName} />
                  </div>
                )}
              </div>
            )}

            <div className={`auv-card bg-[#0D1A2D] border rounded-2xl p-4 sm:p-6 transition-colors ${editingCard === "account" ? "border-[#17387C]/60" : "border-white/10"}`}>
              <SectionTitle title="Account Information" editing={editingCard === "account"} onEdit={() => openEdit("account")} onConfirm={requestSave} onCancel={cancelEdit} />
              {editingCard === "account" ? (
                <div className="auv-account-grid auv-prof-grid auv-grid-gap grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                  <InputField label="Username" value={String(draft.username ?? "")} onChange={(v) => set("username", v)} />
                  <InputField label="Email" type="email" value={String(draft.email ?? "")} onChange={(v) => set("email", v)} />
                  <InputField label="Phone" type="tel"   value={String(draft.phone ?? "")} onChange={(v) => set("phone", v)} />
                  <div className="flex flex-col gap-1">
                    <span className="auv-field-label text-gray-500 text-xs tracking-wide">New Password</span>
                    <div className="relative">
                      <input type={showPassword ? "text" : "password"} placeholder="Leave blank to keep current"
                        value={String(draft.password ?? "")} onChange={(e) => set("password", e.target.value)}
                        className="auv-input w-full bg-[#040A16] border border-[#374151] focus:border-[#17387C] rounded-lg px-2 py-1.5 pr-8 text-white text-sm outline-none transition-colors placeholder-gray-600" />
                      <button type="button" onClick={() => setShowPassword((p) => !p)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors cursor-pointer">
                        {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>
                  <SelectField label="Status" value={String(draft.isActive ?? "1")} onChange={(v) => set("isActive", Number(v))}
                    options={[{ label: "Active", value: "1" }, { label: "Inactive", value: "0" }]} />
                </div>
              ) : (
                <div className="auv-account-grid auv-prof-grid auv-grid-gap grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                  <Field label="Username" value={user.username} />
                  <Field label="Email"    value={user.email} />
                  <Field label="Phone"    value={user.phone} />
                  <div className="flex flex-col gap-1">
                    <span className="auv-field-label text-gray-500 text-xs tracking-wide">Status</span>
                    <StatusBadge active={user.isActive} />
                  </div>
                  {(isDoctor || isTechnician) && <>
                    <Field label="Created At" value={formatDate(user.createdAt)} />
                    <Field label="Updated At" value={formatDate(user.updatedAt)} />
                  </>}
                </div>
              )}
            </div>
          </div>

          {isPatient && <AccessionTable userId={user.id} />}
          {(isDoctor || isTechnician) && <AssignedPatientsTable userId={user.id} role={user.role as "doctor" | "technician"} />}
          {(isPatient || isDoctor) && <ReportsTable userId={user.id} role={user.role as "patient" | "doctor"} />}

        </div>
      </div>
    </div>
  );
}