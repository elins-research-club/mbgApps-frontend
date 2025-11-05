// /frontend/src/components/RecipeSearchCard.js
// Component baru untuk search resep individual

import { useState, useEffect, useRef } from "react";
import { Search as SearchIcon } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const RecipeSearchCard = ({ onRecipeSelect, isLoading }) => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchTimeout = useRef(null);
  const wrapperRef = useRef(null);
  const isSelectingRef = useRef(false); // 🟢 Tambahan penting

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
    };
  }, []);

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setSuggestions([]);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 🔍 Debounced search
  useEffect(() => {
    // ⛔ Skip search kalau baru saja memilih resep
    if (isSelectingRef.current) {
      isSelectingRef.current = false;
      return;
    }

    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    if (searchTimeout.current) clearTimeout(searchTimeout.current);

    searchTimeout.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const response = await fetch(
          `${API_URL}/search?q=${encodeURIComponent(query)}&type=all`
        );
        if (response.ok) {
          const data = await response.json();
          console.log("🔍 Search results:", data);
          setSuggestions(data);
        } else {
          console.error("Search failed:", response.status);
          setSuggestions([]);
        }
      } catch (error) {
        console.error("Error fetching suggestions:", error);
        setSuggestions([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);
  }, [query]);

  // ✅ Handle select (langsung tutup dropdown tanpa trigger search baru)
  const handleSelect = (recipe) => {
    console.log("✅ Selected recipe:", recipe);

    // Tandai bahwa kita sedang memilih manual (agar useEffect tidak fetch ulang)
    isSelectingRef.current = true;

    // Tutup semua hasil dan hentikan pencarian aktif
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    setSuggestions([]);
    setIsSearching(false);

    // Set query ke nama resep
    setQuery(recipe.nama);

    // Reset highlight dan kirim ID ke parent
    setSelectedIndex(-1);
    onRecipeSelect(recipe.id);
  };

  const handleKeyDown = (e) => {
    if (suggestions.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleSelect(suggestions[selectedIndex]);
        }
        break;
      case "Escape":
        e.preventDefault();
        setSuggestions([]);
        setSelectedIndex(-1);
        break;
      default:
        break;
    }
  };

  // Kategori icons
  const kategoriIcons = {
    karbohidrat: "🍚",
    proteinHewani: "🍗",
    sayur: "🥬",
    proteinTambahan: "🥜",
    buah: "🍌",
  };

  return (
    <div
      ref={wrapperRef}
      className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200"
    >
      <div className="flex items-center gap-3 mb-4">
        <SearchIcon className="w-6 h-6 text-orange-500" />
        <h3 className="text-xl font-bold text-orange-500">
          Cari Resep Individual
        </h3>
      </div>

      <p className="text-sm text-slate-600 mb-4">
        Cari dan lihat label nutrisi dari satu resep saja
      </p>

      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ketik nama resep (min. 2 karakter)..."
          className="w-full p-3 pl-10 pr-10 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition disabled:bg-slate-100 disabled:cursor-not-allowed"
          disabled={isLoading}
        />

        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />

        {isSearching && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <svg
              className="animate-spin h-5 w-5 text-orange-500"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
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
          </div>
        )}

        {/* Suggestions Dropdown */}
        {suggestions.length > 0 && (
          <ul className="absolute z-10 w-full bg-white border border-slate-300 rounded-lg shadow-xl mt-1 max-h-80 overflow-y-auto">
            {suggestions.map((recipe, index) => (
              <li
                key={recipe.id}
                className={`p-3 cursor-pointer border-b border-slate-100 last:border-b-0 transition-colors ${
                  index === selectedIndex ? "bg-orange-50" : "hover:bg-slate-50"
                }`}
                onClick={() => handleSelect(recipe)}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className="text-xl flex-shrink-0">
                      {kategoriIcons[recipe.kategori] || "🍽️"}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-slate-800 truncate">
                        {recipe.nama}
                      </p>
                      <p className="text-xs text-slate-500">ID: {recipe.id}</p>
                    </div>
                  </div>
                  <span className="text-xs px-2 py-1 bg-orange-100 text-orange-600 rounded flex-shrink-0">
                    {recipe.kategori === "karbohidrat" && "Karbohidrat"}
                    {recipe.kategori === "proteinHewani" && "Protein Hewani"}
                    {recipe.kategori === "sayur" && "Sayur"}
                    {recipe.kategori === "proteinTambahan" &&
                      "Protein Tambahan"}
                    {recipe.kategori === "buah" && "Buah"}
                    {![
                      "karbohidrat",
                      "proteinHewani",
                      "sayur",
                      "proteinTambahan",
                      "buah",
                    ].includes(recipe.kategori) && recipe.kategori}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}

        {/* No results message */}
        {/* {!isSearching && query.length >= 2 && suggestions.length === 0 && (
          <div className="absolute z-10 w-full bg-white border border-slate-300 rounded-lg shadow-xl mt-1 p-4">
            <p className="text-sm text-slate-500 text-center">
              Tidak ada resep yang ditemukan dengan kata kunci "{query}"
            </p>
          </div>
        )} */}
      </div>
    </div>
  );
};

export default RecipeSearchCard;
