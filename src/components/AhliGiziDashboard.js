// /frontend/src/components/AhliGiziDashboard.js

import { useState, useEffect } from "react"; // <-- DIUBAH
import AhliGiziNavbar from "./AhliGiziNavbar";
import Footer from "./Footer";
import ValidationModal from "./ValidationModal";
import { EditIcon } from "./Icons";
// --- BARU: Impor fungsi API ---
import {
  getNotValidatedIngredients,
  validateIngredient,
} from "../services/api";

// --- FUNGSI HELPER BARU ---
// Mengubah data 'Bahan' (flat) dari Prisma menjadi struktur
// 'nutritionData' (nested) yang diharapkan oleh Modal/UI Anda
const mapBahanToValidationItem = (bahan) => {
  // Ambil semua field nutrisi dari objek 'bahan'
  const {
    id,
    nama,
    isValidated,
    energi_kkal,
    protein_g,
    lemak_g,
    karbohidrat_g,
    serat_g,
    abu_g,
    kalsium_mg,
    fosfor_mg,
    besi_mg,
    natrium_mg,
    kalium_mg,
    tembaga_mg,
    seng_mg,
    retinol_mcg,
    b_kar_mcg,
    karoten_total_mcg,
    thiamin_mg,
    riboflavin_mg,
    niasin_mg,
    vitamin_c_mg,
  } = bahan;

  return {
    id: id,
    nama: nama,
    deskripsi:
      "Bahan ini merupakan bahan yang baru saja masuk ke database dari hasil generate AI",
    // Ubah boolean 'isValidated' menjadi string 'status'
    status: isValidated ? "sudah tervalidasi" : "belum tervalidasi",
    // Buat objek 'nutritionData' yang diharapkan oleh ValidationModal
    nutritionData: {
      takaran_saji_g: 100, // Model 'Bahan' tidak punya takaran, kita default ke 100g
      informasi_nilai_gizi: {
        // Masukkan semua nilai nutrisi ke sini
        energi_kkal,
        protein_g,
        lemak_g,
        karbohidrat_g,
        serat_g,
        abu_g,
        kalsium_mg,
        fosfor_mg,
        besi_mg,
        natrium_mg,
        kalium_mg,
        tembaga_mg,
        seng_mg,
        retinol_mcg,
        b_kar_mcg,
        karoten_total_mcg,
        thiamin_mg,
        riboflavin_mg,
        niasin_mg,
        vitamin_c_mg,
      },
      persen_akg: {}, // Tidak digunakan untuk mode edit
    },
  };
};

// --- KOMPONEN UTAMA ---
export default function AhliGiziDashboard() {
  const [validationList, setValidationList] = useState([]); // <-- DIUBAH (Awalnya kosong)
  const [isLoading, setIsLoading] = useState(true); // <-- BARU
  const [error, setError] = useState(null); // <-- BARU
  const [selectedIngredient, setSelectedIngredient] = useState(null);

  // --- BARU: Mengambil data dari API saat halaman dimuat ---
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const ingredientsFromApi = await getNotValidatedIngredients();
        // Backend (getNotValidatedIngredients) hanya mengirim yang 'isValidated: false'
        // Kita format datanya agar sesuai dengan UI
        const mappedList = ingredientsFromApi.map(mapBahanToValidationItem);
        setValidationList(mappedList);
      } catch (err) {
        setError(err.message || "Gagal memuat data validasi");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []); // [] berarti hanya dijalankan sekali saat komponen dimuat

  const handleEditClick = (ingredient) => {
    setSelectedIngredient(ingredient);
  };

  const handleCloseModal = () => {
    setSelectedIngredient(null);
  };

  // --- DIUBAH: Fungsi ini sekarang memanggil API sungguhan ---
  const handleValidate = async (id, updatedData) => {
    console.log("Memvalidasi ID:", id, "dengan data:", updatedData);

    // 1. Ambil data nutrisi (flat) dari 'updatedData' (nested)
    //    Backend kita mengharapkan objek nutrisi yang flat
    const flatNutritionData = updatedData.informasi_nilai_gizi;

    // 2. Panggil API untuk validasi
    //    Endpoint ini akan menyimpan gizi BARU dan set 'isValidated = true'
    const result = await validateIngredient(id, flatNutritionData);

    if (result.success) {
      // 3. Jika sukses, hapus item dari daftar 'perlu validasi' di UI
      setValidationList((prevList) =>
        prevList.filter((item) => item.id !== id)
      );
      handleCloseModal(); // Tutup modal
    } else {
      // Jika gagal, tampilkan error (idealnya di dalam modal)
      console.error("Gagal memvalidasi:", result.message);
      alert(`Error: ${result.message}`); // Tampilkan error sederhana
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <AhliGiziNavbar />

      {/* Modal Validasi (Tidak berubah) */}
      {selectedIngredient && (
        <ValidationModal
          ingredient={selectedIngredient}
          onClose={handleCloseModal}
          onValidate={handleValidate}
        />
      )}

      {/* Konten Utama Halaman */}
      <main className="flex-grow bg-slate-50 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-200">
            <h2 className="text-3xl font-bold text-orange-500 mb-2">
              Validasi Data Gizi
            </h2>
            <p className="text-slate-500 mb-8">
              Berikut adalah daftar bahan hasil generate AI yang membutuhkan
              validasi Anda.
            </p>

            {/* Daftar Bahan */}
            <div className="space-y-3">
              {/* --- BARU: Tampilkan status Loading / Error --- */}
              {isLoading && (
                <p className="text-slate-500 text-center py-4">
                  Memuat data...
                </p>
              )}
              {error && (
                <p className="text-red-500 text-center py-4">Error: {error}</p>
              )}
              {!isLoading && !error && validationList.length === 0 && (
                <p className="text-green-600 font-medium text-center py-4">
                  Semua bahan sudah tervalidasi. Kerja bagus!
                </p>
              )}
              {/* --- AKHIR BLOK BARU --- */}

              {!isLoading &&
                !error &&
                validationList.map((item) => {
                  // UI Anda sudah benar, tidak perlu diubah
                  // 'getNotValidatedIngredients' hanya akan mengirim item
                  // dengan status "belum tervalidasi"
                  const isTervalidasi = item.status === "sudah tervalidasi";

                  return (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-4 bg-orange-50 border border-orange-200 rounded-lg"
                    >
                      <div>
                        <h3 className="font-bold text-slate-800">
                          {item.nama}
                        </h3>
                        <p className="text-sm text-slate-600">
                          {item.deskripsi}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span
                          className={`px-3 py-1 text-xs font-bold rounded-full ${
                            isTervalidasi
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {item.status}
                        </span>
                        <button
                          onClick={() => handleEditClick(item)}
                          className="p-2 rounded-lg text-yellow-600 bg-yellow-100 hover:bg-yellow-200"
                        >
                          <EditIcon />
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
