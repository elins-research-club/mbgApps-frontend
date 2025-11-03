// import { useState, useEffect, useMemo } from "react";
// import { Search as SearchIcon, List as ListIcon } from "lucide-react";
// import debounce from "lodash.debounce";

// const API_URL = "http://localhost:5000/api";

// const SearchCard = ({
//   category,
//   onMenuSelect,
//   onSearchSubmit,
//   onAiGenerate,
//   isLoading,
//   showAiFallback,
//   lastSearchedQuery,
//   searchType = "composition", // ✅ PERBAIKAN: Default ke "composition" untuk menu komposisi chef
//   filterCategory = "komposisi_chef", // ✅ PERBAIKAN: Default filter untuk menu komposisi
// }) => {
//   const [query, setQuery] = useState("");
//   const [suggestions, setSuggestions] = useState([]);
//   const [isFocused, setIsFocused] = useState(false);
//   const [isSearching, setIsSearching] = useState(false);

//   // 🔹 Pencarian dengan debounce
//   const searchApi = useMemo(
//     () =>
//       debounce(async (searchQuery) => {
//         if (searchQuery.length < 2) {
//           setSuggestions([]);
//           return;
//         }

//         setIsSearching(true);
//         try {
//           const url = `${API_URL}/search?q=${encodeURIComponent(
//             searchQuery
//           )}&type=${searchType}`;
//           console.log("🔍 Fetching:", url);

//           const response = await fetch(url);

//           if (!response.ok) {
//             const text = await response.text();
//             console.error("❌ Response Error:", response.status, text);
//             throw new Error("Gagal memuat saran menu.");
//           }

//           let data = await response.json();

//           // ✅ Filter berdasarkan kategori jika filterCategory ada
//           if (filterCategory) {
//             data = data.filter((menu) => menu.kategori === filterCategory);
//           }

//           console.log("✅ Hasil setelah filter:", data);
//           setSuggestions(data);
//         } catch (error) {
//           console.error("Error fetching suggestions:", error);
//           setSuggestions([]);
//         } finally {
//           setIsSearching(false);
//         }
//       }, 500),
//     [searchType, filterCategory]
//   );

//   const handleQueryChange = (e) => {
//     const newQuery = e.target.value;
//     setQuery(newQuery);
//     searchApi(newQuery);
//   };

//   // 🔹 Submit pencarian
//   const handleSubmit = (e) => {
//     e.preventDefault();
//     if (onSearchSubmit && query.length >= 2) {
//       onSearchSubmit(query);
//       setIsFocused(false);
//     }
//   };

//   // 🔹 Pilih menu dari hasil
//   const handleSelect = (menuId, menuName) => {
//     if (onMenuSelect) {
//       // Untuk SearchCard yang digunakan di ChefDashboard/GuestView,
//       // onMenuSelect hanya menerima menuId
//       onMenuSelect(menuId);
//       setQuery(menuName);
//       setSuggestions([]);
//       setIsFocused(false);
//     }
//   };

//   const currentLoading = isLoading || isSearching;
//   const dropdownTitle =
//     query.length < 2
//       ? "Ketik untuk mencari menu..."
//       : `Hasil Pencarian untuk "${query}"`;

//   // 🔹 Render UI
//   return (
//     <div className="bg-white rounded-3xl shadow-xl p-6 md:p-8 w-full">
//       <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-3">
//         <SearchIcon className="w-8 h-8 text-green-500" />
//         Cari Menu Anda
//       </h2>

//       <form onSubmit={handleSubmit} className="relative w-full">
//         <div className="relative">
//           <input
//             type="text"
//             value={query}
//             onChange={handleQueryChange}
//             onFocus={() => setIsFocused(true)}
//             onBlur={() => setTimeout(() => setIsFocused(false), 200)}
//             placeholder="Ketik nama menu (minimal 2 karakter)..."
//             className="w-full pl-12 pr-4 py-3 border-2 border-slate-300 rounded-xl focus:border-green-500 focus:ring-green-500 outline-none transition-shadow duration-150 shadow-sm"
//             disabled={currentLoading}
//           />

//           <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400">
//             <SearchIcon className="w-5 h-5" />
//           </div>

//           {currentLoading && (
//             <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
//               <svg
//                 className="animate-spin h-5 w-5 text-green-500"
//                 xmlns="http://www.w3.org/2000/svg"
//                 fill="none"
//                 viewBox="0 0 24 24"
//               >
//                 <circle
//                   className="opacity-25"
//                   cx="12"
//                   cy="12"
//                   r="10"
//                   stroke="currentColor"
//                   strokeWidth="4"
//                 ></circle>
//                 <path
//                   className="opacity-75"
//                   fill="currentColor"
//                   d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
//                 ></path>
//               </svg>
//             </div>
//           )}

//           {isFocused && suggestions.length > 0 && (
//             <ul className="absolute z-10 w-full bg-white rounded-2xl mt-2 shadow-xl border border-slate-100 overflow-hidden max-h-80 overflow-y-auto">
//               <li className="sticky top-0 bg-green-50 px-4 py-2 border-b border-slate-100 text-sm font-semibold text-slate-700 flex items-center gap-2">
//                 <ListIcon className="w-4 h-4 text-green-600" />
//                 {dropdownTitle}
//               </li>

//               {suggestions.map((menu) => (
//                 <li
//                   key={menu.id}
//                   onClick={() => handleSelect(menu.id, menu.nama)}
//                   className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 cursor-pointer transition-colors border-b border-slate-100 last:border-0"
//                 >
//                   <SearchIcon className="w-5 h-5 text-slate-400 flex-shrink-0" />
//                   <div className="flex flex-col flex-1">
//                     <span className="text-slate-700 font-semibold">
//                       {menu.nama}
//                     </span>
//                     {menu.preview_komposisi && (
//                       <span className="text-xs text-slate-500 mt-1 leading-relaxed">
//                         📋 {menu.preview_komposisi}
//                       </span>
//                     )}
//                     {!menu.preview_komposisi && (
//                       <span className="text-xs text-slate-400 mt-0.5 italic">
//                         Belum ada komposisi resep
//                       </span>
//                     )}
//                   </div>
//                 </li>
//               ))}
//             </ul>
//           )}

//           {isFocused &&
//             query.length >= 2 &&
//             !currentLoading &&
//             suggestions.length === 0 && (
//               <ul className="absolute z-10 w-full bg-white rounded-2xl mt-2 shadow-xl border border-slate-100 overflow-hidden">
//                 <li className="px-4 py-3 text-slate-500 text-sm text-center">
//                   Menu "{query}" tidak ditemukan. Coba kata kunci lain atau buat
//                   menu baru.
//                 </li>
//               </ul>
//             )}
//         </div>
//       </form>

//       {/* Info hint */}
//       <p className="mt-4 text-sm text-slate-500 text-center">
//         Tip: Ketik minimal 2 karakter untuk mulai mencari menu komposisi chef
//       </p>
//     </div>
//   );
// };

// export default SearchCard;

import { useState, useEffect, useMemo } from "react";
import { Search as SearchIcon, List as ListIcon, Sparkles } from "lucide-react";
import debounce from "lodash.debounce";

const API_URL = "http://localhost:5000/api";

const SearchCard = ({
  category,
  onMenuSelect,
  onSearchSubmit,
  onAiGenerate,
  isLoading,
  showAiFallback,
  lastSearchedQuery,
  searchType = "composition",
  filterCategory = "komposisi_chef",
}) => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isFocused, setIsFocused] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // Pencarian dengan debounce
  const searchApi = useMemo(
    () =>
      debounce(async (searchQuery) => {
        if (searchQuery.length < 2) {
          setSuggestions([]);
          return;
        }

        setIsSearching(true);
        try {
          const url = `${API_URL}/search?q=${encodeURIComponent(
            searchQuery
          )}&type=${searchType}`;
          console.log("🔍 Fetching:", url);

          const response = await fetch(url);

          if (!response.ok) {
            const text = await response.text();
            console.error("❌ Response Error:", response.status, text);
            throw new Error("Gagal memuat saran menu.");
          }

          let data = await response.json();

          // Filter berdasarkan kategori jika filterCategory ada
          if (filterCategory) {
            data = data.filter((menu) => menu.kategori === filterCategory);
          }

          console.log("✅ Hasil setelah filter:", data);
          setSuggestions(data);
        } catch (error) {
          console.error("Error fetching suggestions:", error);
          setSuggestions([]);
        } finally {
          setIsSearching(false);
        }
      }, 500),
    [searchType, filterCategory]
  );

  const handleQueryChange = (e) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    searchApi(newQuery);
  };

  // Submit pencarian
  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearchSubmit && query.length >= 2) {
      onSearchSubmit(query);
      setIsFocused(false);
    }
  };

  // Pilih menu dari hasil
  const handleSelect = (menuId, menuName) => {
    if (onMenuSelect) {
      onMenuSelect(menuId);
      setQuery(menuName);
      setSuggestions([]);
      setIsFocused(false);
    }
  };

  const currentLoading = isLoading || isSearching;
  const dropdownTitle =
    query.length < 2
      ? "Ketik untuk mencari menu..."
      : `Hasil Pencarian untuk "${query}"`;

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 w-full">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-orange-50 rounded-xl">
            <SearchIcon className="w-6 h-6 text-orange-500" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-800">Cari Paket</h2>
        </div>
        <p className="text-sm text-gray-500 ml-14">
          Temukan Paket komposisi chef dengan mudah
        </p>
      </div>

      {/* Search Form */}
      <form onSubmit={handleSubmit} className="relative w-full">
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={handleQueryChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 200)}
            placeholder="Ketik nama menu..."
            className="w-full pl-12 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none transition-all duration-200 text-gray-700 placeholder-gray-400"
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
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            </div>
          )}

          {/* Suggestions Dropdown */}
          {isFocused && suggestions.length > 0 && (
            <div className="absolute z-10 w-full bg-white rounded-xl mt-2 shadow-xl border border-gray-200 overflow-hidden max-h-96 overflow-y-auto">
              <div className="sticky top-0 bg-gradient-to-r from-orange-50 to-amber-50 px-4 py-3 border-b border-orange-100">
                <div className="flex items-center gap-2 text-sm font-medium text-orange-800">
                  <ListIcon className="w-4 h-4" />
                  {dropdownTitle}
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
                      {menu.preview_komposisi ? (
                        <span className="text-xs text-gray-500 mt-1.5 leading-relaxed line-clamp-2">
                          {menu.preview_komposisi}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400 mt-1 italic">
                          Belum ada komposisi resep
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* No Results */}
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
                    Menu tidak ditemukan
                  </p>
                  <p className="text-sm text-gray-500">
                    Coba kata kunci lain atau buat menu baru
                  </p>
                </div>
              </div>
            )}
        </div>
      </form>

      {/* Info hint */}
      <div className="mt-4 flex items-start gap-2 p-3 bg-orange-50 rounded-lg border border-orange-100">
        <Sparkles className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-orange-700 leading-relaxed">
          Ketik minimal 2 karakter untuk mulai mencari paket komposisi chef
        </p>
      </div>
    </div>
  );
};

export default SearchCard;
