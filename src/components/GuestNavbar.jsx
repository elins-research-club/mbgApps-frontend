// /frontend/src/components/GuestNavbar.js

import { UserIcon } from "./Icons";
import { ChevronDown } from "lucide-react";

const GuestNavbar = ({ onLoginClick }) => {
  return (
    <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-[#E8D1C5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Kiri: Judul */}
          <span className="text-xl font-bold text-white0 tracking-tight">
            Kalkulator Gizi MBG
          </span>

          {/* Kanan: Tombol Login */}
          <button
            onClick={onLoginClick}
            className="flex items-center gap-2 p-2 rounded-lg text-sm font-medium text-[#37393B] hover:bg-[#E8D1C5] transition-colors"
          >
            <UserIcon />
            <span>Login</span>
            <ChevronDown className="w-4 h-4 text-[#C9A89A]" />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default GuestNavbar;