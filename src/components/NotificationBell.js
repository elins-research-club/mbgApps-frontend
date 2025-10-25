// /frontend/src/components/NotificationBell.js

import { useState, useEffect, useRef } from "react";
import { BellIcon } from "./Icons";

// Data Notifikasi Tiruan
const mockNotifications = [
  { id: 1, text: "Data bahan baru telah masuk ke database, butuh validasi", time: "1 menit lalu" },
  { id: 2, text: "Data bahan baru telah masuk ke database, butuh validasi", time: "1 jam lalu" },
];

const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState(mockNotifications);
  const dropdownRef = useRef(null);

  // Menutup dropdown saat klik di luar
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

  const unreadCount = notifications.length; // Hitung notif yang belum dibaca

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full text-slate-500 hover:text-slate-800 hover:bg-slate-100"
      >
        <BellIcon />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 block h-5 w-5 rounded-full bg-red-600 text-white text-xs font-bold flex items-center justify-center ring-2 ring-white">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Notifikasi */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-slate-100 z-50 overflow-hidden">
          <div className="p-3 border-b border-slate-100">
            <h3 className="text-lg font-bold text-orange-500">Notifikasi</h3>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length > 0 ? (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className="p-3 border-b border-slate-100 hover:bg-slate-50 last:border-b-0"
                >
                  <p className="text-sm text-slate-700">{notif.text}</p>
                  <p className="text-xs text-slate-400 mt-1">{notif.time}</p>
                </div>
              ))
            ) : (
              <p className="p-4 text-center text-sm text-slate-500">
                Tidak ada notifikasi baru.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;