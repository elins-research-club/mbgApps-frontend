// /frontend/src/components/NewMenuModal.js
import { useState, useCallback, useRef, useEffect } from "react";
import { X, Save, ChefHat, Plus, Trash2 } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

function debounce(func, timeout = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => func.apply(this, args), timeout);
  };
}

const NewMenuModal = ({ onClose, onSubmit, isLoading, error }) => {
  const [namaMenu, setNamaMenu] = useState("");
  const [recipes, setRecipes] = useState([
    { id: 1, name: "", menuId: null, kategori: "", status: "idle" },
  ]);
  const [suggestions, setSuggestions] = useState([]);
  const [focusedRecipeId, setFocusedRecipeId] = useState(null);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);

  const searchAbortController = useRef(null);

  useEffect(() => {
    return () => {
      if (searchAbortController.current) {
        searchAbortController.current.abort();
      }
    };
  }, []);

  const searchRecipes = async (searchQuery) => {
    if (!searchQuery || searchQuery.trim().length < 1) {
      setSuggestions([]);
      return;
    }

    if (searchAbortController.current) {
      searchAbortController.current.abort();
    }

    searchAbortController.current = new AbortController();

    try {
      const response = await fetch(
        `${API_URL}/search?q=${encodeURIComponent(searchQuery.trim())}`,
        {
          signal: searchAbortController.current.signal,
        }
      );

      if (!response.ok) throw new Error("Search failed");

      const data = await response.json();
      setSuggestions(Array.isArray(data) ? data : []);
    } catch (error) {
      if (error.name !== "AbortError") {
        console.error("Search error:", error);
        setSuggestions([]);
      }
    }
  };

  const debouncedSearch = useCallback(debounce(searchRecipes, 300), []);

  const handleAddRecipe = () => {
    setRecipes([
      ...recipes,
      {
        id: Date.now(),
        name: "",
        menuId: null,
        kategori: "",
        status: "idle",
      },
    ]);
  };

  const handleRemoveRecipe = (id) => {
    if (recipes.length <= 1) return;
    setRecipes(recipes.filter((r) => r.id !== id));
  };

  const handleRecipeChange = (id, value) => {
    setRecipes((prev) =>
      prev.map((r) => (r.id === id ? { ...r, name: value, status: "idle" } : r))
    );
    debouncedSearch(value);
    setSelectedSuggestionIndex(-1);
  };

  const handleSelectSuggestion = (id, selectedMenu) => {
    console.log("✅ Selected:", selectedMenu);

    setRecipes((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              name: selectedMenu.nama,
              menuId: selectedMenu.id,
              kategori: selectedMenu.kategori || "",
              status: "found",
            }
          : r
      )
    );

    setSuggestions([]);
    setFocusedRecipeId(null);
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
          handleSelectSuggestion(id, suggestions[selectedSuggestionIndex]);
        }
        break;
      case "Escape":
        e.preventDefault();
        setSuggestions([]);
        setSelectedSuggestionIndex(-1);
        setFocusedRecipeId(null);
        break;
      default:
        break;
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!namaMenu.trim()) {
      alert("Nama menu kelompokan wajib diisi.");
      return;
    }

    const validRecipes = recipes.filter(
      (r) => r.menuId && r.status === "found"
    );

    console.log("📋 Valid recipes:", validRecipes);

    if (validRecipes.length === 0) {
      alert("Minimal harus ada 1 menu yang dipilih.");
      return;
    }

    // ✅ PERBAIKAN: Mapping kategori yang benar
    const komposisi = {
      karbo_id: null,
      lauk_id: null,
      sayur_id: null,
      side_dish_id: null,
      buah_id: null,
    };

    validRecipes.forEach((r) => {
      console.log(
        `🔍 Mapping recipe: ${r.name} (kategori: ${r.kategori}, ID: ${r.menuId})`
      );

      const kategoriMap = {
        karbohidrat: "karbo_id",
        "Karbohidrat": "karbo_id", // ✅ TAMBAH CAPITAL
        proteinHewani: "lauk_id",
        "Protein Hewani": "lauk_id", // ✅ TAMBAH CAPITAL
        sayur: "sayur_id",
        "Sayur": "sayur_id", // ✅ TAMBAH CAPITAL
        proteinTambahan: "side_dish_id",
        "Protein Tambahan": "side_dish_id", // ✅ TAMBAH CAPITAL
        buah: "buah_id",
        "Buah": "buah_id", // ✅ TAMBAH CAPITAL
      };

      const key = kategoriMap[r.kategori];

      if (key) {
        console.log(`✅ Assigning ${r.menuId} to ${key}`);
        komposisi[key] = r.menuId;
      } else {
        console.warn(`❌ Unknown kategori: "${r.kategori}"`);
      }
    });

    console.log("📤 Final komposisi:", komposisi);

    onSubmit({
      nama: namaMenu.trim(),
      komposisi,
    });
  };
  const getCategoryBadge = (kategori) => {
    const badges = {
      karbohidrat: {
        emoji: "🍚",
        color: "bg-amber-100 text-amber-700",
        label: "Karbohidrat",
      },
      proteinHewani: {
        emoji: "🍖",
        color: "bg-red-100 text-red-700",
        label: "Protein Hewani",
      },
      sayur: {
        emoji: "🥬",
        color: "bg-green-100 text-green-700",
        label: "Sayur",
      },
      proteinTambahan: {
        emoji: "🥚",
        color: "bg-yellow-100 text-yellow-700",
        label: "Protein Tambahan",
      },
      buah: { emoji: "🍎", color: "bg-pink-100 text-pink-700", label: "Buah" },
    };

    const badge = badges[kategori] || {
      emoji: "📦",
      color: "bg-gray-100 text-gray-700",
      label: kategori,
    };

    return (
      <span
        className={`px-2 py-0.5 rounded-full text-xs font-medium ${badge.color}`}
      >
        {badge.emoji} {badge.label}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="relative bg-orange-500 px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <ChefHat className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">
                  Buat Paket Komposisi
                </h2>
                <p className="text-orange-50 text-sm mt-0.5">
                  Kelompokkan resep menjadi satu paket menu
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Content */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto px-8 py-6"
        >
          <div className="space-y-6">
            {/* Nama Menu */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                Nama Paket Kelompokan
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={namaMenu}
                onChange={(e) => setNamaMenu(e.target.value)}
                placeholder="Contoh: Paket Sehat Senin"
                className="w-full px-4 py-3 border border-orange-200 rounded-xl
                         focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent
                         disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                disabled={isLoading}
              />
            </div>

            {/* Divider */}
            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-orange-200"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="px-4 text-sm font-medium text-slate-500 bg-white">
                  Menu dalam Paket (
                  {recipes.filter((r) => r.status === "found").length})
                </span>
              </div>
            </div>

            {/* Dynamic Recipe Inputs */}
            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
              {recipes.map((recipe, index) => (
                <div
                  key={recipe.id}
                  className="relative p-4 rounded-xl bg-gradient-to-br from-orange-50 to-orange-100 
                           border border-orange-200 hover:shadow-md transition-all"
                >
                  <div className="flex items-start gap-3">
                    {/* Number Badge */}
                    <div
                      className="flex-shrink-0 w-8 h-8 bg-orange-500 text-white rounded-lg 
                                  flex items-center justify-center font-semibold text-sm"
                    >
                      {index + 1}
                    </div>

                    {/* Input Area */}
                    <div className="flex-1 space-y-2">
                      <input
                        type="text"
                        value={recipe.name}
                        onChange={(e) =>
                          handleRecipeChange(recipe.id, e.target.value)
                        }
                        onKeyDown={(e) => handleKeyDown(e, recipe.id)}
                        onFocus={() => {
                          setFocusedRecipeId(recipe.id);
                          if (recipe.name.trim()) {
                            searchRecipes(recipe.name.trim());
                          }
                        }}
                        onBlur={() => {
                          setTimeout(() => {
                            setSuggestions([]);
                            setFocusedRecipeId(null);
                          }, 200);
                        }}
                        placeholder={`Cari menu ${index + 1}...`}
                        className="w-full px-3 py-2 border border-orange-300 rounded-lg 
                                 focus:ring-2 focus:ring-orange-500 focus:border-transparent 
                                 outline-none transition text-sm"
                      />

                      {/* Suggestions Dropdown */}
                      {focusedRecipeId === recipe.id &&
                        suggestions.length > 0 && (
                          <div
                            className="absolute z-30 left-14 right-14 bg-white border border-slate-300 
                                      rounded-lg shadow-xl max-h-48 overflow-y-auto mt-1"
                          >
                            {suggestions.map((suggestion, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onMouseDown={() =>
                                  handleSelectSuggestion(recipe.id, suggestion)
                                }
                                className={`w-full text-left px-4 py-2.5 text-sm transition 
                                       flex items-center justify-between gap-2
                                       ${
                                         selectedSuggestionIndex === idx
                                           ? "bg-orange-50 text-orange-700"
                                           : "hover:bg-slate-50"
                                       }`}
                              >
                                <span className="font-medium">
                                  {suggestion.nama}
                                </span>
                                {getCategoryBadge(suggestion.kategori)}
                              </button>
                            ))}
                          </div>
                        )}

                      {/* Status Badge */}
                      {recipe.status === "found" && (
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-green-600 font-semibold flex items-center gap-1">
                            ✅ Menu ditemukan
                          </span>
                          {recipe.kategori && getCategoryBadge(recipe.kategori)}
                        </div>
                      )}
                    </div>

                    {/* Delete Button */}
                    {recipes.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveRecipe(recipe.id)}
                        className="flex-shrink-0 p-2 text-red-400 hover:text-red-600 
                                 hover:bg-red-50 rounded-lg transition"
                        title="Hapus menu"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Add Recipe Button */}
            <button
              type="button"
              onClick={handleAddRecipe}
              className="w-full flex items-center justify-center gap-2 py-3 
                       border-2 border-dashed border-orange-300 rounded-xl 
                       text-orange-600 hover:bg-orange-50 hover:border-orange-400 
                       transition font-medium"
            >
              <Plus className="w-5 h-5" />
              Tambah Menu Lain
            </button>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                <div className="flex-shrink-0 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                  <X className="w-3 h-3 text-white" />
                </div>
                <p className="text-sm text-red-700 flex-1">{error}</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="pt-6 border-t border-orange-200 mt-6 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-6 py-3 bg-white border border-orange-300 text-slate-700 
                       font-semibold rounded-xl hover:bg-orange-50 disabled:opacity-50 
                       disabled:cursor-not-allowed transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-6 py-3 bg-orange-500 text-white font-semibold rounded-xl
                       hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed
                       transition-all shadow-lg shadow-orange-500/30 flex items-center 
                       justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Simpan Paket
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewMenuModal;
