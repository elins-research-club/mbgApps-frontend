// /frontend/src/components/AutoCompleteInput.js

import { useState, useMemo, useRef } from "react"; // <-- DIUBAH
import { SearchIcon } from "./Icons";

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

const AutoCompleteInput = ({
  id,
  name,
  label,
  value,
  onValueChange,
  placeholder,
}) => {
  const [suggestions, setSuggestions] = useState([]);
  const [isFocused, setIsFocused] = useState(false);

  // Debounce API call
  // --- DIUBAH: Menggunakan useMemo ---
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
    [] // Array dependensi kosong, 'searchApi' akan dibuat sekali
  );
  // --- Akhir Perubahan ---

  const handleChange = (e) => {
    const newValue = e.target.value;
    // 1. Update state di parent (MenuInputCard)
    onValueChange(name, newValue);
    // 2. Panggil API untuk suggestions
    searchApi(newValue);
  };

  const handleSelectSuggestion = (menu) => {
    // 1. Update state di parent dengan nilai yang dipilih
    onValueChange(name, menu.nama);
    // 2. Kosongkan suggestions
    setSuggestions([]);
    // 3. Hilangkan fokus
    setIsFocused(false);
  };

  return (
    <div className="relative">
      <label htmlFor={id} className="text-md font-semibold text-slate-600">
        {label}
      </label>
      <div className="relative mt-2">
        <input
          id={id}
          name={name}
          type="text"
          value={value}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)} // Delay onBlur
          placeholder={placeholder}
          className="w-full p-3 pl-10 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gray-500 outline-none transition"
          autoComplete="off"
        />
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
          <SearchIcon />
        </div>
      </div>

      {/* Suggestions Dropdown */}
      {isFocused && suggestions.length > 0 && (
        <ul className="absolute z-10 w-full bg-white rounded-lg mt-1 shadow-xl border border-slate-100 overflow-hidden max-h-60 overflow-y-auto">
          {suggestions.map((menu) => (
            <li
              key={menu.id}
              onClick={() => handleSelectSuggestion(menu)}
              className="px-4 py-2.5 hover:bg-slate-100 cursor-pointer flex items-center gap-2 transition-colors text-sm"
            >
              {/* Anda bisa tambahkan ikon kategori di sini jika mau */}
              <span className="text-slate-700">{menu.nama}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AutoCompleteInput;