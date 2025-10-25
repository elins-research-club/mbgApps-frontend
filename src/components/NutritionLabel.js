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
  ({ data, isMini = false, isEditable = false, onDataChange = () => {} }, ref) => {
    if (!data) return null;

    const gizi = data.informasi_nilai_gizi;
    const akg = data.persen_akg;

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
      if (isEditable && fieldKey) {
        return (
          <EditableRow
            label={label}
            value={value}
            unit={unit}
            onChange={(e) => handleChange(fieldKey, e.target.value)}
          />
        );
      }
      return (
        <ReadOnlyRow
          label={label}
          value={value}
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
                value={gizi.energi_kkal}
                onChange={(e) => handleChange("energi_kkal", e.target.value)}
                className="w-24 p-1 border border-slate-300 rounded-md text-right focus:ring-2 focus:ring-orange-500 outline-none"
              />
              <span>kkal</span>
            </div>
          ) : (
            <span>{gizi.energi_kkal} kkal</span>
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
          akg.lemak_total,
          "lemak_g"
        )}
        {renderNutritionRow(
          "Protein",
          gizi.protein_g,
          "g",
          akg.protein,
          "protein_g"
        )}
        {renderNutritionRow(
          "Karbohidrat Total",
          gizi.karbohidrat_g,
          "g",
          akg.karbohidrat_total,
          "karbohidrat_g"
        )}
        {renderNutritionRow(
          "Serat Pangan",
          gizi.serat_g,
          "g",
          null,
          "serat_g"
        )}

        <div className="w-full h-1 bg-black my-1"></div>

        {renderNutritionRow(
          "Natrium",
          gizi.natrium_mg,
          "mg",
          akg.natrium,
          "natrium_mg"
        )}
        {renderNutritionRow(
          "Kalium",
          gizi.kalium_mg,
          "mg",
          null,
          "kalium_mg"
        )}
        
        {/* Tambahkan field lain jika perlu diedit */}
        {renderNutritionRow(
          "Kalsium",
          gizi.kalsium_mg,
          "mg",
          akg.kalsium,
          "kalsium_mg"
        )}
        {renderNutritionRow(
          "Besi",
          gizi.besi_mg,
          "mg",
          akg.besi,
          "besi_mg"
        )}
        {renderNutritionRow(
          "Vitamin C",
          gizi.vitamin_c_mg,
          "mg",
          akg.vitamin_c,
          "vitamin_c_mg"
        )}

        <div className="w-full h-2 bg-black my-1"></div>
        <p className="text-xs text-left mt-2">
          *Persen AKG berdasarkan kebutuhan energi 2000 kkal. Kebutuhan energi
          Anda mungkin lebih tinggi atau lebih rendah.
        </p>
      </div>
    );
  }
);

NutritionLabel.displayName = "NutritionLabel";
export default NutritionLabel;