// /frontend/src/components/MenuComponentSearch.js
// REVISI: Menggunakan kategori baru yang sesuai dengan database

import { useState, useEffect, useRef, useMemo } from "react";
import { Search as SearchIcon } from "lucide-react";
import debounce from "lodash.debounce";

const API_URL = "http://localhost:5000/api";

/**
 * Komponen pencarian khusus untuk Menu Komponen (Resep Dasar).
 * Digunakan di NewMenuModal.js untuk memilih Karbo, Lauk, Sayur, dll.
 */
const MenuComponentSearch = ({
  category, // ✅ Sekarang: 'karbohidrat', 'proteinHewani', 'sayur', 'proteinTambahan', 'buah'
  onMenuSelect, // Dipanggil saat menu dipilih: (stateKey, menuId, menuName)
  placeholder = "Cari atau pilih resep...",
  isLoading: propIsLoading,
  disabled,
}) => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const wrapperRef = useRef(null);

  // Parameter searchType DITETAPKAN SECARA PERMANEN di sini untuk Menu KOMPONEN
  const searchType = "component";

  // Fungsi untuk fetching data dari backend
  const fetchSuggestions = useMemo(
    () =>
      debounce(async (searchQuery) => {
        if (searchQuery.length < 2) {
          setSuggestions([]);
          setIsSearching(false);
          return;
        }

        setIsSearching(true);
        try {
          // URL menggunakan type="component"
          const url = `${API_URL}/search?q=${encodeURIComponent(
            searchQuery
          )}&type=${searchType}`;

          console.log("🔍 Fetching Menu Component:", url);
          const response = await fetch(url);

          if (!response.ok) {
            const text = await response.text();
            console.error("❌ Response Error:", response.status, text);
            throw new Error("Gagal memuat saran menu komponen.");
          }

          const data = await response.json();
          console.log("📝 DATA MENTAH DARI BACKEND:", data);
          console.log("🏷️ KATEGORI YANG DICARI (PROP `category`):", category);

          // Filter TAMBAHAN: Pastikan kategori yang kembali sesuai dengan kategori input
          const filteredData = data.filter(
            (menu) =>
              menu.kategori &&
              menu.kategori.toLowerCase() === category.toLowerCase()
          );

          console.log("✅ HASIL SETELAH FILTER KATEGORI:", filteredData);

          setSuggestions(filteredData);
        } catch (error) {
          console.error("Error fetching suggestions:", error);
          setSuggestions([]);
        } finally {
          setIsSearching(false);
        }
      }, 500),
    [category]
  );

  // Cleanup debounce pada unmount
  useEffect(() => {
    return () => {
      fetchSuggestions.cancel();
    };
  }, [fetchSuggestions]);

  const handleQueryChange = (e) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    fetchSuggestions(newQuery);
  };

  const handleSelect = (menuId, menuName) => {
    if (onMenuSelect) {
      // ✅ PERBAIKAN: Mapping kategori baru ke stateKey
      let stateKey;
      if (category === "karbohidrat") stateKey = "karbo_id";
      else if (category === "proteinHewani") stateKey = "lauk_id";
      else if (category === "sayur") stateKey = "sayur_id";
      else if (category === "proteinTambahan") stateKey = "side_dish_id";
      else if (category === "buah") stateKey = "buah_id";
      else stateKey = `${category}_id`; // Fallback

      // Kirim ke parent
      onMenuSelect(stateKey, menuId, menuName);

      // Tampilkan nama menu yang dipilih
      setQuery(menuName);

      // Tutup dropdown setelah klik benar-benar selesai
      setTimeout(() => {
        setSuggestions([]);
      }, 100);
    }
  };

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <input
        type="text"
        value={query}
        onChange={handleQueryChange}
        onFocus={() => query.length >= 2 || suggestions.length > 0}
        placeholder={placeholder}
        className="w-full p-3 pl-10 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none transition disabled:bg-slate-100"
        disabled={disabled || propIsLoading}
      />
      <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />

      {/* Saran Menu (Suggestions) */}
      {suggestions.length > 0 && (
        <ul className="absolute z-10 w-full bg-white border border-slate-300 rounded-lg shadow-xl mt-1 max-h-60 overflow-y-auto">
          {suggestions.map((menu) => (
            <li
              key={menu.id}
              className="p-3 cursor-pointer hover:bg-slate-100 transition-colors"
              onClick={() => handleSelect(menu.id, menu.nama)}
            >
              <span className="text-slate-700 font-semibold">{menu.nama}</span>
              <span className="text-xs text-slate-500 ml-2">
                ({menu.kategori})
              </span>
            </li>
          ))}
        </ul>
      )}

      {/* Loading Indicator */}
      {(isSearching || propIsLoading) &&
        query.length >= 2 &&
        suggestions.length === 0 && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <svg
              className="animate-spin h-5 w-5 text-green-500"
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
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          </div>
        )}
    </div>
  );
};

export default MenuComponentSearch;
