// /frontend/src/components/AddRecipeModal.js
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
  const [kategori, setKategori] = useState("karbohidrat");
  const [ingredients, setIngredients] = useState([
    {
      id: 1,
      name: "",
      gramasi: "",
      status: "idle",
      message: "",
      nutrisi: null,
      bahanId: null,
    },
  ]);

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

  useEffect(() => {
    console.log(
      `[Ingredients State]`,
      ingredients.map((i) => ({
        id: i.id,
        name: i.name,
        status: i.status,
        bahanId: i.bahanId,
        hasNutrisi: !!i.nutrisi,
      }))
    );
  }, [ingredients]);

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
        nutrisi: null,
        bahanId: null,
      },
    ]);
  };
  const initialIngredients = [
    {
      id: 1,
      name: "",
      gramasi: "",
      status: "idle",
      message: "",
      nutrisi: null,
      bahanId: null,
    },
  ];

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

  const handleSelectSuggestion = (id, selectedName, bahanId) => {
    console.log(`Selecting ingredient: ${selectedName} (ID: ${bahanId})`);

    setIngredients((prevIngredients) =>
      prevIngredients.map((item) =>
        item.id === id
          ? {
              ...item,
              name: selectedName,
              status: "found",
              message: "Bahan ditemukan di database",
              bahanId: bahanId,
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
            suggestions[selectedSuggestionIndex].id
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
      console.log("Skip checking - status:", currentItem.status);
      return;
    }

    console.log("Checking ingredient:", trimmedName);
    updateIngredientStatus(id, "checking", "");

    try {
      const res = await checkIngredient(trimmedName);
      console.log("Check result:", res);

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

  const handleGenerateClick = async (id, name) => {
    const trimmedName = name?.trim();
    if (!trimmedName) {
      updateIngredientStatus(id, "error", "Nama bahan tidak boleh kosong");
      return;
    }

    console.log(`[Generate] Starting for: "${trimmedName}"`);
    updateIngredientStatus(id, "generating", "Memproses dengan AI...");

    try {
      const res = await generateIngredient(trimmedName);

      console.log(`[Generate] Response:`, JSON.stringify(res, null, 2));

      const isSuccess =
        res &&
        res.success === true &&
        res.predicted_composition &&
        (res.ingredient_id || res.id);

      if (isSuccess) {
        const bahanId = res.ingredient_id || res.id;
        const nutrisiData = res.predicted_composition;

        console.log(`[Generate] SUCCESS!`);
        console.log(`   - Bahan ID: ${bahanId}`);
        console.log(`   - Method: ${res.method}`);
        console.log(`   - Confidence: ${res.confidence}`);

        setIngredients((prev) =>
          prev.map((item) =>
            item.id === id
              ? {
                  ...item,
                  status: "generated",
                  message: `Berhasil! (${res.method}, ${Math.round(
                    (res.confidence || 0.5) * 100
                  )}% confidence)`,
                  nutrisi: nutrisiData,
                  bahanId: bahanId,
                }
              : item
          )
        );

        setTimeout(() => {
          console.log(`[Generate] Refreshing suggestions...`);
          searchApi(trimmedName);
        }, 500);
      } else {
        console.error(`[Generate] FAILED - Response:`, res);

        const errorMessage =
          res?.error ||
          res?.message ||
          (!res?.predicted_composition
            ? "AI tidak dapat menghasilkan data nutrisi"
            : "Gagal generate bahan");

        updateIngredientStatus(id, "error", errorMessage);
      }
    } catch (error) {
      console.error(`[Generate] EXCEPTION:`, error);
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
        icon: null,
      },
      checking: {
        text: "Mengecek database...",
        className: "text-blue-600 font-medium",
        bgColor: "bg-blue-50",
        borderColor: "border-blue-200",
        icon: (
          <svg
            className="w-6 h-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        ),
        showSpinner: true,
      },
      found: {
        text: "Ditemukan di database",
        className: "text-green-600 font-semibold",
        bgColor: "bg-green-50",
        borderColor: "border-green-200",
        icon: (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        ),
      },
      not_found: {
        text: "Tidak ditemukan di database",
        className: "text-amber-700 font-medium",
        bgColor: "bg-amber-50",
        borderColor: "border-amber-200",
        icon: (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        ),
        showButton: true,
      },
      generating: {
        text: "AI sedang menganalisis komposisi nutrisi...",
        className: "text-purple-600 font-medium",
        bgColor: "bg-purple-50",
        borderColor: "border-purple-200",
        icon: (
          <svg
            className="w-6 h-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
            />
          </svg>
        ),
        showSpinner: true,
      },
      generated: {
        text: item.message || "Berhasil ditambahkan dengan AI",
        className: "text-purple-700 font-semibold",
        bgColor: "bg-purple-50",
        borderColor: "border-purple-300",
        icon: (
          <svg
            className="w-6 h-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
            />
          </svg>
        ),
      },
      error: {
        text: item.message || "Terjadi kesalahan",
        className: "text-red-600 font-medium",
        bgColor: "bg-red-50",
        borderColor: "border-red-200",
        icon: (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        ),
      },
    };

    const config = statusConfig[item.status];
    if (!config || item.status === "idle") return null;

    return (
      <div className="mt-3">
        <div
          className={`${config.bgColor} ${config.borderColor} border-2 rounded-xl p-4 transition-all duration-300 w-full`}
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              {config.showSpinner ? (
                <div className="relative w-6 h-6">
                  <svg
                    className="animate-spin w-6 h-6 text-current"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="3"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                </div>
              ) : (
                <div className={config.className}>{config.icon}</div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p className={`text-sm ${config.className} leading-relaxed`}>
                {config.text}
              </p>

              {config.showButton && (
                <button
                  type="button"
                  onClick={() => handleGenerateClick(item.id, item.name)}
                  className="mt-3 w-full group relative overflow-hidden bg-gradient-to-r from-purple-600 via-purple-500 to-indigo-600 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

                  <div className="relative flex items-center justify-center gap-3">
                    <svg
                      className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                      />
                    </svg>
                    <span className="text-base">Generate dengan AI</span>
                    <svg
                      className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                      />
                    </svg>
                  </div>
                </button>
              )}

              {item.status === "generated" && (
                <div className="mt-3 flex items-center gap-2 text-xs text-purple-600">
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="font-medium">
                    Data nutrisi telah tersimpan di database
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
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

  const resetForm = () => {
    setMenuName("");
    setKategori("karbohidrat");
    setIngredients(initialIngredients);
    setSuggestions([]);
    setError("");
    setSelectedSuggestionIndex(-1);
    setFocusedIngredientId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSaving) return;

    setError("");

    if (!validateForm()) return;

    setIsSaving(true);

    try {
      const validIngredients = ingredients.filter((item) => item.name.trim());

      const payload = {
        menuName: menuName.trim(),
        kategori: kategori,
        ingredients: validIngredients.map((item) => ({
          id: item.id,
          name: item.name.trim(),
          gramasi: parseFloat(item.gramasi),
          status: item.status,
          bahanId: item.bahanId,
          nutrisi: item.nutrisi,
        })),
      };

      console.log("Sending payload:", JSON.stringify(payload, null, 2));
      const res = await saveRecipe(payload);
      console.log("Save response:", res);

      if (res?.success) {
        const newRecipeId =
          res.menu?.id || null;
        console.log("Recipe ID ", newRecipeId);
        if (onRecipeAdded) onRecipeAdded(newRecipeId);
        if (onClose) {
          onClose();
        } else {
          resetForm();
        }
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

  const handleCancel = () => {
    if (isSaving) return;
    if (onClose) {
      onClose();
    } else {
      resetForm();
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && !isSaving) {
      onClose();
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl w-full flex flex-col animate-in fade-in duration-200">
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-8 py-6">
          <h2 className="text-2xl font-bold text-white">
            Tambahkan Resep Baru
          </h2>
          <p className="text-orange-50 text-sm mt-1">
            Lengkapi informasi resep dan bahan-bahan yang diperlukan
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex-1">
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
                  className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:ring-4 focus:ring-orange-100 focus:border-orange-500 outline-none transition"
                />
              </div>

              <div>
                {/* <label
                  htmlFor="kategori"
                  className="block text-sm font-semibold text-slate-700 mb-2"
                >
                  Kategori Resep <span className="text-red-500">*</span>
                </label> */}
                {/* <select
                  id="kategori"
                  value={kategori}
                  onChange={(e) => setKategori(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:ring-4 focus:ring-orange-100 focus:border-orange-500 outline-none transition bg-white"
                >
                  <option value="karbohidrat">Karbohidrat</option>
                  <option value="proteinHewani">Protein Hewani</option>
                  <option value="sayur">Sayur</option>
                  <option value="proteinTambahan">Protein Tambahan</option>
                  <option value="buah">Buah/Susu/Salad</option>
                </select> */}
              </div>
            </div>

            <div className="border-t border-slate-200"></div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="text-sm font-semibold text-slate-700">
                  Bahan-bahan <span className="text-red-500">*</span>
                </label>
                <span className="text-xs text-slate-500 bg-slate-100 px-3 py-1 rounded-full font-medium">
                  {ingredients.filter((i) => i.name.trim()).length} bahan
                </span>
              </div>

              <div className="space-y-4 pr-2 custom-scrollbar">
                {ingredients.map((item, index) => (
                  <div
                    key={item.id}
                    className={`relative p-5 rounded-2xl border-2 shadow-md hover:shadow-xl transition-all duration-300 ${
                      item.status === "generated"
                        ? "bg-gradient-to-br from-purple-50 via-white to-indigo-50 border-purple-300"
                        : item.status === "found"
                        ? "bg-gradient-to-br from-green-50 via-white to-emerald-50 border-green-300"
                        : item.status === "generating"
                        ? "bg-gradient-to-br from-purple-50 via-white to-blue-50 border-purple-300 animate-pulse"
                        : "bg-gradient-to-br from-slate-50 to-white border-slate-300"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center font-bold text-base shadow-lg transition-all duration-300 ${
                          item.status === "generated" ||
                          item.status === "generating"
                            ? "bg-gradient-to-br from-purple-500 to-indigo-600 text-white"
                            : item.status === "found"
                            ? "bg-gradient-to-br from-green-500 to-emerald-600 text-white"
                            : "bg-gradient-to-br from-orange-400 to-orange-500 text-white"
                        }`}
                      >
                        {index + 1}
                      </div>

                      <div className="flex-1 space-y-3">
                        <div className="relative">
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
                            placeholder={`Masukkan nama bahan ${index + 1}...`}
                            className={`w-full px-4 py-3 border-2 rounded-xl outline-none transition-all duration-300 text-sm font-medium ${
                              item.status === "generated" ||
                              item.status === "found"
                                ? "border-green-300 bg-green-50/50 focus:border-green-500 focus:ring-4 focus:ring-green-100"
                                : "border-slate-300 bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                            }`}
                            disabled={
                              item.status === "checking" ||
                              item.status === "generating"
                            }
                          />
                          

                          {(item.status === "checking" ||
                            item.status === "generating") && (
                            <div className="absolute right-4 top-1/2 -translate-y-1/2">
                              <svg
                                className="animate-spin h-5 w-5 text-purple-500"
                                viewBox="0 0 24 24"
                                fill="none"
                              >
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="3"
                                />
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                />
                              </svg>
                            </div>
                          )}
                        </div>

                        {focusedIngredientId === item.id &&
                          suggestions.length > 0 && (
                            <div className="absolute z-30 left-16 right-16 mt-1 bg-white border-2 border-purple-200 rounded-xl shadow-2xl max-h-64 overflow-y-auto">
                              <div className="p-2">
                                <p className="px-3 py-2 text-xs font-semibold text-purple-600 uppercase tracking-wide">
                                  Pilih dari database ({suggestions.length})
                                </p>
                              </div>
                              <div className="divide-y divide-slate-100">
                                {suggestions.map((suggestion, idx) => (
                                  <button
                                    key={idx}
                                    type="button"
                                    onMouseDown={(e) =>{
                                      e.preventDefault();
                                      handleSelectSuggestion(
                                        item.id,
                                        suggestion.nama,
                                        suggestion.id
                                      )}
                                    } // ✅ TAMBAHKAN onClick!
                                    className={`w-full text-left px-4 py-3 transition-colors ${
                                      idx === selectedSuggestionIndex
                                        ? "bg-purple-100 border-l-4 border-purple-500"
                                        : "hover:bg-slate-50"
                                    }`}
                                  >
                                    <div className="flex items-center justify-between">
                                      <span className="font-medium">
                                        {suggestion.nama}
                                      </span>

                                      {/* ✅ BADGE VERIFIED */}
                                      {suggestion.isValidated && (
                                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                                          <svg
                                            className="w-3 h-3"
                                            fill="currentColor"
                                            viewBox="0 0 20 20"
                                          >
                                            <path
                                              fillRule="evenodd"
                                              d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                              clipRule="evenodd"
                                            />
                                          </svg>
                                          {suggestion.validatedBy || "TKPI"}
                                        </span>
                                      )}
                                    </div>
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}

                        {/* {renderIngredientStatus(item)} */}
                      </div>

                      <div className="flex items-center gap-3">
                          <div className="relative flex-shrink-0">
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
                              className="w-32 px-4 py-3 border-2 border-slate-300 rounded-xl focus:ring-4 focus:ring-orange-100 focus:border-orange-500 outline-none transition-all text-sm font-semibold"
                              min="0"
                              step="0.01"
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 pointer-events-none">
                              g
                            </span>
                          </div>
                          {/* <div className="flex items-center gap-2 text-sm text-slate-600">
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"
                              />
                            </svg> */}
                            {/* <span className="font-medium">Gramasi</span> */}
                          {/* </div> */}
                      </div>

                      {ingredients.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveIngredient(item.id)}
                          className="flex-shrink-0 p-2.5 text-red-500 hover:text-white hover:bg-red-500 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg group"
                          title="Hapus bahan"
                        >
                          <TrashIcon className="group-hover:scale-110 transition-transform" />
                        </button>
                      )}
                    </div>
                    {renderIngredientStatus(item)}
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={handleAddIngredient}
                className="w-full mt-4 flex items-center justify-center gap-2 py-3 border-2 border-dashed border-slate-300 rounded-xl text-slate-600 hover:bg-slate-50 hover:border-slate-400 transition font-medium cursor-pointer"
              >
                <PlusIcon />
                Tambahkan Bahan
              </button>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl">
                <p className="text-sm text-red-700 font-medium">{error}</p>
              </div>
            )}
          </div>

          {/* <div className="px-8 py-6 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-6 py-2.5 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Batal
            </button> */}
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold shadow-lg hover:shadow-xl hover:from-orange-600 cursor-pointer hover:to-orange-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 w-full"
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
                <span className="w-full text-center">Tampilkan Gizi</span>
              )}
            </button>
        </form>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: linear-gradient(to bottom, #f1f5f9, #e2e8f0);
          border-radius: 10px;
          margin: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #a855f7, #7c3aed);
          border-radius: 10px;
          transition: all 0.3s;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #9333ea, #6d28d9);
          box-shadow: 0 0 10px rgba(168, 85, 247, 0.3);
        }
      `}</style>
    </div>
  );
};

export default AddRecipeModal;
