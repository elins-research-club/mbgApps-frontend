// /frontend/src/components/DetailResultCard.js
import Image from "next/image";
import { ChevronDown } from "lucide-react";
import NutritionLabel from "./NutritionLabel";

const DetailResultCard = ({ log, details }) => {
  const ingredientDetails = details || [];
  const calculationLog = log || [];

  if (calculationLog.length === 0 && ingredientDetails.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-slate-200">
      <div className="grid grid-cols-1 divide-y divide-slate-200">
        {/* Bagian Atas: Log Perhitungan */}
        <div className="p-6 lg:p-8">
          <div className="flex items-center gap-3 mb-5">
            <Image
              src="/hasil-icon.png"
              alt="Log Icon"
              width={20}
              height={20}
              className="w-10 h-10"
              style={{ objectFit: "contain" }}
            />
            <h3 className="text-2xl font-bold text-orange-500">Log Proses</h3>
          </div>

          {calculationLog.length > 0 ? (
            <div className="bg-[#202020]/85 text-white/80 p-5 rounded-xl font-mono text-sm max-h-[28rem] overflow-y-auto shadow-inner">
              {calculationLog.map((entry, index) => (
                <p key={index} className="mb-2 last:mb-0 leading-relaxed">
                  {entry}
                </p>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-32 bg-slate-50 rounded-xl border-2 border-dashed border-slate-300">
              <p className="text-slate-400 text-sm">Log tidak tersedia</p>
            </div>
          )}
        </div>

        {/* Bagian Bawah: Rincian Gizi Bahan */}
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
              Rincian Gizi per Bahan
            </h3>
          </div>

          {ingredientDetails.length > 0 ? (
            <div className="space-y-3 max-h-[28rem] overflow-y-auto pr-2">
              {ingredientDetails.map((item, index) => (
                <details
                  key={index}
                  className="group bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-all duration-200"
                >
                  <summary className="flex items-center justify-between p-4 cursor-pointer select-none">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center justify-center w-7 h-7 bg-[#202020]/10 text-[#202020]90 rounded-full text-xs font-bold">
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
    </div>
  );
};

export default DetailResultCard;
