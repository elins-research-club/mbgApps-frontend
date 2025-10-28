// /frontend/src/components/MenuInputCard.js
import { useState } from "react";
import Image from "next/image";
import AutoCompleteInput from "./AutoCompleteInput"; // <-- BARU

// Kategori berdasarkan PNG Anda
const categories = [
  { key: "karbohidrat", label: "Karbohidrat" },
  { key: "proteinHewani", label: "Protein Hewani" },
  { key: "sayur", label: "Sayur" },
  { key: "proteinTambahan", label: "Protein Tambahan" },
  { key: "buah", label: "Buah" },
];

// Opsi untuk dropdown Target
const targetOptions = [
  "TK A",
  "TK B",
  "SD Kelas 1",
  "SD Kelas 2",
  "SD Kelas 3",
  "SD Kelas 4",
  "SD Kelas 5",
  "SD Kelas 6",
  "SMP Kelas 1",
  "SMP Kelas 2",
  "SMP Kelas 3",
  "SMA Kelas 1",
  "SMA Kelas 2",
  "SMA Kelas 3",
];

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

const MenuInputCard = ({ onSubmit, isLoading, error }) => {
  const [target, setTarget] = useState(targetOptions[0]); // Default ke "TK A"
  const [inputs, setInputs] = useState({
    karbohidrat: "",
    proteinHewani: "",
    sayur: "",
    proteinTambahan: "",
    buah: "",
  });

  // --- DIUBAH: Handler untuk AutoCompleteInput ---
  const handleInputChange = (name, value) => {
    setInputs((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isLoading) return;
    const targetId = TARGET_ID_MAP[target];

    if (targetId === undefined) {
      console.error("Target audiens tidak valid:", target);
      alert("Pilihan target audiens tidak valid. Silakan pilih ulang.");
      return;
    }
    onSubmit({
      target: targetId,
      ...inputs,
    });
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-200">
      <div className="flex items-center gap-3 mb-3">
        <Image
          src="/input-icon.png"
          alt="Icon Input"
          width={40}
          height={40}
          className="w-10 h-10"
        />
        <h2 className="text-2xl font-bold text-orange-500">Komposisi Menu</h2>
      </div>
      <p className="text-slate-500 mt-2 text-sm">
        Pilih target dan ketik nama resep untuk menghitung total gizinya.
      </p>

      <form onSubmit={handleSubmit} className="space-y-5 mt-8">
        <div>
          <label
            htmlFor="target"
            className="text-md font-semibold text-slate-600"
          >
            Target
          </label>
          <select
            id="target"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            className="w-full mt-2 p-3 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-gray-500 outline-none transition"
          >
            {targetOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        {/* --- DIUBAH: Menggunakan AutoCompleteInput --- */}
        {categories.map((cat) => (
          <AutoCompleteInput
            key={cat.key}
            id={cat.key}
            name={cat.key}
            label={cat.label}
            value={inputs[cat.key]}
            onValueChange={handleInputChange}
            placeholder="Ketik nama resep..."
          />
        ))}
        {/* --- Akhir Perubahan --- */}

        <button
          type="submit"
          disabled={isLoading}
          className="mt-6 w-full py-4 bg-orange-400 text-white font-bold text-lg rounded-lg shadow-lg hover:bg-gray-700 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed"
        >
          {isLoading ? "Menganalisis..." : "Generate Menu"}
        </button>

        {error && (
          <p className="mt-4 p-4 bg-red-100 text-red-700 border border-red-300 rounded-lg text-center">
            {error}
          </p>
        )}
      </form>
    </div>
  );
};

export default MenuInputCard;
