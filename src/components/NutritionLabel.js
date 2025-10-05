// /frontend/src/components/NutritionLabel.js

// Komponen ini tidak lagi menggunakan Home.module.css, melainkan Tailwind CSS
const NutritionLabel = ({ data }) => {
  if (!data) return null;

  // Membuat alias agar lebih mudah dibaca
  const gizi = data.informasi_nilai_gizi;
  const akg = data.persen_akg;

  return (
    <div className="mt-6 p-4 border-2 border-black bg-white w-full max-w-sm font-sans">
      <h3 className="font-bold text-2xl tracking-wide">INFORMASI NILAI GIZI</h3>
      <p className="text-sm">Takaran Saji: {data.takaran_saji_g}g</p>

      <div className="w-full h-1 bg-black my-1"></div>

      <p className="font-bold">Jumlah per Sajian</p>
      <div className="flex justify-between items-center font-bold text-lg">
        <span>Energi Total</span>
        <span>{gizi.energi_total_kkal} kkal</span>
      </div>
      <p className="text-right text-sm">
        Energi dari Lemak {gizi.energi_dari_lemak_kkal} kkal
      </p>

      <div className="w-full h-px bg-gray-400 my-1"></div>
      <div className="text-right font-bold">% AKG*</div>
      <div className="w-full h-px bg-gray-800 my-1"></div>

      <div className="flex justify-between">
        <span>
          <strong>Lemak Total</strong> {gizi.lemak_total_g}g
        </span>
        <span className="font-bold">{akg.lemak_total}</span>
      </div>
      <div className="w-full h-px bg-gray-400 my-1"></div>

      <div className="flex justify-between">
        <span>
          <strong>Protein</strong> {gizi.protein_g}g
        </span>
        <span className="font-bold">{akg.protein}</span>
      </div>
      <div className="w-full h-px bg-gray-400 my-1"></div>

      <div className="flex justify-between">
        <span>
          <strong>Karbohidrat Total</strong> {gizi.karbohidrat_total_g}g
        </span>
        <span className="font-bold">{akg.karbohidrat_total}</span>
      </div>
      <div className="w-full h-px bg-gray-400 my-1"></div>

      <div className="flex justify-between">
        <span>
          <strong>Natrium</strong> {gizi.natrium_mg}mg
        </span>
        <span className="font-bold">{akg.natrium}</span>
      </div>

      <div className="w-full h-1 bg-black my-1"></div>

      <p className="text-xs text-left mt-2">
        *Persen AKG berdasarkan kebutuhan energi 2000 kkal. Kebutuhan energi
        Anda mungkin lebih tinggi atau lebih rendah.
      </p>
    </div>
  );
};

export default NutritionLabel;
