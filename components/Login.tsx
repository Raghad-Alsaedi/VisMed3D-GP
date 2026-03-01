"use client";

import { LOG_IN } from "@/constant";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { Eye, EyeOff, Arrowlist } from "@/components/icons";
import Link from "next/link";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
  role: z.string().min(1, "Please select a role"),
});

const roleRoutes: Record<string, string> = {
  "/admin":      "/admin",
  "/doctor":     "/doctor",
  "/patients":   "/patients",
  "/radio_tech": "/radio_tech",
};

const Login = () => {
  const router = useRouter();
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isInactive, setIsInactive]     = useState(false); 
  const [loading, setLoading]           = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [usernameValue, setUsernameValue] = useState("");
  const [passwordValue, setPasswordValue] = useState("");

  const handelsumbite = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setGeneralError(null);
    setIsInactive(false);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const username = (formData.get("username") as string) || "";
    const password = (formData.get("password") as string) || "";
    const role     = (formData.get("role") as string) || "";

    const result = loginSchema.safeParse({ username, password, role });

    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      if (fieldErrors.username)      setGeneralError("Please fill in the username field");
      else if (fieldErrors.password) setGeneralError("Please fill in the password field");
      else if (fieldErrors.role)     setGeneralError("Please select a role");
      else                           setGeneralError("Invalid input");
      setLoading(false);
      return;
    }

    try {
      const res = await signIn("credentials", {
        username: result.data.username,
        password: result.data.password,
        role:     result.data.role,
        redirect: false,
      });

      if (res?.error) {
        if (res.error === "Account is inactive") {
          setIsInactive(true);
        } else {
          setGeneralError("Invalid credentials");
        }
        setLoading(false);
        return;
      }

      if (res?.ok && !res?.error) {
        router.push(roleRoutes[result.data.role] ?? "/login");
        router.refresh();
      }

    } catch (error) {
      console.error("Login error:", error);
      setGeneralError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <Link href={"/viewimg"} className="absolute top-0 left-0 m-2">
        go to Image
      </Link> 
      

      <main className="login-card">
        <div className="brand" style={{ marginTop: "-12px", marginBottom: "0px" }}>
          <Image
            src="/logo.png"
            alt="VisMed3D"
            width={240}
            height={150}
            className="brand-logo"
            priority
          />
        </div>

        <h1 className="title" style={{ marginTop: "4px", marginBottom: "20px" }}>
          WELCOME BACK
        </h1>

        {isInactive && (
          <div
            style={{
              padding: "10px 16px",
              backgroundColor: "#dc3545",
              borderRadius: "6px",
              marginBottom: "20px",
              color: "#ffffff",
              fontSize: "13px",
              textAlign: "center",
              fontWeight: "600",
            }}
          >
            Your account is inactive. Please contact your administrator.
          </div>
        )}

        {generalError && !isInactive && (
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
            <input
              className="input"
              type="text"
              name="username"
              value={usernameValue}
              onChange={(e) => setUsernameValue(e.target.value)}
              autoComplete="username"
            />
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
                autoComplete="current-password"
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

          <button className="btn" type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>
      </main>
    </div>
  );
};

export default Login;