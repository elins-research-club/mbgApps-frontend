// /frontend/src/components/AddRecipeModal.js
// VERSI PERBAIKAN - Dengan Support Nutrisi Lengkap

import { useState, useCallback, useRef, useEffect } from "react";
import {
  checkIngredient,
  generateIngredient,
  saveRecipe,
} from "../services/api";
import { PlusIcon, TrashIcon } from "./Icons";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

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
  const [kategori, setKategori] = useState("Karbohidrat");

  // ✅ UPDATE: Tambah field nutrisi dan bahanId
  const [ingredients, setIngredients] = useState([
    {
      id: 1,
      name: "",
      gramasi: "",
      status: "idle",
      message: "",
      nutrisi: null, // ✅ BARU: Untuk menyimpan data nutrisi dari AI
      bahanId: null, // ✅ BARU: Untuk menyimpan ID bahan yang sudah ada
    },
  ]);

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

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [focusedIngredientId, setFocusedIngredientId] = useState(null);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const [isSearching, setIsSearching] = useState(false);

  const searchAbortController = useRef(null);

  useEffect(() => {
    return () => {
      if (searchAbortController.current) {
        searchAbortController.current.abort();
      }
    };
  }, []);

  const searchApi = async (searchQuery) => {
    if (!searchQuery || searchQuery.trim().length < 1) {
      setSuggestions([]);
      return;
    }

    if (searchAbortController.current) {
      searchAbortController.current.abort();
    }

    searchAbortController.current = new AbortController();
    setIsSearching(true);

    try {
      const response = await fetch(
        `${API_URL}/ingredients/search?q=${encodeURIComponent(
          searchQuery.trim()
        )}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          signal: searchAbortController.current.signal,
        }
      );

      if (!response.ok) {
        throw new Error(`Search failed with status: ${response.status}`);
      }

      const data = await response.json();
      setSuggestions(Array.isArray(data.ingredients) ? data.ingredients : []);
    } catch (error) {
      if (error.name !== "AbortError") {
        console.error("Search API error:", error);
        setSuggestions([]);
      }
    } finally {
      setIsSearching(false);
    }
  };

  const debouncedSearch = useCallback(debounce(searchApi, 300), []);

  const handleAddIngredient = () => {
    const newId = Date.now();
    setIngredients([
      ...ingredients,
      {
        id: newId,
        name: "",
        gramasi: "",
        status: "idle",
        message: "",
        nutrisi: null, // ✅ BARU
        bahanId: null, // ✅ BARU
      },
    ]);
  };

  const handleRemoveIngredient = (id) => {
    if (ingredients.length <= 1) {
      setError("Minimal harus ada 1 bahan");
      return;
    }
    setIngredients(ingredients.filter((item) => item.id !== id));
    setError("");
  };

  const handleIngredientDataChange = (id, field, value) => {
    setIngredients((prevIngredients) =>
      prevIngredients.map((item) => {
        if (item.id !== id) return item;

        if (field === "name") {
          const trimmedValue = value;
          const isNameChanged = trimmedValue !== item.name;

          if (isNameChanged) {
            debouncedSearch(trimmedValue);
            setSelectedSuggestionIndex(-1);
            return { ...item, name: trimmedValue, status: "idle", message: "" };
          }

          return { ...item, name: trimmedValue };
        }

        if (field === "gramasi") {
          const numValue = value.replace(/[^0-9.]/g, "");
          return { ...item, gramasi: numValue };
        }

        return { ...item, [field]: value };
      })
    );
  };

  const updateIngredientStatus = useCallback((id, status, message = "") => {
    setIngredients((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status, message } : item))
    );
  }, []);

  // ✅ UPDATE: handleSelectSuggestion sekarang save bahanId
  const handleSelectSuggestion = (id, selectedName, bahanId) => {
    console.log(`✅ Selecting ingredient: ${selectedName} (ID: ${bahanId})`);

    setIngredients((prevIngredients) =>
      prevIngredients.map((item) =>
        item.id === id
          ? {
              ...item,
              name: selectedName,
              status: "found",
              message: "Bahan ditemukan di database",
              bahanId: bahanId, // ✅ SIMPAN ID BAHAN
            }
          : item
      )
    );
    setSuggestions([]);
    setFocusedIngredientId(null);
    setSelectedSuggestionIndex(-1);
  };

  const handleKeyDown = (e, id) => {
    if (suggestions.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedSuggestionIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedSuggestionIndex((prev) =>
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case "Enter":
        if (selectedSuggestionIndex >= 0) {
          e.preventDefault();
          handleSelectSuggestion(
            id,
            suggestions[selectedSuggestionIndex].nama,
            suggestions[selectedSuggestionIndex].id // ✅ PASS ID
          );
        }
        break;
      case "Escape":
        e.preventDefault();
        setSuggestions([]);
        setSelectedSuggestionIndex(-1);
        setFocusedIngredientId(null);
        break;
      default:
        break;
    }
  };

  const handleIngredientBlur = async (id, name) => {
    const trimmedName = name?.trim();
    if (!trimmedName) return;

    const currentItem = ingredients.find((item) => item.id === id);

    if (
      currentItem?.status === "found" ||
      currentItem?.status === "generated" ||
      currentItem?.status === "checking" ||
      currentItem?.status === "generating"
    ) {
      console.log("⏭️ Skip checking - status:", currentItem.status);
      return;
    }

    console.log("🔍 Checking ingredient:", trimmedName);
    updateIngredientStatus(id, "checking", "");

    try {
      const res = await checkIngredient(trimmedName);
      console.log("📋 Check result:", res);

      if (res?.found) {
        updateIngredientStatus(id, "found", "Bahan ditemukan di database");
      } else {
        updateIngredientStatus(id, "not_found", "Bahan tidak ditemukan");
      }
    } catch (error) {
      console.error("Error checking ingredient:", error);
      updateIngredientStatus(id, "error", "Gagal mengecek bahan");
    }
  };

  // ✅ PERBAIKAN KRITIS: handleGenerateClick sekarang save data nutrisi lengkap
  const handleGenerateClick = async (id, name) => {
    const trimmedName = name?.trim();
    if (!trimmedName) {
      updateIngredientStatus(id, "error", "Nama bahan tidak boleh kosong");
      return;
    }

    updateIngredientStatus(id, "generating", "Memproses dengan AI...");

    try {
      console.log("🔄 Generating ingredient:", trimmedName);
      const res = await generateIngredient(trimmedName);

      console.log("📦 Generate response:", JSON.stringify(res, null, 2));

      // Deteksi sukses yang lebih robust
      const isSuccess =
        res &&
        (res.success === true ||
          res.status === "success" ||
          res.predicted_composition ||
          res.ingredient_id ||
          res.id);

      if (isSuccess) {
        console.log("✅ Generate BERHASIL!");

        // ✅ KUNCI: Ekstrak data nutrisi dari response
        const nutrisiData = res.predicted_composition || {};
        const bahanId = res.ingredient_id || res.id;

        console.log("💾 Saving nutrisi data:", nutrisiData);
        console.log("🆔 Saving bahan ID:", bahanId);

        // ✅ Update state dengan data nutrisi LENGKAP
        setIngredients((prev) =>
          prev.map((item) =>
            item.id === id
              ? {
                  ...item,
                  status: "generated",
                  message: "Bahan berhasil ditambahkan dengan AI",
                  nutrisi: nutrisiData, // 🔥 SIMPAN DATA NUTRISI
                  bahanId: bahanId, // 🔥 SIMPAN ID BAHAN
                }
              : item
          )
        );

        // Auto-refresh suggestion
        setTimeout(() => {
          console.log("🔄 Refreshing suggestions...");
          searchApi(trimmedName);
        }, 1000);
      } else {
        console.error("❌ Generate GAGAL - Response:", res);
        updateIngredientStatus(
          id,
          "error",
          res?.error || res?.message || "Gagal generate bahan"
        );
      }
    } catch (error) {
      console.error("💥 EXCEPTION generating ingredient:", error);
      updateIngredientStatus(
        id,
        "error",
        error.message || "Gagal menghubungi server"
      );
    }
  };

  const renderIngredientStatus = (item) => {
    const statusConfig = {
      idle: {
        text: "",
        className: "",
        icon: "",
      },
      checking: {
        text: "Mengecek database...",
        className: "text-blue-600 font-medium",
        icon: "🔍",
        showSpinner: true,
      },
      found: {
        text: "Ditemukan di database",
        className: "text-green-600 font-semibold",
        icon: "✅",
      },
      not_found: {
        text: "Tidak ada di database",
        className: "text-amber-600 font-medium",
        icon: "⚠️",
        showButton: true,
      },
      generating: {
        text: "Generating dengan AI...",
        className: "text-blue-600 font-medium",
        icon: "🤖",
        showSpinner: true,
      },
      generated: {
        text: "Berhasil ditambahkan (AI)",
        className: "text-purple-600 font-semibold",
        icon: "✨",
      },
      error: {
        text: item.message || "Terjadi kesalahan",
        className: "text-red-600 font-medium",
        icon: "❌",
      },
    };

    const config = statusConfig[item.status];
    if (!config || item.status === "idle") return null;

    return (
      <div className="flex items-center gap-2 mt-1.5 min-h-[24px]">
        <div
          className={`text-xs ${config.className} flex items-center gap-1.5`}
        >
          {config.showSpinner ? (
            <svg
              className="animate-spin h-3.5 w-3.5"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          ) : (
            <span className="text-sm">{config.icon}</span>
          )}
          <span>{config.text}</span>
        </div>
        {config.showButton && (
          <button
            type="button"
            onClick={() => handleGenerateClick(item.id, item.name)}
            className="px-2.5 py-1 bg-gradient-to-r from-purple-500 to-purple-600 text-white text-xs font-medium rounded-md hover:from-purple-600 hover:to-purple-700 transition-all shadow-sm hover:shadow-md"
          >
            Generate dengan AI
          </button>
        )}
      </div>
    );
  };

  const validateForm = () => {
    if (!menuName.trim()) {
      setError("Nama menu tidak boleh kosong");
      return false;
    }

    const validIngredients = ingredients.filter((item) => item.name.trim());

    if (validIngredients.length === 0) {
      setError("Minimal harus ada 1 bahan");
      return false;
    }

    const emptyGramasi = validIngredients.find(
      (item) => !item.gramasi.trim() || parseFloat(item.gramasi) <= 0
    );
    if (emptyGramasi) {
      setError("Gramasi untuk semua bahan harus diisi dengan nilai yang valid");
      return false;
    }

    const unreadyIngredients = validIngredients.filter(
      (item) => item.status !== "found" && item.status !== "generated"
    );
    if (unreadyIngredients.length > 0) {
      setError(
        "Pastikan semua bahan sudah 'Ditemukan' atau telah di-'Generate'"
      );
      return false;
    }

    return true;
  };

  // ✅ PERBAIKAN KRITIS: handleSubmit sekarang kirim data lengkap
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSaving) return;

    setError("");

    if (!validateForm()) return;

    setIsSaving(true);

    try {
      const validIngredients = ingredients.filter((item) => item.name.trim());

      // ✅ PAYLOAD BARU: Include semua data yang diperlukan backend
      const payload = {
        menuName: menuName.trim(),
        kategori: kategori,
        ingredients: validIngredients.map((item) => ({
          id: item.id,
          name: item.name.trim(),
          gramasi: parseFloat(item.gramasi),
          status: item.status, // ✅ KIRIM STATUS
          bahanId: item.bahanId, // ✅ KIRIM ID BAHAN (untuk found)
          nutrisi: item.nutrisi, // ✅ KIRIM DATA NUTRISI (untuk generated)
        })),
      };

      console.log("📤 Sending payload:", JSON.stringify(payload, null, 2));
      const res = await saveRecipe(payload);
      console.log("📥 Save response:", res);

      if (res?.success) {
        if (onRecipeAdded) onRecipeAdded();
        onClose();
      } else {
        setError(res?.message || "Gagal menyimpan resep");
      }
    } catch (error) {
      console.error("Error saving recipe:", error);
      setError("Terjadi kesalahan saat menyimpan resep");
    } finally {
      setIsSaving(false);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && !isSaving) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={handleOverlayClick}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in duration-200">
        <div className="bg-orange-400 px-8 py-6">
          <h2 className="text-2xl font-bold text-white">
            Tambahkan Resep Baru
          </h2>
          <p className="text-orange-50 text-sm mt-1">
            Lengkapi informasi resep dan bahan-bahan yang diperlukan
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="px-8 py-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="menu-name"
                  className="block text-sm font-semibold text-slate-700 mb-2"
                >
                  Nama Resep <span className="text-red-500">*</span>
                </label>
                <input
                  id="menu-name"
                  type="text"
                  value={menuName}
                  onChange={(e) => setMenuName(e.target.value)}
                  placeholder="Contoh: Nasi Goreng Spesial"
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition"
                />
              </div>

              <div>
                <label
                  htmlFor="kategori"
                  className="block text-sm font-semibold text-slate-700 mb-2"
                >
                  Kategori Resep <span className="text-red-500">*</span>
                </label>
                <select
                  id="kategori"
                  value={kategori}
                  onChange={(e) => setKategori(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition bg-white"
                >
                  <option value="proteinHewani">Protein Hewani</option>
                  <option value="sayur">Sayur</option>
                  <option value="karbohidrat">Karbohidrat</option>
                  <option value="proteinTambahan">Protein Tambahan</option>
                  <option value="buah">Buah</option>
                </select>
              </div>
            </div>

            <div className="border-t border-slate-200"></div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="text-sm font-semibold text-slate-700">
                  Bahan-bahan <span className="text-red-500">*</span>
                </label>
                <span className="text-xs text-slate-500">
                  {ingredients.filter((i) => i.name.trim()).length} bahan
                </span>
              </div>

              <div className="space-y-3 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                {ingredients.map((item, index) => (
                  <div
                    key={item.id}
                    className="relative p-4 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-orange-500 text-white rounded-lg flex items-center justify-center font-semibold text-sm">
                        {index + 1}
                      </div>

                      <div className="flex-1 space-y-2">
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
                          onFocus={() => {
                            setFocusedIngredientId(item.id);
                            if (item.name.trim()) {
                              searchApi(item.name.trim());
                            }
                          }}
                          onBlur={() => {
                            setTimeout(() => {
                              setSuggestions([]);
                              setFocusedIngredientId(null);
                              handleIngredientBlur(item.id, item.name);
                            }, 300);
                          }}
                          placeholder={`Nama bahan ${index + 1}`}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition text-sm"
                          disabled={
                            item.status === "checking" ||
                            item.status === "generating"
                          }
                        />

                        {focusedIngredientId === item.id &&
                          suggestions.length > 0 && (
                            <div className="absolute z-30 left-14 right-14 bg-white border border-slate-300 rounded-lg shadow-xl max-h-48 overflow-y-auto mt-1">
                              {suggestions.map((suggestion, idx) => (
                                <button
                                  key={idx}
                                  type="button"
                                  onMouseDown={() =>
                                    handleSelectSuggestion(
                                      item.id,
                                      suggestion.nama,
                                      suggestion.id // ✅ PASS ID BAHAN
                                    )
                                  }
                                  className={`w-full text-left px-4 py-2.5 text-sm transition ${
                                    selectedSuggestionIndex === idx
                                      ? "bg-orange-50 text-orange-700"
                                      : "hover:bg-slate-50"
                                  }`}
                                >
                                  {suggestion.nama}
                                </button>
                              ))}
                            </div>
                          )}

                        <div className="flex items-center gap-2">
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
                            placeholder="0"
                            className="w-24 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition text-sm"
                            min="0"
                            step="0.01"
                          />
                          <span className="text-sm text-slate-600">gram</span>
                        </div>

                        {renderIngredientStatus(item)}
                      </div>

                      {ingredients.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveIngredient(item.id)}
                          className="flex-shrink-0 p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Hapus bahan"
                        >
                          <TrashIcon />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={handleAddIngredient}
                className="w-full mt-4 flex items-center justify-center gap-2 py-3 border-2 border-dashed border-slate-300 rounded-xl text-slate-600 hover:bg-slate-50 hover:border-slate-400 transition font-medium"
              >
                <PlusIcon />
                Tambahkan Bahan
              </button>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-sm text-red-700 font-medium">{error}</p>
              </div>
            )}
          </div>

          <div className="px-8 py-6 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-6 py-2.5 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 bg-orange-400 text-white font-bold rounded-xl shadow-lg hover:bg-orange-500 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSaving ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Menyimpan...
                </>
              ) : (
                "Simpan Resep"
              )}
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
};

export default AddRecipeModal;
