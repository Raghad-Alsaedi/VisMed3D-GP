import NextAuth, { DefaultSession } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      doctor_id?: number | null;     
      patient_id?: number | null;     
      technician_id?: number | null; 
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role: string;
    doctor_id?: number | null;        
    patient_id?: number | null;       
    technician_id?: number | null;    
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    doctor_id?: number | null;        
    patient_id?: number | null;       
    technician_id?: number | null;   
  }
}