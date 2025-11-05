// /frontend/src/components/ChefDashboard.js
// VERSI LENGKAP DENGAN PERBAIKAN - Includes Individual Recipe Search

import { useState, useRef } from "react";
import jsPDF from "jspdf";
import * as htmlToImage from "html-to-image";
import NextImage from "next/image";
import SearchCard from "./SearchCard";
import ChefNavbar from "./ChefNavbar";
import Footer from "./Footer";
import NutritionLabel from "./NutritionLabel";
import DetailResultCard from "./DetailResultCard";
import NewMenuModal from "./NewMenuModal";
import AddRecipeModal from "./AddRecipeModal";
import RecommendationCard from "./RecommendationCard";
import NutritionPerRecipeCard from "./NutritionPerRecipeCard";
import RecipeSearchCard from "./RecipeSearchCard";
import TargetSelector from "./TargetSelector";
import { LayoutList, UtensilsCrossed } from "lucide-react";
import {
  generateNutrition,
  getMenuNutritionById,
  saveNewMenuComposition,
} from "../services/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const targetOptions = [
  "TK A",
  "TK B",
  "SD Kelas 1",
  "SD Kelas 2",
  "SD Kelas 3",
  "SD Kelas 4",
  "SD Kelas 5",
  "SD Kelas 6",
  "SMP Kelas 1",
  "SMP Kelas 2",
  "SMP Kelas 3",
  "SMA Kelas 1",
  "SMA Kelas 2",
  "SMA Kelas 3",
];

const TARGET_ID_MAP = {
  "TK A": 1,
  "TK B": 2,
  "SD Kelas 1": 3,
  "SD Kelas 2": 4,
  "SD Kelas 3": 5,
  "SD Kelas 4": 6,
  "SD Kelas 5": 7,
  "SD Kelas 6": 8,
  "SMP Kelas 1": 9,
  "SMP Kelas 2": 10,
  "SMP Kelas 3": 11,
  "SMA Kelas 1": 12,
  "SMA Kelas 2": 13,
  "SMA Kelas 3": 14,
};

export default function ChefDashboard() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [totalLabel, setTotalLabel] = useState(null);
  const [detailBahan, setDetailBahan] = useState([]);
  const [calculationLog, setCalculationLog] = useState([]);
  const [recommendationData, setRecommendationData] = useState(null);
  const [detailPerResep, setDetailPerResep] = useState(null);
  const nutritionLabelRef = useRef(null);
  const [isPrinting, setIsPrinting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTarget, setSelectedTarget] = useState(targetOptions[0]);
  const [isAddRecipeModalOpen, setIsAddRecipeModalOpen] = useState(false);
  const [isNewMenuModalOpen, setIsNewMenuModalOpen] = useState(false);

  // ✅ STATE BARU untuk Individual Recipe Search
  const [isRecipeView, setIsRecipeView] = useState(false);
  const [selectedRecipeId, setSelectedRecipeId] = useState(null);

  // ✅ UPDATE: clearResults sekarang reset recipe mode juga
  const clearResults = () => {
    setError("");
    setTotalLabel(null);
    setDetailBahan([]);
    setCalculationLog([]);
    setRecommendationData(null);
    setDetailPerResep(null);
    setSelectedRecipeId(null);
    // NOTE: isRecipeView tidak di-reset di sini, biar toggle yang handle
  };

  const handlePrintPDF = async () => {
    if (!nutritionLabelRef.current) return;
    setIsPrinting(true);
    try {
      const node = nutritionLabelRef.current;
      const dataUrl = await htmlToImage.toPng(node, {
        quality: 1,
        pixelRatio: 2,
        backgroundColor: "#ffffff",
      });
      const img = new Image();
      img.src = dataUrl;
      img.onload = () => {
        const imgWidth = img.width * 0.264583;
        const imgHeight = img.height * 0.264583;
        const pdf = new jsPDF({
          orientation: imgHeight > imgWidth ? "portrait" : "landscape",
          unit: "mm",
          format: [imgWidth, imgHeight],
        });
        pdf.addImage(
          dataUrl,
          "PNG",
          0,
          0,
          imgWidth,
          imgHeight,
          undefined,
          "FAST"
        );
        pdf.save("Label-Gizi.pdf");
        setIsPrinting(false);
      };
    } catch (err) {
      console.error("Gagal membuat PDF:", err);
      setError("Gagal membuat PDF.");
      setIsPrinting(false);
    }
  };

  const handleSubmitComposition = async (formData) => {
    setIsLoading(true);
    clearResults();
    console.log("[ChefDashboard] Menerima data dari MenuInputCard:", formData);

    const getMenuIdByName = async (name) => {
      if (!name || name.trim() === "") return null;
      try {
        console.log(`[ChefDashboard] Mencari ID untuk: "${name.trim()}"`);
        const response = await fetch(
          `${API_URL}/search?q=${encodeURIComponent(name.trim())}`
        );
        if (!response.ok) {
          console.error(
            `[ChefDashboard] Search API error (${
              response.status
            }) untuk: "${name.trim()}"`
          );
          return null;
        }
        const suggestions = await response.json();
        const exactMatch = suggestions.find(
          (m) => m.nama.toLowerCase() === name.trim().toLowerCase()
        );
        if (!exactMatch) {
          console.warn(
            `[ChefDashboard] ID tidak ditemukan (tidak ada match persis) untuk: "${name.trim()}"`
          );
          setError(
            `Resep "${name.trim()}" tidak ditemukan persis di database. Harap pilih dari saran.`
          );
          return null;
        }
        console.log(
          `[ChefDashboard] ID ditemukan untuk "${name.trim()}": ${
            exactMatch.id
          }`
        );
        return exactMatch.id;
      } catch (err) {
        console.error(
          `[ChefDashboard] Gagal fetch ID untuk "${name.trim()}":`,
          err
        );
        setError(
          `Gagal menghubungi server untuk mencari ID resep. Periksa koneksi backend.`
        );
        return null;
      }
    };

    try {
      const [karboId, laukId, sayurId, proteinTambahanId, buahId] =
        await Promise.all([
          getMenuIdByName(formData.karbohidrat),
          getMenuIdByName(formData.proteinHewani),
          getMenuIdByName(formData.sayur),
          getMenuIdByName(formData.proteinTambahan),
          getMenuIdByName(formData.buah),
        ]);

      if (
        error &&
        !karboId &&
        !laukId &&
        !sayurId &&
        !proteinTambahanId &&
        !buahId
      ) {
        setIsLoading(false);
        return;
      }

      const payload = {
        target: formData.target,
        karbo_id: karboId,
        lauk_id: laukId,
        sayur_id: sayurId,
        side_dish_id: proteinTambahanId,
        buah_id: buahId,
      };

      const validIdsCount = [
        karboId,
        laukId,
        sayurId,
        proteinTambahanId,
        buahId,
      ].filter((id) => id !== null).length;
      if (validIdsCount === 0) {
        throw new Error(
          "Tidak ada resep valid yang dipilih atau ditemukan ID-nya. Pastikan nama resep diketik dengan benar dan dipilih dari saran."
        );
      }
      console.log(
        "[ChefDashboard] Payload siap dikirim ke /generate:",
        payload
      );

      console.log(
        "[ChefDashboard] Mengirim Payload ke Backend:",
        JSON.stringify(payload, null, 2)
      );

      const result = await generateNutrition(payload);

      if (!result) {
        throw new Error(
          error ||
            "Gagal menghitung gizi. Respons backend kosong atau terjadi error."
        );
      }

      console.log("[ChefDashboard] Hasil kalkulasi diterima:", result);

      setTotalLabel(result.totalLabel || null);
      setDetailBahan(result.detailPerhitungan?.rincian_per_bahan || []);
      setCalculationLog(result.detailPerhitungan?.log || []);
      setRecommendationData(result.rekomendasi || null);
      setDetailPerResep(result.detailPerResep || null);
    } catch (err) {
      console.error(
        "[ChefDashboard] Error dalam handleSubmitComposition:",
        err
      );
      setError(err.message || "Terjadi kesalahan saat memproses permintaan.");
      setTotalLabel(null);
      setDetailBahan([]);
      setCalculationLog([]);
      setRecommendationData(null);
      setDetailPerResep(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMenuSelect = async (menuId) => {
    setIsLoading(true);
    clearResults();
    setError("");

    try {
      const result = await getMenuNutritionById(menuId, targetId);

      if (!result || !result.totalLabel) {
        throw new Error("Gagal menghitung gizi atau respons tidak valid.");
      }

      console.log("📊 detailPerResep received:", result.detailPerResep); // ✅ TAMBAH LOG INI

      setTotalLabel(result.totalLabel);
      setDetailBahan(result.detailPerhitungan?.rincian_per_bahan || []);
      setCalculationLog(result.detailPerhitungan?.log || []);
      setRecommendationData(result.rekomendasi || null);
      setDetailPerResep(result.detailPerResep || null); // ✅ PASTIKAN INI ADA
    } catch (err) {
      console.error("[ChefDashboard] Error di handleMenuSelect:", err);
      setError(err.message || "Terjadi kesalahan saat mencari menu.");
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ FUNGSI BARU: Handle Individual Recipe Selection
  const handleRecipeSelect = async (recipeId) => {
    setIsLoading(true);
    clearResults();
    setError("");
    setIsRecipeView(true); // Set mode to single recipe

    try {
      console.log(`🔍 Fetching nutrition for recipe ID: ${recipeId}`);

      const API_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      const response = await fetch(`${API_URL}/recipes/${recipeId}/nutrition`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ API Error:", response.status, errorText);
        throw new Error(`Gagal mengambil data resep (${response.status})`);
      }

      const result = await response.json();
      console.log("📊 Recipe nutrition result:", result);

      if (!result || !result.totalLabel) {
        throw new Error("Data nutrisi tidak valid");
      }

      // Set data seperti biasa
      setTotalLabel(result.totalLabel);
      setDetailBahan(result.detailPerhitungan?.rincian_per_bahan || []);
      setCalculationLog([
        `Resep: ${result.menu?.nama || "Unknown"}`,
        `Kategori: ${result.menu?.kategori || "Unknown"}`,
        `Total bahan: ${result.detailPerhitungan?.jumlah_bahan || 0}`,
      ]);
      setSelectedRecipeId(recipeId);

      console.log("✅ Recipe data loaded successfully");
    } catch (err) {
      console.error("[ChefDashboard] Error di handleRecipeSelect:", err);
      setError(err.message || "Terjadi kesalahan saat mencari resep.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveNewMenu = async (formData) => {
    setIsLoading(true);
    setError("");

    try {
      console.log("[ChefDashboard] Menyimpan menu baru:", formData);

      const result = await saveNewMenuComposition(formData);

      if (result?.id) {
        alert(
          `Menu "${result.nama}" berhasil disimpan dengan ID: ${result.id}`
        );
        setIsNewMenuModalOpen(false);
        clearResults();
      } else {
        throw new Error(
          result?.message || "Gagal menyimpan menu baru. Respons tidak valid."
        );
      }
    } catch (err) {
      console.error("[ChefDashboard] Error saat menyimpan menu baru:", err);
      setError(err.message || "Terjadi kesalahan saat menyimpan menu.");
    } finally {
      setIsLoading(false);
    }
  };

  const hasResults = totalLabel !== null;
  const targetId = TARGET_ID_MAP[selectedTarget];

  return (
    <div className="flex flex-col min-h-screen">
      <ChefNavbar
        onAddRecipeClick={() => setIsAddRecipeModalOpen(true)}
        onNewMenuClick={() => setIsNewMenuModalOpen(true)}
      />

      {isAddRecipeModalOpen && (
        <AddRecipeModal
          onClose={() => setIsAddRecipeModalOpen(false)}
          onRecipeAdded={() => {
            alert("Resep baru dari bahan berhasil ditambahkan!");
            setIsAddRecipeModalOpen(false);
          }}
        />
      )}

      {isNewMenuModalOpen && (
        <NewMenuModal
          onClose={() => setIsNewMenuModalOpen(false)}
          onSubmit={handleSaveNewMenu}
          isLoading={isLoading}
          error={error}
          targetId={targetId}
        />
      )}

      <main className="flex-grow bg-slate-50 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* 🔹 ROW 1: Input (Kiri) & Total Gizi (Kanan) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start mb-8">
            {/* Kolom Kiri */}
            <div className="lg:sticky lg:top-8">
              {/* Target Audiens Selector */}
              <div className="mb-6">
                <TargetSelector
                  selectedTarget={selectedTarget}
                  onChange={(value) => setSelectedTarget(value)}
                />
              </div>

              {/* ✅ TOGGLE BUTTON BARU: Switch Mode */}
              <div className="bg-white p-4 rounded-2xl shadow-lg border border-slate-200 mb-6">
                <div className="flex gap-3">
                  {/* 🔸 Paket Menu Button */}
                  <button
                    type="button"
                    onClick={() => {
                      console.log("🔘 Clicking Paket Menu button");
                      clearResults();
                      setIsRecipeView(false);
                    }}
                    className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-200 border ${
                      !isRecipeView
                        ? "bg-orange-400 text-white border-orange-400 shadow-md"
                        : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <LayoutList
                        className={`w-5 h-5 ${
                          !isRecipeView ? "text-white" : "text-orange-400"
                        }`}
                      />
                      <span>Cari Paketan Menu</span>
                    </div>
                    {!isRecipeView && (
                      <p className="text-xs mt-1 opacity-90 font-normal">
                        Hitung gizi dari kombinasi resep
                      </p>
                    )}
                  </button>

                  {/* 🔹 Resep Individual Button */}
                  <button
                    type="button"
                    onClick={() => {
                      console.log("🔘 Clicking Resep Individual button");
                      clearResults();
                      setIsRecipeView(true);
                    }}
                    className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-200 border ${
                      isRecipeView
                        ? "bg-orange-400 text-white border-orange-400 shadow-md"
                        : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <UtensilsCrossed
                        className={`w-5 h-5 ${
                          isRecipeView ? "text-white" : "text-orange-400"
                        }`}
                      />
                      <span>Resep Individual</span>
                    </div>
                    {isRecipeView && (
                      <p className="text-xs mt-1 opacity-90 font-normal">
                        Lihat gizi satu resep saja
                      </p>
                    )}
                  </button>
                </div>
              </div>

              {/* ✅ CONDITIONAL RENDERING: SearchCard atau RecipeSearchCard */}
              {isRecipeView ? (
                <RecipeSearchCard
                  onRecipeSelect={handleRecipeSelect}
                  isLoading={isLoading}
                />
              ) : (
                <SearchCard
                  onMenuSelect={handleMenuSelect}
                  isLoading={isLoading}
                />
              )}

              {error && (
                <p className="mt-4 p-4 bg-red-100 text-red-700 border border-red-300 rounded-lg text-center text-sm">
                  ⚠️ {error}
                </p>
              )}
            </div>

            {/* Kolom Kanan - Label Gizi */}
            <div>
              <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg w-full flex flex-col items-center">
                <div className="flex items-center justify-between mb-6 w-full gap-4">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <NextImage
                      src="/pdf-icon.png"
                      alt="PDF Icon"
                      width={20}
                      height={20}
                      className="w-5 h-5 flex-shrink-0"
                      style={{ objectFit: "contain" }}
                    />
                    <h2 className="text-xl sm:text-2xl font-bold text-orange-500 whitespace-nowrap">
                      Total Nilai Gizi
                    </h2>
                  </div>
                  <button
                    onClick={handlePrintPDF}
                    disabled={isPrinting || !hasResults}
                    className="py-2 px-3 sm:px-4 bg-[#202020]/10 text-[#202020]/80 text-xs sm:text-sm font-semibold rounded-lg hover:bg-[#202020]/20 border border-[#202020]/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                  >
                    {isPrinting ? "Mencetak..." : "Cetak PDF"}
                  </button>
                </div>

                {hasResults ? (
                  <div className="w-full max-w-md">
                    {/* ✅ INFO BADGE untuk Recipe Mode */}
                    {isRecipeView && (
                      <div className="mb-3 p-2 bg-purple-50 border border-purple-200 rounded-lg">
                        <p className="text-xs text-purple-700 font-medium text-center">
                          🍳 Mode Resep Individual
                        </p>
                      </div>
                    )}

                    <div ref={nutritionLabelRef}>
                      <NutritionLabel data={totalLabel} />
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-72 text-center text-slate-400">
                    <svg
                      className="w-16 h-16 text-slate-300"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <p className="mt-2 text-lg font-medium">
                      Hasil akan ditampilkan di sini.
                    </p>
                    <p className="text-sm">
                      Silakan pilih {isRecipeView ? "resep" : "menu"} di sebelah
                      kiri.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 🔹 ROW 2: Rekomendasi (Full Width) */}
          {/* ✅ HANYA TAMPIL jika BUKAN Recipe Mode */}
          {hasResults && recommendationData && !isRecipeView && (
            <div className="bg-none p-0 mb-8">
              {/* <h2 className="text-2xl font-bold text-orange-500 mb-4">
                Rekomendasi Menu Tambahan
              </h2> */}
              <RecommendationCard data={recommendationData} />
            </div>
          )}

          {/* 🔹 ROW 3: Nutrisi per Menu & per Bahan */}
          {hasResults && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Nutrition Per Recipe - Hanya tampil jika BUKAN Recipe Mode */}
              {detailPerResep && detailPerResep.length > 0 && !isRecipeView && (
                <NutritionPerRecipeCard data={detailPerResep} />
              )}

              {/* Detail Bahan - Selalu tampil */}
              {(detailBahan.length > 0 || calculationLog.length > 0) && (
                <DetailResultCard
                  log={calculationLog}
                  details={detailBahan}
                  detailPerResep={detailPerResep}
                  // groupedData={groupedData}
                />
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
