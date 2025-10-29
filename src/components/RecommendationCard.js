// /frontend/src/components/RecommendationCard.js

/**
 * Komponen untuk menampilkan rekomendasi gizi.
 * Versi profesional dengan desain simple dan clean.
 */
const RecommendationCard = ({ data }) => {
  console.log("📦 Data yang diterima oleh RecommendationCard:", data);

  const { kekurangan = [], saran = [] } = data || {};
  const hasData = kekurangan.length > 0 || saran.length > 0;

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-200">
      {/* Header */}
      <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
        <h3 className="text-xl font-semibold text-slate-800">
          Rekomendasi Gizi
        </h3>
        <p className="text-sm text-slate-500 mt-1">
          Analisis kekurangan dan saran pemenuhan nutrisi
        </p>
      </div>

      {/* Content */}
      <div className="p-6">
        {hasData ? (
          <div className="space-y-8">
            {/* Analisis Kekurangan */}
            {kekurangan.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wide">
                  Analisis Kekurangan
                </h4>
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">
                          Menu
                        </th>
                        <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">
                          Kekurangan Gizi
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {kekurangan.map((item, index) => (
                        <tr
                          key={index}
                          className="hover:bg-slate-50 transition-colors"
                        >
                          <td className="px-4 py-3 text-sm font-medium text-slate-800">
                            {item.menu}
                          </td>
                          <td className="px-4 py-3 text-sm text-red-600">
                            {item.kurang}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Saran Penambahan */}
            {saran.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wide">
                  Saran Penambahan
                </h4>
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">
                          Rekomendasi
                        </th>
                        <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">
                          Gramasi
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {saran.map((item, index) => (
                        <tr
                          key={index}
                          className="hover:bg-slate-50 transition-colors"
                        >
                          <td className="px-4 py-3 text-sm font-medium text-slate-800">
                            {item.nama}
                          </td>
                          <td className="px-4 py-3 text-sm text-green-600 font-medium">
                            + {item.gramasi}g
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        ) : (
          // Placeholder
          <div className="text-center py-12">
            <svg
              className="w-16 h-16 text-slate-300 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h4 className="text-base font-medium text-slate-600 mb-1">
              Belum Ada Rekomendasi
            </h4>
            <p className="text-sm text-slate-400">
              Rekomendasi akan muncul setelah menu di-generate
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecommendationCard;
