import { useState, useRef } from "react";
import jsPDF from "jspdf";
import * as htmlToImage from "html-to-image";
import NextImage from "next/image";
import SearchCard from "../components/SearchCard";
import NutritionLabel from "../components/NutritionLabel";
import DetailResultCard from "../components/DetailResultCard";

// --- TENTUKAN ALAMAT BACKEND DI SINI ---
const API_URL = "http://localhost:5000/api";

export default function Home() {
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

  // --- Fungsi cetak PDF ---
  const handlePrintPDF = async () => {
    if (!nutritionLabelRef.current) {
      alert("Label gizi belum tersedia untuk dicetak!");
      return;
    }

    setIsPrinting(true);
    try {
      const node = nutritionLabelRef.current;
      const originalWidth = node.style.width;
      node.style.width = "100%";
      const dataUrl = await htmlToImage.toPng(node, {
        quality: 1,
        pixelRatio: 2,
        backgroundColor: "#ffffff",
      });

      node.style.width = originalWidth;

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
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();

        pdf.addImage(
          dataUrl,
          "PNG",
          0,
          0,
          pageWidth,
          pageHeight,
          undefined,
          "FAST"
        );

        pdf.save("Label-Gizi-Full.pdf");
        setIsPrinting(false);
      };

      img.onerror = () => {
        throw new Error("Gagal memuat gambar untuk PDF");
      };
    } catch (err) {
      console.error("Gagal membuat PDF:", err);
      alert("Terjadi kesalahan saat membuat PDF. Silakan coba lagi.");
      setIsPrinting(false);
    }
  };

  // --- Fungsi existing kamu tetap ---
  const handleMenuSelect = async (menuId) => {
    setIsLoading(true);
    clearResults();
    try {
      const response = await fetch(`${API_URL}/generate`, {
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
        setCalculationLog([
          `Menu "${query}" ditemukan di database. Memulai kalkulasi...`,
        ]);
        await handleMenuSelect(exactMatch.id);
      } else {
        setCalculationLog([
          `Menu "${query}" tidak ditemukan di database lokal.`,
        ]);
        setShowAiFallback(true);
      }
    } catch (err) {
      setError(err.message);
    }
    setIsLoading(false);
  };

  const handleAiGenerate = async (menuName, onLog, onComplete) => {
    setIsLoading(true);
    clearResults();
    setLastSearchedQuery(menuName);

    try {
      const response = await fetch(`${API_URL}/suggest-menu-stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ new_menu_name: menuName }),
      });

      if (!response.ok) throw new Error("Gagal memulai streaming dari server.");

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split("\n\n");
        buffer = parts.pop();

        for (const part of parts) {
          if (part.startsWith("data: ")) {
            const jsonStr = part.replace("data: ", "").trim();
            if (!jsonStr) continue;

            try {
              const parsed = JSON.parse(jsonStr);
              if (parsed.type === "complete" && parsed.data) {
                await handleMenuSelect(parsed.data.id);
                if (onComplete) onComplete();
              } else {
                if (onLog) onLog(parsed);
              }
            } catch (e) {
              console.warn("Gagal parsing SSE:", e);
            }
          }
        }
      }
    } catch (err) {
      setError(err.message);
      if (onLog)
        onLog({
          type: "error",
          message: `Terjadi kesalahan: ${err.message}`,
        });
    } finally {
      if (onComplete) onComplete();
      setIsLoading(false);
    }
  };

  const hasResults = totalLabel !== null;

  return (
    <div className="bg-slate-50 w-full min-h-[calc(100vh-128px)]">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {!hasResults ? (
          <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
            <div className="w-full max-w-2xl">
              <SearchCard
                onMenuSelect={handleMenuSelect}
                onSearchSubmit={handleSearchSubmit}
                onAiGenerate={handleAiGenerate}
                isLoading={isLoading}
                showAiFallback={showAiFallback}
                lastSearchedQuery={lastSearchedQuery}
              />
            </div>
          </div>
        ) : (
          <div className="py-8 space-y-8">
            <div className="max-w-3xl mx-auto">
              <SearchCard
                onMenuSelect={handleMenuSelect}
                onSearchSubmit={handleSearchSubmit}
                onAiGenerate={handleAiGenerate}
                isLoading={isLoading}
                showAiFallback={showAiFallback}
                lastSearchedQuery={lastSearchedQuery}
              />
            </div>

            {/* Result Area */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Kolom Kiri - Nutrition Label */}
              <div className="lg:sticky lg:top-8 lg:self-start flex flex-col items-center">
                <div className="bg-white p-8 rounded-2xl shadow-lg w-fit min-w-[320px] flex flex-col items-center">
                  {/* Header Card */}
                  <div className="flex items-center justify-between mb-6 w-full">
                    <div className="flex items-center gap-3">
                      <NextImage
                        src="/pdf-icon.png"
                        alt="Cetak Label"
                        width={20}
                        height={20}
                        className="w-5 h-5"
                        style={{ objectFit: "contain" }}
                      />
                      <h2 className="text-2xl font-bold text-orange-500">
                        Label Gizi
                      </h2>
                    </div>

                    <button
                      onClick={handlePrintPDF}
                      disabled={isPrinting}
                      className="py-2 px-4 bg-[#202020]/10 text-[#202020]/80 text-sm font-semibold rounded-lg hover:bg-[#202020]/20 border border-[#202020]/20 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
                    >
                      {isPrinting ? (
                        <>
                          <svg
                            className="animate-spin h-4 w-4 text-[#202020]/80"
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
                          Membuat...
                        </>
                      ) : (
                        <>
                          <NextImage
                            src="/download-icon.png"
                            alt="Cetak"
                            width={16}
                            height={16}
                            className="w-4 h-4"
                            style={{ objectFit: "contain" }}
                          />
                          Cetak
                        </>
                      )}
                    </button>
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 flex items-start gap-3">
                      <svg
                        className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <p className="text-red-700 text-sm">{error}</p>
                    </div>
                  )}

                  <NutritionLabel ref={nutritionLabelRef} data={totalLabel} />
                </div>
              </div>

              {/* Kolom Kanan - Detail Bahan */}
              {(detailBahan.length > 0 || calculationLog.length > 0) && (
                <DetailResultCard log={calculationLog} details={detailBahan} />
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
