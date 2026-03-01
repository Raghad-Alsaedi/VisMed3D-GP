"use client";
import { useState, useEffect, useCallback } from "react";
import { CheckCircle } from "lucide-react";
import { DataTable, Column } from "@/components/DataTable";
import AdminUserView, { AnyUser } from "@/components/AdminUserView";
import AddUserPage from "@/components/AddUser";

interface Technician {
  id: number;
  first_name: string;
  middle_name?: string;
  last_name: string;
  gender: string;
  is_active: number;
  specialty: string;
  technician_code: string;
  license_number: string;
  years_experience: number;
  username: string;
  email: string;
  phone: string;
  profile_picture?: string;
  created_at: string;
  updated_at?: string;
}

const columns: Column[] = [
  { key: "technician_code",  label: "Technician ID" },
  { key: "first_name",       label: "First Name" },
  { key: "last_name",        label: "Last Name" },
  { key: "gender",           label: "Gender" },
  { key: "specialty",        label: "Specialty" },
  { key: "years_experience", label: "Experience" },
  { key: "is_active",        label: "Status" },
];

export default function AdminTechList() {
  const [techs,        setTechs]        = useState<Technician[]>([]);
  const [selectedUser, setSelectedUser] = useState<AnyUser | null>(null);
  const [showAdd,      setShowAdd]      = useState(false);
  const [successMsg,   setSuccessMsg]   = useState<string | null>(null);

  const fetchTechs = useCallback(async () => {
    try {
      const res  = await fetch("/api/admin/users?role=technician");
      const data = await res.json();
      if (data.status === "ok") setTechs(data.users);
    } catch (err) { console.error(err); }
  }, []);

  useEffect(() => { fetchTechs(); }, [fetchTechs]);
  useEffect(() => {
    if (!successMsg) return;
    const t = setTimeout(() => setSuccessMsg(null), 4000);
    return () => clearTimeout(t);
  }, [successMsg]);

  const handleDelete = async (id: number) => {
    const res  = await fetch(`/api/admin/users?id=${id}`, { method: "DELETE" });
    const data = await res.json();
    if (data.status === "ok") setTechs((t) => t.filter((u) => u.id !== id));
  };

  const renderCell = (col: Column, row: Technician) => {
    if (col.key === "is_active")
      return (
        <span className={`px-1 md:px-1.5 py-px rounded-full text-[8px] md:text-[10px] font-medium ${row.is_active ? "bg-green-600" : "bg-[#6E6E6E]"} text-white`}>
          {row.is_active ? "Active" : "Inactive"}
        </span>
      );
    if (col.key === "gender") return <span className="capitalize">{row.gender}</span>;
    if (col.key === "years_experience") return <span>{row.years_experience} yrs</span>;
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
            searchKeys={["first_name", "last_name", "technician_code"]}
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
              statusKey:     "is_active",
              specialtyKey:  "specialty",
              experienceKey: "years_experience",
            }}
          />
        </div>
      </div>
    </section>
  );
}