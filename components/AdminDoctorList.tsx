"use client";
import { useState, useEffect, useCallback } from "react";
import { CheckCircle } from "lucide-react";
import { DataTable, Column } from "@/components/DataTable";
import AdminUserView, { AnyUser } from "@/components/AdminUserView";
import AddUserPage from "@/components/AddUser";

// ── Types ──────────────────────────────────────────────────────────────────

interface Doctor {
  id: number;
  firstName: string;
  middleName?: string;
  lastName: string;
  gender: string;
  isActive: number;
  specialty: string;
  doctorCode: string;
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
  { key: "doctorCode",      label: "Doctor ID"  },
  { key: "firstName",       label: "First Name" },
  { key: "lastName",        label: "Last Name"  },
  { key: "gender",          label: "Gender"     },
  { key: "specialty",       label: "Specialty"  },
  { key: "yearsExperience", label: "Experience" },
  { key: "isActive",        label: "Status"     },
];

// ── AdminDoctorList — displays the full list of doctors ───────────────────

export default function AdminDoctorList() {
  const [doctors,      setDoctors]      = useState<Doctor[]>([]);
  const [selectedUser, setSelectedUser] = useState<AnyUser | null>(null);
  const [showAdd,      setShowAdd]      = useState(false);
  const [successMsg,   setSuccessMsg]   = useState<string | null>(null);

  // Fetch all doctors from the API and update local state
  const fetchDoctors = useCallback(async () => {
    try {
      const res  = await fetch("/api/admin/users?role=doctor");
      const data = await res.json();
      if (data.status === "ok") setDoctors(data.users);
    } catch (err) { console.error(err); }
  }, []);

  useEffect(() => { fetchDoctors(); }, [fetchDoctors]);

  // Auto-clear the success banner after 4 seconds
  useEffect(() => {
    if (!successMsg) return;
    const t = setTimeout(() => setSuccessMsg(null), 4000);
    return () => clearTimeout(t);
  }, [successMsg]);

  // Send a DELETE request and remove the doctor from local state on success
  const handleDelete = async (id: number) => {
    const res  = await fetch(`/api/admin/users?id=${id}`, { method: "DELETE" });
    const data = await res.json();
    if (data.status === "ok") setDoctors((d) => d.filter((u) => u.id !== id));
  };

  // Render custom cell content for specific columns (status badge, gender, experience)
  const renderCell = (col: Column, row: Doctor) => {
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

  // Show the detail view if a doctor row is selected
  if (selectedUser)
  return (
    <AdminUserView
      user={selectedUser}
      onClose={() => {
        setSelectedUser(null);
        fetchDoctors();
      }}
    />
  );
  
  // Show the add form if the add button was clicked
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
    <section className="main-section-container w-full min-w-0 h-screen flex flex-col items-center justify-center overflow-visible">
      <div className="w-full px-1.5 sm:px-2 md:px-3 lg:px-4 overflow-visible">
        {successMsg && (
          <div className="mb-2 md:mb-3 bg-green-900/30 border border-green-500/30 rounded-xl px-3 py-2 text-green-300 text-[10px] md:text-xs flex items-center gap-2">
            <CheckCircle size={13} className="flex-shrink-0 text-green-400" />
            <span>{successMsg}</span>
          </div>
        )}
        <div className="bg-[#040A16] border border-white/30 rounded-[10px] p-2 md:p-3 lg:p-4 w-full min-w-0 overflow-visible">
          <DataTable
            data={doctors}
            columns={columns}
            searchKeys={["firstName", "lastName", "doctorCode"]}
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