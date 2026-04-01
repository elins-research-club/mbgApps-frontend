// /frontend/src/components/UserMenu.js

import { useState, useEffect, useRef } from "react";
// --- 1. SwitchAccountIcon dihapus dari import ---
import { UserIcon, LogOutIcon } from "./Icons";
import { ChevronDown } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

const UserMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  // --- 2. 'login' dihapus, karena tidak dipakai lagi ---
  const { user, logout } = useAuth();
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // --- 3. Fungsi handleSwitchAccount DIHAPUS ---

  // Fungsi logout asli
  const handleLogout = () => {
    logout();
    setIsOpen(false);
  };

  // Jika tidak ada user, jangan render apa-apa
  if (!user) {
    return null;
  }

  // --- JSX RETURN ---
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-2 rounded-lg text-sm text-left text-[#452829] hover:bg-[#E8D1C5] transition-colors"
      >
        <div className="w-8 h-8 rounded-full bg-[#E8D1C5] flex items-center justify-center text-white0">
          <UserIcon />
        </div>
        <div>
          <div className="font-bold text-[#17191B]">{user.name}</div>
          <div className="text-xs text-white0">{user.role}</div>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-[#C9A89A] transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-60 bg-white rounded-lg shadow-xl border border-white z-50 overflow-hidden">
          <div className="p-3 border-b border-white">
            <p className="text-sm font-semibold text-[#17191B]">{user.name}</p>
            <p className="text-xs text-white0">{user.role}</p>
          </div>
          <nav className="p-1">
            {/* --- 4. Tombol "Ganti Akun" DIHAPUS dari sini --- */}

            <button
              onClick={handleLogout}
              className="w-full text-left flex items-center gap-3 px-3 py-2 text-sm text-red-600 rounded-md hover:bg-red-50 transition-colors"
            >
              <LogOutIcon />
              <span>Logout</span>
            </button>
          </nav>
        </div>
      )}
    </div>
  );
};

export default UserMenu;