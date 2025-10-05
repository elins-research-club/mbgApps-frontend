// /frontend/src/pages/index.js

import { useState, useEffect } from "react";
import { getMenus, generateNutrition } from "../services/api";
import NutritionLabel from "../components/NutritionLabel";
import {
  MenuIcon,
  PlateIcon,
  CarrotIcon,
  BreadIcon,
  AppleIcon,
} from "../components/Icons";

export default function Home() {
  const [menus, setMenus] = useState(null);
  // Ubah state dari 'nasi' menjadi 'karbo'
  const [selections, setSelections] = useState({
    karbo: "", // DIUBAH
    lauk: "",
    sayur: "",
    side_dish: "",
    buah: "",
  });
  const [nutritionResult, setNutritionResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMenus = async () => {
      const menuData = await getMenus();
      if (menuData) {
        setMenus(menuData);
      } else {
        setError(
          "Gagal terhubung ke server backend. Pastikan server backend sudah berjalan."
        );
      }
    };
    fetchMenus();
  }, []);

  const handleSelectionChange = (category, value) => {
    setSelections((prev) => ({ ...prev, [category]: value }));
  };

  const handleSubmit = async () => {
    if (Object.values(selections).some((val) => val === "")) {
      alert("Harap pilih semua kategori menu!");
      return;
    }
    setIsLoading(true);
    setNutritionResult(null);
    setError("");

    // Ubah payload agar sesuai dengan backend
    const payload = {
      karbo_id: selections.karbo, // DIUBAH
      lauk_id: selections.lauk,
      sayur_id: selections.sayur,
      side_dish_id: selections.side_dish,
      buah_id: selections.buah,
    };

    const result = await generateNutrition(payload);
    if (result) {
      setNutritionResult(result);
    } else {
      setError("Gagal mendapatkan hasil dari server.");
    }
    setIsLoading(false);
  };

  const categoryIcons = {
    karbo: <MenuIcon />, // DIUBAH
    lauk: <PlateIcon />,
    sayur: <CarrotIcon />,
    side_dish: <BreadIcon />,
    buah: <AppleIcon />,
  };

  // ... (sisa kode JSX di return() tidak perlu diubah)

  return (
    <div className="bg-slate-50 w-full min-h-screen">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-slate-800">
            Dashboard Kalkulator Gizi
          </h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="bg-white p-8 rounded-2xl shadow-lg">
            <h2 className="text-2xl font-bold text-slate-700">
              Pilih Komposisi Menu
            </h2>
            <p className="text-slate-500 mt-2">
              Pilih item dari setiap kategori untuk menghitung total gizinya.
            </p>
            <div className="space-y-6 mt-8">
              {menus ? (
                Object.keys(menus).map((category) => (
                  <div key={category}>
                    <label className="flex items-center text-lg font-semibold text-slate-600 capitalize">
                      {categoryIcons[category]}
                      <span className="ml-3">{category.replace("_", " ")}</span>
                    </label>
                    <select
                      className="w-full mt-2 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                      value={selections[category]}
                      onChange={(e) =>
                        handleSelectionChange(category, e.target.value)
                      }
                    >
                      <option value="">
                        -- Pilih {category.replace("_", " ")} --
                      </option>
                      {menus[category].map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.nama}
                        </option>
                      ))}
                    </select>
                  </div>
                ))
              ) : (
                <p className="text-center text-slate-500">Memuat menu...</p>
              )}
            </div>

            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="mt-10 w-full py-4 bg-blue-600 text-white font-bold text-lg rounded-lg shadow-lg hover:bg-blue-700 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed"
            >
              {isLoading ? "Menganalisis..." : "Generate Menu"}
            </button>
            {error && (
              <p className="mt-4 p-4 bg-red-100 text-red-700 border border-red-300 rounded-lg text-center">
                {error}
              </p>
            )}
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-lg">
            <h2 className="text-2xl font-bold text-slate-700">
              Informasi Nilai Gizi
            </h2>
            {nutritionResult ? (
              <>
                <p className="text-slate-500 mt-2">
                  Berikut adalah hasil kalkulasi gizi dari menu yang Anda pilih.
                </p>
                <NutritionLabel data={nutritionResult} />
                <button className="mt-6 w-full py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors">
                  Cetak Label Gizi
                </button>
              </>
            ) : (
              <div className="text-center mt-16 text-slate-400">
                <svg
                  className="mx-auto h-12 w-12 text-gray-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <p className="mt-4">
                  Hasil informasi nilai gizi akan ditampilkan di sini setelah
                  Anda menekan tombol "Generate Menu".
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
