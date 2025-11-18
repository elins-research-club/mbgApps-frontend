const RecommendationCard = ({ data }) => {
  const { combinedKekurangan = [], combinedSaran = [] } = data || {};

  // Group kekurangan by kelas
  const groupedKekurangan = combinedKekurangan.reduce((acc, item) => {
    if (!acc[item.kelas]) acc[item.kelas] = [];
    acc[item.kelas].push(item);
    return acc;
  }, {});

  // Group saran by kelas
  const groupedSaran = combinedSaran.reduce((acc, item) => {
    if (!acc[item.kelas]) acc[item.kelas] = [];
    acc[item.kelas].push(item);
    return acc;
  }, {});

  // Combine all kelas keys
  const allKelas = Array.from(
    new Set([
      ...Object.keys(groupedKekurangan),
      ...Object.keys(groupedSaran),
    ])
  ).sort((a, b) => a - b); // sort numerically

  const hasData = allKelas.length > 0;

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
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-slate-200">
      {/* Header */}
      <div className="border-b-2 border-orange-200 bg-gradient-to-r from-orange-50 to-white px-6 py-5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-xl font-bold text-[#202020]">
              Analisis & Rekomendasi Nutrisi
            </h3>
            <p className="text-sm text-slate-600 mt-1">
              Evaluasi kecukupan gizi dan saran optimalisasi menu untuk berbagai
              tingkat pendidikan
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {hasData ? (
          <div className="space-y-8">
            {allKelas.map((kelas) => (
              <div key={kelas} className="border-2 border-slate-200 rounded-xl p-4">
                <h4 className="text-lg font-bold mb-2 text-[#202020]">
                  {getClassName(Number(kelas))}
                </h4>

                {/* Kekurangan */}
                {groupedKekurangan[kelas] && (
                  <div className="mb-4">
                    <h5 className="font-semibold text-red-600 mb-1">
                      Kekurangan Nutrisi
                    </h5>
                    <ul className="list-disc list-inside text-sm text-slate-700">
                      {groupedKekurangan[kelas].map((item, idx) => (
                        <li key={idx}>
                          {item.menu}: {item.kurang}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Saran */}
                {groupedSaran[kelas] && (
                  <div>
                    <h5 className="font-semibold text-green-600 mb-1">
                      Rekomendasi Menu
                    </h5>
                    <ul className="list-disc list-inside text-sm text-slate-700">
                      {groupedSaran[kelas].map((item, idx) => (
                        <li key={idx}>
                          {item.nama} - {item.serving} porsi
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-10 h-10 text-slate-400"
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
            </div>
            <h4 className="text-lg font-bold text-slate-600 mb-2">
              Belum Ada Data Rekomendasi
            </h4>
            <p className="text-sm text-slate-500">
              Sistem akan menampilkan analisis setelah komposisi menu diproses
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecommendationCard;
