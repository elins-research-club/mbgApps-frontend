// // /frontend/src/components/AddRecipeModal.js

// import { useState } from "react";
// import {
//   checkIngredient,
//   generateIngredient,
//   saveRecipe,
// } from "../services/api";
// import { PlusIcon, TrashIcon } from "./Icons";

// // Ambil URL API dari env atau hardcode
// // const API_URL = "http://localhost:5000/api";
// const API_URL = process.env.NEXT_PUBLIC_API_URL;

// // Fungsi Debounce
// function debounce(func, timeout = 300) {
//   let timer;
//   return (...args) => {
//     clearTimeout(timer);
//     timer = setTimeout(() => {
//       func.apply(this, args);
//     }, timeout);
//   };
// }

// const AddRecipeModal = ({ onClose, onRecipeAdded }) => {
//   const [menuName, setMenuName] = useState("");
//   const [kategori, setKategori] = useState("Lauk");
//   const [ingredients, setIngredients] = useState([
//     { id: 1, name: "", gramasi: "", status: "idle" }, // <-- DIUBAH
//   ]);
//   const [isSaving, setIsSaving] = useState(false);
//   const [error, setError] = useState("");
//   const [suggestions, setSuggestions] = useState([]);
//   const [focusedIngredientId, setFocusedIngredientId] = useState(null);
//   const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);

//   // API call for fetching ingredient suggestions
//   const searchApi = async (searchQuery) => {
//     console.log("Searching for ingredient:", searchQuery);
//     if (searchQuery.length < 1) {
//       setSuggestions([]);
//       return;
//     }
//     try {
//       const response = await fetch(
//         `${API_URL}/ingredients/search?q=${encodeURIComponent(searchQuery)}`,
//         {
//           method: "GET",
//           headers: {
//             "Content-Type": "application/json",
//           },
//         }
//       );
//       if (!response.ok) {
//         console.error("Search API failed:", response.status);
//         setSuggestions([]);
//         return;
//       }
//       const data = await response.json();
//       console.log("Search results:", data);
//       setSuggestions(data.ingredients || []);
//     } catch (error) {
//       console.error("Search API error:", error);
//       setSuggestions([]);
//     }
//   };

//   const handleAddIngredient = () => {
//     setIngredients([
//       ...ingredients,
//       { id: Date.now(), name: "", gramasi: "", status: "idle" }, // <-- DIUBAH
//     ]);
//   };

//   const handleRemoveIngredient = (id) => {
//     setIngredients(ingredients.filter((item) => item.id !== id));
//   };

//   // --- HANDLER BARU ---
//   // Mengelola perubahan untuk nama dan gramasi
//   const handleIngredientDataChange = (id, field, value) => {
//     const newIngredients = ingredients.map((item) => {
//       if (item.id === id) {
//         // Jika mengubah nama, reset status pengecekan dan panggil searchApi
//         if (field === "name") {
//           searchApi(value);
//           setSelectedSuggestionIndex(-1);
//           return { ...item, name: value, status: "idle" };
//         }
//         // Jika mengubah gramasi, biarkan status apa adanya
//         return { ...item, [field]: value };
//       }
//       return item;
//     });
//     setIngredients(newIngredients);
//   };
//   // --- Akhir Handler Baru ---

//   const updateIngredientStatus = (id, status, message = "") => {
//     setIngredients((prev) =>
//       prev.map((item) => (item.id === id ? { ...item, status, message } : item))
//     );
//   };

//   const handleSelectSuggestion = (id, selectedName) => {
//     handleIngredientDataChange(id, "name", selectedName);
//     updateIngredientStatus(id, "found", "Bahan ditemukan di database");
//     setSuggestions([]);
//     setFocusedIngredientId(null);
//     setSelectedSuggestionIndex(-1);
//   };

//   const handleKeyDown = (e, id) => {
//     if (suggestions.length === 0) return;
//     if (e.key === "ArrowDown") {
//       e.preventDefault();
//       setSelectedSuggestionIndex((prev) =>
//         prev < suggestions.length - 1 ? prev + 1 : 0
//       );
//     } else if (e.key === "ArrowUp") {
//       e.preventDefault();
//       setSelectedSuggestionIndex((prev) =>
//         prev > 0 ? prev - 1 : suggestions.length - 1
//       );
//     } else if (e.key === "Enter" && selectedSuggestionIndex >= 0) {
//       e.preventDefault();
//       handleSelectSuggestion(id, suggestions[selectedSuggestionIndex].nama);
//     } else if (e.key === "Escape") {
//       setSuggestions([]);
//       setSelectedSuggestionIndex(-1);
//     }
//   };

//   // Cek ke DB saat input 'Bahan' di-blur (fokus hilang)
//   const handleIngredientBlur = async (id, name) => {
//     if (!name.trim()) return;

//     // Jika sudah "found" (dari autocomplete), jangan cek lagi
//     const currentItem = ingredients.find((item) => item.id === id);
//     if (currentItem && currentItem.status === "found") return;

//     updateIngredientStatus(id, "checking");
//     const res = await checkIngredient(name); // API call

//     if (res.found) {
//       updateIngredientStatus(id, "found", "Bahan ditemukan di database");
//     } else {
//       updateIngredientStatus(id, "not_found", "Bahan tidak ditemukan");
//     }
//   };

//   // Panggil AI untuk generate bahan yg 'not_found'
//   const handleGenerateClick = async (id, name) => {
//     updateIngredientStatus(id, "generating");
//     const res = await generateIngredient(name); // API call

//     if (res.success) {
//       updateIngredientStatus(id, "generated", "Sukses! Bahan akan divalidasi.");
//     } else {
//       updateIngredientStatus(id, "error", res.message || "Gagal generate.");
//     }
//   };

//   // Render status & tombol untuk setiap bahan
//   const renderIngredientStatus = (item) => {
//     switch (item.status) {
//       case "checking":
//         return <span className="text-xs text-blue-500">Mengecek...</span>;
//       case "found":
//         return <span className="text-xs text-green-600">✓ Ditemukan</span>;
//       case "not_found":
//         return (
//           <div className="flex items-center gap-2">
//             <span className="text-xs text-red-500">✗ Tidak ditemukan</span>
//             <button
//               type="button"
//               onClick={() => handleGenerateClick(item.id, item.name)}
//               className="px-2 py-0.5 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
//             >
//               Generate
//             </button>
//           </div>
//         );
//       case "generating":
//         return <span className="text-xs text-blue-500">Generating...</span>;
//       case "generated":
//         return <span className="text-xs text-purple-600">✓ Generated</span>;
//       case "error":
//         return (
//           <span className="text-xs text-red-600" title={item.message}>
//             Error!
//           </span>
//         );
//       default:
//         return null;
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (isSaving) return;

//     // --- VALIDASI BARU ---
//     if (!menuName.trim()) {
//       setError("Nama menu tidak boleh kosong.");
//       return;
//     }
//     const emptyGramasi = ingredients.find(
//       (item) => !item.gramasi.trim() || parseFloat(item.gramasi) <= 0
//     );
//     if (emptyGramasi) {
//       setError("Gramasi untuk semua bahan tidak boleh kosong.");
//       return;
//     }
//     const unreadyIngredients = ingredients.filter(
//       (item) =>
//         item.status !== "found" &&
//         item.status !== "generated" &&
//         item.name.trim() !== "" // Abaikan jika barisnya kosong
//     );
//     if (unreadyIngredients.length > 0) {
//       setError("Pastikan semua bahan 'Ditemukan' atau telah di-'Generate'.");
//       return;
//     }
//     // --- Akhir Validasi Baru ---

//     setIsSaving(true);
//     setError("");

//     // --- PAYLOAD BARU ---
//     const payload = {
//       menuName: menuName,
//       kategori: kategori, // <-- TAMBAHKAN BARIS INI
//       ingredients: ingredients.filter((item) => item.name.trim() !== ""),
//     };
//     // --- Akhir Payload Baru ---

//     const res = await saveRecipe(payload);

//     if (res.success) {
//       alert("Resep baru berhasil ditambahkan!");
//       if (onRecipeAdded) onRecipeAdded(); // Refresh data di page
//       onClose(); // Tutup modal
//     } else {
//       setError(res.message || "Gagal menyimpan resep baru.");
//     }
//     setIsSaving(false);
//   };

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
//       <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-8 m-4">
//         <form onSubmit={handleSubmit}>
//           <h2 className="text-2xl font-bold text-slate-800 mb-6">
//             Tambahkan Resep Baru
//           </h2>

//           <div className="space-y-4">
//             <div>
//               <label
//                 htmlFor="menu-name"
//                 className="text-sm font-semibold text-slate-600"
//               >
//                 Nama Menu
//               </label>
//               <input
//                 id="menu-name"
//                 type="text"
//                 value={menuName}
//                 onChange={(e) => setMenuName(e.target.value)}
//                 placeholder="Ketik nama menu..."
//                 className="w-full mt-1 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gray-500 outline-none transition"
//               />
//             </div>

//             {/* --- TAMBAHKAN BLOK DROPDOWN INI --- */}
//             <div className="mt-4">
//               <label
//                 htmlFor="kategori"
//                 className="block text-sm font-medium text-slate-700"
//               >
//                 Kategori Menu
//               </label>
//               <select
//                 id="kategori"
//                 value={kategori}
//                 onChange={(e) => setKategori(e.target.value)}
//                 className="mt-1 block w-full rounded-lg border-slate-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
//               >
//                 <option value="Lauk">Lauk</option>
//                 <option value="Sayur">Sayur</option>
//                 <option value="Karbo">Karbo</option>
//                 <option value="Protein Tambahan">Protein Tambahan</option>
//                 <option value="Buah">Buah</option>
//               </select>
//             </div>
//             {/* --- AKHIR BLOK BARU --- */}

//             <hr />

//             <label className="text-sm font-semibold text-slate-600">
//               Bahan-bahan
//             </label>
//             <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
//               {/* --- UI INPUT BAHAN DIUBAH --- */}
//               {ingredients.map((item, index) => (
//                 <div
//                   key={item.id}
//                   className="space-y-1 p-2 rounded-md bg-slate-50 border relative"
//                 >
//                   <div className="flex items-center gap-2">
//                     {/* Input Nama Bahan */}
//                     <input
//                       type="text"
//                       value={item.name}
//                       onChange={(e) =>
//                         handleIngredientDataChange(
//                           item.id,
//                           "name",
//                           e.target.value
//                         )
//                       }
//                       onKeyDown={(e) => handleKeyDown(e, item.id)}
//                       onFocus={() => setFocusedIngredientId(item.id)}
//                       onBlur={() => {
//                         setFocusedIngredientId(null);
//                         handleIngredientBlur(item.id, item.name);
//                       }}
//                       placeholder={`Bahan ${index + 1}`}
//                       className="flex-grow p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gray-500 outline-none transition"
//                       disabled={item.status === "checking"}
//                     />
//                     {/* Input Gramasi */}
//                     <input
//                       type="number"
//                       value={item.gramasi}
//                       onChange={(e) =>
//                         handleIngredientDataChange(
//                           item.id,
//                           "gramasi",
//                           e.target.value
//                         )
//                       }
//                       placeholder="Gram"
//                       className="w-20 p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gray-500 outline-none transition"
//                       min="0"
//                     />
//                     {/* Tombol Hapus */}
//                     {ingredients.length > 1 && (
//                       <button
//                         type="button"
//                         onClick={() => handleRemoveIngredient(item.id)}
//                         className="p-1 text-red-400 hover:text-red-600 flex-shrink-0"
//                       >
//                         <TrashIcon />
//                       </button>
//                     )}
//                   </div>
//                   {/* Suggestions Dropdown */}
//                   {focusedIngredientId === item.id &&
//                     suggestions.length > 0 && (
//                       <div className="absolute z-20 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-40 overflow-y-auto mt-1">
//                         {suggestions.map((suggestion, idx) => (
//                           <button
//                             key={idx}
//                             type="button"
//                             onMouseDown={() =>
//                               handleSelectSuggestion(item.id, suggestion.nama)
//                             }
//                             className={`w-full text-left px-3 py-2 ${
//                               selectedSuggestionIndex === idx
//                                 ? "bg-blue-100"
//                                 : "hover:bg-gray-100"
//                             }`}
//                           >
//                             {suggestion.nama}
//                           </button>
//                         ))}
//                       </div>
//                     )}
//                   {/* Status Pengecekan */}
//                   <div className="pl-1 h-4">{renderIngredientStatus(item)}</div>
//                 </div>
//               ))}
//               {/* --- Akhir Perubahan UI --- */}
//             </div>

//             <button
//               type="button"
//               onClick={handleAddIngredient}
//               className="w-full flex items-center justify-center gap-2 py-2 border-2 border-dashed border-slate-300 rounded-lg text-slate-500 hover:bg-slate-50 transition"
//             >
//               <PlusIcon />
//               Tambahkan Bahan
//             </button>
//           </div>

//           {error && (
//             <p className="mt-4 text-center text-sm text-red-600">{error}</p>
//           )}

//           <div className="flex items-center justify-end gap-4 mt-8">
//             <button
//               type="button"
//               onClick={onClose}
//               className="py-2 px-5 text-slate-600 font-medium rounded-lg hover:bg-slate-100 transition"
//             >
//               Batal
//             </button>
//             <button
//               type="submit"
//               disabled={isSaving}
//               className="py-2 px-5 bg-orange-400 text-white font-bold rounded-lg shadow-md hover:bg-orange-500 transition disabled:bg-slate-300"
//             >
//               {isSaving ? "Menyimpan..." : "Simpan Resep"}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default AddRecipeModal;

// /frontend/src/components/AddRecipeModal.js
// /frontend/src/components/AddRecipeModal.js

import { useState, useCallback, useRef, useEffect } from "react";
import {
  checkIngredient,
  generateIngredient,
  saveRecipe,
} from "../services/api";
import { PlusIcon, TrashIcon } from "./Icons";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

// Fungsi Debounce dengan proper cleanup
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
  const [kategori, setKategori] = useState("Karbohidrat");
  const [ingredients, setIngredients] = useState([
    { id: 1, name: "", gramasi: "", status: "idle", message: "" },
  ]);

  // Kategori sesuai dengan struktur database
  const categories = [
    { key: "karbohidrat", label: "Karbohidrat", stateKey: "karbo_id" },
    { key: "proteinHewani", label: "Protein Hewani", stateKey: "lauk_id" },
    { key: "sayur", label: "Sayur", stateKey: "sayur_id" },
    {
      key: "proteinTambahan",
      label: "Protein Tambahan",
      stateKey: "side_dish_id",
    },
    { key: "buah", label: "Buah", stateKey: "buah_id" },
  ];
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [focusedIngredientId, setFocusedIngredientId] = useState(null);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const [isSearching, setIsSearching] = useState(false);

  const searchAbortController = useRef(null);

  // Cleanup function untuk abort controller
  useEffect(() => {
    return () => {
      if (searchAbortController.current) {
        searchAbortController.current.abort();
      }
    };
  }, []);

  // API call untuk fetching ingredient suggestions dengan error handling
  const searchApi = async (searchQuery) => {
    if (!searchQuery || searchQuery.trim().length < 1) {
      setSuggestions([]);
      return;
    }

    // Abort previous request
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

  // Debounced search
  const debouncedSearch = useCallback(debounce(searchApi, 300), []);

  const handleAddIngredient = () => {
    const newId = Date.now();
    setIngredients([
      ...ingredients,
      { id: newId, name: "", gramasi: "", status: "idle", message: "" },
    ]);
  };

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

          // Hanya reset status jika user benar-benar mengubah nama
          const isNameChanged = trimmedValue !== item.name;

          if (isNameChanged) {
            debouncedSearch(trimmedValue);
            setSelectedSuggestionIndex(-1);

            // Reset ke idle hanya jika nama berubah
            return { ...item, name: trimmedValue, status: "idle", message: "" };
          }

          // Jika nama tidak berubah, jangan reset status
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

  const handleSelectSuggestion = (id, selectedName) => {
    setIngredients((prevIngredients) =>
      prevIngredients.map((item) =>
        item.id === id
          ? {
              ...item,
              name: selectedName,
              status: "found",
              message: "Bahan ditemukan di database",
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
          handleSelectSuggestion(id, suggestions[selectedSuggestionIndex].nama);
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

    // JANGAN cek ulang jika sudah ada status final
    if (
      currentItem?.status === "found" ||
      currentItem?.status === "generated" ||
      currentItem?.status === "checking" ||
      currentItem?.status === "generating"
    ) {
      console.log("⏭️ Skip checking - status:", currentItem.status);
      return;
    }

    console.log("🔍 Checking ingredient:", trimmedName);
    updateIngredientStatus(id, "checking", "");

    try {
      const res = await checkIngredient(trimmedName);
      console.log("📋 Check result:", res);

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

    updateIngredientStatus(id, "generating", "Memproses dengan AI...");

    try {
      console.log("🔄 Generating ingredient:", trimmedName);
      const res = await generateIngredient(trimmedName);

      console.log("📦 Generate response:", JSON.stringify(res, null, 2));

      // PERBAIKAN: Deteksi sukses yang lebih robust
      const isSuccess =
        res &&
        (res.success === true ||
          res.status === "success" ||
          res.saved === true ||
          res.ingredient_id ||
          res.id ||
          (res.message && res.message.toLowerCase().includes("saved")));

      if (isSuccess) {
        console.log("✅ Generate BERHASIL!");
        updateIngredientStatus(
          id,
          "generated",
          "Bahan berhasil ditambahkan dengan AI"
        );

        // Auto-refresh suggestion setelah 1 detik
        setTimeout(() => {
          console.log("🔄 Refreshing suggestions...");
          searchApi(trimmedName);
        }, 1000);
      } else if (
        res &&
        (res.error || res.message?.toLowerCase().includes("error"))
      ) {
        // Jika ada error message dari backend
        console.error("❌ Generate ERROR:", res.error || res.message);
        updateIngredientStatus(
          id,
          "error",
          res.error || res.message || "Gagal generate bahan"
        );
      } else {
        // Response tidak jelas - anggap gagal untuk keamanan
        console.warn("⚠️ Response ambiguous:", res);
        updateIngredientStatus(
          id,
          "error",
          "Response tidak jelas dari server. Coba lagi atau refresh halaman."
        );
      }
    } catch (error) {
      console.error("💥 EXCEPTION generating ingredient:", error);
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
        icon: "",
      },
      checking: {
        text: "Mengecek database...",
        className: "text-blue-600 font-medium",
        icon: "🔍",
        showSpinner: true,
      },
      found: {
        text: "Ditemukan di database",
        className: "text-green-600 font-semibold",
        icon: "✅",
      },
      not_found: {
        text: "Tidak ada di database",
        className: "text-amber-600 font-medium",
        icon: "⚠️",
        showButton: true,
      },
      generating: {
        text: "Generating dengan AI...",
        className: "text-blue-600 font-medium",
        icon: "🤖",
        showSpinner: true,
      },
      generated: {
        text: "Berhasil ditambahkan (AI)",
        className: "text-purple-600 font-semibold",
        icon: "✨",
      },
      error: {
        text: item.message || "Terjadi kesalahan",
        className: "text-red-600 font-medium",
        icon: "❌",
      },
    };

    const config = statusConfig[item.status];
    if (!config || item.status === "idle") return null;

    return (
      <div className="flex items-center gap-2 mt-1.5 min-h-[24px]">
        <div
          className={`text-xs ${config.className} flex items-center gap-1.5`}
        >
          {config.showSpinner ? (
            <svg
              className="animate-spin h-3.5 w-3.5"
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
          ) : (
            <span className="text-sm">{config.icon}</span>
          )}
          <span>{config.text}</span>
        </div>
        {config.showButton && (
          <button
            type="button"
            onClick={() => handleGenerateClick(item.id, item.name)}
            className="px-2.5 py-1 bg-gradient-to-r from-purple-500 to-purple-600 text-white text-xs font-medium rounded-md hover:from-purple-600 hover:to-purple-700 transition-all shadow-sm hover:shadow-md"
          >
            Generate dengan AI
          </button>
        )}
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
          gramasi: item.gramasi.trim(),
        })),
      };

      console.log("📤 Sending payload:", payload);
      const res = await saveRecipe(payload);
      console.log("📥 Save response:", res);

      if (res?.success) {
        if (onRecipeAdded) onRecipeAdded();
        onClose();
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

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && !isSaving) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={handleOverlayClick}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in duration-200">
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-8 py-6">
          <h2 className="text-2xl font-bold text-white">
            Tambahkan Resep Baru
          </h2>
          <p className="text-orange-50 text-sm mt-1">
            Lengkapi informasi resep dan bahan-bahan yang diperlukan
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="px-8 py-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="menu-name"
                  className="block text-sm font-semibold text-slate-700 mb-2"
                >
                  Nama Menu <span className="text-red-500">*</span>
                </label>
                <input
                  id="menu-name"
                  type="text"
                  value={menuName}
                  onChange={(e) => setMenuName(e.target.value)}
                  placeholder="Contoh: Nasi Goreng Spesial"
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition"
                />
              </div>

              <div>
                <label
                  htmlFor="kategori"
                  className="block text-sm font-semibold text-slate-700 mb-2"
                >
                  Kategori Menu <span className="text-red-500">*</span>
                </label>
                <select
                  id="kategori"
                  value={kategori}
                  onChange={(e) => setKategori(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition bg-white"
                >
                  <option value="Lauk">Lauk</option>
                  <option value="Sayur">Sayur</option>
                  <option value="Karbo">Karbo</option>
                  <option value="Protein Tambahan">Protein Tambahan</option>
                  <option value="Buah">Buah</option>
                </select>
              </div>
            </div>

            <div className="border-t border-slate-200"></div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="text-sm font-semibold text-slate-700">
                  Bahan-bahan <span className="text-red-500">*</span>
                </label>
                <span className="text-xs text-slate-500">
                  {ingredients.filter((i) => i.name.trim()).length} bahan
                </span>
              </div>

              <div className="space-y-3 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                {ingredients.map((item, index) => (
                  <div
                    key={item.id}
                    className="relative p-4 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-orange-500 text-white rounded-lg flex items-center justify-center font-semibold text-sm">
                        {index + 1}
                      </div>

                      <div className="flex-1 space-y-2">
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
                            // Trigger search saat focus jika ada nama
                            if (item.name.trim()) {
                              searchApi(item.name.trim());
                            }
                          }}
                          onBlur={() => {
                            setTimeout(() => {
                              setSuggestions([]); // Clear suggestions
                              setFocusedIngredientId(null);
                              handleIngredientBlur(item.id, item.name);
                            }, 300); // Increased delay untuk click suggestion
                          }}
                          placeholder={`Nama bahan ${index + 1}`}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition text-sm"
                          disabled={
                            item.status === "checking" ||
                            item.status === "generating"
                          }
                        />

                        {focusedIngredientId === item.id &&
                          suggestions.length > 0 && (
                            <div className="absolute z-30 left-14 right-14 bg-white border border-slate-300 rounded-lg shadow-xl max-h-48 overflow-y-auto mt-1">
                              {suggestions.map((suggestion, idx) => (
                                <button
                                  key={idx}
                                  type="button"
                                  onMouseDown={() =>
                                    handleSelectSuggestion(
                                      item.id,
                                      suggestion.nama
                                    )
                                  }
                                  className={`w-full text-left px-4 py-2.5 text-sm transition ${
                                    selectedSuggestionIndex === idx
                                      ? "bg-orange-50 text-orange-700"
                                      : "hover:bg-slate-50"
                                  }`}
                                >
                                  {suggestion.nama}
                                </button>
                              ))}
                            </div>
                          )}

                        <div className="flex items-center gap-2">
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
                            className="w-24 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition text-sm"
                            min="0"
                            step="0.01"
                          />
                          <span className="text-sm text-slate-600">gram</span>
                        </div>

                        {renderIngredientStatus(item)}
                      </div>

                      {ingredients.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveIngredient(item.id)}
                          className="flex-shrink-0 p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Hapus bahan"
                        >
                          <TrashIcon />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={handleAddIngredient}
                className="w-full mt-4 flex items-center justify-center gap-2 py-3 border-2 border-dashed border-slate-300 rounded-xl text-slate-600 hover:bg-slate-50 hover:border-slate-400 transition font-medium"
              >
                <PlusIcon />
                Tambahkan Bahan Baru
              </button>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-sm text-red-700 font-medium">{error}</p>
              </div>
            )}
          </div>

          <div className="px-8 py-6 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-6 py-2.5 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold rounded-xl shadow-lg hover:from-orange-600 hover:to-orange-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
                "Simpan Resep"
              )}
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
};

export default AddRecipeModal;
