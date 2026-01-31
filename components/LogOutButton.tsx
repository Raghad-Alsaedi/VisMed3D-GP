import { LOG_OUT } from "@/constant";
import Link from "next/link";

const LogOutButton = () => {
  return (
    <button>
      {LOG_OUT.map((link) => {
        return (
          <Link
            href={link.href}
            key={link.Key}
            className="flex items-center gap-3 justify-center bottom-4 h-10 p-2 text-gray-300 rounded-lg hover:bg-gray-900  hover:font-semibold hover:text-red-700 ml-16"
          >
            <svg
              width={24}
              height={24}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d={link.icon1}
              />
              <path fill="currentColor" d={link.icon2} />
            </svg>
            {link.label}
          </Link>
        );
      })}
    </button>
  );
};

export default LogOutButton;
