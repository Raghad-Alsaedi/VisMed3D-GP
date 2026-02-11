"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";

const LogOut = () => {
  const router = useRouter();

  const handleLogout = () => {
    sessionStorage.clear(); 
  };

  return (
    <div className="logout-page">
      <h1 className="logout-title">Log out</h1>

      <div className="logout-content-wrapper">
        <div className="logout-card">
          <h2 className="logout-message">Are you sure you want to log out?</h2>
          <div className="logout-buttons-wrapper">
            <button className="btn-large-primary" onClick={() => router.back()}>
              Cancel
            </button>

            <Link
              href="/login"
              className="btn-large-danger inline-block"
              onClick={handleLogout} 
            >
              Log out
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogOut;