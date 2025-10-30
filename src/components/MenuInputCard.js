// /frontend/src/components/MenuInputCard.js (REVISI TOTAL)

import { useState } from "react";
import Image from "next/image";
// Import SearchCard yang sudah kita revisi
import SearchCard from "./SearchCard";

// Mapping Target ID (Anda harus memastikan ini sesuai dengan data Anda,
// ini adalah contoh berdasarkan snippet Anda sebelumnya)
const TARGET_ID_MAP = {
  "TK A": 1,
  "TK B": 1,
  "SD Kelas 1": 1,
  "SD Kelas 2": 2,
  "SD Kelas 3": 3,
  "SD Kelas 4": 4,
  "SD Kelas 5": 5,
  "SD Kelas 6": 6,
  "SMP Kelas 1": 7,
  "SMP Kelas 2": 8,
  "SMP Kelas 3": 9,
  "SMA Kelas 1": 10,
  "SMA Kelas 2": 11,
  "SMA Kelas 3": 12,
};
const targetOptions = Object.keys(TARGET_ID_MAP);

// Kategori (ditambah stateKey sesuai payload backend)
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

const MenuInputCard = ({ onSubmit, isLoading, error }) => {
  // State untuk menyimpan ID menu yang dipilih (yang akan dikirim ke backend)
  const [selectedMenuId, setSelectedMenuId] = useState(null);
  const [selectedMenuName, setSelectedMenuName] = useState("");

  const [target, setTarget] = useState(targetOptions[0]);

  // Handler untuk SearchCard: Menyimpan ID dan Nama Menu Komposisi Chef
  const handleMenuSelect = (menuId, menuName) => {
    setSelectedMenuId(menuId);
    setSelectedMenuName(menuName);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (isLoading || !selectedMenuId) {
      alert("Anda harus memilih Menu Komposisi Chef untuk dianalisis.");
      return;
    }
    const targetId = TARGET_ID_MAP[target];

    // Kirim payload BARU: Hanya ID Menu Komposisi dan Target
    onSubmit({
      menu_komposisi_id: selectedMenuId,
      target: targetId,
    });
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl p-6 md:p-8">
      <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-3">
        <Image src="/input-icon.png" alt="Icon Menu" width={32} height={32} />
        Input Komposisi Menu
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Dropdown Target Audiens */}
        <div>
          <label
            htmlFor="target"
            className="block text-sm font-medium text-slate-700"
          >
            Target Audiens (Kelompok Usia)
          </label>
          <select
            id="target"
            name="target"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            className="w-full mt-2 p-3 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none transition"
            disabled={isLoading}
          >
            {targetOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        {/* BARU: Input Menu Komposisi Chef */}
        <div>
          <label className="block text-md font-semibold text-slate-600 mb-1">
            Pilih Menu Komposisi Chef
          </label>
          {/* Menggunakan SearchCard dan mengirim type="composition" */}
          <SearchCard
            searchType="composition"
            filterCategory="Komposisi Chef" // ✅ hanya tampilkan menu dengan kategori ini
            onMenuSelect={(menuId, menuName) =>
              handleMenuSelect(menuId, menuName)
            }
            placeholder="Cari Menu Komposisi Chef (misal: Menu 1, Paket Sehat)..."
            showAiFallback={false}
          />
          {selectedMenuName && (
            <p className="mt-1 text-xs text-green-600">
              Menu dipilih: **{selectedMenuName}**
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading || !selectedMenuId}
          className="mt-6 w-full py-4 bg-green-500 text-white font-bold text-lg rounded-lg shadow-lg hover:bg-green-600 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed"
        >
          {isLoading ? "Menganalisis..." : "Generate Nutrisi Menu"}
        </button>

        {error && (
          <p className="mt-4 p-3 bg-red-100 text-red-700 border border-red-300 rounded-lg text-center text-sm">
            {error}
          </p>
        )}
      </form>
    </div>
  );
};

export default MenuInputCard;
