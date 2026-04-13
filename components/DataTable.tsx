"use client";
import { useState, useRef } from "react";
import { Search, Plus, SlidersHorizontal, Eye, Trash, ChevronDown } from "lucide-react";

export interface Column {
  key: string;
  label: string;
}

export interface DataTableProps<T extends { id: number }> {
  data: T[];
  columns: Column[];
  searchKeys: (keyof T)[];
  onDelete: (id: number) => void;
  onView?: (row: T) => void;
  onAdd?: () => void;
  renderCell?: (col: Column, row: T) => React.ReactNode;
  filterConfig?: {
    genderKey?: keyof T;
    statusKey?: keyof T;
    specialtyKey?: keyof T;
    experienceKey?: keyof T;
    doctorKey?: keyof T;
    techKey?: keyof T;
  };
  addTooltip?: string;
  hideSort?: boolean;
  deleteTooltip?: string;
  viewTooltip?: string;
}

type SortOption = "newest" | "oldest" | "name_asc" | "name_desc";
const sortLabels: Record<SortOption, string> = {
  newest:    "Newest First",
  oldest:    "Oldest First",
  name_asc:  "Name (A → Z)",
  name_desc: "Name (Z → A)",
};

function ConfirmDeleteDialog({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 px-4">
      <div className="bg-[#0D1A2D] border border-white/20 rounded-xl p-4 w-full max-w-[260px] flex flex-col gap-3 shadow-2xl">
        <div className="flex flex-col gap-1">
          <h4 className="text-white font-semibold text-xs sm:text-sm">Delete User?</h4>
          <p className="text-gray-400 text-[10px] sm:text-xs">Are you sure you want to delete this user? This action cannot be undone.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={onCancel}  className="flex-1 py-1.5 rounded-lg border border-white/20 text-gray-300 text-[10px] sm:text-xs hover:bg-white/5 transition-colors cursor-pointer">Cancel</button>
          <button onClick={onConfirm} className="flex-1 py-1.5 rounded-lg bg-red-700 text-white text-[10px] sm:text-xs font-semibold hover:bg-red-600 transition-colors cursor-pointer">Yes, Delete</button>
        </div>
      </div>
    </div>
  );
}

const tooltipCls = "absolute bottom-[calc(100%+5px)] left-1/2 -translate-x-1/2 px-[7px] py-[2px] bg-gray-800 text-white text-[10px] font-medium rounded-[5px] whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-[9999] after:content-[''] after:absolute after:top-full after:left-1/2 after:-translate-x-1/2 after:border-[3px] after:border-transparent after:border-t-gray-800";

const scrollbarCls = "[&::-webkit-scrollbar]:w-[3px] [&::-webkit-scrollbar]:h-[3px] [&::-webkit-scrollbar-track]:bg-[#040A16] [&::-webkit-scrollbar-track]:rounded-[10px] [&::-webkit-scrollbar-thumb]:bg-[#303A46] [&::-webkit-scrollbar-thumb]:rounded-[10px] [&::-webkit-scrollbar-thumb:hover]:bg-[#4a5568]";

export function DataTable<T extends { id: number }>({
  data, columns, searchKeys, onDelete, onView, onAdd,
  renderCell, filterConfig,
  addTooltip = "Add", hideSort = false,
  deleteTooltip = "Delete user", viewTooltip = "View details",
}: DataTableProps<T>) {

  const [searchQuery,      setSearchQuery]      = useState("");
  const [showFilter,       setShowFilter]        = useState(false);
  const [sortBy,           setSortBy]            = useState<SortOption>("newest");
  const [filterDoctor,     setFilterDoctor]      = useState("All");
  const [filterTech,       setFilterTech]        = useState("All");
  const [filterSpecialty,  setFilterSpecialty]   = useState("All");
  const [filterExperience, setFilterExperience]  = useState("All");
  const [filterGender,     setFilterGender]      = useState("All");
  const [filterStatus,     setFilterStatus]      = useState("All");
  const [openDropdown,     setOpenDropdown]      = useState<"doctor" | "tech" | null>(null);
  const [pendingDeleteId,  setPendingDeleteId]   = useState<number | null>(null);
  const filterRef = useRef<HTMLDivElement>(null);

  const doctors     = filterConfig?.doctorKey    ? ["All", ...Array.from(new Set(data.map((r) => String(r[filterConfig.doctorKey!]    ?? "")).filter(Boolean)))] : [];
  const techs       = filterConfig?.techKey      ? ["All", ...Array.from(new Set(data.map((r) => String(r[filterConfig.techKey!]      ?? "")).filter(Boolean)))] : [];
  const specialties = filterConfig?.specialtyKey ? ["All", ...Array.from(new Set(data.map((r) => String(r[filterConfig.specialtyKey!] ?? "")).filter(Boolean)))] : [];
  const experienceRanges = ["All", "0-2 years", "3-5 years", "6-10 years", "10+ years"];

  const processed = [...data]
    .filter((row) => {
      const q = searchQuery.toLowerCase().trim();
      if (q && !searchKeys.some((k) => String(row[k] ?? "").toLowerCase().includes(q))) return false;
      if (filterConfig?.doctorKey    && filterDoctor    !== "All" && String(row[filterConfig.doctorKey])    !== filterDoctor)    return false;
      if (filterConfig?.techKey      && filterTech      !== "All" && String(row[filterConfig.techKey])      !== filterTech)      return false;
      if (filterConfig?.specialtyKey && filterSpecialty !== "All" && String(row[filterConfig.specialtyKey]) !== filterSpecialty) return false;
      if (filterConfig?.experienceKey && filterExperience !== "All") {
        const exp = Number(row[filterConfig.experienceKey] ?? 0);
        if (filterExperience === "0-2 years"  && !(exp >= 0  && exp <= 2))  return false;
        if (filterExperience === "3-5 years"  && !(exp >= 3  && exp <= 5))  return false;
        if (filterExperience === "6-10 years" && !(exp >= 6  && exp <= 10)) return false;
        if (filterExperience === "10+ years"  && !(exp > 10))               return false;
      }
      if (filterConfig?.genderKey && filterGender !== "All" && String(row[filterConfig.genderKey]).toLowerCase() !== filterGender.toLowerCase()) return false;
      if (filterConfig?.statusKey && filterStatus !== "All") {
        const val = row[filterConfig.statusKey];
        if (filterStatus === "Active"   && val !== 1) return false;
        if (filterStatus === "Inactive" && val !== 0) return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (hideSort) return b.id - a.id;
      switch (sortBy) {
        case "oldest":    return a.id - b.id;
        case "newest":    return b.id - a.id;
        case "name_asc":  return String(a[searchKeys[0]] ?? "").localeCompare(String(b[searchKeys[0]] ?? ""));
        case "name_desc": return String(b[searchKeys[0]] ?? "").localeCompare(String(a[searchKeys[0]] ?? ""));
        default:          return 0;
      }
    });

  const hasActiveFilters =
    (!hideSort && sortBy !== "newest") ||
    filterDoctor !== "All" || filterTech !== "All" ||
    filterSpecialty !== "All" || filterExperience !== "All" ||
    filterGender !== "All" || filterStatus !== "All";

  const resetAll = () => {
    setSortBy("newest"); setFilterDoctor("All"); setFilterTech("All");
    setFilterSpecialty("All"); setFilterExperience("All");
    setFilterGender("All"); setFilterStatus("All");
  };

  return (
    <div className="w-full flex flex-col p-1 sm:p-1.5 md:p-2">
      {pendingDeleteId !== null && (
        <ConfirmDeleteDialog
          onConfirm={() => { onDelete(pendingDeleteId); setPendingDeleteId(null); }}
          onCancel={() => setPendingDeleteId(null)}
        />
      )}

      <div className="flex flex-col w-full max-w-screen-xl mx-auto">

        <div className="flex items-center justify-between flex-shrink-0 w-full mb-2 md:mb-4">
          <div className="relative w-32 md:w-72">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 w-2.5 h-2.5 md:w-3.5 md:h-3.5" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0D1A2D] border border-[#374151] rounded py-1 pl-6 pr-2 md:py-1.5 md:pl-7 md:pr-3 text-white text-[8px] md:text-xs placeholder-gray-400 outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="flex-1" />

          <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
            <div className="relative group">
              <button onClick={onAdd} className="bg-[#0D1A2D] border border-[#374151] rounded p-1 md:p-1.5 flex items-center justify-center hover:bg-[#1a2a3a] transition-colors text-white cursor-pointer">
                <Plus className="w-2.5 h-2.5 md:w-3.5 md:h-3.5" />
              </button>
              <span className={tooltipCls}>{addTooltip}</span>
            </div>

            <div className="relative group" ref={filterRef}>
              <button
                onClick={() => setShowFilter((p) => !p)}
                className={`relative border border-[#374151] rounded p-1 md:p-1.5 flex items-center justify-center transition-colors text-white cursor-pointer ${showFilter ? "bg-[#1a2a3a]" : "bg-[#0D1A2D] hover:bg-[#1a2a3a]"}`}
              >
                <SlidersHorizontal className="w-2.5 h-2.5 md:w-3.5 md:h-3.5" />
                {hasActiveFilters && <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-[#17387C] rounded-full" />}
              </button>
              <span className={tooltipCls}>Filter &amp; Sort</span>

              {showFilter && (
                <div className={`absolute right-0 top-7 z-50 bg-[#0D1A2D] border border-white/20 rounded-lg p-2 md:p-3 w-44 md:w-52 shadow-xl max-h-[260px] overflow-y-auto ${scrollbarCls}`}>

                  {!hideSort && (
                    <>
                      <p className="text-[9px] md:text-[10px] text-gray-400 mb-1 font-medium tracking-wide uppercase">Sort</p>
                      <div className="flex flex-col gap-0.5 mb-2">
                        {(Object.entries(sortLabels) as [SortOption, string][]).map(([key, label]) => (
                          <button key={key} onClick={() => setSortBy(key)}
                            className={`w-full text-left px-1.5 py-0.5 rounded text-[9px] md:text-[10px] transition-colors cursor-pointer ${sortBy === key ? "bg-[#17387C] text-white font-medium" : "text-gray-300 hover:bg-[#040A16] hover:text-white"}`}>
                            {label}
                          </button>
                        ))}
                      </div>
                    </>
                  )}

                  {filterConfig?.doctorKey && doctors.length > 1 && (
                    <>
                      {!hideSort && <div className="border-t border-white/10 mb-2" />}
                      <p className="text-[9px] md:text-[10px] text-gray-400 mb-1 font-medium tracking-wide uppercase">Doctor</p>
                      <div className="relative mb-2">
                        <button onClick={() => setOpenDropdown(openDropdown === "doctor" ? null : "doctor")}
                          className="w-full flex items-center justify-between px-1.5 py-0.5 bg-[#040A16] border border-white/10 rounded text-[9px] md:text-[10px] text-white hover:bg-[#1a2a3a] transition-colors cursor-pointer">
                          <span className="truncate">{filterDoctor}</span>
                          <ChevronDown className={`ml-1 flex-shrink-0 w-2 h-2 transition-transform ${openDropdown === "doctor" ? "rotate-180" : ""}`} />
                        </button>
                        {openDropdown === "doctor" && (
                          <div className={`absolute left-0 right-0 top-6 z-10 bg-[#0D1A2D] border border-white/20 rounded shadow-xl max-h-28 overflow-y-auto ${scrollbarCls}`}>
                            {doctors.map((d) => (
                              <button key={d} onClick={() => { setFilterDoctor(d); setOpenDropdown(null); }}
                                className={`w-full text-left px-1.5 py-0.5 text-[9px] md:text-[10px] transition-colors cursor-pointer ${filterDoctor === d ? "bg-[#17387C] text-white" : "text-gray-300 hover:bg-[#1a2a3a] hover:text-white"}`}>{d}</button>
                            ))}
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  {filterConfig?.techKey && techs.length > 1 && (
                    <>
                      <div className="border-t border-white/10 mb-2" />
                      <p className="text-[9px] md:text-[10px] text-gray-400 mb-1 font-medium tracking-wide uppercase">Technician</p>
                      <div className="relative mb-2">
                        <button onClick={() => setOpenDropdown(openDropdown === "tech" ? null : "tech")}
                          className="w-full flex items-center justify-between px-1.5 py-0.5 bg-[#040A16] border border-white/10 rounded text-[9px] md:text-[10px] text-white hover:bg-[#1a2a3a] transition-colors cursor-pointer">
                          <span className="truncate">{filterTech}</span>
                          <ChevronDown className={`ml-1 flex-shrink-0 w-2 h-2 transition-transform ${openDropdown === "tech" ? "rotate-180" : ""}`} />
                        </button>
                        {openDropdown === "tech" && (
                          <div className={`absolute left-0 right-0 top-6 z-10 bg-[#0D1A2D] border border-white/20 rounded shadow-xl max-h-28 overflow-y-auto ${scrollbarCls}`}>
                            {techs.map((t) => (
                              <button key={t} onClick={() => { setFilterTech(t); setOpenDropdown(null); }}
                                className={`w-full text-left px-1.5 py-0.5 text-[9px] md:text-[10px] transition-colors cursor-pointer ${filterTech === t ? "bg-[#17387C] text-white" : "text-gray-300 hover:bg-[#1a2a3a] hover:text-white"}`}>{t}</button>
                            ))}
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  {filterConfig?.specialtyKey && specialties.length > 1 && (
                    <>
                      <div className="border-t border-white/10 mb-2" />
                      <p className="text-[9px] md:text-[10px] text-gray-400 mb-1 font-medium tracking-wide uppercase">Specialty</p>
                      <div className="flex flex-col gap-0.5 mb-2">
                        {specialties.map((s) => (
                          <button key={s} onClick={() => setFilterSpecialty(s)}
                            className={`w-full text-left px-1.5 py-0.5 rounded text-[9px] md:text-[10px] transition-colors cursor-pointer ${filterSpecialty === s ? "bg-[#17387C] text-white font-medium" : "text-gray-300 hover:bg-[#040A16] hover:text-white"}`}>{s}</button>
                        ))}
                      </div>
                    </>
                  )}

                  {filterConfig?.experienceKey && (
                    <>
                      <div className="border-t border-white/10 mb-2" />
                      <p className="text-[9px] md:text-[10px] text-gray-400 mb-1 font-medium tracking-wide uppercase">Experience</p>
                      <div className="flex flex-col gap-0.5 mb-2">
                        {experienceRanges.map((e) => (
                          <button key={e} onClick={() => setFilterExperience(e)}
                            className={`w-full text-left px-1.5 py-0.5 rounded text-[9px] md:text-[10px] transition-colors cursor-pointer ${filterExperience === e ? "bg-[#17387C] text-white font-medium" : "text-gray-300 hover:bg-[#040A16] hover:text-white"}`}>{e}</button>
                        ))}
                      </div>
                    </>
                  )}

                  {filterConfig?.genderKey && (
                    <>
                      <div className="border-t border-white/10 mb-2" />
                      <p className="text-[9px] md:text-[10px] text-gray-400 mb-1 font-medium tracking-wide uppercase">Gender</p>
                      <div className="flex gap-0.5 mb-2">
                        {["All", "Male", "Female"].map((g) => (
                          <button key={g} onClick={() => setFilterGender(g)}
                            className={`flex-1 py-0.5 rounded text-[9px] md:text-[10px] font-medium transition-colors cursor-pointer ${filterGender === g ? "bg-[#17387C] text-white" : "bg-[#040A16] text-gray-300 hover:bg-[#1a2a3a]"}`}>{g}</button>
                        ))}
                      </div>
                    </>
                  )}

                  {filterConfig?.statusKey && (
                    <>
                      <div className="border-t border-white/10 mb-2" />
                      <p className="text-[9px] md:text-[10px] text-gray-400 mb-1 font-medium tracking-wide uppercase">Status</p>
                      <div className="flex gap-0.5 mb-2">
                        {["All", "Active", "Inactive"].map((s) => (
                          <button key={s} onClick={() => setFilterStatus(s)}
                            className={`flex-1 py-0.5 rounded text-[9px] md:text-[10px] font-medium transition-colors cursor-pointer ${filterStatus === s ? "bg-[#17387C] text-white" : "bg-[#040A16] text-gray-300 hover:bg-[#1a2a3a]"}`}>{s}</button>
                        ))}
                      </div>
                    </>
                  )}

                  {hasActiveFilters && (
                    <button onClick={resetAll}
                      className="w-full py-0.5 text-[9px] md:text-[10px] text-gray-400 hover:text-white border border-white/10 rounded hover:bg-[#1a2a3a] transition-colors cursor-pointer">
                      Reset All
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className={`overflow-x-auto overflow-y-visible [-webkit-overflow-scrolling:touch] max-w-[calc(100vw-274px)] max-[767px]:max-w-[calc(100vw-24px)] border border-white/30 rounded-lg ${scrollbarCls}`}>
          <table className="w-full text-white min-w-[520px]" style={{ tableLayout: "auto", borderCollapse: "collapse" }}>
            <thead className="sticky top-0 bg-[#040A16] z-10">
              <tr className="border-b border-white/20">
                {columns.map((col) => (
                  <th key={col.key} className="py-1 px-1.5 sm:py-1.5 sm:px-2 md:py-2.5 md:px-3 lg:py-3 lg:px-4 text-[8px] sm:text-[8px] md:text-xs lg:text-sm font-medium text-gray-200 text-left whitespace-nowrap">
                    {col.label}
                  </th>
                ))}
                <th className="py-1 px-1 sm:py-1.5 sm:px-1 md:py-2.5 md:px-1.5 text-[8px] sm:text-[8px] md:text-xs font-medium text-gray-200 text-center whitespace-nowrap w-8 sm:w-10 md:w-12">
                  Action
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/10">
              {processed.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + 1} className="py-6 text-center text-gray-400 text-[8px] md:text-xs">
                    No records found
                  </td>
                </tr>
              ) : (
                processed.map((row) => (
                  <tr key={row.id} className="hover:bg-[#132030] transition-colors">
                    {columns.map((col) => (
                      <td key={col.key} className="py-1 px-1.5 sm:py-1.5 sm:px-2 md:py-2.5 md:px-3 lg:py-3 lg:px-4 text-[8px] sm:text-[8px] md:text-xs lg:text-sm whitespace-nowrap">
                        {renderCell ? renderCell(col, row) : String((row as Record<string, unknown>)[col.key] ?? "—")}
                      </td>
                    ))}
                    <td className="py-0.5 px-1 sm:py-1 sm:px-1 md:py-1.5 md:px-1.5 text-center w-8 sm:w-10 md:w-12">
                      <div className="flex items-center gap-1 md:gap-1.5 justify-center">
                        <div className="relative group">
                          <button onClick={() => onView?.(row)} className="p-0.5 md:p-1 rounded hover:bg-[#1a2a3a] transition-colors text-gray-400 cursor-pointer flex items-center">
                            <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                          </button>
                          <span className={tooltipCls}>{viewTooltip}</span>
                        </div>
                        <div className="relative group">
                          <button onClick={() => setPendingDeleteId(row.id)} className="p-0.5 md:p-1 rounded hover:bg-[#1a2a3a] transition-colors text-gray-400 hover:text-red-400 cursor-pointer flex items-center">
                            <Trash className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                          </button>
                          <span className={tooltipCls}>{deleteTooltip}</span>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}