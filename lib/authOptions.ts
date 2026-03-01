import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/database/db";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
        role: { label: "Role", type: "text" },
      },

      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          throw new Error("Missing credentials");
        }

        try {
          const [rows]: any = await db.query(
            `
            SELECT 
              u.id,
              u.username,
              u.first_name,
              u.last_name,
              u.middle_name,
              u.email,
              u.password_hash,
              u.role,
              u.is_active,
              u.doctor_id,
              u.patient_id,
              u.technician_id
            FROM users u
            WHERE u.username = ?
            LIMIT 1
            `,
            [credentials.username]
          );

          const user = rows?.[0];
          if (!user) {
            throw new Error("Invalid credentials");
          }

          const isValid = await bcrypt.compare(
            credentials.password,
            user.password_hash
          );
          if (!isValid) {
            throw new Error("Invalid credentials");
          }

          if (!user.is_active) {
            throw new Error("Account is inactive");
          }

          if (credentials.role) {
            const roleMap: Record<string, string> = {
              "/doctor":     "doctor",
              "/patients":   "patient",
              "/radio_tech": "technician",
              "/admin":      "admin",
            };

            const selectedRole = roleMap[credentials.role] || credentials.role;

            if (selectedRole !== user.role) {
              throw new Error("Invalid credentials");
            }
          }

          return {
            id: String(user.id),
            name: `${user.first_name} ${user.last_name}`,
            username: user.username,
            email: user.email ?? null,
            role: user.role,
            doctor_id: user.doctor_id,
            patient_id: user.patient_id,
            technician_id: user.technician_id,
          } as any;
        } catch (error) {
          console.error("Auth error:", error);
          throw error;
        }
      },
    }),
  ],

  session: { strategy: "jwt" },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id            = (user as any).id;
        token.role          = (user as any).role;
        token.username      = (user as any).username;
        token.doctor_id     = (user as any).doctor_id;
        token.patient_id    = (user as any).patient_id;
        token.technician_id = (user as any).technician_id;
      }
      return token;
    },

    async session({ session, token }) {
      if (token?.id) {
        const [rows]: any = await db.query(
          `SELECT is_active FROM users WHERE id = ? LIMIT 1`,
          [token.id]
        );
        if (!rows?.[0]?.is_active) {
          return null as any;
        }
      }

      if (session.user) {
        (session.user as any).id            = token.id;
        (session.user as any).role          = token.role;
        (session.user as any).username      = token.username;
        (session.user as any).doctor_id     = token.doctor_id;
        (session.user as any).patient_id    = token.patient_id;
        (session.user as any).technician_id = token.technician_id;
      }
      return session;
    },
  },

  pages: {
    signIn: "/login",
  },

  secret: process.env.NEXTAUTH_SECRET,

  debug: process.env.NODE_ENV === "development",
};