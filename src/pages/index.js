// /frontend/src/pages/index.js

import { useState, useEffect } from "react";
import { getMenus, generateNutrition } from "../services/api";

// Impor semua komponen yang dibutuhkan
import NutritionLabel from "../components/NutritionLabel";
import AiAssistantCard from "../components/AiAssistantCard";
import MenuInputCard from "../components/MenuInputCard"; // <-- Impor komponen baru

export default function Home() {
  // Semua state tetap di sini karena ini adalah "otak" dari halaman
  const [menus, setMenus] = useState(null);
  const [selections, setSelections] = useState({
    karbo: "",
    lauk: "",
    sayur: "",
    side_dish: "",
    buah: "",
  });
  const [nutritionResult, setNutritionResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchMenus = async () => {
    const menuData = await getMenus();
    if (menuData) {
      setMenus(menuData);
    } else {
      setError("Gagal terhubung ke server backend.");
    }
  };

  useEffect(() => {
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
    const payload = {
      karbo_id: selections.karbo,
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

  return (
    <div className="bg-slate-50 w-full min-h-screen">
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="space-y-12">
          {/* Bagian Atas: 2 Card */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Card Kiri sekarang menjadi komponen */}
            <MenuInputCard
              menus={menus}
              selections={selections}
              handleSelectionChange={handleSelectionChange}
              handleSubmit={handleSubmit}
              isLoading={isLoading}
              error={error}
            />

            {/* Card Kanan: Output Gizi */}
            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <h2 className="text-2xl font-bold text-slate-700">
                Informasi Nilai Gizi
              </h2>
              {nutritionResult ? (
                <>
                  <p className="text-slate-500 mt-2">
                    Berikut adalah hasil kalkulasi gizi.
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
                  <p className="mt-4">Hasil akan ditampilkan di sini.</p>
                </div>
              )}
            </div>
          </div>

          {/* Bagian Bawah: 1 Card Full-Width */}
          <div>
            <AiAssistantCard onMenuAdded={fetchMenus} />
          </div>
        </div>
      </main>
    </div>
  );
}
