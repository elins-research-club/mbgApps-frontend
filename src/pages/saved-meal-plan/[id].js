// /frontend/src/pages/saved-meal-plan/[id].js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import NutritionLabel from '../../components/NutritionLabel';
import { getMealPlanById } from '../../services/api';
import { goals, classNames } from '../../utils/goals';

export default function SavedMealPlan() {
  const router = useRouter();
  const { id } = router.query;
  const [mealPlan, setMealPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;

    const fetchMealPlan = async () => {
      try {
        setLoading(true);
        const response = await getMealPlanById(id);
        console.log('Fetched meal plan response:', response);
        
        const data = response.data || response;
        
        // Parse JSON strings from database
        const parsedData = {
          ...data,
          recipes: typeof data.recipes === 'string' ? JSON.parse(data.recipes) : data.recipes,
          totalNutrition: typeof data.totalNutrition === 'string' ? JSON.parse(data.totalNutrition) : data.totalNutrition
        };
        
        setMealPlan(parsedData);
      } catch (err) {
        console.error('Error fetching meal plan:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMealPlan();
  }, [id]);

  const getPlateNutritionData = () => {
    if (!mealPlan || !mealPlan.totalNutrition) return null;
    
    const targetClass = mealPlan.targetClass || 6;
    const target = goals[targetClass];
    const totalNutrition = mealPlan.totalNutrition;
    
    const totalGramasi = mealPlan.recipes.reduce((sum, recipe) => {
      return sum + (recipe.total_gramasi || 0) * (parseFloat(recipe.quantity) || 1);
    }, 0);

    const calculatePercentage = (actual, goal) => {
      if (!goal) return '0%';
      return ((actual / goal) * 100).toFixed(1) + '%';
    };

    return {
      takaran_saji_g: totalGramasi || 100,
      informasi_nilai_gizi: {
        energi_kkal: totalNutrition.energi_kkal || 0,
        lemak_g: totalNutrition.lemak_g || 0,
        protein_g: totalNutrition.protein_g || 0,
        karbohidrat_g: totalNutrition.karbohidrat_g || 0,
        serat_g: totalNutrition.serat_g || 0,
        natrium_mg: totalNutrition.natrium_mg || 0,
        kalium_mg: totalNutrition.kalium_mg || 0,
        kalsium_mg: totalNutrition.kalsium_mg || 0,
        besi_mg: totalNutrition.besi_mg || 0,
        vitamin_c_mg: totalNutrition.vitamin_c_mg || 0
      },
      persen_akg: {
        lemak_g: calculatePercentage(totalNutrition.lemak_g, target.lemak_g),
        protein_g: calculatePercentage(totalNutrition.protein_g, target.protein_g),
        karbohidrat_g: calculatePercentage(totalNutrition.karbohidrat_g, target.karbohidrat_g),
        serat_g: calculatePercentage(totalNutrition.serat_g, target.serat_g),
        natrium_mg: calculatePercentage(totalNutrition.natrium_mg || 0, target.natrium_mg),
        kalium_mg: calculatePercentage(totalNutrition.kalium_mg || 0, target.kalium_mg),
        kalsium_mg: calculatePercentage(totalNutrition.kalsium_mg || 0, target.kalsium_mg),
        besi_mg: calculatePercentage(totalNutrition.besi_mg || 0, target.besi_mg || 1),
        vitamin_c_mg: calculatePercentage(totalNutrition.vitamin_c_mg || 0, target.vitamin_c_mg)
      }
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Memuat meal plan...</p>
        </div>
      </div>
    );
  }

  if (error || !mealPlan) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <svg className="w-20 h-20 mx-auto text-red-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Meal Plan Tidak Ditemukan</h2>
          <p className="text-gray-600 mb-6">{error || 'Meal plan tidak tersedia atau telah dihapus.'}</p>
        </div>
      </div>
    );
  }

  const nutritionData = getPlateNutritionData();
  const targetClass = mealPlan.targetClass || 6;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-orange-100 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="bg-orange-100 p-2 rounded-lg">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="flex-1">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Rencana Makan</h1>
              <p className="text-xs sm:text-sm text-gray-600">{classNames[targetClass]}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Nutrition Summary Card */}
        <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-bold text-orange-600 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Informasi Nilai Gizi
          </h2>
          
          {nutritionData && (
            <div className="scale-95 sm:scale-100 origin-top">
              <NutritionLabel
                data={nutritionData}
                goals={goals}
                classGrade={targetClass}
                isMini={false}
              />
            </div>
          )}
          
          <p className="text-xs text-orange-600 mt-4 text-center">
            Persentase berdasarkan kebutuhan harian {classNames[targetClass]}
          </p>
        </div>

        {/* Recipes List */}
        <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Menu & Bahan-Bahan
          </h2>
          
          <div className="space-y-4">
            {mealPlan.recipes.map((recipe, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 hover:border-orange-300 transition-colors">
                <div className="flex items-start justify-between mb-3 flex-wrap gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base sm:text-lg font-bold text-gray-800 break-words">
                      {index + 1}. {recipe.nama}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <span className="text-xs sm:text-sm px-2 py-1 bg-orange-100 text-orange-700 rounded-full">
                        {recipe.kategori || 'Menu'}
                      </span>
                      <span className="text-xs sm:text-sm font-semibold text-orange-600">
                        {typeof recipe.quantity === 'number' ? recipe.quantity.toFixed(1) : recipe.quantity}× porsi
                      </span>
                    </div>
                  </div>
                  <div className="bg-orange-50 px-3 py-1 rounded-lg">
                    <p className="text-sm font-semibold text-orange-700 whitespace-nowrap">
                      {((recipe.total_gramasi || 0) * (parseFloat(recipe.quantity) || 1)).toFixed(0)}g
                    </p>
                  </div>
                </div>
                
                {/* Ingredients */}
                {recipe.rincian_bahan && Array.isArray(recipe.rincian_bahan) && recipe.rincian_bahan.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-3 sm:p-4 mt-3">
                    <h4 className="text-xs sm:text-sm font-semibold text-gray-700 mb-2">Bahan:</h4>
                    <ul className="space-y-1.5">
                      {recipe.rincian_bahan.map((ingredient, idx) => (
                        <li key={idx} className="flex items-start text-xs sm:text-sm">
                          <span className="text-orange-500 mr-2 mt-0.5">•</span>
                          <span className="text-gray-700 flex-1 break-words">
                            <span className="font-medium">{ingredient.nama || 'Bahan'}</span>
                            {ingredient.gramasi && (
                              <span className="text-gray-600">
                                {' '}- {(parseFloat(ingredient.gramasi) * (parseFloat(recipe.quantity) || 1)).toFixed(1)} g
                              </span>
                            )}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer Info */}
        <div className="bg-orange-50 rounded-xl p-4 sm:p-6 text-center border border-orange-100">
          <p className="text-xs sm:text-sm text-gray-600 mb-2">
            Meal plan dibuat pada {new Date(mealPlan.createdAt).toLocaleDateString('id-ID', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
          <p className="text-xs text-gray-500">
            Powered by MBG Apps
          </p>
        </div>
      </div>
    </div>
  );
}
