// /frontend/src/components/GuestView.js

import { useState, useRef } from "react";
import jsPDF from "jspdf";
import * as htmlToImage from "html-to-image";
import NextImage from "next/image";

import GuestNavbar from "./GuestNavbar";
import Footer from "./Footer";
import SearchCard from "./SearchCard"; // Komponen search baru
import NutritionLabel from "./NutritionLabel";
import DetailResultCard from "./DetailResultCard";

// const API_URL = "http://localhost:5000/api";
const API_URL = process.env.NEXT_PUBLIC_API_URL;

const GuestView = ({ onLoginClick }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [totalLabel, setTotalLabel] = useState(null);
  const [detailBahan, setDetailBahan] = useState([]);
  const [calculationLog, setCalculationLog] = useState([]);
  const [showAiFallback, setShowAiFallback] = useState(false);
  const [lastSearchedQuery, setLastSearchedQuery] = useState("");
  const nutritionLabelRef = useRef(null);
  const [isPrinting, setIsPrinting] = useState(false);

  const clearResults = () => {
    setError("");
    setTotalLabel(null);
    setDetailBahan([]);
    setCalculationLog([]);
    setShowAiFallback(false);
  };

  // Fungsi cetak PDF
  const handlePrintPDF = async () => {
    if (!nutritionLabelRef.current) return;
    setIsPrinting(true);
    // ... (Logika handlePrintPDF Anda dari index.js lama) ...
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
      setIsPrinting(false);
    }
  };

  // Fungsi dari SearchCard
  const handleMenuSelect = async (menuId) => {
    setIsLoading(true);
    clearResults();
    try {
      const response = await fetch(`${API_URL}/generate-by-id`, {
        // Perlu endpoint baru?
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ menu_id: menuId }),
      });
      if (!response.ok) throw new Error("Gagal menghitung gizi.");

      const result = await response.json();
      setTotalLabel(result.totalLabel);
      setDetailBahan(result.detailPerhitungan.rincian_per_bahan);
      setCalculationLog(result.detailPerhitungan.log);
    } catch (err) {
      setError(err.message);
    }
    setIsLoading(false);
  };

  // Fungsi dari SearchCard
  const handleSearchSubmit = async (query) => {
    setIsLoading(true);
    clearResults();
    setLastSearchedQuery(query);
    try {
      const response = await fetch(
        `${API_URL}/search?q=${encodeURIComponent(query)}`
      );
      const data = await response.json();
      const exactMatch = data.find(
        (m) => m.nama.toLowerCase() === query.toLowerCase()
      );

      if (exactMatch) {
        await handleMenuSelect(exactMatch.id);
      } else {
        setShowAiFallback(true);
      }
    } catch (err) {
      setError(err.message);
    }
    setIsLoading(false);
  };

  // (handleAiGenerate bisa ditambahkan di sini jika tamu boleh pakai AI)

  const hasResults = totalLabel !== null;

  return (
    <div className="flex flex-col min-h-screen">
      <GuestNavbar onLoginClick={onLoginClick} />

      <main className="flex-grow bg-slate-50 w-full">
        {!hasResults ? (
          // Tampilan Search (PNG 1)
          <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
            <div className="w-full max-w-2xl">
              <SearchCard
                onMenuSelect={handleMenuSelect}
                onSearchSubmit={handleSearchSubmit}
                onAiGenerate={() => {}} // Kosongkan jika tamu tidak bisa
                isLoading={isLoading}
                showAiFallback={showAiFallback}
                lastSearchedQuery={lastSearchedQuery}
              />
            </div>
          </div>
        ) : (
          // Tampilan Hasil (PNG 2)
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              {/* Kolom Kiri - Nutrition Label */}
              <div className="lg:sticky lg:top-8 flex flex-col items-center">
                <div className="bg-white p-8 rounded-2xl shadow-lg w-fit min-w-[320px] flex flex-col items-center">
                  <div className="flex items-center justify-between mb-6 w-full">
                    <div className="flex items-center gap-3">
                      <h2 className="text-2xl font-bold text-orange-500">
                        Label Gizi
                      </h2>
                    </div>
                    <button
                      onClick={handlePrintPDF}
                      disabled={isPrinting}
                      className="py-2 px-4 bg-[#202020]/10 text-[#202020]/80 text-sm font-semibold rounded-lg hover:bg-[#202020]/20 border border-[#202020]/20 transition-colors"
                    >
                      Cetak
                    </button>
                  </div>
                  <NutritionLabel ref={nutritionLabelRef} data={totalLabel} />
                </div>
              </div>

              {/* Kolom Kanan - Detail Bahan */}
              <DetailResultCard log={calculationLog} details={detailBahan} />
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default GuestView;
