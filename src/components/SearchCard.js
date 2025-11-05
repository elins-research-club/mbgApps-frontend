import { useState, useMemo, useRef } from "react";
import { Search as SearchIcon, List as ListIcon, Boxes } from "lucide-react";
import debounce from "lodash.debounce";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const SearchCard = ({
  onMenuSelect,
  isLoading,
  filterCategory = "komposisiChef",
}) => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isFocused, setIsFocused] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const wrapperRef = useRef(null);

  // ✅ Debounced API search
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
          const response = await fetch(url);
          if (!response.ok) throw new Error("Gagal memuat saran menu.");
          let data = await response.json();

          // Filter kategori
          if (filterCategory) {
            data = data.filter((menu) => menu.kategori === filterCategory);
          }
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
      onMenuSelect(menuId);
      setQuery(menuName);
      setSuggestions([]);
      setIsFocused(false);
    }
  };

  const currentLoading = isLoading || isSearching;

  return (
    <div
      ref={wrapperRef}
      className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <Boxes className="w-6 h-6 text-orange-500" />
        <h3 className="text-xl font-bold text-orange-500">Cari Paket Menu</h3>
      </div>

      <p className="text-sm text-slate-600 mb-4">
        Temukan dan pilih paket komposisi menu dari chef
      </p>

      {/* Input */}
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={handleQueryChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          placeholder="Ketik nama paket menu (min. 2 karakter)..."
          className="w-full p-3 pl-10 pr-10 border border-slate-300 rounded-lg outline-none 
                     focus:ring-2 focus:ring-orange-500 focus:border-transparent transition 
                     disabled:bg-slate-100 disabled:cursor-not-allowed text-gray-700 placeholder-gray-400"
          disabled={currentLoading}
        />

        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />

        {currentLoading && (
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
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 
                   5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 
                   3 7.938l3-2.647z"
              />
            </svg>
          </div>
        )}

        {/* Dropdown hasil */}
        {isFocused && suggestions.length > 0 && (
          <div className="absolute z-10 w-full bg-white border border-slate-300 rounded-lg shadow-xl mt-1 max-h-80 overflow-y-auto">
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
                    <Boxes className="w-4 h-4 text-gray-500 group-hover:text-orange-600 transition-colors" />
                  </div>
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="text-gray-800 font-medium group-hover:text-orange-600 transition-colors">
                      {menu.nama}
                    </span>
                    <span className="text-xs text-orange-600 mt-1 font-medium">
                      Paket Komposisi Chef
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Tidak ada hasil */}
        {isFocused &&
          query.length >= 2 &&
          !currentLoading &&
          suggestions.length === 0 && (
            <div className="absolute z-10 w-full bg-white border border-slate-300 rounded-lg shadow-xl mt-1 p-4 text-center">
              <p className="text-sm text-slate-500">
                Tidak ada paket menu dengan nama <b>"{query}"</b>
              </p>
            </div>
          )}
      </div>
    </div>
  );
};

export default SearchCard;
