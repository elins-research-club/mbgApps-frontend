// /frontend/src/components/RecommendationCard.js

/**
 * Komponen untuk menampilkan rekomendasi gizi.
 * Versi ini TANPA ICON dan TANPA LINGKARAN KUNING.
 */
const RecommendationCard = ({ data }) => {
  // Cek apakah ada data untuk ditampilkan
  const hasData = data && (data.kekurangan?.length > 0 || data.saran?.length > 0);
  const { kekurangan = [], saran = [] } = data || {};

  return (
    // Kotak luar ini sekarang selalu tampil
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-slate-200">
      <div className="p-6 lg:p-8">
        {/* Judul akan selalu tampil */}
        <div className="flex items-center gap-3 mb-5">
          {/* --- DIV LINGKARAN KUNING DIHAPUS DARI SINI --- */}
          <h3 className="text-2xl font-bold text-orange-600">
            Rekomendasi Tambahan
          </h3>
        </div>

        {/* Konten dinamis:
          Jika ADA DATA, tampilkan tabel.
          Jika TIDAK ADA DATA, tampilkan placeholder.
        */}
        {hasData ? (
          <>
            {/* Bagian 1: Analisis Kekurangan */}
            {kekurangan.length > 0 && (
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-slate-700 mb-3">
                  Analisis Kekurangan Gizi
                </h4>
                <div className="divide-y divide-slate-200 border rounded-lg overflow-hidden">
                  <div className="grid grid-cols-2 bg-slate-50 font-bold text-sm text-slate-600">
                    <span className="px-4 py-2">Menu</span>
                    <span className="px-4 py-2">Kekurangan Gizi</span>
                  </div>
                  {kekurangan.map((item, index) => (
                    <div key={index} className="grid grid-cols-2 text-sm">
                      <span className="px-4 py-3 font-medium text-slate-800">
                        {item.menu}
                      </span>
                      <span className="px-4 py-3 text-red-600">
                        {item.kurang}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bagian 2: Saran Penambahan */}
            {saran.length > 0 && (
              <div>
                <h4 className="text-lg font-semibold text-slate-700 mb-3">
                  Saran Penambahan Resep
                </h4>
                <div className="divide-y divide-slate-200 border rounded-lg overflow-hidden">
                  <div className="grid grid-cols-2 bg-slate-50 font-bold text-sm text-slate-600">
                    <span className="px-4 py-2">Rekomendasi</span>
                    <span className="px-4 py-2">Penambahan</span>
                  </div>
                  {saran.map((item, index) => (
                    <div key={index} className="grid grid-cols-2 text-sm">
                      <span className="px-4 py-3 font-medium text-slate-800">
                        {item.nama}
                      </span>
                      <span className="px-4 py-3 text-green-600">
                        + {item.gramasi}g
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          // --- INI ADALAH PLACEHOLDER ---
          <div className="flex flex-col items-center justify-center h-48 text-center text-slate-400 border-2 border-dashed border-slate-300 rounded-lg bg-slate-50/50">
            <p className="mt-2 text-md font-medium">
              Rekomendasi akan muncul di sini.
            </p>
            <p className="text-sm">
              Hasil rekomendasi akan dibuat setelah menu digenerate.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecommendationCard;