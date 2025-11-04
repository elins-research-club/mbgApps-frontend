// /frontend/src/components/SearchCard.js
import { useState, useMemo } from "react";
import { Search as SearchIcon, List as ListIcon, Sparkles } from "lucide-react";
import debounce from "lodash.debounce";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const SearchCard = ({
  onMenuSelect,
  isLoading,
  filterCategory = "komposisiChef", // ✅ UBAH JADI INI
}) => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isFocused, setIsFocused] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const searchApi = useMemo(
    () =>
      debounce(async (searchQuery) => {
        if (searchQuery.length < 2) {
          setSuggestions([]);
          return;
        }

        setIsSearching(true);
        try {
          const url = `${API_URL}/search?q=${encodeURIComponent(searchQuery)}`;
          console.log("🔍 Fetching:", url);

          const response = await fetch(url);

          if (!response.ok) {
            throw new Error("Gagal memuat saran menu.");
          }

          let data = await response.json();

          // ✅ Filter hanya kategori "komposisiChef"
          if (filterCategory) {
            data = data.filter((menu) => menu.kategori === filterCategory);
          }

          console.log("✅ Hasil filter komposisiChef:", data);
          setSuggestions(data);
        } catch (error) {
          console.error("Error fetching suggestions:", error);
          setSuggestions([]);
        } finally {
          setIsSearching(false);
        }
      }, 500),
    [filterCategory]
  );

  const handleQueryChange = (e) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    searchApi(newQuery);
  };

  const handleSelect = (menuId, menuName) => {
    if (onMenuSelect) {
      console.log("✅ Selected menu ID:", menuId, "Name:", menuName);
      onMenuSelect(menuId);
      setQuery(menuName);
      setSuggestions([]);
      setIsFocused(false);
    }
  };

  const currentLoading = isLoading || isSearching;

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 w-full">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-orange-50 rounded-xl">
            <SearchIcon className="w-6 h-6 text-orange-500" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-800">
            Cari Paket Menu
          </h2>
        </div>
        <p className="text-sm text-gray-500 ml-14">
          Temukan paket komposisi chef yang sudah dibuat
        </p>
      </div>

      <div className="relative w-full">
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={handleQueryChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 200)}
            placeholder="Ketik nama paket menu..."
            className="w-full pl-12 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-xl 
                     focus:bg-white focus:border-orange-400 focus:ring-2 focus:ring-orange-100 
                     outline-none transition-all duration-200 text-gray-700 placeholder-gray-400"
            disabled={currentLoading}
          />

          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
            <SearchIcon className="w-5 h-5" />
          </div>

          {currentLoading && (
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
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

          {isFocused && suggestions.length > 0 && (
            <div className="absolute z-10 w-full bg-white rounded-xl mt-2 shadow-xl border border-gray-200 overflow-hidden max-h-96 overflow-y-auto">
              <div className="sticky top-0 bg-gradient-to-r from-orange-50 to-amber-50 px-4 py-3 border-b border-orange-100">
                <div className="flex items-center gap-2 text-sm font-medium text-orange-800">
                  <ListIcon className="w-4 h-4" />
                  Ditemukan {suggestions.length} paket menu
                </div>
              </div>

              <ul className="divide-y divide-gray-100">
                {suggestions.map((menu) => (
                  <li
                    key={menu.id}
                    onClick={() => handleSelect(menu.id, menu.nama)}
                    className="flex items-start gap-3 px-4 py-3.5 hover:bg-orange-50 cursor-pointer transition-colors group"
                  >
                    <div className="p-1.5 bg-gray-100 rounded-lg group-hover:bg-orange-100 transition-colors mt-0.5">
                      <SearchIcon className="w-4 h-4 text-gray-500 group-hover:text-orange-600 transition-colors" />
                    </div>
                    <div className="flex flex-col flex-1 min-w-0">
                      <span className="text-gray-800 font-medium group-hover:text-orange-600 transition-colors">
                        {menu.nama}
                      </span>
                      <span className="text-xs text-orange-600 mt-1 font-medium">
                        📦 Paket Komposisi Chef
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {isFocused &&
            query.length >= 2 &&
            !currentLoading &&
            suggestions.length === 0 && (
              <div className="absolute z-10 w-full bg-white rounded-xl mt-2 shadow-xl border border-gray-200 overflow-hidden">
                <div className="px-4 py-8 text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full mb-3">
                    <SearchIcon className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="text-gray-600 font-medium mb-1">
                    Paket menu tidak ditemukan
                  </p>
                  <p className="text-sm text-gray-500">
                    Coba kata kunci lain atau buat paket baru
                  </p>
                </div>
              </div>
            )}
        </div>
      </div>

      <div className="mt-4 flex items-start gap-2 p-3 bg-orange-50 rounded-lg border border-orange-100">
        <Sparkles className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-orange-700 leading-relaxed">
          Ketik minimal 2 karakter untuk mencari paket menu yang sudah dibuat
        </p>
      </div>
    </div>
  );
};

export default SearchCard;
