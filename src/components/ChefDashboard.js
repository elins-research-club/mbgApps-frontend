// /frontend/src/components/ChefDashboard.js

import { useState, useRef } from "react";
import jsPDF from "jspdf";
import * as htmlToImage from "html-to-image";
import NextImage from "next/image";

import ChefNavbar from "./ChefNavbar";
import Footer from "./Footer";
import NutritionLabel from "./NutritionLabel";
import DetailResultCard from "./DetailResultCard";
import MenuInputCard from "./MenuInputCard"; // Menggunakan 5 input AutoComplete
import AddRecipeModal from "./AddRecipeModal";
import RecommendationCard from "./RecommendationCard";
import { generateNutrition } from "../services/api"; // API untuk komposisi

// --- Pastikan URL Backend Benar ---
// const API_URL = "http://localhost:5000/api";
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function ChefDashboard() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [totalLabel, setTotalLabel] = useState(null);
  const [detailBahan, setDetailBahan] = useState([]);
  const [calculationLog, setCalculationLog] = useState([]);
  const [recommendationData, setRecommendationData] = useState(null);
  const nutritionLabelRef = useRef(null);
  const [isPrinting, setIsPrinting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fungsi untuk membersihkan hasil sebelumnya
  const clearResults = () => {
    setError("");
    setTotalLabel(null);
    setDetailBahan([]);
    setCalculationLog([]);
    setRecommendationData(null);
  };

  // Fungsi cetak PDF (tidak berubah dari kode Anda)
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
        const imgWidth = img.width * 0.264583; // Konversi pixel ke mm
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

  // --- FUNGSI UTAMA UNTUK MENGHUBUNGKAN INPUT KE BACKEND ---
  const handleSubmitComposition = async (formData) => {
    setIsLoading(true);
    clearResults(); // Bersihkan hasil sebelumnya
    console.log("[ChefDashboard] Menerima data dari MenuInputCard:", formData);

    // Helper: Mencari ID menu dari backend berdasarkan nama
    const getMenuIdByName = async (name) => {
      if (!name || name.trim() === "") return null;
      try {
        console.log(`[ChefDashboard] Mencari ID untuk: "${name.trim()}"`);
        // Panggil API search backend
        const response = await fetch(
          `${API_URL}/search?q=${encodeURIComponent(name.trim())}`
        );
        if (!response.ok) {
          console.error(
            `[ChefDashboard] Search API error (${
              response.status
            }) untuk: "${name.trim()}"`
          );
          return null; // Gagal mencari, kembalikan null
        }
        const suggestions = await response.json();
        // Cari nama yang sama persis (abaikan besar kecil huruf)
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
          return null; // Tidak ada match persis
        }
        console.log(
          `[ChefDashboard] ID ditemukan untuk "${name.trim()}": ${
            exactMatch.id
          }`
        );
        return exactMatch.id; // Kembalikan ID jika ditemukan
      } catch (err) {
        console.error(
          `[ChefDashboard] Gagal fetch ID untuk "${name.trim()}":`,
          err
        );
        setError(
          `Gagal menghubungi server untuk mencari ID resep. Periksa koneksi backend.`
        );
        return null; // Gagal fetch, kembalikan null
      }
    };

    try {
      // 1. Konversi Semua Nama Resep ke ID Resep (secara paralel)
      const [karboId, laukId, sayurId, proteinTambahanId, buahId] =
        await Promise.all([
          getMenuIdByName(formData.karbohidrat), // Ambil nama dari formData
          getMenuIdByName(formData.proteinHewani), // Ambil nama dari formData
          getMenuIdByName(formData.sayur), // Ambil nama dari formData
          getMenuIdByName(formData.proteinTambahan), // Ambil nama dari formData
          getMenuIdByName(formData.buah), // Ambil nama dari formData
        ]);

      // Jika ada error saat fetch ID (setError sudah dipanggil di helper), hentikan proses
      if (
        error &&
        !karboId &&
        !laukId &&
        !sayurId &&
        !proteinTambahanId &&
        !buahId
      ) {
        setIsLoading(false);
        return; // Hentikan jika semua pencarian gagal karena error koneksi/server
      }

      // 2. Buat Payload untuk Dikirim ke Backend /generate
      const payload = {
        target: formData.target, // Sertakan target audiens
        karbo_id: karboId, // Kirim ID (atau null jika tidak ditemukan/kosong)
        lauk_id: laukId, // Kirim ID (atau null)
        sayur_id: sayurId, // Kirim ID (atau null)
        side_dish_id: proteinTambahanId, // Kirim ID (atau null) - **Pastikan nama field ini sama dengan di backend**
        buah_id: buahId, // Kirim ID (atau null)
      };

      // 3. Validasi: Pastikan setidaknya satu ID valid ditemukan
      const validIdsCount = [
        karboId,
        laukId,
        sayurId,
        proteinTambahanId,
        buahId,
      ].filter((id) => id !== null).length;
      if (validIdsCount === 0) {
        // Jika tidak ada ID valid sama sekali (semua input kosong atau nama tidak ditemukan)
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

      // 4. Panggil API Backend /generate menggunakan fungsi dari api.js
      // Fungsi generateNutrition di api.js sudah benar, hanya meneruskan payload
      const result = await generateNutrition(payload);

      // 5. Proses Hasil dari Backend
      if (!result) {
        // Jika generateNutrition mengembalikan null (karena fetch gagal/error)
        throw new Error(
          error ||
            "Gagal menghitung gizi. Respons backend kosong atau terjadi error."
        );
      }

      console.log("[ChefDashboard] Hasil kalkulasi diterima:", result);

      // 6. Update State Frontend untuk Menampilkan Hasil
      setTotalLabel(result.totalLabel || null); // Tampilkan label total
      // Pastikan nama properti ini sesuai dengan respons JSON dari backend Anda
      setDetailBahan(result.detailPerhitungan?.rincian_per_bahan || []);
      setCalculationLog(result.detailPerhitungan?.log || []);
      setRecommendationData(result.rekomendasi || null); // Tampilkan rekomendasi
    } catch (err) {
      // Tangani error yang terjadi selama proses submit
      console.error(
        "[ChefDashboard] Error dalam handleSubmitComposition:",
        err
      );
      setError(err.message || "Terjadi kesalahan saat memproses permintaan."); // Tampilkan pesan error
      // Kosongkan hasil jika terjadi error
      setTotalLabel(null);
      setDetailBahan([]);
      setCalculationLog([]);
      setRecommendationData(null);
    } finally {
      setIsLoading(false); // Selalu set loading ke false setelah selesai
    }
  };
  // --- AKHIR DARI FUNGSI UTAMA ---

  const hasResults = totalLabel !== null; // Cek apakah ada hasil kalkulasi

  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar Chef */}
      <ChefNavbar onAddRecipeClick={() => setIsModalOpen(true)} />

      {/* Modal Tambah Resep (jika dibuka) */}
      {isModalOpen && (
        <AddRecipeModal
          onClose={() => setIsModalOpen(false)}
          onRecipeAdded={() => {
            console.log(
              "Resep baru ditambahkan! (TODO: Mungkin perlu refresh menu?)"
            );
            setIsModalOpen(false); // Tutup modal setelah berhasil
          }}
        />
      )}

      {/* Konten Utama */}
      <main className="flex-grow bg-slate-50 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            {/* Kolom Kiri: Input Card */}
            <div className="lg:sticky lg:top-8">
              <MenuInputCard
                onSubmit={handleSubmitComposition} // Hubungkan ke fungsi submit
                isLoading={isLoading}
                // error prop di MenuInputCard bisa dihapus jika error ditampilkan di sini
              />
              {/* Tampilkan pesan error di bawah input card */}
              {error && (
                <p className="mt-4 p-4 bg-red-100 text-red-700 border border-red-300 rounded-lg text-center text-sm">
                  ⚠️ {error}
                </p>
              )}
            </div>

            {/* Kolom Kanan: Output Cards */}
            <div className="space-y-8">
              {/* 1. Total Label Gizi */}
              <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg w-full flex flex-col items-center">
                {/* ... (Header Label Gizi + Tombol Cetak - tidak berubah) ... */}
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
                      {" "}
                      Total Nilai Gizi{" "}
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
                {/* Tampilkan Label atau Pesan Default */}
                {hasResults ? (
                  <div ref={nutritionLabelRef} className="w-full max-w-md">
                    <NutritionLabel data={totalLabel} />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-72 text-center text-slate-400">
                    <svg
                      className="w-16 h-16 text-slate-300"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      {" "}
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />{" "}
                    </svg>
                    <p className="mt-2 text-lg font-medium">
                      {" "}
                      Hasil akan ditampilkan di sini.{" "}
                    </p>
                    <p className="text-sm">
                      {" "}
                      Silakan isi form di sebelah kiri dan klik &ldquo;Generate
                      Menu&rdquo;.{" "}
                    </p>
                  </div>
                )}
              </div>

              {/* 2. Rekomendasi (Hanya tampil jika ada hasil & rekomendasi) */}
              {hasResults && recommendationData && (
                <RecommendationCard data={recommendationData} />
              )}

              {/* 3. Rincian Gizi per Bahan & Log (Hanya tampil jika ada hasil) */}
              {hasResults &&
                (detailBahan.length > 0 || calculationLog.length > 0) && (
                  <DetailResultCard
                    log={calculationLog}
                    details={detailBahan}
                  />
                )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
