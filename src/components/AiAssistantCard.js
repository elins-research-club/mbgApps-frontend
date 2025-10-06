// /frontend/src/components/AiAssistantCard.js

import { useState } from "react";
import { suggestMenu } from "../services/api";
import { SparklesIcon } from "./Icons";

// Komponen ini menerima satu prop: `onMenuAdded`,
// yang merupakan fungsi untuk memberitahu halaman utama agar me-refresh daftar menu.
const AiAssistantCard = ({ onMenuAdded }) => {
  const [newMenuName, setNewMenuName] = useState("");
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [suggestionStatus, setSuggestionStatus] = useState("");
  const [statusType, setStatusType] = useState("info"); // 'info', 'success', atau 'error'

  const handleSuggestMenu = async () => {
    if (!newMenuName.trim()) {
      alert("Harap masukkan nama menu baru.");
      return;
    }
    setIsSuggesting(true);
    setSuggestionStatus("Menganalisis dan menyarankan resep...");
    setStatusType("info");

    const result = await suggestMenu(newMenuName);

    if (result && result.success) {
      setSuggestionStatus(
        `Sukses! Menu "${result.data.nama}" ditambahkan ke kategori "${result.data.kategori}".`
      );
      setStatusType("success");
      setNewMenuName("");
      // Panggil fungsi onMenuAdded untuk memicu refresh di halaman utama
      if (onMenuAdded) {
        onMenuAdded();
      }
    } else {
      setSuggestionStatus(
        result ? result.message : "Gagal menambahkan menu baru. Coba lagi."
      );
      setStatusType("error");
    }
    setIsSuggesting(false);
  };

  // Fungsi untuk menentukan warna status message
  const getStatusClasses = () => {
    switch (statusType) {
      case "success":
        return "bg-green-50 text-green-800 border-green-200";
      case "error":
        return "bg-red-50 text-red-800 border-red-200";
      default:
        return "bg-blue-50 text-blue-800 border-blue-200";
    }
  };

  return (
    <div className="lg:col-span-1 bg-white p-8 rounded-2xl shadow-lg border-2 border-dashed border-gray-500">
      <h2 className="text-2xl font-bold text-slate-700 flex items-center">
        <SparklesIcon />
        <span className="ml-3">AI Add New Variant</span>
      </h2>
      <p className="text-slate-500 mt-2">
        Tidak menemukan menu? Biarkan AI menyarankan resepnya untuk Anda!
      </p>

      <div className="mt-8">
        <label
          htmlFor="new-menu"
          className="text-lg font-semibold text-slate-600"
        >
          Nama Menu Baru
        </label>
        <input
          id="new-menu"
          type="text"
          value={newMenuName}
          onChange={(e) => setNewMenuName(e.target.value)}
          placeholder="Contoh: Ayam Bumbu Bali"
          className="w-full mt-2 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gray-500 outline-none transition"
        />
      </div>

      <button
        onClick={handleSuggestMenu}
        disabled={isSuggesting}
        className="mt-6 w-full py-4 bg-orange-400 text-white font-bold text-lg rounded-lg shadow-lg hover:bg-gray-700 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed flex items-center justify-center"
      >
        {isSuggesting ? "Menganalisis..." : "Sarankan Varian Baru"}
      </button>

      {suggestionStatus && (
        <p
          className={`mt-4 p-3 border rounded-lg text-center text-sm ${getStatusClasses()}`}
        >
          {suggestionStatus}
        </p>
      )}
    </div>
  );
};

export default AiAssistantCard;
