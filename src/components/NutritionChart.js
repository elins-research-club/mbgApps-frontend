// /frontend/src/components/NutritionChart.js
import { useState } from 'react';
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
} from 'recharts';

export default function NutritionChart({ nutrients, targetClass }) {
  const [showPercentage, setShowPercentage] = useState(true);
  
  console.log('NutritionChart received nutrients:', nutrients);
  console.log('NutritionChart received targetClass:', targetClass);
  
  // Target nutritional values from AKG (same as RecommendationCard)
  const goals = {
    1: { energi_kkal: 1350, protein_g: 20, lemak_g: 45, karbohidrat_g: 215, serat_g: 19 },
    2: { energi_kkal: 1400, protein_g: 25, lemak_g: 50, karbohidrat_g: 250, serat_g: 20 },
    3: { energi_kkal: 1650, protein_g: 40, lemak_g: 55, karbohidrat_g: 250, serat_g: 23 },
    4: { energi_kkal: 1650, protein_g: 40, lemak_g: 55, karbohidrat_g: 250, serat_g: 23 },
    5: { energi_kkal: 1650, protein_g: 40, lemak_g: 55, karbohidrat_g: 250, serat_g: 23 },
    6: { energi_kkal: 2000, protein_g: 50, lemak_g: 65, karbohidrat_g: 300, serat_g: 28 },
    7: { energi_kkal: 2000, protein_g: 50, lemak_g: 65, karbohidrat_g: 300, serat_g: 28 },
    8: { energi_kkal: 2000, protein_g: 50, lemak_g: 65, karbohidrat_g: 300, serat_g: 28 },
    9: { energi_kkal: 2150, protein_g: 60, lemak_g: 70, karbohidrat_g: 350, serat_g: 33 },
    10: { energi_kkal: 2150, protein_g: 60, lemak_g: 70, karbohidrat_g: 350, serat_g: 33 },
    11: { energi_kkal: 2150, protein_g: 60, lemak_g: 70, karbohidrat_g: 350, serat_g: 33 },
    12: { energi_kkal: 2650, protein_g: 70, lemak_g: 85, karbohidrat_g: 400, serat_g: 38 },
    13: { energi_kkal: 2650, protein_g: 70, lemak_g: 85, karbohidrat_g: 400, serat_g: 38 },
    14: { energi_kkal: 2650, protein_g: 70, lemak_g: 85, karbohidrat_g: 400, serat_g: 38 },
  };

  const targets = goals[targetClass] || goals[1];
  
  // Prepare chart data with percentage calculation
  const chartData = [
    {
      nutrient: 'Energi',
      actual: nutrients.energi_kkal || 0,
      target: (targets.energi_kkal || 0) / 3,
      percentage: ((nutrients.energi_kkal || 0) / ((targets.energi_kkal || 0) / 3)) * 100,
      unit: 'kkal'
    },
    {
      nutrient: 'Protein',
      actual: nutrients.protein_g || 0,
      target: (targets.protein_g || 0) / 3,
      percentage: ((nutrients.protein_g || 0) / ((targets.protein_g || 0) / 3)) * 100,
      unit: 'g'
    },
    {
      nutrient: 'Lemak',
      actual: nutrients.lemak_g || 0,
      target: (targets.lemak_g || 0) / 3,
      percentage: ((nutrients.lemak_g || 0) / ((targets.lemak_g || 0) / 3)) * 100,
      unit: 'g'
    },
    {
      nutrient: 'Karbohidrat',
      actual: nutrients.karbohidrat_g || 0,
      target: (targets.karbohidrat_g || 0) / 3,
      percentage: ((nutrients.karbohidrat_g || 0) / ((targets.karbohidrat_g || 0) / 3)) * 100,
      unit: 'g'
    },
    {
      nutrient: 'Serat',
      actual: nutrients.serat_g || 0,
      target: (targets.serat_g || 0) / 3,
      percentage: ((nutrients.serat_g || 0) / ((targets.serat_g || 0) / 3)) * 100,
      unit: 'g'
    }
  ];

  return (
    <div className='bg-white rounded-lg shadow-md p-6'>
      {/* Toggle Button */}
      <div className='flex items-center justify-between mb-3'>
        <h5 className='font-semibold text-blue-600'>
          {showPercentage ? 'Persentase Pencapaian Target' : 'Nilai Nutrisi vs Target'} (1/3 Kebutuhan Harian)
        </h5>
        <button
          onClick={() => setShowPercentage(!showPercentage)}
          className='flex items-center gap-2 px-3 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-700 text-xs font-semibold rounded-lg transition-colors'
        >
          <svg className='w-4 h-4' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4' />
          </svg>
          {showPercentage ? 'Lihat Nilai' : 'Lihat %'}
        </button>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={chartData}
          margin={{
            top: 30,
            right: 30,
            left: 20,
            bottom: 80
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="nutrient"
            angle={-45}
            textAnchor="end"
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
                const data = payload[0].payload;
                const deficiency = data.target - data.actual;
                return (
                  <div className="bg-white p-3 border-2 border-slate-300 rounded-lg shadow-lg">
                    <p className="font-bold text-slate-800">{data.nutrient}</p>
                    <p className="text-sm text-[#10B981]">
                      Aktual: <span className="font-semibold">{data.actual.toFixed(2)} {data.unit}</span>
                    </p>
                    <p className="text-sm text-[#F59E0B]">
                      Target: <span className="font-semibold">{data.target.toFixed(2)} {data.unit}</span>
                    </p>
                    {showPercentage && (
                      <p className={`text-sm font-bold mt-1 ${
                        data.percentage >= 100 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        Pencapaian: {data.percentage.toFixed(1)}%
                      </p>
                    )}
                    {deficiency > 0 ? (
                      <p className="text-sm font-bold mt-1 text-red-600">
                        Kurang: {deficiency.toFixed(2)} {data.unit}
                      </p>
                    ) : (
                      <p className="text-sm font-bold mt-1 text-green-600">
                        ✓ Tercapai
                      </p>
                    )}
                  </div>
                );
              }
              return null;
            }}
          />
          <Legend />
          {showPercentage ? (
            <Bar
              dataKey='percentage'
              name='Pencapaian (%)'
              label={{ position: 'top', formatter: (value) => `${value.toFixed(0)}%` }}
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

      {/* Legend explanation for percentage mode */}
      {showPercentage && (
        <div className="mt-4 flex justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-[#10B981] rounded"></div>
            <span className="text-slate-600">≥ 100% (Tercapai)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-[#EF4444] rounded"></div>
            <span className="text-slate-600">&lt; 100% (Kurang)</span>
          </div>
        </div>
      )}
    </div>
  );
}
