"use client";
import { useState, useEffect, useCallback } from "react";
import { CheckCircle } from "lucide-react";
import { DataTable, Column } from "@/components/DataTable";
import AdminUserView, { AnyUser } from "@/components/AdminUserView";
import AddUserPage from "@/components/AddUser";

interface Doctor {
  id: number;
  first_name: string;
  middle_name?: string;
  last_name: string;
  gender: string;
  is_active: number;
  specialty: string;
  doctor_code: string;
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
  { key: "doctor_code",      label: "Doctor ID" },
  { key: "first_name",       label: "First Name" },
  { key: "last_name",        label: "Last Name" },
  { key: "gender",           label: "Gender" },
  { key: "specialty",        label: "Specialty" },
  { key: "years_experience", label: "Experience" },
  { key: "is_active",        label: "Status" },
];

export default function AdminDoctorList() {
  const [doctors,      setDoctors]      = useState<Doctor[]>([]);
  const [selectedUser, setSelectedUser] = useState<AnyUser | null>(null);
  const [showAdd,      setShowAdd]      = useState(false);
  const [successMsg,   setSuccessMsg]   = useState<string | null>(null);

  const fetchDoctors = useCallback(async () => {
    try {
      const res  = await fetch("/api/admin/users?role=doctor");
      const data = await res.json();
      if (data.status === "ok") setDoctors(data.users);
    } catch (err) { console.error(err); }
  }, []);

  useEffect(() => { fetchDoctors(); }, [fetchDoctors]);
  useEffect(() => {
    if (!successMsg) return;
    const t = setTimeout(() => setSuccessMsg(null), 4000);
    return () => clearTimeout(t);
  }, [successMsg]);

  const handleDelete = async (id: number) => {
    const res  = await fetch(`/api/admin/users?id=${id}`, { method: "DELETE" });
    const data = await res.json();
    if (data.status === "ok") setDoctors((d) => d.filter((u) => u.id !== id));
  };

  const renderCell = (col: Column, row: Doctor) => {
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
        type="doctor"
        onBack={(msg) => {
          setShowAdd(false);
          if (msg) { setSuccessMsg(msg); fetchDoctors(); }
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
            data={doctors}
            columns={columns}
            searchKeys={["first_name", "last_name", "doctor_code"]}
            onDelete={handleDelete}
            onView={(row) => setSelectedUser({ ...row, role: "doctor" } as AnyUser)}
            onAdd={() => setShowAdd(true)}
            renderCell={renderCell}
            addTooltip="Add Doctor"
            deleteTooltip="Delete doctor"
            viewTooltip="View doctor details"
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