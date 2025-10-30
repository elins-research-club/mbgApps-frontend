// /frontend/src/components/ChefNavbar.js
import { Utensils, Plus, LogOut } from "lucide-react";
import UserMenu from "./UserMenu";

const ChefNavbar = ({ onAddRecipeClick, onNewMenuClick }) => {
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

          {/* Kanan: Tombol Tambah Resep */}
          <div className="flex items-center gap-3">
            {/* 1. Tombol Buat Menu Baru (Recipe Composition - Aksi 2) */}
            <button
              onClick={onNewMenuClick} // <-- Tombol baru
              className="flex items-center gap-2 p-2 px-3 rounded-lg text-sm font-semibold bg-orange-500 text-white hover:bg-orange-600 transition-colors shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Buat Menu Baru</span>
            </button>

            {/* 2. Tombol Tambah Resep (Bahan Baru - Aksi 3) */}
            <button
              onClick={onAddRecipeClick}
              className="flex items-center gap-2 p-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <Utensils className="w-5 h-5" />
              <span>Tambah Bahan Baru</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default ChefNavbar;
