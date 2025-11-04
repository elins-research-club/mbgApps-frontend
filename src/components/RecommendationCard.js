// /frontend/src/components/RecommendationCard.js
// FIXED VERSION - Sesuaikan dengan format backend terbaru

const RecommendationCard = ({ data }) => {
  console.log("📦 Data yang diterima oleh RecommendationCard:", data);

  // ✅ PERBAIKAN: Sesuaikan dengan format backend baru
  const { combinedKekurangan = [], combinedSaran = [] } = data || {};

  const hasData = combinedKekurangan.length > 0 || combinedSaran.length > 0;

  // Helper untuk format nama kelas
  const getClassName = (classGrade) => {
    const classMap = {
      1: "TK A",
      2: "TK B",
      3: "SD Kelas 1",
      4: "SD Kelas 2",
      5: "SD Kelas 3",
      6: "SD Kelas 4",
      7: "SD Kelas 5",
      8: "SD Kelas 6",
      9: "SMP Kelas 1",
      10: "SMP Kelas 2",
      11: "SMP Kelas 3",
      12: "SMA Kelas 1",
      13: "SMA Kelas 2",
      14: "SMA Kelas 3",
    };
    return classMap[classGrade] || `Kelas ${classGrade}`;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-200">
      {/* Header */}
      <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
        <h3 className="text-xl font-semibold text-slate-800">
          Rekomendasi Gizi
        </h3>
        <p className="text-sm text-slate-500 mt-1">
          Analisis kekurangan dan saran pemenuhan nutrisi untuk berbagai tingkat
          kelas
        </p>
      </div>

      {/* Content */}
      <div className="p-6">
        {hasData ? (
          <div className="space-y-8">
            {/* Analisis Kekurangan */}
            {combinedKekurangan.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wide flex items-center gap-2">
                  <span className="text-red-500">⚠️</span>
                  Analisis Kekurangan Gizi
                </h4>
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                          <th className="text-left px-4 py-3 text-sm font-medium text-slate-600 whitespace-nowrap">
                            Tingkat Kelas
                          </th>
                          <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">
                            Menu
                          </th>
                          <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">
                            Kekurangan Gizi
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {combinedKekurangan.map((item, index) => (
                          <tr
                            key={index}
                            className="hover:bg-slate-50 transition-colors"
                          >
                            <td className="px-4 py-3 text-sm font-medium text-slate-800 whitespace-nowrap">
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {getClassName(item.kelas)}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm font-medium text-slate-700">
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
              </div>
            )}

            {/* Saran Penambahan */}
            {combinedSaran.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wide flex items-center gap-2">
                  <span className="text-green-500">✨</span>
                  Saran Penambahan Menu
                </h4>
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                          <th className="text-left px-4 py-3 text-sm font-medium text-slate-600 whitespace-nowrap">
                            Tingkat Kelas
                          </th>
                          <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">
                            Menu Rekomendasi
                          </th>
                          <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">
                            Jumlah Porsi
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {combinedSaran.map((item, index) => (
                          <tr
                            key={index}
                            className="hover:bg-slate-50 transition-colors"
                          >
                            <td className="px-4 py-3 text-sm font-medium text-slate-800 whitespace-nowrap">
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {getClassName(item.kelas)}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm font-medium text-slate-700">
                              {item.nama}
                            </td>
                            <td className="px-4 py-3 text-sm text-green-600 font-medium">
                              + {item.serving} porsi
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Info Footer */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex gap-3">
                <svg
                  className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">💡 Informasi Rekomendasi</p>
                  <ul className="space-y-1 text-blue-700">
                    <li>
                      • Rekomendasi ditampilkan untuk berbagai tingkat kelas
                    </li>
                    <li>
                      • Porsi dihitung berdasarkan kebutuhan gizi harian ÷ 3
                      (untuk 1x makan)
                    </li>
                    <li>
                      • Pilih menu yang sesuai dengan tingkat kelas target Anda
                    </li>
                  </ul>
                </div>
              </div>
            </div>
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
