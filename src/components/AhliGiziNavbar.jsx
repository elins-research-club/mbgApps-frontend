// /frontend/src/components/AhliGiziNavbar.js

import UserMenu from "./UserMenu";
import NotificationBell from "./NotificationBell"; // <-- Impor baru

const AhliGiziNavbar = () => {
  return (
    <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Kiri: Menu User & Judul */}
          <div className="flex items-center gap-4">
            <UserMenu />
            <span className="text-xl font-bold text-orange-500 tracking-tight">
              Kalkulator Gizi MBG
            </span>
          </div>

          {/* Kanan: Tombol Dashboard & Notifikasi */}
          <div className="flex items-center gap-4">
            <button
              className="px-4 py-2 bg-orange-400 text-white text-sm font-bold rounded-lg shadow-md hover:bg-orange-500 transition-colors"
            >
              Dashboard
            </button>
            <NotificationBell />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default AhliGiziNavbar;