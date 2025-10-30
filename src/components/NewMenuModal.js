// // /frontend/src/components/NewMenuModal.js
// // REVISI: Menggunakan kategori baru yang sesuai dengan database

// import { useState } from "react";
// import Image from "next/image";
// import { XCircleIcon, SaveIcon, CheckCircleIcon } from "./Icons";
// import MenuComponentSearch from "./MenuComponentSearch";

// // ✅ PERBAIKAN: Daftar kategori menu disesuaikan dengan database
// const categories = [
//   { key: "karbohidrat", label: "Karbohidrat", stateKey: "karbo_id" },
//   { key: "proteinHewani", label: "Protein Hewani", stateKey: "lauk_id" },
//   { key: "sayur", label: "Sayur", stateKey: "sayur_id" },
//   {
//     key: "proteinTambahan",
//     label: "Protein Tambahan",
//     stateKey: "side_dish_id",
//   },
//   { key: "buah", label: "Buah", stateKey: "buah_id" },
// ];

// /**
//  * Modal untuk membuat Menu Komposisi Chef baru
//  * (Menggunakan resep yang sudah ada)
//  */
// const NewMenuModal = ({ onClose, onSubmit, isLoading, error }) => {
//   const [namaMenu, setNamaMenu] = useState("");
//   // State sekarang menyimpan ID resep/menu yang dipilih
//   const [selectedMenus, setSelectedMenus] = useState({
//     karbo_id: null,
//     lauk_id: null,
//     sayur_id: null,
//     side_dish_id: null,
//     buah_id: null,
//   });

//   // Handler untuk menyimpan ID menu dari MenuComponentSearch
//   const handleMenuSelect = (categoryStateKey, menuId) => {
//     setSelectedMenus((prev) => ({
//       ...prev,
//       [categoryStateKey]: menuId,
//     }));
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();

//     // 1. Validasi Nama Menu
//     if (!namaMenu.trim()) {
//       alert("Nama Menu Kelompokan wajib diisi.");
//       return;
//     }

//     // 2. Validasi ID Menu yang Terpilih (PENTING untuk mengatasi Error Anda)
//     // Cek apakah ada ID menu yang valid (bukan null atau undefined)
//     const validMenuIds = Object.values(selectedMenus).filter(
//       (id) => id !== null && id !== 0
//     );

//     if (validMenuIds.length === 0) {
//       alert("Anda harus memilih minimal satu menu komponen.");
//       return;
//     }

//     // 3. Panggil onSubmit dari parent (ChefDashboard/lainnya)
//     // Asumsi parent memiliki logic untuk memanggil /api/menu/composition
//     onSubmit({
//       nama: namaMenu.trim(),
//       komposisi: selectedMenus, // Kirim seluruh objek selectedMenus
//     });
//   };

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
//       <div className="bg-white rounded-3xl p-6 shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
//         <div className="flex justify-between items-center border-b pb-3 mb-4 sticky top-0 bg-white">
//           <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
//             <Image
//               src="/input-icon.png"
//               alt="Icon Menu"
//               width={24}
//               height={24}
//             />
//             Simpan Menu Kelompokan Chef
//           </h2>
//           <button
//             onClick={onClose}
//             className="text-slate-400 hover:text-slate-800 transition"
//           >
//             <XCircleIcon className="w-6 h-6" />
//           </button>
//         </div>

//         <form onSubmit={handleSubmit} className="space-y-4">
//           {/* Input Nama Menu Baru */}
//           <div>
//             <label
//               htmlFor="namaMenu"
//               className="block text-sm font-medium text-slate-700 mb-1"
//             >
//               Nama Menu Kelompokan <span className="text-red-500">*</span>
//             </label>
//             <input
//               id="namaMenu"
//               type="text"
//               value={namaMenu}
//               onChange={(e) => setNamaMenu(e.target.value)}
//               placeholder="Contoh: Paket Sehat Senin"
//               className="w-full p-3 border border-slate-300 rounded-lg shadow-sm focus:border-green-500 focus:ring-green-500 transition"
//               required
//               disabled={isLoading}
//             />
//           </div>

//           {/* Input Komposisi (Menggunakan MenuComponentSearch) */}
//           <h3 className="text-lg font-semibold text-slate-700 pt-2 border-t mt-4">
//             Pilih Komponen Resep (Menu)
//           </h3>
//           {categories.map((cat) => (
//             <div key={cat.key}>
//               <label className="block text-sm font-medium text-slate-600 mb-1">
//                 {cat.label}
//               </label>
//               <MenuComponentSearch
//                 category={cat.key} // ✅ Kirim kategori baru (karbohidrat, proteinHewani, dll)
//                 onMenuSelect={handleMenuSelect}
//                 placeholder={`Cari resep ${cat.label}...`}
//                 disabled={isLoading}
//               />
//             </div>
//           ))}

//           {/* Tombol Save Menu Baru */}
//           <button
//             type="submit"
//             disabled={isLoading}
//             className="w-full py-3 bg-green-500 text-white font-bold text-lg rounded-lg shadow-md hover:bg-green-600 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
//           >
//             {isLoading ? (
//               <>
//                 <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
//                 Menyimpan Menu Komposisi...
//               </>
//             ) : (
//               <>
//                 <SaveIcon className="w-5 h-5" />
//                 Simpan Menu Komposisi Chef
//               </>
//             )}
//           </button>

//           {error && (
//             <p className="mt-4 p-3 bg-red-100 text-red-700 border border-red-300 rounded-lg text-center text-sm flex items-center justify-center gap-2">
//               <XCircleIcon className="w-5 h-5" /> {error}
//             </p>
//           )}
//         </form>
//       </div>
//     </div>
//   );
// };

// export default NewMenuModal;
import { useState } from "react";
import { X, Save, ChefHat, Sparkles } from "lucide-react";
import MenuComponentSearch from "./MenuComponentSearch";

// ✅ Kategori sesuai database
const categories = [
  {
    key: "karbohidrat",
    label: "Karbohidrat",
    stateKey: "karbo_id",
    emoji: "🍚",
  },
  {
    key: "proteinHewani",
    label: "Protein Hewani",
    stateKey: "lauk_id",
    emoji: "🍖",
  },
  { key: "sayur", label: "Sayur", stateKey: "sayur_id", emoji: "🥬" },
  {
    key: "proteinTambahan",
    label: "Protein Tambahan",
    stateKey: "side_dish_id",
    emoji: "🥚",
  },
  { key: "buah", label: "Buah", stateKey: "buah_id", emoji: "🍎" },
];

/**
 * Modal untuk membuat Menu Komposisi Chef (dengan tampilan oranye modern)
 */
const NewMenuModal = ({ onClose, onSubmit, isLoading, error }) => {
  const [namaMenu, setNamaMenu] = useState("");
  const [selectedMenus, setSelectedMenus] = useState({
    karbo_id: null,
    lauk_id: null,
    sayur_id: null,
    side_dish_id: null,
    buah_id: null,
  });

  const handleMenuSelect = (categoryStateKey, menuId) => {
    setSelectedMenus((prev) => ({
      ...prev,
      [categoryStateKey]: menuId,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!namaMenu.trim()) {
      alert("Nama Menu Kelompokan wajib diisi.");
      return;
    }

    const validMenuIds = Object.values(selectedMenus).filter(
      (id) => id !== null && id !== 0
    );

    if (validMenuIds.length === 0) {
      alert("Anda harus memilih minimal satu menu komponen.");
      return;
    }

    onSubmit({
      nama: namaMenu.trim(),
      komposisi: selectedMenus,
    });
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
                  Buat Menu Komposisi
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
            {/* Input Nama Menu */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <Sparkles className="w-4 h-4 text-orange-500" />
                Nama Menu Kelompokan
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={namaMenu}
                onChange={(e) => setNamaMenu(e.target.value)}
                placeholder="Contoh: Paket Sehat Senin"
                className="w-full px-4 py-3 bg-none border border-orange-200 rounded-xl
                         focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent
                         disabled:opacity-50 disabled:cursor-not-allowed transition-all text-slate-900"
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
                  Komponen Menu
                </span>
              </div>
            </div>

            {/* Grid Komponen */}
            <div className="grid gap-4">
              {categories.map((cat) => (
                <div
                  key={cat.key}
                  className="group relative bg-none rounded-xl p-5 border border-orange-200 
                           hover:border-orange-400 hover:shadow-md transition-all"
                >
                  <div className="flex items-start gap-4">
                    <div
                      className="flex-shrink-0 w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-2xl
                                  group-hover:scale-110 transition-transform"
                    >
                      {cat.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        {cat.label}
                      </label>
                      <MenuComponentSearch
                        category={cat.key}
                        stateKey={cat.stateKey}
                        onMenuSelect={handleMenuSelect}
                        placeholder={`Cari resep ${cat.label.toLowerCase()}...`}
                        disabled={isLoading}
                        selectedId={selectedMenus[cat.stateKey]}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

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
              className="flex-1 px-6 py-3 bg-white border border-orange-300 text-slate-700 font-semibold rounded-xl
                       hover:bg-orange-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-6 py-3 bg-orange-500 text-white font-semibold rounded-xl
                       hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed
                       transition-all shadow-lg shadow-orange-500/30 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Simpan Menu
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
