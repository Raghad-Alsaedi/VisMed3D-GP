import { Home, Patients, Logout, Upload_File, Radiology_Technician } from "@/components/icons";

export const NAV_LINKS_DOCTOR = [
  {
    href: "/doctor",
    Key: "doctor_home",
    label: "Home",
    icon: Home,
  },
  {
    href: "/doctor/patients",
    Key: "doctor_patients",
    label: "Patients",
    icon: Patients,
  },
];

export const NAV_LINKS_TECH = [
  {
    href: "/radio_tech",
    Key: "radiology_technician_home",
    label: "Home",
    icon: Home,
  },
  {
    href: "/radio_tech/uploadFile",
    Key: "radiology_technician_Upload",
    label: "Upload",
    icon: Upload_File,
  },
];

export const LOG_OUT = [
  {
    href: "/logout",
    Key: "log_out",
    label: "Log Out",
    icon: Logout,
  },
];

export const LOG_IN = [
  { href: "/doctor", key: "doctor", label: "Doctor" },
  {
    href: "/radio_tech",
    key: "radiology technician",
    label: "Radiology Technician",
  },
  { href: "/patients", key: "patients", label: "Patient" },
  { key: "admin",      label: "Admin",       href: "/admin" },
];


import { UsersRound, Stethoscope} from "lucide-react";

export const NAV_LINKS_ADMIN = [
  {
    Key: "patients",
    label: "Patients",
    href: "/admin/patients",
    icon: UsersRound,
  },
  {
    Key: "doctors",
    label: "Doctors",
    href: "/admin/doctors",
    icon: Stethoscope,
  },
  {
    Key: "technicians",
    label: "Technicians",
    href: "/admin/technicians",
    icon: Radiology_Technician,
  },
  
];

