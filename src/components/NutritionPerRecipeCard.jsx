// /frontend/src/components/NutritionPerRecipeCard.js

import Image from "next/image";
import { ChevronDown } from "lucide-react";

const NutritionPerRecipeCard = ({ data }) => {
  if (!data || data.length === 0) {
    return null;
  }

  // Emoji untuk setiap kategori
  const categoryIcons = {
    karbohidrat: "🍚",
    proteinHewani: "🍗",
    sayur: "🥬",
    proteinTambahan: "🥜",
    buah: "🍌",
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-slate-200">
      <div className="p-6 lg:p-8">
        <div className="flex items-center gap-3 mb-5">
          <Image
            src="/input-icon.png"
            alt="Recipe Icon"
            width={20}
            height={20}
            className="w-10 h-10"
            style={{ objectFit: "contain" }}
          />
          <h3 className="text-2xl font-bold text-orange-500">
            Nutrisi Per Resep
          </h3>
        </div>

        <div className="space-y-3 max-h-[28rem] overflow-y-auto pr-2">
          {data.map((resep, index) => (
            <details
              key={index}
              className="group bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-all duration-200"
            >
              <summary className="flex items-center justify-between p-4 cursor-pointer select-none">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">
                    {categoryIcons[resep.kategori] || "🍽️"}
                  </span>
                  <div>
                    <p className="font-semibold text-slate-800 group-hover:text-orange-500 transition-colors">
                      {resep.kategori_label}: {resep.nama_menu}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {resep.gramasi}g •{" "}
                      {Math.round(resep.nutrisi.energi_kkal || 0)} kkal
                    </p>
                  </div>
                </div>
                <ChevronDown className="w-5 h-5 text-slate-400 group-open:rotate-180 transition-transform duration-200" />
              </summary>

              <div className="px-4 pb-4 border-t border-slate-100">
                <div className="pt-4 space-y-2">
                  {/* Grid 2 kolom untuk nutrisi */}
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Energi:</span>
                      <span className="font-semibold">
                        {Math.round(resep.nutrisi.energi_kkal || 0)} kkal
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Protein:</span>
                      <span className="font-semibold">
                        {(resep.nutrisi.protein_g || 0).toFixed(1)}g
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Lemak:</span>
                      <span className="font-semibold">
                        {(resep.nutrisi.lemak_g || 0).toFixed(1)}g
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Karbohidrat:</span>
                      <span className="font-semibold">
                        {(resep.nutrisi.karbohidrat_g || 0).toFixed(1)}g
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Serat:</span>
                      <span className="font-semibold">
                        {(resep.nutrisi.serat_g || 0).toFixed(1)}g
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Natrium:</span>
                      <span className="font-semibold">
                        {Math.round(resep.nutrisi.natrium_mg || 0)}mg
                      </span>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-slate-200 my-2"></div>

                  {/* Micronutrients - 2 columns */}
                  <div className="text-xs text-slate-600 grid grid-cols-2 gap-x-4 gap-y-1">
                    <div className="flex justify-between">
                      <span>Kalsium:</span>
                      <span>{Math.round(resep.nutrisi.kalsium_mg || 0)}mg</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Besi:</span>
                      <span>{(resep.nutrisi.besi_mg || 0).toFixed(1)}mg</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Vitamin C:</span>
                      <span>
                        {Math.round(resep.nutrisi.vitamin_c_mg || 0)}mg
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Kalium:</span>
                      <span>{Math.round(resep.nutrisi.kalium_mg || 0)}mg</span>
                    </div>
                  </div>
                </div>
              </div>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NutritionPerRecipeCard;
