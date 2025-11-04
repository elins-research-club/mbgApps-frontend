// /frontend/src/components/DetailResultCard.js
import Image from "next/image";
import { ChevronDown } from "lucide-react";
import NutritionLabel from "./NutritionLabel";

const DetailResultCard = ({ log, details, detailPerResep, groupedData }) => {
  const ingredientDetails = details || [];
  const calculationLog = log || [];

  // ✅ BARU: Jika ada detailPerResep, group bahan per resep
  const shouldGroupByRecipe = detailPerResep && detailPerResep.length > 0;

  if (calculationLog.length === 0 && ingredientDetails.length === 0) {
    return null;
  }

  // Emoji untuk kategori
  const categoryIcons = {
    karbohidrat: "🍚",
    proteinHewani: "🍗",
    sayur: "🥬",
    proteinTambahan: "🥜",
    buah: "🍌",
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-slate-200">
      {/* Bagian: Rincian Gizi Bahan */}
      <div className="p-6 lg:p-8 bg-slate-50/50">
        <div className="flex items-center gap-3 mb-5">
          <Image
            src="/search-icon.png"
            alt="Icon Rincian Gizi"
            width={20}
            height={20}
            className="w-10 h-10"
            style={{ objectFit: "contain" }}
          />
          <h3 className="text-2xl font-bold text-orange-500">
            Nutrisi per Bahan
          </h3>
        </div>

        {ingredientDetails.length > 0 ? (
          <div className="space-y-4 max-h-[28rem] overflow-y-auto pr-2">
            {shouldGroupByRecipe
              ? // ✅ TAMPILAN BARU: Grouped by Recipe
                detailPerResep.map((resep, resepIndex) => (
                  <div
                    key={resepIndex}
                    className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden"
                  >
                    {/* Header Resep */}
                    <div className="bg-gradient-to-r from-orange-50 to-orange-100 px-4 py-3 border-b border-orange-200">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">
                          {categoryIcons[resep.kategori] || "🍽️"}
                        </span>
                        <div>
                          <p className="font-bold text-orange-600">
                            {resep.kategori_label}
                          </p>
                          <p className="text-sm text-slate-600">
                            {resep.nama_menu}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* List Bahan dalam Resep */}
                    <div className="p-2 space-y-2">
                      {resep.rincian_bahan && resep.rincian_bahan.length > 0 ? (
                        resep.rincian_bahan.map((item, itemIndex) => (
                          <details
                            key={itemIndex}
                            className="group bg-slate-50 rounded-lg border border-slate-200 hover:shadow-md transition-all duration-200"
                          >
                            <summary className="flex items-center justify-between p-3 cursor-pointer select-none">
                              <div className="flex items-center gap-2">
                                <span className="flex items-center justify-center w-6 h-6 bg-orange-100 text-orange-600 rounded-full text-xs font-bold">
                                  {itemIndex + 1}
                                </span>
                                <div>
                                  <p className="font-semibold text-slate-800 text-sm group-hover:text-orange-500 transition-colors">
                                    {item.nama}
                                  </p>
                                  <p className="text-xs text-slate-500">
                                    {item.gramasi}g
                                  </p>
                                </div>
                              </div>
                              <ChevronDown className="w-4 h-4 text-slate-400 group-open:rotate-180 transition-transform duration-200" />
                            </summary>

                            <div className="px-3 pb-3 border-t border-slate-200">
                              <div className="pt-3">
                                <NutritionLabel
                                  data={{
                                    takaran_saji_g: item.gramasi,
                                    informasi_nilai_gizi: item.gizi,
                                    persen_akg: {},
                                  }}
                                  isMini={true}
                                />
                              </div>
                            </div>
                          </details>
                        ))
                      ) : (
                        <p className="text-center text-slate-400 text-sm py-2">
                          Tidak ada rincian bahan
                        </p>
                      )}
                    </div>
                  </div>
                ))
              : // ✅ TAMPILAN LAMA: List biasa (tanpa grouping)
                ingredientDetails.map((item, index) => (
                  <details
                    key={index}
                    className="group bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-all duration-200"
                  >
                    <summary className="flex items-center justify-between p-4 cursor-pointer select-none">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center justify-center w-7 h-7 bg-[#202020]/10 text-[#202020]/90 rounded-full text-xs font-bold">
                          {index + 1}
                        </span>
                        <div>
                          <p className="font-semibold text-slate-800 group-hover:text-orange-500 transition-colors">
                            {item.nama}
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {item.gramasi}g
                          </p>
                        </div>
                      </div>
                      <ChevronDown className="w-5 h-5 text-slate-400 group-open:rotate-180 transition-transform duration-200" />
                    </summary>

                    <div className="px-4 pb-4 border-t border-slate-100">
                      <div className="pt-4">
                        <NutritionLabel
                          data={{
                            takaran_saji_g: item.gramasi,
                            informasi_nilai_gizi: item.gizi,
                            persen_akg: {},
                          }}
                          isMini={true}
                        />
                      </div>
                    </div>
                  </details>
                ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-32 bg-white rounded-xl border-2 border-dashed border-slate-300">
            <p className="text-slate-400 text-sm">
              Rincian bahan tidak tersedia
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DetailResultCard;
