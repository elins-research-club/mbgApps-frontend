// /frontend/src/components/AddRecipeModal.js

import { useState } from "react";
import {
  checkIngredient,
  generateIngredient,
  saveRecipe,
} from "../services/api";
import { PlusIcon, TrashIcon } from "./Icons";

// Ambil URL API dari env atau hardcode
const API_URL = "http://localhost:5000/api";

// Fungsi Debounce
function debounce(func, timeout = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func.apply(this, args);
    }, timeout);
  };
}

const AddRecipeModal = ({ onClose, onRecipeAdded }) => {
  const [menuName, setMenuName] = useState("");
  const [kategori, setKategori] = useState("Lauk");
  const [ingredients, setIngredients] = useState([
    { id: 1, name: "", gramasi: "", status: "idle" }, // <-- DIUBAH
  ]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [focusedIngredientId, setFocusedIngredientId] = useState(null);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);

  // API call for fetching ingredient suggestions
  const searchApi = async (searchQuery) => {
    console.log("Searching for ingredient:", searchQuery);
    if (searchQuery.length < 1) {
      setSuggestions([]);
      return;
    }
    try {
      const response = await fetch(
        `${API_URL}/ingredients/search?q=${encodeURIComponent(searchQuery)}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) {
        console.error("Search API failed:", response.status);
        setSuggestions([]);
        return;
      }
      const data = await response.json();
      console.log("Search results:", data);
      setSuggestions(data.ingredients || []);
    } catch (error) {
      console.error("Search API error:", error);
      setSuggestions([]);
    }
  };

  const handleAddIngredient = () => {
    setIngredients([
      ...ingredients,
      { id: Date.now(), name: "", gramasi: "", status: "idle" }, // <-- DIUBAH
    ]);
  };

  const handleRemoveIngredient = (id) => {
    setIngredients(ingredients.filter((item) => item.id !== id));
  };

  // --- HANDLER BARU ---
  // Mengelola perubahan untuk nama dan gramasi
  const handleIngredientDataChange = (id, field, value) => {
    const newIngredients = ingredients.map((item) => {
      if (item.id === id) {
        // Jika mengubah nama, reset status pengecekan dan panggil searchApi
        if (field === "name") {
          searchApi(value);
          setSelectedSuggestionIndex(-1);
          return { ...item, name: value, status: "idle" };
        }
        // Jika mengubah gramasi, biarkan status apa adanya
        return { ...item, [field]: value };
      }
      return item;
    });
    setIngredients(newIngredients);
  };
  // --- Akhir Handler Baru ---

  const updateIngredientStatus = (id, status, message = "") => {
    setIngredients((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status, message } : item))
    );
  };

  const handleSelectSuggestion = (id, selectedName) => {
    handleIngredientDataChange(id, "name", selectedName);
    updateIngredientStatus(id, "found", "Bahan ditemukan di database");
    setSuggestions([]);
    setFocusedIngredientId(null);
    setSelectedSuggestionIndex(-1);
  };

  const handleKeyDown = (e, id) => {
    if (suggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedSuggestionIndex((prev) =>
        prev < suggestions.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedSuggestionIndex((prev) =>
        prev > 0 ? prev - 1 : suggestions.length - 1
      );
    } else if (e.key === "Enter" && selectedSuggestionIndex >= 0) {
      e.preventDefault();
      handleSelectSuggestion(id, suggestions[selectedSuggestionIndex].nama);
    } else if (e.key === "Escape") {
      setSuggestions([]);
      setSelectedSuggestionIndex(-1);
    }
  };

  // Cek ke DB saat input 'Bahan' di-blur (fokus hilang)
  const handleIngredientBlur = async (id, name) => {
    if (!name.trim()) return;

    // Jika sudah "found" (dari autocomplete), jangan cek lagi
    const currentItem = ingredients.find((item) => item.id === id);
    if (currentItem && currentItem.status === "found") return;

    updateIngredientStatus(id, "checking");
    const res = await checkIngredient(name); // API call

    if (res.found) {
      updateIngredientStatus(id, "found", "Bahan ditemukan di database");
    } else {
      updateIngredientStatus(id, "not_found", "Bahan tidak ditemukan");
    }
  };

  // Panggil AI untuk generate bahan yg 'not_found'
  const handleGenerateClick = async (id, name) => {
    updateIngredientStatus(id, "generating");
    const res = await generateIngredient(name); // API call

    if (res.success) {
      updateIngredientStatus(id, "generated", "Sukses! Bahan akan divalidasi.");
    } else {
      updateIngredientStatus(id, "error", res.message || "Gagal generate.");
    }
  };

  // Render status & tombol untuk setiap bahan
  const renderIngredientStatus = (item) => {
    switch (item.status) {
      case "checking":
        return <span className="text-xs text-blue-500">Mengecek...</span>;
      case "found":
        return <span className="text-xs text-green-600">✓ Ditemukan</span>;
      case "not_found":
        return (
          <div className="flex items-center gap-2">
            <span className="text-xs text-red-500">✗ Tidak ditemukan</span>
            <button
              type="button"
              onClick={() => handleGenerateClick(item.id, item.name)}
              className="px-2 py-0.5 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
            >
              Generate
            </button>
          </div>
        );
      case "generating":
        return <span className="text-xs text-blue-500">Generating...</span>;
      case "generated":
        return <span className="text-xs text-purple-600">✓ Generated</span>;
      case "error":
        return (
          <span className="text-xs text-red-600" title={item.message}>
            Error!
          </span>
        );
      default:
        return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSaving) return;

    // --- VALIDASI BARU ---
    if (!menuName.trim()) {
      setError("Nama menu tidak boleh kosong.");
      return;
    }
    const emptyGramasi = ingredients.find(
      (item) => !item.gramasi.trim() || parseFloat(item.gramasi) <= 0
    );
    if (emptyGramasi) {
      setError("Gramasi untuk semua bahan tidak boleh kosong.");
      return;
    }
    const unreadyIngredients = ingredients.filter(
      (item) =>
        item.status !== "found" &&
        item.status !== "generated" &&
        item.name.trim() !== "" // Abaikan jika barisnya kosong
    );
    if (unreadyIngredients.length > 0) {
      setError("Pastikan semua bahan 'Ditemukan' atau telah di-'Generate'.");
      return;
    }
    // --- Akhir Validasi Baru ---

    setIsSaving(true);
    setError("");

    // --- PAYLOAD BARU ---
    const payload = {
      menuName: menuName,
      kategori: kategori, // <-- TAMBAHKAN BARIS INI
      ingredients: ingredients.filter((item) => item.name.trim() !== ""),
    };
    // --- Akhir Payload Baru ---

    const res = await saveRecipe(payload);

    if (res.success) {
      alert("Resep baru berhasil ditambahkan!");
      if (onRecipeAdded) onRecipeAdded(); // Refresh data di page
      onClose(); // Tutup modal
    } else {
      setError(res.message || "Gagal menyimpan resep baru.");
    }
    setIsSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-8 m-4">
        <form onSubmit={handleSubmit}>
          <h2 className="text-2xl font-bold text-slate-800 mb-6">
            Tambahkan Resep Baru
          </h2>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="menu-name"
                className="text-sm font-semibold text-slate-600"
              >
                Nama Menu
              </label>
              <input
                id="menu-name"
                type="text"
                value={menuName}
                onChange={(e) => setMenuName(e.target.value)}
                placeholder="Ketik nama menu..."
                className="w-full mt-1 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gray-500 outline-none transition"
              />
            </div>

            {/* --- TAMBAHKAN BLOK DROPDOWN INI --- */}
            <div className="mt-4">
              <label
                htmlFor="kategori"
                className="block text-sm font-medium text-slate-700"
              >
                Kategori Menu
              </label>
              <select
                id="kategori"
                value={kategori}
                onChange={(e) => setKategori(e.target.value)}
                className="mt-1 block w-full rounded-lg border-slate-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
              >
                <option value="Lauk">Lauk</option>
                <option value="Sayur">Sayur</option>
                <option value="Karbo">Karbo</option>
                <option value="Protein Tambahan">Protein Tambahan</option>
                <option value="Buah">Buah</option>
              </select>
            </div>
            {/* --- AKHIR BLOK BARU --- */}

            <hr />

            <label className="text-sm font-semibold text-slate-600">
              Bahan-bahan
            </label>
            <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
              {/* --- UI INPUT BAHAN DIUBAH --- */}
              {ingredients.map((item, index) => (
                <div
                  key={item.id}
                  className="space-y-1 p-2 rounded-md bg-slate-50 border relative"
                >
                  <div className="flex items-center gap-2">
                    {/* Input Nama Bahan */}
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) =>
                        handleIngredientDataChange(
                          item.id,
                          "name",
                          e.target.value
                        )
                      }
                      onKeyDown={(e) => handleKeyDown(e, item.id)}
                      onFocus={() => setFocusedIngredientId(item.id)}
                      onBlur={() => {
                        setFocusedIngredientId(null);
                        handleIngredientBlur(item.id, item.name);
                      }}
                      placeholder={`Bahan ${index + 1}`}
                      className="flex-grow p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gray-500 outline-none transition"
                      disabled={item.status === "checking"}
                    />
                    {/* Input Gramasi */}
                    <input
                      type="number"
                      value={item.gramasi}
                      onChange={(e) =>
                        handleIngredientDataChange(
                          item.id,
                          "gramasi",
                          e.target.value
                        )
                      }
                      placeholder="Gram"
                      className="w-20 p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gray-500 outline-none transition"
                      min="0"
                    />
                    {/* Tombol Hapus */}
                    {ingredients.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveIngredient(item.id)}
                        className="p-1 text-red-400 hover:text-red-600 flex-shrink-0"
                      >
                        <TrashIcon />
                      </button>
                    )}
                  </div>
                  {/* Suggestions Dropdown */}
                  {focusedIngredientId === item.id &&
                    suggestions.length > 0 && (
                      <div className="absolute z-20 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-40 overflow-y-auto mt-1">
                        {suggestions.map((suggestion, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onMouseDown={() =>
                              handleSelectSuggestion(item.id, suggestion.nama)
                            }
                            className={`w-full text-left px-3 py-2 ${
                              selectedSuggestionIndex === idx
                                ? "bg-blue-100"
                                : "hover:bg-gray-100"
                            }`}
                          >
                            {suggestion.nama}
                          </button>
                        ))}
                      </div>
                    )}
                  {/* Status Pengecekan */}
                  <div className="pl-1 h-4">{renderIngredientStatus(item)}</div>
                </div>
              ))}
              {/* --- Akhir Perubahan UI --- */}
            </div>

            <button
              type="button"
              onClick={handleAddIngredient}
              className="w-full flex items-center justify-center gap-2 py-2 border-2 border-dashed border-slate-300 rounded-lg text-slate-500 hover:bg-slate-50 transition"
            >
              <PlusIcon />
              Tambahkan Bahan
            </button>
          </div>

          {error && (
            <p className="mt-4 text-center text-sm text-red-600">{error}</p>
          )}

          <div className="flex items-center justify-end gap-4 mt-8">
            <button
              type="button"
              onClick={onClose}
              className="py-2 px-5 text-slate-600 font-medium rounded-lg hover:bg-slate-100 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="py-2 px-5 bg-orange-400 text-white font-bold rounded-lg shadow-md hover:bg-orange-500 transition disabled:bg-slate-300"
            >
              {isSaving ? "Menyimpan..." : "Simpan Resep"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddRecipeModal;
