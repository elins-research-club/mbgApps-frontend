// /frontend/src/components/NewMenuModal.js
// REVISI: Menggunakan kategori baru yang sesuai dengan database

import { useState } from "react";
import Image from "next/image";
import { XCircleIcon, SaveIcon, CheckCircleIcon } from "./Icons";
import MenuComponentSearch from "./MenuComponentSearch";

// ✅ PERBAIKAN: Daftar kategori menu disesuaikan dengan database
const categories = [
  { key: "karbohidrat", label: "Karbohidrat", stateKey: "karbo_id" },
  { key: "proteinHewani", label: "Protein Hewani", stateKey: "lauk_id" },
  { key: "sayur", label: "Sayur", stateKey: "sayur_id" },
  {
    key: "proteinTambahan",
    label: "Protein Tambahan",
    stateKey: "side_dish_id",
  },
  { key: "buah", label: "Buah", stateKey: "buah_id" },
];

/**
 * Modal untuk membuat Menu Komposisi Chef baru
 * (Menggunakan resep yang sudah ada)
 */
const NewMenuModal = ({ onClose, onSubmit, isLoading, error }) => {
  const [namaMenu, setNamaMenu] = useState("");
  // State sekarang menyimpan ID resep/menu yang dipilih
  const [selectedMenus, setSelectedMenus] = useState({
    karbo_id: null,
    lauk_id: null,
    sayur_id: null,
    side_dish_id: null,
    buah_id: null,
  });

  // Handler untuk menyimpan ID menu dari MenuComponentSearch
  const handleMenuSelect = (categoryStateKey, menuId) => {
    setSelectedMenus((prev) => ({
      ...prev,
      [categoryStateKey]: menuId,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // 1. Validasi Nama Menu
    if (!namaMenu.trim()) {
      alert("Nama Menu Kelompokan wajib diisi.");
      return;
    }

    // 2. Validasi ID Menu yang Terpilih (PENTING untuk mengatasi Error Anda)
    // Cek apakah ada ID menu yang valid (bukan null atau undefined)
    const validMenuIds = Object.values(selectedMenus).filter(
      (id) => id !== null && id !== 0
    );

    if (validMenuIds.length === 0) {
      alert("Anda harus memilih minimal satu menu komponen.");
      return;
    }

    // 3. Panggil onSubmit dari parent (ChefDashboard/lainnya)
    // Asumsi parent memiliki logic untuk memanggil /api/menu/composition
    onSubmit({
      nama: namaMenu.trim(),
      komposisi: selectedMenus, // Kirim seluruh objek selectedMenus
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-3xl p-6 shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center border-b pb-3 mb-4 sticky top-0 bg-white">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Image
              src="/input-icon.png"
              alt="Icon Menu"
              width={24}
              height={24}
            />
            Simpan Menu Kelompokan Chef
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-800 transition"
          >
            <XCircleIcon className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Input Nama Menu Baru */}
          <div>
            <label
              htmlFor="namaMenu"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Nama Menu Kelompokan <span className="text-red-500">*</span>
            </label>
            <input
              id="namaMenu"
              type="text"
              value={namaMenu}
              onChange={(e) => setNamaMenu(e.target.value)}
              placeholder="Contoh: Paket Sehat Senin"
              className="w-full p-3 border border-slate-300 rounded-lg shadow-sm focus:border-green-500 focus:ring-green-500 transition"
              required
              disabled={isLoading}
            />
          </div>

          {/* Input Komposisi (Menggunakan MenuComponentSearch) */}
          <h3 className="text-lg font-semibold text-slate-700 pt-2 border-t mt-4">
            Pilih Komponen Resep (Menu)
          </h3>
          {categories.map((cat) => (
            <div key={cat.key}>
              <label className="block text-sm font-medium text-slate-600 mb-1">
                {cat.label}
              </label>
              <MenuComponentSearch
                category={cat.key} // ✅ Kirim kategori baru (karbohidrat, proteinHewani, dll)
                onMenuSelect={handleMenuSelect}
                placeholder={`Cari resep ${cat.label}...`}
                disabled={isLoading}
              />
            </div>
          ))}

          {/* Tombol Save Menu Baru */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-green-500 text-white font-bold text-lg rounded-lg shadow-md hover:bg-green-600 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Menyimpan Menu Komposisi...
              </>
            ) : (
              <>
                <SaveIcon className="w-5 h-5" />
                Simpan Menu Komposisi Chef
              </>
            )}
          </button>

          {error && (
            <p className="mt-4 p-3 bg-red-100 text-red-700 border border-red-300 rounded-lg text-center text-sm flex items-center justify-center gap-2">
              <XCircleIcon className="w-5 h-5" /> {error}
            </p>
          )}
        </form>
      </div>
    </div>
  );
};

export default NewMenuModal;
