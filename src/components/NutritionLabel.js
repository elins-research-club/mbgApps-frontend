// /frontend/src/components/NutritionLabel.js

import { forwardRef } from "react";

// --- KOMPONEN BARU UNTUK BARIS YANG BISA DIEDIT ---
const EditableRow = ({ label, value, unit, onChange }) => (
  <div className="flex justify-between items-center text-sm py-1">
    <span>
      <strong>{label}</strong>
    </span>
    <div className="flex items-center gap-1">
      <input
        type="number"
        value={value}
        onChange={onChange}
        className="w-24 p-1 border border-slate-300 rounded-md text-right focus:ring-2 focus:ring-orange-500 outline-none"
      />
      <span>{unit}</span>
    </div>
  </div>
);

// --- KOMPONEN BARU UNTUK BARIS BIASA ---
const ReadOnlyRow = ({ label, value, unit, akgValue }) => (
  <>
    <div className="flex justify-between text-sm">
      <span>
        <strong>{label}</strong> {value}
        {unit}
      </span>
      {akgValue && <span className="font-bold">{akgValue}</span>}
    </div>
    <div className="w-full h-px bg-gray-300 my-1"></div>
  </>
);

const NutritionLabel = forwardRef(
  (
    { data, goals, classGrade, fromRecCard=false, isMini = false, isEditable = false, onDataChange = () => {} },
    ref
  ) => {
    if (!data) return null;

    const gizi = data.informasi_nilai_gizi || {};
    let akg = data.persen_akg || {};
    if (fromRecCard){
      const akgAll = data.persen_akg_all || {};
      akg = akgAll[classGrade] || {};
    }
    const defaultGoals = {
      6: { energi_kkal: 2000 }
    };
    const currentGoals = goals || defaultGoals;
    
    console.log("akg",akg);
    console.log("classGrade", classGrade)
    console.log("Goals ", currentGoals)

    // --- FUNGSI BARU UNTUK MENANGANI PERUBAHAN INPUT ---
    const handleChange = (field, value) => {
      // Buat salinan data gizi
      const newGizi = { ...gizi };
      // Perbarui nilainya (pastikan itu angka)
      newGizi[field] = parseFloat(value) || 0;
      // Kirim data yang sudah diperbarui ke parent
      onDataChange({ ...data, informasi_nilai_gizi: newGizi });
    };

    // --- FUNGSI RENDER DIPERBARUI ---
    const renderNutritionRow = (
      label,
      value,
      unit,
      akgValue,
      fieldKey // fieldKey adalah nama properti di objek `gizi`
    ) => {
      // ✅ pastikan value angka dan dibulatkan 2 angka di belakang koma
      const roundedValue =
        typeof value === "number" && !isNaN(value)
          ? Number(value.toFixed(2))
          : value || 0;

      if (isEditable && fieldKey) {
        return (
          <EditableRow
            label={label}
            value={roundedValue}
            unit={unit}
            onChange={(e) => handleChange(fieldKey, e.target.value)}
          />
        );
      }

      return (
        <ReadOnlyRow
          label={label}
          value={roundedValue}
          unit={unit}
          akgValue={akgValue}
        />
      );
    };

    return (
      <div
        ref={ref}
        className={`p-4 border-2 border-black bg-white w-full max-w-md font-sans ${
          isMini ? "text-sm" : ""
        }`}
      >
        <h3
          className={`font-bold tracking-wide ${
            isMini ? "text-xl" : "text-3xl"
          }`}
        >
          Informasi Nilai Gizi
        </h3>
        <p className={`${isMini ? "text-xs" : "text-md"}`}>
          Takaran Saji: {data.takaran_saji_g}g
        </p>

        <div className="w-full h-1 bg-black my-1"></div>
        <p className="font-bold text-lg">Jumlah per Sajian</p>

        <div className="flex justify-between items-center font-bold text-xl mb-1">
          <span>Energi Total</span>
          {/* Energi juga bisa diedit */}
          {isEditable ? (
            <div className="flex items-center gap-1">
              <input
                type="number"
                value={
                  typeof gizi.energi_kkal === "number" &&
                  !isNaN(gizi.energi_kkal)
                    ? Number(gizi.energi_kkal.toFixed(2))
                    : gizi.energi_kkal || 0
                }
                onChange={(e) => handleChange("energi_kkal", e.target.value)}
                className="w-24 p-1 border border-slate-300 rounded-md text-right focus:ring-2 focus:ring-orange-500 outline-none"
              />
              <span>kkal</span>
            </div>
          ) : (
            <span>
              {typeof gizi.energi_kkal === "number" && !isNaN(gizi.energi_kkal)
                ? Number(gizi.energi_kkal.toFixed(2))
                : gizi.energi_kkal || 0}{" "}
              kkal
            </span>
          )}
        </div>

        <div className="w-full h-2 bg-black my-1"></div>
        {/* AKG % tidak diedit, hanya nilai mentah (g/mg) */}
        {!isEditable && (
          <>
            <div className="text-right font-bold">% AKG*</div>
            <div className="w-full h-px bg-gray-800 my-1"></div>
          </>
        )}

        {/* --- PANGGILAN FUNGSI RENDER DIPERBARUI DENGAN fieldKey --- */}
        {renderNutritionRow(
          "Lemak Total",
          gizi.lemak_g,
          "g",
          akg.lemak_g,
          "lemak_g"
        )}
        {renderNutritionRow(
          "Protein",
          gizi.protein_g,
          "g",
          akg.protein_g,
          "protein_g"
        )}
        {renderNutritionRow(
          "Karbohidrat Total",
          gizi.karbohidrat_g,
          "g",
          akg.karbohidrat_g,
          "karbohidrat_g"
        )}
        {renderNutritionRow("Serat Pangan", gizi.serat_g, "g", akg.serat_g, "serat_g")}

        <div className="w-full h-1 bg-black my-1"></div>

        {renderNutritionRow(
          "Natrium",
          gizi.natrium_mg,
          "mg",
          akg.natrium_mg,
          "natrium_mg"
        )}
        {renderNutritionRow("Kalium", gizi.kalium_mg, "mg", akg.kalium_mg, "kalium_mg")}

        {/* Tambahkan field lain jika perlu diedit */}
        {renderNutritionRow(
          "Kalsium",
          gizi.kalsium_mg,
          "mg",
          akg.kalsium_mg,
          "kalsium_mg"
        )}
        {renderNutritionRow("Besi", gizi.besi_mg, "mg", akg.besi_mg, "besi_mg")}
        {renderNutritionRow(
          "Vitamin C",
          gizi.vitamin_c_mg,
          "mg",
          akg.vitamin_c_mg,
          "vitamin_c_mg"
        )}

        <div className="w-full h-2 bg-black my-1"></div>
        <p className="text-xs text-left mt-2">
          *Persen AKG berdasarkan kebutuhan {currentGoals[classGrade || 6]?.energi_kkal || 2000} energi kkal. Kebutuhan energi
          Anda mungkin lebih tinggi atau lebih rendah.
        </p>
      </div>
    );
  }
);

NutritionLabel.displayName = "NutritionLabel";
export default NutritionLabel;
