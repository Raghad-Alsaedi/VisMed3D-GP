"use client";

import { LOG_IN } from "@/constant";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useState } from "react";
import Link from "next/link";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
  role: z.string().min(1, "Please select a role"),
});

const USERS_DATABASE = [
  { username: "doctor", password: "doctor123", role: "/doctor" },
  { username: "dr.ahmed", password: "ahmed@123", role: "/doctor" },

  { username: "patient", password: "patient123", role: "/patients" },
  { username: "mohammed", password: "mohammed@123", role: "/patients" },

  {
    username: "radiology technician",
    password: "tech123",
    role: "/radio_tech",
  },
  { username: "Sarah", password: "recept@123", role: "/radio_tech" },
];

const Login = () => {
  const router = useRouter();
  const [generalError, setGeneralError] = useState<string | null>(null);

  const handelsumbite = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setGeneralError(null);

    const formData = new FormData(e.currentTarget);
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;
    const role = formData.get("role") as string;

    const result = loginSchema.safeParse({
      username,
      password,
      role,
    });

    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;

      if (fieldErrors.username) {
        setGeneralError("Please fill in the username field");
        return;
      }
      if (fieldErrors.password) {
        setGeneralError("Please fill in the password field");
        return;
      }
      if (fieldErrors.role) {
        setGeneralError("Please select a role");
        return;
      }
      return;
    }

    const user = USERS_DATABASE.find(
      (u) =>
        u.username === result.data.username &&
        u.password === result.data.password &&
        u.role === result.data.role,
    );

    if (!user) {
      setGeneralError("Invalid username, password, or role type");
      return;
    }
    localStorage.setItem("userRole", user.role);

    router.push(user.role);
  };

  return (
    <div className="login-page">
     <Link href={"/viewimg"} className="absolute top-0 left-0 m-2">
      go to Image
      </Link>

      <main className="login-card">
        <div
          className="brand"
          style={{
            marginTop: "-12px",
            marginBottom: "0px",
          }}
        >
          <Image
            src="/logo.png"
            alt="VisMed3D"
            width={240}
            height={150}
            className="brand-logo"
            priority
          />
        </div>

        <h1
          className="title"
          style={{
            marginTop: "4px",
            marginBottom: "20px",
          }}
        >
          WELCOME BACK
        </h1>

        {generalError && (
          <div
            style={{
              padding: "10px 16px",
              backgroundColor: "#dc3545",
              borderRadius: "6px",
              marginBottom: "20px",
              color: "#ffffff",
              fontSize: "13px",
              textAlign: "center",
            }}
          >
            {generalError}
          </div>
        )}

        <form className="form" onSubmit={handelsumbite}>
          <label className="field">
            <span className="label">Username</span>
            <input className="input" type="text" name="username" />
          </label>

          <label className="field">
            <span className="label">Password</span>
            <input className="input" type="password" name="password" />
          </label>

          <label className="field">
            <span className="sr-only">Role</span>

            <div className="select-wrap">
              <select className="select" name="role" defaultValue="">
                <option value="" disabled>
                  Select Role
                </option>
                {LOG_IN.map((link) => (
                  <option key={link.key} value={link.href}>
                    {link.label}
                  </option>
                ))}
              </select>

              <span className="chev">▾</span>
            </div>
          </label>

          <button className="btn" type="submit">
            Login
          </button>
        </form>
      </main>
    </div>
  );
};

export default Login;
