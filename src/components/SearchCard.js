// /frontend/src/components/SearchCard.js
// INI ADALAH KOMPONEN DARI FILE ASLI ANDA (FILE 8), DIPERLUKAN UNTUK GUEST VIEW

import { useState, useEffect, useRef, useMemo } from "react";
import { SparklesIcon, SearchIcon } from "./Icons"; // Pastikan SearchIcon ada di Icons.js
import Image from "next/image";

function debounce(func, timeout = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func.apply(this, args);
    }, timeout);
  };
}

const API_URL = "http://localhost:5000/api";

const SearchCard = ({
  onMenuSelect,
  onSearchSubmit,
  onAiGenerate,
  isLoading,
  showAiFallback,
  lastSearchedQuery,
}) => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isFocused, setIsFocused] = useState(false);
  const [aiLogs, setAiLogs] = useState([]);
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const logContainerRef = useRef(null);

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [aiLogs]);

  const searchApi = useMemo(
    () =>
      debounce(async (searchQuery) => {
        if (searchQuery.length < 2) {
          setSuggestions([]);
          return;
        }
        try {
          const response = await fetch(
            `${API_URL}/search?q=${encodeURIComponent(searchQuery)}`
          );
          if (!response.ok) {
            console.error("Backend search failed:", response.statusText);
            setSuggestions([]);
            return;
          }
          const data = await response.json();
          setSuggestions(data);
        } catch (error) {
          console.error("Failed to fetch search suggestions:", error);
          setSuggestions([]);
        }
      }, 500),
    []
  );

  const handleChange = (e) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    searchApi(newQuery);
  };

  const handleSelectSuggestion = (menu) => {
    setQuery(menu.nama);
    setSuggestions([]);
    onMenuSelect(menu.id);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isLoading || !query) return;
    setSuggestions([]);
    onSearchSubmit(query);
  };

  const handleAiClick = () => {
    setAiLogs([]);
    setIsAiProcessing(true);
    onAiGenerate(
      lastSearchedQuery,
      (log) => {
        setAiLogs((prev) => [...prev, log]);
      },
      () => {
        setIsAiProcessing(false);
      }
    );
  };

  const getLogStyle = (type) => {
    // ... (Fungsi getLogStyle Anda dari file asli bisa ditaruh di sini jika AI fallback dipakai)
    return { icon: "•", color: "text-slate-600", bg: "bg-slate-50" };
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4">
      {/* Logo & Title Section */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-3">
          <Image
            src="/input-icon.png" // Anda bisa ganti ini
            alt="Icon Resep"
            width={48}
            height={48}
            className="w-12 h-12"
          />
          <h1 className="text-4xl font-bold text-orange-500">
            Kalkulator Gizi MBG
          </h1>
        </div>
        <p className="text-slate-600 text-sm">
          Cari resep makanan dan analisis kandungan gizinya
        </p>
      </div>

      {/* Search Box - Google Style */}
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <div
            className={`bg-white rounded-full shadow-lg transition-shadow duration-200 ${
              isFocused ? "shadow-xl" : "shadow-md"
            } hover:shadow-xl`}
          >
            <div className="relative flex items-center">
              <div className="absolute left-6 w-5 h-5 text-slate-400">
                <SearchIcon />
              </div>
              <input
                type="text"
                value={query}
                onChange={handleChange}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setTimeout(() => setIsFocused(false), 200)}
                placeholder="Cari resep makanan..."
                className="w-full py-4 px-14 text-base rounded-full outline-none border-none focus:ring-0"
                disabled={isAiProcessing}
              />
              {query && !isAiProcessing && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    setSuggestions([]);
                  }}
                  className="absolute right-20 text-slate-400 hover:text-slate-600"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
              <button
                type="submit"
                disabled={isLoading || !query || isAiProcessing}
                className="absolute right-2 p-3 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Suggestions Dropdown */}
          {suggestions.length > 0 && !isAiProcessing && (
            <ul className="absolute z-10 w-full bg-white rounded-2xl mt-2 shadow-xl border border-slate-100 overflow-hidden max-h-80 overflow-y-auto">
              {suggestions.map((menu) => (
                <li
                  key={menu.id}
                  onClick={() => handleSelectSuggestion(menu)}
                  className="px-6 py-3 hover:bg-slate-50 cursor-pointer flex items-center gap-3 transition-colors"
                >
                  <SearchIcon className="w-5 h-5 text-slate-400" />
                  <span className="text-slate-700">{menu.nama}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </form>

      {/* AI Fallback Section */}
      {showAiFallback && !isAiProcessing && (
         <div className="mt-6 text-center">
           <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 mb-3">
             <p className="text-slate-600 text-sm flex items-center justify-center gap-2">
              Menu &ldquo;{lastSearchedQuery}&rdquo; tidak ditemukan
             </p>
           </div>
           {/* Hapus tombol AI jika tidak diperlukan untuk tamu */}
         </div>
       )}

      {/* Quick Tips */}
      {!isAiProcessing && (
        <div className="mt-8 text-center">
          <p className="text-xs text-slate-400">
            Tips: Ketik minimal 2 karakter untuk melihat saran resep
          </p>
        </div>
      )}
    </div>
  );
};

export default SearchCard;