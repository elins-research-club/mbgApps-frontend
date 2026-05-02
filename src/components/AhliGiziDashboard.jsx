// /frontend/src/components/AhliGiziDashboard.js

import { useState, useEffect } from "react"; // <-- DIUBAH
import MainNavbar from "./MainNavbar";
import Footer from "./Footer";
import ValidationModal from "./ValidationModal";
import { EditIcon } from "./Icons";
// --- BARU: Impor fungsi API ---
import {
  getAllIngredients,
  createIngredient,
  updateIngredient,
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
import { useRouter } from "next/router";
export default function AhliGiziDashboard() {
  const [validationList, setValidationList] = useState([]); // <-- DIUBAH (Awalnya kosong)
  const [isLoading, setIsLoading] = useState(true); // <-- BARU
  const [error, setError] = useState(null); // <-- BARU
  const [selectedIngredient, setSelectedIngredient] = useState(null);

  // --- BARU: Mengambil data dari API saat halaman dimuat ---
  const router = useRouter();

  // derive orgId from query (support id or orgId param)
  const routeOrgId = Array.isArray(router.query?.id)
    ? router.query.id[0]
    : router.query?.id || router.query?.orgId;

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const context = routeOrgId ? { orgId: routeOrgId } : {};
        const ingredientsFromApi = await getAllIngredients(context);
        const mappedList = ingredientsFromApi.map(mapBahanToValidationItem);
        setValidationList(mappedList);
      } catch (err) {
        setError(err.message || "Gagal memuat data bahan");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [routeOrgId]); // refetch when orgId changes

  const handleEditClick = (ingredient) => {
    setSelectedIngredient(ingredient);
  };

  const handleCloseModal = () => {
    setSelectedIngredient(null);
  };

  // --- DIUBAH: Fungsi ini sekarang memanggil API sungguhan ---
  // const handleValidate = async (id, updatedData) => {
  //   console.log("Memvalidasi ID:", id, "dengan data:", updatedData);

  //   // 1. Ambil data nutrisi (flat) dari 'updatedData' (nested)
  //   //    Backend kita mengharapkan objek nutrisi yang flat
  //   const flatNutritionData = updatedData.informasi_nilai_gizi;

  //   // 2. Panggil API untuk validasi
  //   //    Endpoint ini akan menyimpan gizi BARU dan set 'isValidated = true'
  //   const result = await validateIngredient(id, flatNutritionData);

  //   if (result.success) {
  //     // 3. Jika sukses, hapus item dari daftar 'perlu validasi' di UI
  //     setValidationList((prevList) =>
  //       prevList.filter((item) => item.id !== id)
  //     );
  //     handleCloseModal(); // Tutup modal
  //   } else {
  //     // Jika gagal, tampilkan error (idealnya di dalam modal)
  //     console.error("Gagal memvalidasi:", result.message);
  //     alert(`Error: ${result.message}`); // Tampilkan error sederhana
  //   }
  // };

  // Di AhliGiziDashboard.js

  // Update fungsi handleValidate untuk menerima parameter validatorName
  // This handler will create a new ingredient when there's no id,
  // or update an existing one when id is present.
  const handleValidate = async (id, updatedData, validatorName) => {
    console.log("Saving ingredient:", id, updatedData, "by:", validatorName);

    const flatNutritionData = updatedData.informasi_nilai_gizi;
    const context = routeOrgId ? { orgId: routeOrgId } : {};

    try {
      let result;
      const payload = {
        nama: updatedData.nama || updatedData.name || "",
        ...flatNutritionData,
        // if validator provided, mark as validated
        ...(validatorName ? { validatedBy: validatorName, isValidated: true } : {}),
      };

      if (id) {
        result = await updateIngredient(id, payload, context);
      } else {
        result = await createIngredient(payload, context);
      }

      if (result && result.success === false) {
        throw new Error(result.message || "Gagal menyimpan bahan");
      }

      // reload list
      const list = await getAllIngredients(context);
      setValidationList(list.map(mapBahanToValidationItem));
      handleCloseModal();

      alert("Bahan berhasil disimpan.");
    } catch (err) {
      console.error("Error saving ingredient:", err);
      alert(err.message || "Gagal menyimpan bahan");
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <MainNavbar />

      {/* Modal Validasi */}
      {selectedIngredient && (
        <ValidationModal
          ingredient={selectedIngredient}
          onClose={handleCloseModal}
          onValidate={handleValidate}
        />
      )}

      {/* Konten Utama Halaman */}
      <main className="flex-grow bg-white w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-[#E8D1C5]">
            <h2 className="text-3xl font-bold text-white0 mb-2">
              Validasi Data Gizi
            </h2>
            <p className="text-white0 mb-8">
              Berikut adalah daftar bahan hasil generate AI yang membutuhkan
              validasi Anda.
            </p>

            {/* Daftar Bahan */}
            <div className="space-y-3">
              {/* --- BARU: Tampilkan status Loading / Error --- */}
              {isLoading && (
                <p className="text-white0 text-center py-4">
                  Memuat data...
                </p>
              )}
              {error && (
                <p className="text-red-500 text-center py-4">Error: {error}</p>
              )}
              {!isLoading && !error && validationList.length === 0 && (
                <p className="text-green-600 font-medium text-center py-4">
                  Semua bahan sudah tervalidasi.
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
                      className="flex items-center justify-between p-4 bg-white border border-[#E8D1C5] rounded-lg"
                    >
                      <div>
                        <h3 className="font-bold text-[#17191B]">
                          {item.nama}
                        </h3>
                        <p className="text-sm text-[#452829]">
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

      {/* <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-white0">Daftar Bahan</h1>
          <button
            onClick={() => setSelectedIngredient({ id: null, nama: "", nutritionData: { takaran_saji_g: 100, informasi_nilai_gizi: {} } })}
            className="px-4 py-2 bg-[#452829] hover:bg-[#6C2D19] text-white rounded-lg"
          >
            Tambah Bahan
          </button>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow border border-[#E8D1C5]">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-[#F8F5F3]">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-medium text-[#37393B]">Nama</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-[#37393B]">Status</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-[#37393B]">Energi (kkal)</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-[#37393B]">Protein (g)</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-[#37393B]">Lemak (g)</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-[#37393B]">Karbo (g)</th>
                  <th className="px-4 py-2 text-right text-sm font-medium text-[#37393B]">Aksi</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {validationList.map((item) => {
                  const info = item.nutritionData?.informasi_nilai_gizi || {};
                  return (
                    <tr key={item.id}>
                      <td className="px-4 py-3 text-sm text-[#17191B]">{item.nama}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${item.status === 'sudah tervalidasi' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">{info.energi_kkal ?? '-'}</td>
                      <td className="px-4 py-3 text-sm">{info.protein_g ?? '-'}</td>
                      <td className="px-4 py-3 text-sm">{info.lemak_g ?? '-'}</td>
                      <td className="px-4 py-3 text-sm">{info.karbohidrat_g ?? '-'}</td>
                      <td className="px-4 py-3 text-right text-sm">
                        <button
                          onClick={() => setSelectedIngredient(item)}
                          className="px-3 py-1 mr-2 bg-[#452829] hover:bg-[#6C2D19] text-white rounded-md text-sm"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div> */}
      </main>

      <Footer />
    </div>
  );
}
