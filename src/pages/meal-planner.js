// /frontend/src/pages/meal-planner.js
import { useState, useEffect } from 'react'
import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core'
import RecipeItem from '../components/RecipeItem'
import Plate from '../components/Plate'
import NutritionChart from '../components/NutritionChart'
import NutritionLabel from '../components/NutritionLabel'
import ChefNavbar from '../components/ChefNavbar'
import { useRouter } from 'next/router'
import { getAllRecipes } from '../services/api'
import { goals, classNames } from '../utils/goals'

export default function MealPlanner () {
  const router = useRouter()
  const [recipes, setRecipes] = useState([])
  const [plateRecipes, setPlateRecipes] = useState([])
  const [targetClass, setTargetClass] = useState(6) // Default: SD Kelas 4
  const [activeId, setActiveId] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  // Save to localStorage whenever plateRecipes or targetClass changes
  useEffect(() => {
    if (plateRecipes.length > 0) {
      localStorage.setItem('plateRecipes', JSON.stringify(plateRecipes))
    }
  }, [plateRecipes])

  useEffect(() => {
    localStorage.setItem('targetClass', targetClass.toString())
  }, [targetClass])

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8
      }
    })
  )

  useEffect(() => {
    // Load recipes from backend API
    const fetchRecipes = async () => {
      setIsLoading(true)
      try {
        const recipeData = await getAllRecipes()
        console.log('📥 Loaded recipes:', recipeData)
        // Ensure we always have an array
        let recipesArray = Array.isArray(recipeData)
          ? recipeData
          : recipeData?.recipes || []

        // Parse nutrisi if it's a JSON string
        recipesArray = recipesArray.map(recipe => ({
          ...recipe,
          nutrisi:
            typeof recipe.nutrisi === 'string'
              ? JSON.parse(recipe.nutrisi)
              : recipe.nutrisi
        }))

        console.log('📋 Processed recipes with nutrisi:', recipesArray)
        setRecipes(recipesArray)
      } catch (error) {
        console.error('Error loading recipes:', error)
        setRecipes([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchRecipes()
  }, [])

  const handleDragStart = event => {
    setActiveId(event.active.id)
  }

  const handleDragEnd = event => {
    const { active, over } = event

    if (over && over.id === 'plate') {
      // Ensure recipes is an array before using find
      if (Array.isArray(recipes)) {
        const recipe = recipes.find(r => r.id === parseInt(active.id))
        if (recipe && !plateRecipes.find(r => r.id === recipe.id)) {
          setPlateRecipes([...plateRecipes, { ...recipe, quantity: 1 }])
        }
      }
    }

    setActiveId(null)
  }

  const removeFromPlate = recipeId => {
    setPlateRecipes(plateRecipes.filter(r => r.id !== recipeId))
  }

  const increaseQuantity = recipeId => {
    setPlateRecipes(
      plateRecipes.map(r =>
        r.id === recipeId
          ? { ...r, quantity: parseFloat(((r.quantity || 1) + 0.1).toFixed(1)) }
          : r
      )
    )
  }

  const decreaseQuantity = recipeId => {
    setPlateRecipes(
      plateRecipes.map(r =>
        r.id === recipeId && (r.quantity || 1) > 0.1
          ? { ...r, quantity: parseFloat(((r.quantity || 1) - 0.1).toFixed(1)) }
          : r
      )
    )
  }

  const updateQuantity = (recipeId, newQuantity) => {
    setPlateRecipes(
      plateRecipes.map(r =>
        r.id === recipeId ? { ...r, quantity: newQuantity } : r
      )
    )
  }

  const handleQuantityBlur = (recipeId, currentQuantity) => {
    const quantity = parseFloat(currentQuantity)
    if (currentQuantity === '' || isNaN(quantity) || quantity <= 0) {
      setPlateRecipes(
        plateRecipes.map(r => (r.id === recipeId ? { ...r, quantity: 1 } : r))
      )
    } else {
      setPlateRecipes(
        plateRecipes.map(r =>
          r.id === recipeId
            ? { ...r, quantity: parseFloat(quantity.toFixed(1)) }
            : r
        )
      )
    }
  }

  const getPlateNutritionData = () => {
    const aggregated = aggregateNutrients()
    const target = goals[targetClass]

    const totalGramasi = plateRecipes.reduce((sum, recipe) => {
      return sum + (recipe.total_gramasi || 0) * (recipe.quantity || 1)
    }, 0)

    const calculatePercentage = (actual, goal) => {
      if (!goal) return 0
      return ((actual / goal) * 100).toFixed(1) + '%'
    }

    return {
      takaran_saji_g: totalGramasi || 100,
      informasi_nilai_gizi: {
        energi_kkal: aggregated.energi_kkal,
        lemak_g: aggregated.lemak_g,
        protein_g: aggregated.protein_g,
        karbohidrat_g: aggregated.karbohidrat_g,
        serat_g: aggregated.serat_g,
        natrium_mg: aggregated.natrium_mg || 0,
        kalium_mg: aggregated.kalium_mg || 0,
        kalsium_mg: aggregated.kalsium_mg || 0,
        besi_mg: aggregated.besi_mg || 0,
        vitamin_c_mg: aggregated.vitamin_c_mg || 0
      },
      persen_akg: {
        lemak_g: calculatePercentage(aggregated.lemak_g, target.lemak_g),
        protein_g: calculatePercentage(aggregated.protein_g, target.protein_g),
        karbohidrat_g: calculatePercentage(
          aggregated.karbohidrat_g,
          target.karbohidrat_g
        ),
        serat_g: calculatePercentage(aggregated.serat_g, target.serat_g),
        natrium_mg: calculatePercentage(
          aggregated.natrium_mg || 0,
          target.natrium_mg
        ),
        kalium_mg: calculatePercentage(
          aggregated.kalium_mg || 0,
          target.kalium_mg
        ),
        kalsium_mg: calculatePercentage(
          aggregated.kalsium_mg || 0,
          target.kalsium_mg
        ),
        besi_mg: calculatePercentage(
          aggregated.besi_mg || 0,
          target.besi_mg || 1
        ),
        vitamin_c_mg: calculatePercentage(
          aggregated.vitamin_c_mg || 0,
          target.vitamin_c_mg
        )
      }
    }
  }

  const aggregateNutrients = () => {
    const result = plateRecipes.reduce(
      (acc, recipe) => {
        console.log('Recipe on plate:', recipe)
        const nutrisi = recipe.nutrisi || {}
        const quantity = recipe.quantity || 1
        acc.energi_kkal += (parseFloat(nutrisi.energi_kkal) || 0) * quantity
        acc.protein_g += (parseFloat(nutrisi.protein_g) || 0) * quantity
        acc.karbohidrat_g += (parseFloat(nutrisi.karbohidrat_g) || 0) * quantity
        acc.lemak_g += (parseFloat(nutrisi.lemak_g) || 0) * quantity
        acc.serat_g += (parseFloat(nutrisi.serat_g) || 0) * quantity
        acc.natrium_mg += (parseFloat(nutrisi.natrium_mg) || 0) * quantity
        acc.kalium_mg += (parseFloat(nutrisi.kalium_mg) || 0) * quantity
        acc.kalsium_mg += (parseFloat(nutrisi.kalsium_mg) || 0) * quantity
        acc.besi_mg += (parseFloat(nutrisi.besi_mg) || 0) * quantity
        acc.vitamin_c_mg += (parseFloat(nutrisi.vitamin_c_mg) || 0) * quantity
        return acc
      },
      {
        energi_kkal: 0,
        protein_g: 0,
        karbohidrat_g: 0,
        lemak_g: 0,
        serat_g: 0,
        natrium_mg: 0,
        kalium_mg: 0,
        kalsium_mg: 0,
        besi_mg: 0,
        vitamin_c_mg: 0
      }
    )

    console.log('Aggregated nutrients:', result)
    return result
  }

  const activeRecipe =
    Array.isArray(recipes) && activeId
      ? recipes.find(r => r.id === parseInt(activeId))
      : null

  // Filter recipes based on search query
  const filteredRecipes = recipes.filter(recipe => {
    if (!searchQuery.trim()) return true
    const query = searchQuery.toLowerCase()
    return (
      recipe.nama?.toLowerCase().includes(query) ||
      recipe.kategori?.toLowerCase().includes(query)
    )
  })

  return (
    <div className='flex flex-col min-h-screen'>
      <ChefNavbar />

      <div className='flex-grow bg-gray-50'>
        <div className='bg-white shadow-sm border-b border-gray-200 mb-6'>
          <div className='max-w-7xl mx-auto px-4 py-4'>
            <div className='flex items-center justify-between'>
              <div>
                <h1 className='text-2xl font-bold text-gray-800'>
                  Meal Planner
                </h1>
                <p className='text-sm text-gray-600 mt-1'>
                  Seret menu ke piring untuk melihat total nutrisi
                </p>
              </div>
              <button
                onClick={() => router.push('/')}
                className='px-4 py-2 bg-orange-400 hover:bg-orange-500 text-white rounded-lg transition-colors'
              >
                ← Kembali ke Dashboard
              </button>
            </div>
          </div>
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className='max-w-7xl mx-auto px-4'>
            <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6'>
              {/* Recipes Sidebar */}
              <div className='lg:col-span-1 bg-white rounded-lg shadow-md p-6 flex flex-col'>
                <h2 className='text-xl font-bold text-gray-800 mb-4'>
                  Menu Tersedia
                </h2>

                {/* Search Input */}
                <div className='mb-4'>
                  <div className='relative'>
                    <input
                      type='text'
                      placeholder='Cari menu...'
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className='w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm'
                    />
                    <svg
                      className='absolute left-3 top-2.5 h-5 w-5 text-gray-400'
                      fill='none'
                      viewBox='0 0 24 24'
                      stroke='currentColor'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
                      />
                    </svg>
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className='absolute right-3 top-2.5 text-gray-400 hover:text-gray-600'
                      >
                        <svg
                          className='h-5 w-5'
                          fill='none'
                          viewBox='0 0 24 24'
                          stroke='currentColor'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M6 18L18 6M6 6l12 12'
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>

                <div className='space-y-3 max-h-96 overflow-y-auto'>
                  {isLoading ? (
                    <p className='text-gray-500 text-center py-8'>
                      Memuat resep...
                    </p>
                  ) : !Array.isArray(recipes) || recipes.length === 0 ? (
                    <p className='text-gray-500 text-center py-8'>
                      Belum ada resep tersimpan. Silakan tambah resep baru di
                      Dashboard.
                    </p>
                  ) : filteredRecipes.length === 0 ? (
                    <p className='text-gray-500 text-center py-8'>
                      Tidak ada resep yang cocok dengan pencarian {searchQuery}
                    </p>
                  ) : (
                    filteredRecipes.map(recipe => (
                      <RecipeItem key={recipe.id} recipe={recipe} />
                    ))
                  )}
                </div>
              </div>

              {/* Plate Area */}
              <div className='lg:col-span-2 flex flex-col'>
                <Plate
                  recipes={plateRecipes}
                  onRemove={removeFromPlate}
                  onIncrease={increaseQuantity}
                  onDecrease={decreaseQuantity}
                  onUpdateQuantity={updateQuantity}
                  onQuantityBlur={handleQuantityBlur}
                />
              </div>
            </div>

            {/* Bottom Row: AKG and Chart spanning full width */}
            {plateRecipes.length > 0 && (
              <div>
                {/* View Details Button */}
                <div className='flex justify-center mb-6'>
                  <button
                    onClick={() => router.push('/meal-details')}
                    className='px-6 py-3 bg-orange-400 hover:bg-orange-500 text-white rounded-lg transition-colors font-medium shadow-md flex items-center gap-2'
                  >
                    <svg
                      className='w-5 h-5'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
                      />
                    </svg>
                    Lihat Detail Bahan & Nutrisi
                  </button>
                </div>

                <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                  {/* Nutrition Label */}
                  <div className='bg-white rounded-lg shadow-md p-6 flex flex-col items-center'>
                    <div className='flex items-center justify-between mb-4 w-full'>
                      <h3 className='text-lg font-bold text-orange-500'>
                        Total Nilai Gizi
                      </h3>
                      <select
                        value={targetClass}
                        onChange={e => setTargetClass(parseInt(e.target.value))}
                        className='px-4 py-2 border border-orange-300 bg-white rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm font-medium'
                      >
                        <option value={1}>TK A</option>
                        <option value={2}>TK B</option>
                        <option value={3}>SD Kelas 1</option>
                        <option value={4}>SD Kelas 2</option>
                        <option value={5}>SD Kelas 3</option>
                        <option value={6}>SD Kelas 4</option>
                        <option value={7}>SD Kelas 5</option>
                        <option value={8}>SD Kelas 6</option>
                        <option value={9}>SMP Kelas 1</option>
                        <option value={10}>SMP Kelas 2</option>
                        <option value={11}>SMP Kelas 3</option>
                        <option value={12}>SMA Kelas 1</option>
                        <option value={13}>SMA Kelas 2</option>
                        <option value={14}>SMA Kelas 3</option>
                      </select>
                    </div>
                    <div className='transform scale-95'>
                      <NutritionLabel
                        data={getPlateNutritionData()}
                        goals={goals}
                        classGrade={targetClass}
                        isMini={false}
                      />
                    </div>
                    <p className='text-xs text-orange-600 mt-3 text-center'>
                      <span className='font-semibold'>ℹ️</span> Persentase
                      berdasarkan kebutuhan harian {classNames[targetClass]}.
                      Grafik menampilkan 1/3 kebutuhan harian.
                    </p>
                  </div>

                  {/* Nutrition Chart */}
                  <div className='bg-white rounded-lg shadow-md p-6'>
                    <h2 className='text-xl font-bold text-gray-800 mb-4'>
                      Grafik Nutrisi
                    </h2>
                    <NutritionChart
                      nutrients={aggregateNutrients()}
                      targetClass={targetClass}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <DragOverlay>
            {activeRecipe ? (
              <div className='bg-orange-100 border-2 border-orange-400 rounded-lg p-4 shadow-lg opacity-80'>
                <RecipeItem recipe={activeRecipe} />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  )
}
