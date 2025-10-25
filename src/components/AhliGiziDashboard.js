// /frontend/src/components/AhliGiziDashboard.js

import { useState } from "react";
import AhliGiziNavbar from "./AhliGiziNavbar";
import Footer from "./Footer";
import ValidationModal from "./ValidationModal";
import { EditIcon } from "./Icons";

// --- DATA TIRUAN (MOCK DATA) ---
// Ganti ini dengan data asli dari API Anda
const mockValidationList = [
  {
    id: 1,
    nama: "Bahan 1 (AI Generated)",
    deskripsi: "Bahan ini merupakan bahan yang baru saja masuk ke database dari hasil generate AI",
    status: "belum tervalidasi",
    // Data gizi tiruan untuk diedit
    nutritionData: {
      takaran_saji_g: 100,
      informasi_nilai_gizi: {
        energi_kkal: 285.6,
        lemak_g: 1.36,
        protein_g: 6.72,
        karbohidrat_g: 61.68,
        serat_g: 0.16,
        natrium_mg: 21.6,
        kalium_mg: 56.8,
        kalsium_mg: 10,
        besi_mg: 1,
        vitamin_c_mg: 0,
      },
      persen_akg: {}, // AKG tidak penting untuk mode edit
    },
  },
  {
    id: 2,
    nama: "Bahan 2 (AI Generated)",
    deskripsi: "Bahan ini merupakan bahan yang baru saja masuk ke database dari hasil generate AI",
    status: "sudah tervalidasi",
    nutritionData: { /* ... data gizi ... */ },
  },
  {
    id: 3,
    nama: "Bahan 3 (AI Generated)",
    deskripsi: "Bahan ini merupakan bahan yang baru saja masuk ke database dari hasil generate AI",
    status: "sudah tervalidasi",
    nutritionData: { /* ... data gizi ... */ },
  },
];
// --- AKHIR DATA TIRUAN ---

export default function AhliGiziDashboard() {
  const [validationList, setValidationList] = useState(mockValidationList);
  const [selectedIngredient, setSelectedIngredient] = useState(null); // Untuk modal

  const handleEditClick = (ingredient) => {
    setSelectedIngredient(ingredient);
  };

  const handleCloseModal = () => {
    setSelectedIngredient(null);
  };

  // Fungsi tiruan untuk 'menyimpan' validasi
  const handleValidate = async (id, updatedData) => {
    console.log("Saving ID:", id, "with data:", updatedData);
    // Simulasi API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    // Perbarui daftar di UI
    setValidationList((prevList) =>
      prevList.map((item) =>
        item.id === id
          ? { ...item, status: "sudah tervalidasi", nutritionData: updatedData }
          : item
      )
    );
  };

  return (
    <div className="flex flex-col min-h-screen">
      <AhliGiziNavbar />

      {/* Modal Validasi */}
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
              Silahkan pilih bahan untuk memvalidasi data gizi...
            </p>

            {/* Daftar Bahan */}
            <div className="space-y-3">
              {validationList.map((item) => {
                const isTervalidasi = item.status === "sudah tervalidasi";
                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-4 bg-orange-50 border border-orange-200 rounded-lg"
                  >
                    <div>
                      <h3 className="font-bold text-slate-800">{item.nama}</h3>
                      <p className="text-sm text-slate-600">{item.deskripsi}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      {/* Status */}
                      <span
                        className={`px-3 py-1 text-xs font-bold rounded-full ${
                          isTervalidasi
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {item.status}
                      </span>
                      {/* Tombol Edit */}
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