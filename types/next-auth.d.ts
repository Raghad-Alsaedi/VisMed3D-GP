import NextAuth, { DefaultSession } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      doctor_id?: number | null;      // ✅ إضافة
      patient_id?: number | null;     // ✅ إضافة
      technician_id?: number | null;  // ✅ إضافة
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role: string;
    doctor_id?: number | null;        // ✅ إضافة
    patient_id?: number | null;       // ✅ إضافة
    technician_id?: number | null;    // ✅ إضافة
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    doctor_id?: number | null;        // ✅ إضافة
    patient_id?: number | null;       // ✅ إضافة
    technician_id?: number | null;    // ✅ إضافة
  }
}