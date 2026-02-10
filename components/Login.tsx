"use client";

import { LOG_IN } from "@/constant";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, Arrowlist } from "@/components/icons";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
  role: z.string().min(1, "Please select a role"),
});

const Login = () => {
  const router = useRouter();
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordValue, setPasswordValue] = useState("");

  const handelsumbite = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setGeneralError(null);

    const formData = new FormData(e.currentTarget);
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;
    const role = formData.get("role") as string; // هنا عندك المسار مثل /doctor

    const result = loginSchema.safeParse({ username, password, role });

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

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userName: result.data.username, // ✅ API يحتاج userName
          password: result.data.password,
          role: result.data.role, // ✅ نرسل المسار /doctor... والـ API بيحوّله
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setGeneralError(data?.message || "Login failed");
        return;
      }

      // نخزن بيانات المستخدم (اختياري لكن مفيد)
      localStorage.setItem("vismed_user", JSON.stringify(data.user));
      localStorage.setItem("userRole", result.data.role);

      // توجيه حسب الدور المختار
      router.push(result.data.role);
    } catch (err) {
      setGeneralError("Server error");
    }
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
            <div style={{ position: "relative" }}>
              <input 
                className="input" 
                type={showPassword ? "text" : "password"} 
                name="password"
                value={passwordValue}
                onChange={(e) => setPasswordValue(e.target.value)}
              />
              {passwordValue && (
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: "0",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  {showPassword ? (
                    <EyeOff size={20} color="#303A46" strokeWidth={2.5} />
                  ) : (
                    <Eye size={20} color="#303A46" strokeWidth={2.5} />
                  )}
                </button>
              )}
            </div>
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

              <Arrowlist className="chev" />
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