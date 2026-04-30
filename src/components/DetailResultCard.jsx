// /frontend/src/components/DetailResultCard.js
import Image from "next/image";
import { ChevronDown, Pencil } from "lucide-react";
import NutritionLabel from "./NutritionLabel";

const DetailResultCard = ({ log, details, detailPerResep, groupedData, selectedRecipeId, onRecipeEdit }) => {
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
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-[#E8D1C5]">
      {/* Bagian: Rincian Gizi Bahan */}
      <div className="p-6 lg:p-8 bg-white/50">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <Image
              src="/search-icon.png"
              alt="Icon Rincian Gizi"
              width={20}
              height={20}
              className="w-10 h-10"
              style={{ objectFit: "contain" }}
            />
            <h3 className="text-2xl font-bold text-white0">
              Nutrisi per Bahan
            </h3>
          </div>
          {selectedRecipeId && onRecipeEdit && (
            <button
              type="button"
              onClick={() => onRecipeEdit({ id: selectedRecipeId })}
              className="flex items-center gap-2 px-4 py-2 border-2 border-white0 text-[#37393B] hover:bg-white rounded-lg transition-all duration-200 font-semibold hover:shadow-md"
              title="Edit menu ini"
            >
              <Pencil className="w-4 h-4" />
              <span>Edit Menu</span>
            </button>
          )}
        </div>

        {ingredientDetails.length > 0 ? (
          <div className="space-y-4 max-h-[28rem] overflow-y-auto pr-2">
            {shouldGroupByRecipe
              ? // ✅ TAMPILAN BARU: Grouped by Recipe
                detailPerResep.map((resep, resepIndex) => (
                  <div
                    key={resepIndex}
                    className="bg-white rounded-xl shadow-sm border border-[#E8D1C5] overflow-hidden"
                  >
                    {/* Header Resep */}
                    <div className="bg-[#E8D1C5] px-4 py-3 border-b border-[#E8D1C5]">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">
                          {categoryIcons[resep.kategori] || "🍽️"}
                        </span>
                        <div>
                          <p className="font-bold text-[#37393B]">
                            {resep.kategori_label}
                          </p>
                          <p className="text-sm text-[#452829]">
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
                            className="group bg-white rounded-lg border border-[#E8D1C5] hover:shadow-md transition-all duration-200"
                          >
                            <summary className="flex items-center justify-between p-3 cursor-pointer select-none">
                              <div className="flex items-center gap-2">
                                <span className="flex items-center justify-center w-6 h-6 bg-[#E8D1C5] text-[#37393B] rounded-full text-xs font-bold">
                                  {itemIndex + 1}
                                </span>
                                <div>
                                  <p className="font-semibold text-[#17191B] text-sm group-hover:text-white0 transition-colors">
                                    {item.nama}
                                  </p>
                                  <p className="text-xs text-white0">
                                    {item.gramasi}g
                                  </p>
                                </div>
                              </div>
                              <ChevronDown className="w-4 h-4 text-[#C9A89A] group-open:rotate-180 transition-transform duration-200" />
                            </summary>

                            <div className="px-3 pb-3 border-t border-[#E8D1C5]">
                              <div className="pt-3">
                                <NutritionLabel
                                  data={{
                                    takaran_saji_g: item.gramasi,
                                    informasi_nilai_gizi: item.gizi,
                                  }}
                                  isMini={true}
                                />
                              </div>
                            </div>
                          </details>
                        ))
                      ) : (
                        <p className="text-center text-[#C9A89A] text-sm py-2">
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
                    className="group bg-white rounded-xl shadow-sm border border-[#E8D1C5] hover:shadow-md transition-all duration-200"
                  >
                    <summary className="flex items-center justify-between p-4 cursor-pointer select-none">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center justify-center w-7 h-7 bg-[#202020]/10 text-[#202020]/90 rounded-full text-xs font-bold">
                          {index + 1}
                        </span>
                        <div>
                          <p className="font-semibold text-[#17191B] group-hover:text-white0 transition-colors">
                            {item.nama}
                          </p>
                          <p className="text-xs text-white0 mt-0.5">
                            {item.gramasi}g
                          </p>
                        </div>
                      </div>
                      <ChevronDown className="w-5 h-5 text-[#C9A89A] group-open:rotate-180 transition-transform duration-200" />
                    </summary>

                    <div className="px-4 pb-4 border-t border-white">
                      <div className="pt-4">
                        <NutritionLabel
                          data={{
                            takaran_saji_g: item.gramasi,
                            informasi_nilai_gizi: item.gizi,
                          }}
                          isMini={true}
                        />
                      </div>
                    </div>
                  </details>
                ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-32 bg-white rounded-xl border-2 border-dashed border-[#D9C7B8]">
            <p className="text-[#C9A89A] text-sm">
              Rincian bahan tidak tersedia
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DetailResultCard;
