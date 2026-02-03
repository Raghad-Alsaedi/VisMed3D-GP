import { LOG_OUT } from "@/constant";
import Link from "next/link";
import { Logout } from "./icons";

const LogOutButton = () => {
  return (
    <button>
      {LOG_OUT.map((link) => {
        return (
          <Link
            href={link.href}
            key={link.Key}
            className="logout-btn-link"
          >
            <Logout />
            {link.label}
          </Link>
        );
      })}
    </button>
  );
};

export default LogOutButton;