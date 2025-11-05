const RecommendationCard = ({ data }) => {
  console.log("Data yang diterima oleh RecommendationCard:", data);

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
            {/* Analisis Kekurangan */}
            {combinedKekurangan.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-orange-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-[#202020] uppercase tracking-wide">
                      Defisiensi Nutrisi Terdeteksi
                    </h4>
                    <p className="text-xs text-slate-600">
                      Komponen gizi yang belum memenuhi standar kebutuhan harian
                    </p>
                  </div>
                </div>

                <div className="border-2 border-slate-200 rounded-xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-slate-50">
                          <th className="text-left px-6 py-4 text-sm font-bold text-[#202020] border-b-2 border-slate-200">
                            Tingkat Pendidikan
                          </th>
                          <th className="text-left px-6 py-4 text-sm font-bold text-[#202020] border-b-2 border-slate-200">
                            Komposisi Menu
                          </th>
                          <th className="text-left px-6 py-4 text-sm font-bold text-[#202020] border-b-2 border-slate-200">
                            Kekurangan Nutrisi
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {combinedKekurangan.map((item, index) => (
                          <tr
                            key={index}
                            // className="hover:bg-orange-50 transition-colors"
                          >
                            <td className="px-6 py-4">
                              <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold bg-orange-100 text-orange-700 border border-orange-200">
                                {getClassName(item.kelas)}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm font-medium text-[#202020]">
                              {item.menu}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                                <span className="text-sm text-slate-700 font-medium">
                                  {item.kurang}
                                </span>
                              </div>
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
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-[#202020] uppercase tracking-wide">
                      Rekomendasi Penambahan Menu
                    </h4>
                    <p className="text-xs text-slate-600">
                      Menu pelengkap untuk mencapai target kebutuhan gizi
                      optimal
                    </p>
                  </div>
                </div>

                <div className="border-2 border-orange-200 rounded-xl overflow-hidden bg-gradient-to-br from-orange-50 to-white">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-orange-100">
                          <th className="text-left px-6 py-4 text-sm font-bold text-[#202020] border-b-2 border-orange-200">
                            Tingkat Pendidikan
                          </th>
                          <th className="text-left px-6 py-4 text-sm font-bold text-[#202020] border-b-2 border-orange-200">
                            Menu Rekomendasi
                          </th>
                          <th className="text-right px-6 py-4 text-sm font-bold text-[#202020] border-b-2 border-orange-200">
                            Takaran Porsi
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-orange-100">
                        {combinedSaran.map((item, index) => (
                          <tr
                            key={index}
                            // className="hover:bg-orange-100 transition-colors"
                          >
                            <td className="px-6 py-4">
                              <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold bg-white text-orange-700 border-2 border-orange-300 shadow-sm">
                                {getClassName(item.kelas)}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm font-semibold text-[#202020]">
                              {item.nama}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="inline-flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg font-bold text-sm shadow-md">
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 4v16m8-8H4"
                                  />
                                </svg>
                                <span>{item.serving} porsi</span>
                              </div>
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
            <div className="bg-slate-50 border-2 border-slate-200 rounded-xl p-5">
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-[#202020] rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <h5 className="font-bold text-[#202020] mb-3">
                    Catatan Metodologi Perhitungan
                  </h5>
                  <div className="space-y-2 text-sm text-slate-700">
                    <div className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-1.5 flex-shrink-0"></div>
                      <p>
                        Analisis dilakukan untuk seluruh tingkat pendidikan
                        sesuai standar AKG Indonesia
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-1.5 flex-shrink-0"></div>
                      <p>
                        Perhitungan porsi menggunakan formula: Kebutuhan harian
                        ÷ 3 (asumsi makan utama)
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-1.5 flex-shrink-0"></div>
                      <p>
                        Rekomendasi disesuaikan dengan tingkat kelas target yang
                        dipilih dalam analisis
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Placeholder
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
