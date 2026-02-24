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
  Line,
  ComposedChart,
} from 'recharts';
import { goals, multipliers } from '../utils/goals';

export default function NutritionChart({ nutrients, targetClass }) {
  const [showPercentage, setShowPercentage] = useState(true);

  const targets = goals[targetClass] || goals[6];

  const multiplier = multipliers[targetClass] || multipliers[6];
  
  const chartData = [
    {
      nutrient: 'Energi',
      actual: nutrients.energi_kkal || 0,
      target: (targets.energi_kkal || 0) * multiplier,
      threshold: ((targets.energi_kkal || 0) * multiplier) * 1.05,
      percentage: ((nutrients.energi_kkal || 0) / ((targets.energi_kkal || 0) * multiplier)) * 100,
      thresholdPercentage: 105, 
      targetPercentage: 100,
      unit: 'kkal'
    },
    {
      nutrient: 'Protein',
      actual: nutrients.protein_g || 0,
      target: (targets.protein_g || 0) * multiplier,
      threshold: ((targets.protein_g || 0) * multiplier) * 1.05, 
      percentage: ((nutrients.protein_g || 0) / ((targets.protein_g || 0) * multiplier)) * 100,
      thresholdPercentage: 105,
      targetPercentage: 100,
      unit: 'g'
    },
    {
      nutrient: 'Lemak',
      actual: nutrients.lemak_g || 0,
      target: (targets.lemak_g || 0) * multiplier,
      threshold: ((targets.lemak_g || 0) * multiplier) * 1.05, 
      percentage: ((nutrients.lemak_g || 0) / ((targets.lemak_g || 0) * multiplier)) * 100,
      thresholdPercentage: 105,
      targetPercentage: 100,
      unit: 'g'
    },
    {
      nutrient: 'Karbohidrat',
      actual: nutrients.karbohidrat_g || 0,
      target: (targets.karbohidrat_g || 0) * multiplier,
      threshold: ((targets.karbohidrat_g || 0) * multiplier) * 1.05, // 5% above target
      percentage: ((nutrients.karbohidrat_g || 0) / ((targets.karbohidrat_g || 0) * multiplier)) * 100,
      thresholdPercentage: 105,
      targetPercentage: 100,
      unit: 'g'
    },
  ];

  // Check if any nutrient exceeds threshold
  const hasExceededThreshold = chartData.some(entry => 
    showPercentage ? entry.percentage > 105 : entry.actual > entry.threshold
  );

  return (
    <div className='bg-white rounded-lg shadow-md p-6'>
      {/* Toggle Button */}
      <div className='flex items-center justify-between mb-3'>
        <h5 className='font-semibold text-blue-600'>
          {showPercentage ? 'Persentase Pencapaian Target (100% = Target)' : 'Nilai Nutrisi vs Target'} ({(multiplier * 100).toFixed(1)}% AKG)
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
        <ComposedChart
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
              value: showPercentage ? '% dari Target' : 'Nilai', 
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
                const excess = data.actual - data.threshold;
                const isOptimal = data.actual >= data.target;
                
                return (
                  <div className="bg-white p-3 border-2 border-slate-300 rounded-lg shadow-lg">
                    <p className="font-bold text-slate-800">{data.nutrient}</p>
                    <p className="text-sm text-[#10B981]">
                      Aktual: <span className="font-semibold">{data.actual.toFixed(2)} {data.unit}</span>
                    </p>
                    <p className="text-sm text-[#F59E0B]">
                      Target: <span className="font-semibold">{data.target.toFixed(2)} {data.unit}</span>
                    </p>
                    <p className="text-sm text-[#EF4444]">
                      Threshold (Target +5%): <span className="font-semibold">{data.threshold.toFixed(2)} {data.unit}</span>
                    </p>
                    {showPercentage && (
                      <p className={`text-sm font-bold mt-1 ${
                        isOptimal ? 'text-green-600' : 'text-red-600'
                      }`}>
                        Pencapaian: {data.percentage.toFixed(1)}% dari target
                      </p>
                    )}
                    {deficiency > 0 ? (
                      <p className="text-sm font-bold mt-1 text-red-600">
                        Kurang: {deficiency.toFixed(2)} {data.unit}
                      </p>
                    ) : excess > 0 ? (
                      <p className="text-sm font-bold mt-1 text-red-600">
                        Berlebih: {excess.toFixed(2)} {data.unit}
                      </p>
                    ) : (
                      <p className="text-sm font-bold mt-1 text-green-600">
                        ✓ Optimal
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
            <>
              <Bar
                dataKey='percentage'
                name='Pencapaian (%)'
                label={{ position: 'top', formatter: (value) => `${value.toFixed(0)}%` }}
              >
                {chartData.map((entry, index) => {
                  const isAchieved = entry.percentage >= 100;
                  return (
                    <Cell key={`cell-${index}`} fill={isAchieved ? '#10B981' : '#EF4444'} />
                  );
                })}
              </Bar>
              {hasExceededThreshold && (
                <Line
                  type="monotone"
                  dataKey="thresholdPercentage"
                  stroke="#DC2626"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="Threshold (105%)"
                  dot={{ fill: '#DC2626', r: 4 }}
                />
              )}
            </>
          ) : (
            <>
              <Bar
                dataKey='actual'
                name='Aktual'
              >
                {chartData.map((entry, index) => {
                  const isAchieved = entry.actual >= entry.target;
                  return (
                    <Cell key={`cell-${index}`} fill={isAchieved ? '#10B981' : '#EF4444'} />
                  );
                })}
              </Bar>
              <Bar
                dataKey='target'
                fill='#F59E0B'
                name={`Target (${(multiplier * 100).toFixed(1)}%)`}
              />
              {hasExceededThreshold && (
                <Line
                  type="monotone"
                  dataKey="threshold"
                  stroke="#DC2626"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="Threshold (Target +5%)"
                  dot={{ fill: '#DC2626', r: 4 }}
                />
              )}
            </>
          )}
        </ComposedChart>
      </ResponsiveContainer>

      {/* Legend explanation */}
      <div className="mt-4 flex justify-center gap-6 text-sm flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-[#10B981] rounded"></div>
          <span className="text-slate-600">Tercapai (≥100% target)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-[#EF4444] rounded"></div>
          <span className="text-slate-600">Kurang (&lt;100%)</span>
        </div>
        {!showPercentage && (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-[#F59E0B] rounded"></div>
            <span className="text-slate-600">Target ({(multiplier * 100).toFixed(1)}% AKG)</span>
          </div>
        )}
        {hasExceededThreshold && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-0.5 bg-[#DC2626] border-dashed" style={{ borderTop: '2px dashed #DC2626' }}></div>
            <span className="text-slate-600">
              {showPercentage ? 'Batas Berlebih (105%)' : 'Batas Berlebih (Target +5%)'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
