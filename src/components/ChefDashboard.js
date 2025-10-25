// /frontend/src/components/ChefDashboard.js

import { useState, useRef } from "react";
import jsPDF from "jspdf";
import * as htmlToImage from "html-to-image";
import NextImage from "next/image";

import ChefNavbar from "./ChefNavbar"; // Navbar untuk user login
import Footer from "./Footer";
import NutritionLabel from "./NutritionLabel";
import DetailResultCard from "./DetailResultCard";
import MenuInputCard from "./MenuInputCard";
import AddRecipeModal from "./AddRecipeModal";
import RecommendationCard from "./RecommendationCard";
import { generateNutrition } from "../services/api"; // API untuk komposisi

export default function DashboardView() {
  // --- INI ADALAH SEMUA STATE DARI index.js LAMA ANDA ---
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [totalLabel, setTotalLabel] = useState(null);
  const [detailBahan, setDetailBahan] = useState([]);
  const [calculationLog, setCalculationLog] = useState([]);
  const [recommendationData, setRecommendationData] = useState(null);
  const nutritionLabelRef = useRef(null);
  const [isPrinting, setIsPrinting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal untuk "Tambah Resep"

  // --- INI ADALAH SEMUA FUNGSI DARI index.js LAMA ANDA ---
  
  const clearResults = () => {
    setError("");
    setTotalLabel(null);
    setDetailBahan([]);
    setCalculationLog([]);
    setRecommendationData(null);
  };

  const handlePrintPDF = async () => {
    if (!nutritionLabelRef.current) return;
    setIsPrinting(true);
    // ... (Logika handlePrintPDF Anda) ...
     try {
      const node = nutritionLabelRef.current;
      const dataUrl = await htmlToImage.toPng(node, {
        quality: 1, pixelRatio: 2, backgroundColor: "#ffffff",
      });
      const img = new Image();
      img.src = dataUrl;
      img.onload = () => {
        const imgWidth = img.width * 0.264583;
        const imgHeight = img.height * 0.264583;
        const pdf = new jsPDF({
          orientation: imgHeight > imgWidth ? "portrait" : "landscape",
          unit: "mm", format: [imgWidth, imgHeight],
        });
        pdf.addImage(dataUrl, "PNG", 0, 0, imgWidth, imgHeight, undefined, "FAST");
        pdf.save("Label-Gizi.pdf");
        setIsPrinting(false);
      };
    } catch (err) {
      console.error("Gagal membuat PDF:", err);
      setIsPrinting(false);
    }
  };

  const handleSubmitComposition = async (formData) => {
    setIsLoading(true);
    clearResults();
    try {
      const result = await generateNutrition(formData); // API untuk komposisi
      if (!result) throw new Error("Gagal menghitung gizi.");

      setTotalLabel(result.totalLabel);
      setDetailBahan(result.detailPerhitungan.rincian_per_bahan);
      setCalculationLog(result.detailPerhitungan.log);
      setRecommendationData(result.rekomendasi || null);
    } catch (err) {
      setError(err.message);
    }
    setIsLoading(false);
  };

  const hasResults = totalLabel !== null;

  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar Chef, menerima prop untuk modal "Tambah Resep" */}
      <ChefNavbar onAddRecipeClick={() => setIsModalOpen(true)} />

      {/* Modal Tambah Resep */}
      {isModalOpen && (
        <AddRecipeModal
          onClose={() => setIsModalOpen(false)}
          onRecipeAdded={() => {
            console.log("Resep baru ditambahkan!");
          }}
        />
      )}

      {/* Konten Utama Halaman (Layout Komposisi Anda) */}
      <main className="flex-grow bg-slate-50 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            {/* --- Kolom Kiri - Input --- */}
            <div className="lg:sticky lg:top-8">
              <MenuInputCard
                onSubmit={handleSubmitComposition}
                isLoading={isLoading}
                error={error}
              />
            </div>
            {/* --- Kolom Kanan - Hasil --- */}
            <div className="space-y-8">
              {/* 1. Label Gizi */}
              <div className="bg-white p-8 rounded-2xl shadow-lg w-full flex flex-col items-center">
                 <div className="flex items-center justify-between mb-6 w-full">
                  <div className="flex items-center gap-3">
                    <NextImage
                      src="/pdf-icon.png"
                      alt="Label Gizi"
                      width={20}
                      height={20}
                      className="w-5 h-5"
                      style={{ objectFit: "contain" }}
                    />
                    <h2 className="text-2xl font-bold text-orange-500">
                      Informasi Nilai Gizi per Resep
                    </h2>
                  </div>
                  <button
                    onClick={handlePrintPDF}
                    disabled={isPrinting || !hasResults}
                    className="py-2 px-4 bg-[#202020]/10 text-[#202020]/80 text-sm font-semibold rounded-lg hover:bg-[#202020]/20 border border-[#202020]/20 transition-colors"
                  >
                    Cetak
                  </button>
                </div>
                {hasResults ? (
                  <NutritionLabel ref={nutritionLabelRef} data={totalLabel} />
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
                      Silakan isi form di sebelah kiri dan klik &ldquo;Generate
                      Menu&rdquo;.
                    </p>
                  </div>
                )}
              </div>
              
              {/* 2. Rekomendasi */}
              <RecommendationCard data={recommendationData} />

              {/* 3. Rincian Gizi per Bahan & Log */}
              {(detailBahan.length > 0 || calculationLog.length > 0) && (
                <DetailResultCard log={calculationLog} details={detailBahan} />
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}