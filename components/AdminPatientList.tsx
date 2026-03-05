"use client";
import { useState, useEffect, useCallback } from "react";
import { CheckCircle } from "lucide-react";
import { DataTable, Column } from "@/components/DataTable";
import AdminUserView, { AnyUser } from "@/components/AdminUserView";
import AddUserPage from "@/components/AddUser";

interface Patient {
  id: number;
  first_name: string;
  middle_name?: string;
  last_name: string;
  gender: string;
  is_active: number;
  mrn: string;
  national_id: string;
  date_of_birth: string;
  created_at: string;
  updated_at?: string;
  username: string;
  email: string;
  phone: string;
  profile_picture?: string;
  doctor_name: string;
  tech_name: string;
}

const columns: Column[] = [
  { key: "mrn",         label: "MRN" },
  { key: "first_name",  label: "First Name" },
  { key: "last_name",   label: "Last Name" },
  { key: "gender",      label: "Gender" },
  { key: "doctor_name", label: "Doctor" },
  { key: "tech_name",   label: "Technician" },
  { key: "is_active",   label: "Status" },
];

export default function AdminPatientList() {
  const [patients,     setPatients]     = useState<Patient[]>([]);
  const [selectedUser, setSelectedUser] = useState<AnyUser | null>(null);
  const [showAdd,      setShowAdd]      = useState(false);
  const [successMsg,   setSuccessMsg]   = useState<string | null>(null);

  const fetchPatients = useCallback(async () => {
    try {
      const res  = await fetch("/api/admin/users?role=patient");
      const data = await res.json();
      if (data.status === "ok") setPatients(data.users);
    } catch (err) { console.error(err); }
  }, []);

  useEffect(() => { fetchPatients(); }, [fetchPatients]);
  useEffect(() => {
    if (!successMsg) return;
    const t = setTimeout(() => setSuccessMsg(null), 4000);
    return () => clearTimeout(t);
  }, [successMsg]);

  const handleDelete = async (id: number) => {
    const res  = await fetch(`/api/admin/users?id=${id}`, { method: "DELETE" });
    const data = await res.json();
    if (data.status === "ok") setPatients((p) => p.filter((u) => u.id !== id));
  };

  const renderCell = (col: Column, row: Patient) => {
    if (col.key === "is_active")
      return (
        <span className={`px-1 md:px-2 py-px md:py-0.5 rounded-full text-[8px] md:text-xs font-medium ${row.is_active ? "bg-[#1F9C3E]" : "bg-[#6E6E6E]"} text-white`}>
          {row.is_active ? "Active" : "Inactive"}
        </span>
      );
    if (col.key === "gender") return <span className="capitalize">{row.gender}</span>;
    return String((row as unknown as Record<string, unknown>)[col.key] ?? "—");
  };

  if (selectedUser)
    return <AdminUserView user={selectedUser} onClose={() => setSelectedUser(null)} />;

  if (showAdd)
    return (
      <AddUserPage
        type="patient"
        onBack={(msg) => {
          setShowAdd(false);
          if (msg) { setSuccessMsg(msg); fetchPatients(); }
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
            data={patients}
            columns={columns}
            searchKeys={["first_name", "last_name", "mrn"]}
            onDelete={handleDelete}
            onView={(row) => setSelectedUser({ ...row, role: "patient" } as AnyUser)}
            onAdd={() => setShowAdd(true)}
            renderCell={renderCell}
            addTooltip="Add Patient"
            deleteTooltip="Delete patient"
            viewTooltip="View patient details"
            hideSort={true}
            filterConfig={{
              genderKey: "gender",
              statusKey: "is_active",
              doctorKey: "doctor_name",
              techKey:   "tech_name",
            }}
          />
        </div>
      </div>
    </section>
  );
}