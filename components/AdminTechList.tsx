"use client";
import { useState, useEffect, useCallback } from "react";
import { CheckCircle } from "lucide-react";
import { DataTable, Column } from "@/components/DataTable";
import AdminUserView, { AnyUser } from "@/components/AdminUserView";
import AddUserPage from "@/components/AddUser";

// ── Types ──────────────────────────────────────────────────────────────────

interface Technician {
  id: number;
  firstName: string;
  middleName?: string;
  lastName: string;
  gender: string;
  isActive: number;
  specialty: string;
  technicianCode: string;
  licenseNumber: string;
  yearsExperience: number;
  username: string;
  email: string;
  phone: string;
  profilePicture?: string;
  createdAt: string;
  updatedAt?: string;
}

// ── Table column definitions ───────────────────────────────────────────────

const columns: Column[] = [
  { key: "technicianCode",  label: "Technician ID" },
  { key: "firstName",       label: "First Name"    },
  { key: "lastName",        label: "Last Name"     },
  { key: "gender",          label: "Gender"        },
  { key: "specialty",       label: "Specialty"     },
  { key: "yearsExperience", label: "Experience"    },
  { key: "isActive",        label: "Status"        },
];

// ── AdminTechList — displays the full list of technicians ─────────────────

export default function AdminTechList() {
  const [techs,        setTechs]        = useState<Technician[]>([]);
  const [selectedUser, setSelectedUser] = useState<AnyUser | null>(null);
  const [showAdd,      setShowAdd]      = useState(false);
  const [successMsg,   setSuccessMsg]   = useState<string | null>(null);

  // Fetch all technicians from the API and update local state
  const fetchTechs = useCallback(async () => {
    try {
      const res  = await fetch("/api/admin/users?role=technician");
      const data = await res.json();
      if (data.status === "ok") setTechs(data.users);
    } catch (err) { console.error(err); }
  }, []);

  useEffect(() => { fetchTechs(); }, [fetchTechs]);

  // Auto-clear the success banner after 4 seconds
  useEffect(() => {
    if (!successMsg) return;
    const t = setTimeout(() => setSuccessMsg(null), 4000);
    return () => clearTimeout(t);
  }, [successMsg]);

  // Send a DELETE request and remove the technician from local state on success
  const handleDelete = async (id: number) => {
    const res  = await fetch(`/api/admin/users?id=${id}`, { method: "DELETE" });
    const data = await res.json();
    if (data.status === "ok") setTechs((t) => t.filter((u) => u.id !== id));
  };

  // Render custom cell content for status, gender, and experience columns
  const renderCell = (col: Column, row: Technician) => {
    if (col.key === "isActive")
      return (
        <span className={`px-1 md:px-2 py-px md:py-0.5 rounded-full text-[8px] md:text-xs font-medium ${row.isActive ? "bg-[#1F9C3E]" : "bg-[#6E6E6E]"} text-white`}>
          {row.isActive ? "Active" : "Inactive"}
        </span>
      );
    if (col.key === "gender") return <span className="capitalize">{row.gender}</span>;
    if (col.key === "yearsExperience") return <span>{row.yearsExperience} yrs</span>;
    return String((row as unknown as Record<string, unknown>)[col.key] ?? "—");
  };

  if (selectedUser)
    return <AdminUserView user={selectedUser} onClose={() => setSelectedUser(null)} />;

  if (showAdd)
    return (
      <AddUserPage
        type="technician"
        onBack={(msg) => {
          setShowAdd(false);
          if (msg) { setSuccessMsg(msg); fetchTechs(); }
        }}
      />
    );

  return (
    <section className="main-section-container w-full min-w-0 h-screen flex flex-col items-center justify-center overflow-hidden">
      <div className="w-full px-1.5 sm:px-2 md:px-3 lg:px-4 overflow-hidden">
        {successMsg && (
          <div className="mb-2 md:mb-3 bg-green-900/30 border border-green-500/30 rounded-xl px-3 py-2 text-green-300 text-[10px] md:text-xs flex items-center gap-2">
            <CheckCircle size={13} className="flex-shrink-0 text-green-400" />
            <span>{successMsg}</span>
          </div>
        )}
        <div className="bg-[#040A16] border border-white/30 rounded-[10px] p-2 md:p-3 lg:p-4 w-full min-w-0 overflow-hidden">
          <DataTable
            data={techs}
            columns={columns}
            searchKeys={["firstName", "lastName", "technicianCode"]}
            onDelete={handleDelete}
            onView={(row) => setSelectedUser({ ...row, role: "technician" } as AnyUser)}
            onAdd={() => setShowAdd(true)}
            renderCell={renderCell}
            addTooltip="Add Technician"
            deleteTooltip="Delete technician"
            viewTooltip="View technician details"
            hideSort={true}
            filterConfig={{
              genderKey:     "gender",
              statusKey:     "isActive",
              specialtyKey:  "specialty",
              experienceKey: "yearsExperience",
            }}
          />
        </div>
      </div>
    </section>
  );
}