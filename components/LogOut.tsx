"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";

const LogOut = () => {
  const router = useRouter();

  const handleLogout = () => {
    sessionStorage.clear(); 
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "#040A16" }}>
      <div className="logout-content-wrapper">
        <div className="logout-card">
          <h2 className="logout-message">Are you sure you want to log out?</h2>
          <div className="logout-buttons-wrapper">
            <button
              className="btn-large text-white"
              style={{ background: "#0D1A2D", border: "1px solid rgba(255,255,255,0.3)" }}
              onClick={() => router.back()}
              onMouseEnter={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.6)")}
              onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)")}
              onMouseDown={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.6)")}
              onMouseUp={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)")}
            >
              Cancel
            </button>

            <Link
              href="/login"
              className="btn-large inline-block text-white bg-red-600 hover:bg-red-500"
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