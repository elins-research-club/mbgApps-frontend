// /frontend/src/components/NutritionLabel.js

const NutritionLabel = ({ data }) => {
  if (!data) return null;

  const gizi = data.informasi_nilai_gizi;
  const akg = data.persen_akg;

  // Helper untuk menampilkan baris nutrisi
  const renderNutritionRow = (label, value, unit, akgValue) => (
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

  return (
    <div className="mt-6 p-4 border-2 border-black bg-white w-full max-w-md font-sans">
      <h3 className="font-bold text-3xl tracking-wide">Informasi Nilai Gizi</h3>
      <p className="text-md">Takaran Saji: {data.takaran_saji_g}g</p>

      <div className="w-full h-1 bg-black my-1"></div>

      <p className="font-bold text-lg">Jumlah per Sajian</p>
      <div className="flex justify-between items-center font-bold text-xl mb-1">
        <span>Energi Total</span>
        <span>{gizi.energi_kkal} kkal</span>
      </div>

      <div className="w-full h-2 bg-black my-1"></div>
      <div className="text-right font-bold">% AKG*</div>
      <div className="w-full h-px bg-gray-800 my-1"></div>

      {renderNutritionRow("Lemak Total", gizi.lemak_g, "g", akg.lemak_total)}
      {renderNutritionRow("Protein", gizi.protein_g, "g", akg.protein)}
      {renderNutritionRow(
        "Karbohidrat Total",
        gizi.karbohidrat_g,
        "g",
        akg.karbohidrat_total
      )}
      {renderNutritionRow("Serat Pangan", gizi.serat_g, "g")}

      <div className="w-full h-1 bg-black my-1"></div>

      {renderNutritionRow("Natrium", gizi.natrium_mg, "mg", akg.natrium)}
      <div className="w-full h-px bg-gray-800 my-1"></div>
      {renderNutritionRow("Kalium", gizi.kalium_mg, "mg")}

      <div className="w-full h-px bg-gray-800 my-1"></div>

      {/* Menampilkan nutrisi dengan % AKG baru */}
      {renderNutritionRow("Kalsium", gizi.kalsium_mg, "mg", akg.kalsium)}
      {renderNutritionRow("Besi", gizi.besi_mg, "mg", akg.besi)}
      {renderNutritionRow("Vitamin C", gizi.vitamin_c_mg, "mg", akg.vitamin_c)}

      <div className="w-full h-2 bg-black my-1"></div>

      <p className="text-xs text-left mt-2">
        *Persen AKG berdasarkan kebutuhan energi 2000 kkal. Kebutuhan energi
        Anda mungkin lebih tinggi atau lebih rendah.
      </p>
    </div>
  );
};

export default NutritionLabel;
