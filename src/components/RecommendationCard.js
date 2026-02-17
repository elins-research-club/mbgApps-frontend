import { useState, useRef } from "react";
import NutritionLabel from "./NutritionLabel";
import NextImage from "next/image";
import * as htmlToImage from "html-to-image";
import jsPDF from "jspdf";
import {
	BarChart,
	Bar,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	Legend,
	ResponsiveContainer,
	Cell,
} from "recharts";
const RecommendationCard = ({ data, totalLabel }) => {
  const {
    combinedKekurangan = [],
    combinedSaran = [],
    warnings = []
  } = data || {}
  const [isPrinting, setIsPrinting] = useState(false)
  const [showPercentage, setShowPercentage] = useState(true) 
  const nutritionLabelRef = useRef(null)
  const hasResults = totalLabel !== null
  // ------------------------------
  const goals = {
    1: {
      // TK A
      energi_kkal: 1350,
      protein_g: 20,
      lemak_g: 45,
      karbohidrat_g: 215,
      serat_g: 19,
      // abu_g: 5, // optional, tidak tercantum di AKG resmi
      kalsium_mg: 1000,
      // fosfor_mg: 500,
      besi_mg: 10,
      natrium_mg: 1000,
      kalium_mg: 3200,
      // tembaga_mg: 570,
      // seng_mg: 5,
      // retinol_mcg: 500,
      // b_kar_mcg: 3600,
      // karoten_total_mcg: 4000,
      // thiamin_mg: 1.1,
      // riboflavin_mg: 1.1,
      // niasin_mg: 10,
      vitamin_c_mg: 45
    },
    2: {
      // TK B
      energi_kkal: 1400,
      protein_g: 25,
      lemak_g: 50,
      karbohidrat_g: 250,
      serat_g: 20,
      // abu_g: 5, // optional, tidak tercantum di AKG resmi
      kalsium_mg: 1000,
      // fosfor_mg: 500,
      besi_mg: 10,
      natrium_mg: 1000,
      kalium_mg: 3200,
      // tembaga_mg: 570,
      // seng_mg: 5,
      // retinol_mcg: 500,
      // b_kar_mcg: 3600,
      // karoten_total_mcg: 4000,
      // thiamin_mg: 1.1,
      // riboflavin_mg: 1.1,
      // niasin_mg: 10,
      vitamin_c_mg: 45
    },
    3: {
      //SD 1
      energi_kkal: 1650,
      protein_g: 40,
      lemak_g: 55,
      karbohidrat_g: 250,
      serat_g: 23,
      // abu_g: 5, // optional, tidak tercantum di AKG resmi
      kalsium_mg: 1000,
      // fosfor_mg: 500,
      besi_mg: 10,
      natrium_mg: 1000,
      kalium_mg: 3200,
      // tembaga_mg: 570,
      // seng_mg: 5,
      // retinol_mcg: 500,
      // b_kar_mcg: 3600,
      // karoten_total_mcg: 4000,
      // thiamin_mg: 1.1,
      // riboflavin_mg: 1.1,
      // niasin_mg: 10,
      vitamin_c_mg: 45
    },
    4: {
      // SD 2
      energi_kkal: 1650,
      protein_g: 40,
      lemak_g: 55,
      karbohidrat_g: 250,
      serat_g: 23,
      // abu_g: 5, // optional, tidak tercantum di AKG resmi
      kalsium_mg: 1000,
      // fosfor_mg: 500,
      besi_mg: 10,
      natrium_mg: 1000,
      kalium_mg: 3200,
      // tembaga_mg: 570,
      // seng_mg: 5,
      // retinol_mcg: 500,
      // b_kar_mcg: 3600,
      // karoten_total_mcg: 4000,
      // thiamin_mg: 1.1,
      // riboflavin_mg: 1.1,
      // niasin_mg: 10,
      vitamin_c_mg: 45
    },
    5: {
      //SD 3
      energi_kkal: 1650,
      protein_g: 40,
      lemak_g: 55,
      karbohidrat_g: 250,
      serat_g: 23,
      // abu_g: 5, // optional, tidak tercantum di AKG resmi
      kalsium_mg: 1000,
      // fosfor_mg: 500,
      // besi_mg: 10,
      natrium_mg: 1000,
      kalium_mg: 3200,
      tembaga_mg: 570,
      // seng_mg: 5,
      // retinol_mcg: 500,
      // b_kar_mcg: 3600,
      // karoten_total_mcg: 4000,
      // thiamin_mg: 1.1,
      // riboflavin_mg: 1.1,
      // niasin_mg: 10,
      vitamin_c_mg: 45
    },
    6: {
      //SD 4
      energi_kkal: 2000,
      protein_g: 50,
      lemak_g: 65,
      karbohidrat_g: 300,
      serat_g: 28,
      // abu_g: 5, // optional, tidak tercantum di AKG resmi
      kalsium_mg: 1000,
      // fosfor_mg: 1250,
      besi_mg: 8,
      natrium_mg: 1300,
      kalium_mg: 3900,
      // tembaga_mg: 700,
      // seng_mg: 8,
      // retinol_mcg: 500,
      // b_kar_mcg: 3600,
      // karoten_total_mcg: 4000,
      // thiamin_mg: 1.1,
      // riboflavin_mg: 1.3,
      // niasin_mg: 12,
      vitamin_c_mg: 50
    },
    7: {
      //SD 5
      energi_kkal: 2000,
      protein_g: 50,
      lemak_g: 65,
      karbohidrat_g: 300,
      serat_g: 28,
      // abu_g: 5, // optional, tidak tercantum di AKG resmi
      kalsium_mg: 1000,
      // fosfor_mg: 1250,
      // besi_mg: 8,
      natrium_mg: 1300,
      kalium_mg: 3900,
      tembaga_mg: 700,
      // seng_mg: 8,
      // retinol_mcg: 500,
      // b_kar_mcg: 3600,
      // karoten_total_mcg: 4000,
      // thiamin_mg: 1.1,
      // riboflavin_mg: 1.3,
      // niasin_mg: 12,
      vitamin_c_mg: 50
    },
    8: {
      //SD 6
      energi_kkal: 2000,
      protein_g: 50,
      lemak_g: 65,
      karbohidrat_g: 300,
      serat_g: 28,
      // abu_g: 5, // optional, tidak tercantum di AKG resmi
      kalsium_mg: 1000,
      // fosfor_mg: 1250,
      // besi_mg: 8,
      natrium_mg: 1300,
      kalium_mg: 3900,
      tembaga_mg: 700,
      // seng_mg: 8,
      // retinol_mcg: 500,
      // b_kar_mcg: 3600,
      // karoten_total_mcg: 4000,
      // thiamin_mg: 1.1,
      // riboflavin_mg: 1.3,
      // niasin_mg: 12,
      vitamin_c_mg: 50
    },
    9: {
      // SMP 1
      energi_kkal: 2400,
      protein_g: 70,
      lemak_g: 80,
      karbohidrat_g: 350,
      serat_g: 34,
      // abu_g: 5, // optional, tidak tercantum di AKG resmi
      kalsium_mg: 1200,
      // fosfor_mg: 1250,
      besi_mg: 11,
      natrium_mg: 1500,
      kalium_mg: 4800,
      // tembaga_mg: 795,
      // seng_mg: 11,
      // retinol_mcg: 500,
      // b_kar_mcg: 3600,
      // karoten_total_mcg: 4000,
      // thiamin_mg: 1.2,
      // riboflavin_mg: 1.3,
      // niasin_mg: 16,
      vitamin_c_mg: 75
    },
    10: {
      //SMP 2
      energi_kkal: 2400,
      protein_g: 70,
      lemak_g: 80,
      karbohidrat_g: 350,
      serat_g: 34,
      // abu_g: 5, // optional, tidak tercantum di AKG resmi
      kalsium_mg: 1200,
      // fosfor_mg: 1250,
      besi_mg: 11,
      natrium_mg: 1500,
      kalium_mg: 4800,
      // tembaga_mg: 795,
      // seng_mg: 11,
      // retinol_mcg: 500,
      // b_kar_mcg: 3600,
      // karoten_total_mcg: 4000,
      // thiamin_mg: 1.2,
      // riboflavin_mg: 1.3,
      // niasin_mg: 16,
      vitamin_c_mg: 75
    },
    11: {
      //SMP 3
      energi_kkal: 2650,
      protein_g: 75,
      lemak_g: 85,
      karbohidrat_g: 400,
      serat_g: 37,
      // abu_g: 5, // optional, tidak tercantum di AKG resmi
      kalsium_mg: 1200,
      // fosfor_mg: 1250,
      besi_mg: 9,
      natrium_mg: 1700,
      kalium_mg: 5300,
      // tembaga_mg: 890,
      // seng_mg: 11,
      // retinol_mcg: 500,
      // b_kar_mcg: 3600,
      // karoten_total_mcg: 4000,
      // thiamin_mg: 1.2,
      // riboflavin_mg: 1.3,
      // niasin_mg: 16,
      vitamin_c_mg: 90
    },
    12: {
      //SMA 1
      energi_kkal: 2650,
      protein_g: 75,
      lemak_g: 85,
      karbohidrat_g: 400,
      serat_g: 37,
      // abu_g: 5, // optional, tidak tercantum di AKG resmi
      kalsium_mg: 1200,
      // fosfor_mg: 1250,
      besi_mg: 9,
      natrium_mg: 1700,
      kalium_mg: 5300,
      // tembaga_mg: 890,
      // seng_mg: 11,
      // retinol_mcg: 500,
      // b_kar_mcg: 3600,
      // karoten_total_mcg: 4000,
      // thiamin_mg: 1.2,
      // riboflavin_mg: 1.3,
      // niasin_mg: 16,
      vitamin_c_mg: 90
    },
    13: {
      //SMA 2
      energi_kkal: 2650,
      protein_g: 75,
      lemak_g: 85,
      karbohidrat_g: 400,
      serat_g: 37,
      // abu_g: 5, // optional, tidak tercantum di AKG resmi
      kalsium_mg: 1200,
      // fosfor_mg: 1250,
      besi_mg: 9,
      natrium_mg: 1700,
      kalium_mg: 5300,
      // tembaga_mg: 890,
      // seng_mg: 11,
      // retinol_mcg: 500,
      // b_kar_mcg: 3600,
      // karoten_total_mcg: 4000,
      // thiamin_mg: 1.2,
      // riboflavin_mg: 1.3,
      // niasin_mg: 16,
      vitamin_c_mg: 90
    },
    14: {
      //SMA 3
      energi_kkal: 2650,
      protein_g: 75,
      lemak_g: 85,
      karbohidrat_g: 400,
      serat_g: 37,
      // abu_g: 5, // optional, tidak tercantum di AKG resmi
      kalsium_mg: 1200,
      // fosfor_mg: 700,
      besi_mg: 9,
      natrium_mg: 1700,
      kalium_mg: 5300,
      // tembaga_mg: 900,
      // seng_mg: 11,
      // retinol_mcg: 500,
      // b_kar_mcg: 3600,
      // karoten_total_mcg: 4000,
      // thiamin_mg: 1.2,
      // riboflavin_mg: 1.3,
      // niasin_mg: 16,
      vitamin_c_mg: 90
    }
  }

	const handlePrintPDF = async () => {
		if (!nutritionLabelRef.current) return;
		setIsPrinting(true);
		try {
			const node = nutritionLabelRef.current;

			await new Promise((resolve) => setTimeout(resolve, 200));

			const dataUrl = await htmlToImage.toPng(node, {
				quality: 1,
				pixelRatio: 2,
				backgroundColor: "#ffffff",
			});

			const img = new Image();
			img.src = dataUrl;
			img.onload = () => {
				const imgWidth = img.width * 0.264583;
				const imgHeight = img.height * 0.264583;
				const pdf = new jsPDF({
					orientation: imgHeight > imgWidth ? "portrait" : "landscape",
					unit: "mm",
					format: [imgWidth, imgHeight],
				});
				pdf.addImage(
					dataUrl,
					"PNG",
					0,
					0,
					imgWidth,
					imgHeight,
					undefined,
					"FAST",
				);
				pdf.save("Label-Gizi.pdf");
				setIsPrinting(false);
			};
			img.onerror = () => {
				console.error("Failed to load image for PDF");
				setIsPrinting(false);
			};
		} catch (err) {
			console.error("Gagal membuat PDF:", err);
			setIsPrinting(false);
		}
	};

	// --- 1. Group kekurangan by kelas and split by comma ---
	const groupedKekurangan = combinedKekurangan.reduce((acc, item) => {
		if (!acc[item.kelas]) acc[item.kelas] = [];

		// Split by comma and trim each part
		const nutrients = item.kurang.split(",").map((n) => n.trim());

		// Push each nutrient separately, keep kelas info
		nutrients.forEach((nutrient) => {
			acc[item.kelas].push({
				kelas: item.kelas,
				nutrient,
			});
		});

		return acc;
	}, {});

  console.log('Grouped Kekurangan ', groupedKekurangan)
  console.log("combined Kekurangan ", combinedKekurangan)

	// --- 2. Group saran by kelas ---
	const groupedSaran = combinedSaran.reduce((acc, item) => {
		if (!acc[item.kelas]) acc[item.kelas] = [];
		acc[item.kelas].push(item);
		return acc;
	}, {});

	// --- 3. Group warnings by kelas AND by reason ---
	const groupedWarnings = warnings.reduce((acc, item) => {
		if (!acc[item.kelas]) acc[item.kelas] = {};

		const reason = item.warning || item.reason || "Peringatan";
		if (!acc[item.kelas][reason]) acc[item.kelas][reason] = [];

		if (item.details && item.details.length) {
			acc[item.kelas][reason].push(...item.details);
		} else {
			acc[item.kelas][reason].push({ reason });
		}

		return acc;
	}, {});

	// Combine all kelas keys
	// const allKelas = Array.from(
	//   new Set([
	//     ...Object.keys(groupedKekurangan),
	//     ...Object.keys(groupedSaran),
	//     ...Object.keys(groupedWarnings),
	//   ]),
	// ).sort((a, b) => a - b);
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
	const allKelas = Object.keys(classMap).map(Number);
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

	const [openKelas, setOpenKelas] = useState(new Set());
	const toggleKelas = (k) =>
		setOpenKelas((prev) => {
			const next = new Set(prev);
			if (next.has(k)) next.delete(k);
			else next.add(k);
			return next;
		});

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
      <div className='p-6'>
        {hasData ? (
          <div className='space-y-8'>
            {allKelas.map((kelas, index) => {
              const open = openKelas.has(kelas)
              const kekuranganCount = (groupedKekurangan[kelas] || []).length
              console.log("Kekurangan Count: ", kekuranganCount)
              const mins = goals[kelas] || {}
              const chartData = totalLabel
                ? [
                    {
                      nutrient: 'Energi',
                      actual: totalLabel.informasi_nilai_gizi.energi_kkal || 0,
                      target: (mins.energi_kkal || 0) / 3,
                      percentage: ((totalLabel.informasi_nilai_gizi.energi_kkal || 0) / ((mins.energi_kkal || 0) / 3)) * 100,
                      unit: 'kkal'
                    },
                    {
                      nutrient: 'Protein',
                      actual: totalLabel.informasi_nilai_gizi.protein_g || 0,
                      target: (mins.protein_g || 0) / 3,
                      percentage:((totalLabel.informasi_nilai_gizi.protein_g || 0) / ((mins.protein_g || 0) / 3)) * 100,
                      unit: 'g'
                    },
                    {
                      nutrient: 'Lemak',
                      actual: totalLabel.informasi_nilai_gizi.lemak_g || 0,
                      target: (mins.lemak_g || 0) / 3,
                      percentage: ((totalLabel.informasi_nilai_gizi.lemak_g || 0) / ((mins.lemak_g || 0) / 3)) * 100,
                      unit: 'g'
                    },
                    {
                      nutrient: 'Karbohidrat',
                      actual: totalLabel.informasi_nilai_gizi.karbohidrat_g || 0,
                      target: (mins.karbohidrat_g || 0) / 3,
                      percentage: ((totalLabel.informasi_nilai_gizi.karbohidrat_g || 0) / ((mins.karbohidrat_g || 0) / 3)) * 100,
                      unit: 'g'
                    },
                    {
                      nutrient: 'Serat',
                      actual: totalLabel.informasi_nilai_gizi.serat_g || 0,
                      target: (mins.serat_g || 0) / 3,
                      percentage:((totalLabel.informasi_nilai_gizi.serat_g || 0) / ((mins.serat_g || 0) / 3)) * 100,
                      unit: 'g'
                    },
                    // {
                    //   nutrient: 'Kalsium',
                    //   actual: totalLabel.informasi_nilai_gizi.kalsium_mg || 0,
                    //   target: (mins.kalsium_mg || 0) / 3,
                    //   percentage: Math.min(((totalLabel.informasi_nilai_gizi.kalsium_mg || 0) / ((mins.kalsium_mg || 0) / 3)) * 100, 100),
                    //   unit: 'mg'
                    // },
                    // {
                    //   nutrient: 'Besi',
                    //   actual: totalLabel.informasi_nilai_gizi.besi_mg || 0,
                    //   target: (mins.besi_mg || 0) / 3,
                    //   percentage: ((totalLabel.informasi_nilai_gizi.besi_mg || 0) / ((mins.besi_mg || 0) / 3)) * 100,
                    //   unit: 'mg'
                    // },
                    // {
                    //   nutrient: 'Natrium',
                    //   actual: totalLabel.informasi_nilai_gizi.natrium_mg || 0,
                    //   target: (mins.natrium_mg || 0) / 3,
                    //   percentage: ((totalLabel.informasi_nilai_gizi.natrium_mg || 0) / ((mins.natrium_mg || 0) / 3)) * 100,
                    //   unit: 'mg'
                    // },
                    // {
                    //   nutrient: 'Kalium',
                    //   actual: totalLabel.informasi_nilai_gizi.kalium_mg || 0,
                    //   target: (mins.kalium_mg || 0) / 3,
                    //   percentage: ((totalLabel.informasi_nilai_gizi.kalium_mg || 0) / ((mins.kalium_mg || 0) / 3)) * 100,
                    //   unit: 'mg'
                    // },
                    // {
                    //   nutrient: 'Vitamin C',
                    //   actual: totalLabel.informasi_nilai_gizi.vitamin_c_mg || 0,
                    //   target: (mins.vitamin_c_mg || 0) / 3,
                    //   percentage: ((totalLabel.informasi_nilai_gizi.vitamin_c_mg || 0) / ((mins.vitamin_c_mg || 0) / 3)) * 100,
                    //   unit: 'mg'
                    // },
                    // ...(mins.tembaga_mg ? [{
                    //   nutrient: 'Tembaga',
                    //   actual: totalLabel.informasi_nilai_gizi.tembaga_mg || 0,
                    //   target: (mins.tembaga_mg || 0) / 3,
                    //   percentage: ((totalLabel.informasi_nilai_gizi.tembaga_mg || 0) / ((mins.tembaga_mg || 0) / 3)) * 100,
                    //   unit: 'mg'
                    // }] 
                    // : [])
                  ].filter(item => item.target > 0)
                : []
              return (
                <div
                  key={kelas}
                  className='border-2 border-slate-200 rounded-xl p-4 cursor-pointer'
                  onClick={() => toggleKelas(kelas)}
                >
                  <div className='flex justify-between'>
                    <div>
                      <h4 className='text-lg font-semibold text-[#202020]'>
                        {getClassName(Number(kelas))}
                      </h4>
                      <p className='text-xs text-slate-500 mt-0.5'>
                        {kekuranganCount > 0
                          ? `${kekuranganCount} kekurangan`
                          : 'Tidak ada kekurangan'}{' '}
                        •{' '}
                        {(groupedSaran[kelas]?.length || 0) > 0
                          ? `${groupedSaran[kelas].length} rekomendasi`
                          : 'Tidak ada rekomendasi'}
                      </p>
                    </div>

										<div className="flex items-center gap-3">
											<span
												className={`text-lg font-bold ${
													open ? "text-orange-600" : "text-slate-400"
												}`}
											>
												{open ? "Tutup" : "Lihat"}
											</span>

											<svg
												className={`w-5 h-5 transform transition-transform duration-200 ${
													open
														? "rotate-180 text-orange-600"
														: "rotate-0 text-slate-400"
												}`}
												viewBox="0 0 24 24"
												fill="currentColor"
												aria-hidden="true"
											>
												<path
													fillRule="evenodd"
													d="M5.23 7.21a.75.75 0 011.06-.02L10 10.67l3.71-3.48a.75.75 0 111.04 1.08l-4.25 4a.75.75 0 01-1.04 0l-4.25-4a.75.75 0 01-.02-1.06z"
													clipRule="evenodd"
												/>
											</svg>
										</div>
									</div>

									{open && (
										<div className="grid grid-flow-col">
											<div className="px-4 py-4 bg-white">
												{/* Kekurangan */}
												{groupedKekurangan[kelas] &&
													groupedKekurangan[kelas].length > 0 && (
														<div className="mb-4">
															<h5 className="font-bold text-red-600 mb-1">
																Kekurangan Nutrisi
															</h5>
															<ul className="list-disc list-inside text-sm text-slate-700">
																{groupedKekurangan[kelas].map((item, idx) => (
																	<li key={idx}>{item.nutrient}</li>
																))}
															</ul>
														</div>
													)}

												{/* Saran */}
												{groupedSaran[kelas] &&
													groupedSaran[kelas].length > 0 && (
														<div>
															<h5 className="font-semibold text-green-600 mb-1">
																Rekomendasi Menu
															</h5>
															<ul className="list-disc list-inside text-sm text-slate-700">
																{groupedSaran[kelas].map((item, idx) => (
																	<li key={idx}>
																		{item.nama} - {item.serving} gram
																	</li>
																))}
															</ul>
														</div>
													)}

                        {chartData.length > 0 && (
                          <div className='mb-4'>
                            <div className='flex items-center justify-between mb-3'>
                              <h5 className='font-semibold text-blue-600'>
                                {showPercentage ? 'Persentase Pencapaian Target' : 'Nilai Nutrisi vs Target'} (1/3 Kebutuhan Harian)
                              </h5>
                              {/* ✅ Toggle Switch */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setShowPercentage(!showPercentage)
                                }}
                                className='flex items-center gap-2 px-3 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-700 text-xs font-semibold rounded-lg transition-colors'
                              >
                                <svg className='w-4 h-4' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4' />
                                </svg>
                                {showPercentage ? 'Lihat Nilai' : 'Lihat %'}
                              </button>
                            </div>
                            <ResponsiveContainer width='100%' height={350}>
                              <BarChart
                                data={chartData}
                                margin={{
                                  top: 30,
                                  right: 30,
                                  left: 20,
                                  bottom: 80
                                }}
                              >
                                <CartesianGrid strokeDasharray='3 3' />
                                <XAxis
                                  dataKey='nutrient'
                                  angle={-45}
                                  textAnchor='end'
                                  height={80}
                                />
                                <YAxis 
                                  label={{ 
                                    value: showPercentage ? 'Persentase (%)' : 'Nilai', 
                                    angle: -90, 
                                    position: 'insideLeft' 
                                  }}
                                  domain={showPercentage ? [0, 'auto'] : [0, 'auto']}
                                  allowDataOverflow
                                />
                                <Tooltip
                                  content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                      const data = payload[0].payload
                                      return (
                                        <div className="bg-white p-3 border-2 border-slate-300 rounded-lg shadow-lg">
                                          <p className="font-bold text-slate-800">{data.nutrient}</p>
                                          <p className="text-sm text-[#10B981]">
                                            Aktual: <span className="font-semibold">{data.actual.toFixed(2)} {data.unit}</span>
                                          </p>
                                          <p className="text-sm text-[#F59E0B]">
                                            Target: <span className="font-semibold">{data.target.toFixed(2)} {data.unit}</span>
                                          </p>
                                          {showPercentage ? (
                                            
                                          <p className={`text-sm font-bold mt-1 ${data.percentage >= 100 ? 'text-green-600' : 'text-red-600'}`}>
                                            Pencapaian: {data.percentage.toFixed(1)}%
                                          </p>
                                          ) : <></>}
                                        </div>
                                      )
                                    }
                                    return null
                                  }}
                                />
                                <Legend />
                                {showPercentage ? (
                                  <Bar
                                    dataKey='percentage'
                                    name='Pencapaian (%)'
                                    label={{ position: 'top', formatter: (value) => `${value.toFixed(0)}%` }}
                                    offset={5}
                                  >
                                    {chartData.map((entry, index) => (
                                      <Cell key={`cell-${index}`} fill={entry.percentage >= 100 ? '#10B981' : '#EF4444'} />
                                    ))}
                                  </Bar>
                                ) : (
                                  <>
                                    <Bar
                                      dataKey='actual'
                                      fill='#10B981'
                                      name='Aktual'
                                    />
                                    <Bar
                                      dataKey='target'
                                      fill='#F59E0B'
                                      name='Target (1/3)'
                                    />
                                  </>
                                )}
                              </BarChart>
                            </ResponsiveContainer>
                            
                            {/* ✅ Legend dengan penjelasan */}
                            {showPercentage && (
                              <div className='mt-3 flex items-center gap-4 text-xs'>
                                <div className='flex items-center gap-2'>
                                  <div className='w-4 h-4 bg-green-500 rounded'></div>
                                  <span className='text-slate-600'>≥ 100% (Memenuhi target)</span>
                                </div>
                                <div className='flex items-center gap-2'>
                                  <div className='w-4 h-4 bg-red-500 rounded'></div>
                                  <span className='text-slate-600'>&lt; 100% (Kurang dari target)</span>
                                </div>
                              </div>
                            )}
                            
                            <p className='text-xs text-slate-500 mt-2'>
                              Target menunjukkan 1/3 dari kebutuhan harian (untuk 1 kali makan).
                              {!showPercentage && ' Hover pada bar untuk melihat persentase pencapaian.'}
                            </p>
                          </div>
                        )}
                      </div>

											{/* Kolom Kanan - Label Gizi */}
											<div>
												<div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg w-full flex flex-col items-center">
													<div className="flex items-center justify-between mb-6 w-full gap-4">
														<div className="flex items-center gap-2 sm:gap-3">
															<NextImage
																src="/pdf-icon.png"
																alt="PDF Icon"
																width={20}
																height={20}
																className="w-5 h-5 flex-shrink-0"
																style={{ objectFit: "contain" }}
															/>
															<h2 className="text-xl sm:text-2xl font-bold text-orange-500 whitespace-nowrap">
																Total Nilai Gizi
															</h2>
														</div>
														<button
															onClick={(e) => {
																e.stopPropagation();
																handlePrintPDF();
															}}
															disabled={isPrinting || !hasResults}
															className="py-2 px-3 sm:px-4 bg-[#202020]/10 text-[#202020]/80 text-xs sm:text-sm font-semibold rounded-lg hover:bg-[#202020]/20 border border-[#202020]/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
														>
															{isPrinting ? "Mencetak..." : "Cetak PDF"}
														</button>
													</div>

													<div ref={nutritionLabelRef}>
														<NutritionLabel
															data={totalLabel}
                              goals={goals}
															classGrade={index + 1}
															fromRecCard={true}
														/>
													</div>
												</div>
											</div>
										</div>

										// sampai sini
									)}
								</div>
							);
						})}
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
