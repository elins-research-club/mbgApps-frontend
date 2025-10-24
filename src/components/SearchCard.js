// /frontend/src/components/SearchCard.js

import { useState, useEffect, useRef } from "react";
import { SparklesIcon } from "./Icons";
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

  // State untuk AI Log real-time
  const [aiLogs, setAiLogs] = useState([]);
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const logContainerRef = useRef(null);

  // Auto-scroll log container
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [aiLogs]);

  const searchApi = debounce(async (searchQuery) => {
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
  }, 500);

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
    // Reset log dan mulai streaming
    setAiLogs([]);
    setIsAiProcessing(true);

    // Panggil fungsi streaming
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

  // Fungsi untuk mendapatkan icon dan warna berdasarkan tipe log
  const getLogStyle = (type) => {
    switch (type) {
      case "start":
        return { icon: "🚀", color: "text-blue-600", bg: "bg-blue-50" };
      case "success":
        return { icon: "✓", color: "text-green-600", bg: "bg-green-50" };
      case "warning":
        return { icon: "⚠", color: "text-yellow-600", bg: "bg-yellow-50" };
      case "error":
        return { icon: "✗", color: "text-red-600", bg: "bg-red-50" };
      case "complete":
        return { icon: "🎉", color: "text-purple-600", bg: "bg-purple-50" };
      default:
        return { icon: "•", color: "text-slate-600", bg: "bg-slate-50" };
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4">
      {/* Logo & Title Section */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-3">
          <Image
            src="/input-icon.png"
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
              <svg
                className="absolute left-6 w-5 h-5 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
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
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
              <button
                type="submit"
                disabled={isLoading || !query || isAiProcessing}
                className="absolute right-2 p-3 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <svg
                    className="animate-spin h-5 w-5"
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
                ) : (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
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
                  <svg
                    className="w-5 h-5 text-slate-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  <span className="text-slate-700">{menu.nama}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </form>

      {/* AI Processing Log - Real-time */}
      {isAiProcessing && (
        <div className="mt-6">
          <div className="bg-gradient-to-br from-orange-50 to-amber-50 border-2 border-orange-200 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="relative">
                <SparklesIcon className="w-6 h-6 text-orange-500 animate-pulse" />
                <div className="absolute inset-0 w-6 h-6 text-orange-500 animate-ping opacity-20">
                  <SparklesIcon />
                </div>
              </div>
              <h3 className="text-lg font-bold text-orange-600">
                AI Sedang Menganalisis...
              </h3>
            </div>

            <div
              ref={logContainerRef}
              className="bg-[#202020]/90 text-white/90 rounded-xl p-4 max-h-80 overflow-y-auto font-mono text-sm space-y-2 shadow-inner"
            >
              {aiLogs.length === 0 ? (
                <div className="flex items-center gap-2 text-white/60">
                  <svg
                    className="animate-spin h-4 w-4"
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
                  <span>Menghubungkan ke AI...</span>
                </div>
              ) : (
                aiLogs.map((log, index) => {
                  const style = getLogStyle(log.type);
                  return (
                    <div
                      key={index}
                      className="flex items-start gap-2 animate-fade-in"
                      style={{
                        animation: "fadeIn 0.3s ease-in",
                      }}
                    >
                      <span className={`flex-shrink-0 ${style.color}`}>
                        {style.icon}
                      </span>
                      <span className="leading-relaxed">{log.message}</span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* AI Fallback Section */}
      {showAiFallback && !isAiProcessing && (
        <div className="mt-6 text-center">
          <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 mb-3">
            <p className="text-slate-600 text-sm flex items-center justify-center gap-2">
              <svg
                className="w-4 h-4 text-orange-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Menu "{lastSearchedQuery}" tidak ditemukan di database
            </p>
          </div>
          <button
            onClick={handleAiClick}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-400 text-white font-semibold rounded-full shadow-lg hover:shadow-xl hover:from-orange-600 cursor-pointer hover:to-orange-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <SparklesIcon />
            <span>Buat Resep dengan AI</span>
          </button>
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

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default SearchCard;
