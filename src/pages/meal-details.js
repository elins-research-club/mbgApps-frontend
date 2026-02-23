// /frontend/src/pages/meal-details.js
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import ChefNavbar from '../components/ChefNavbar'
import NutritionLabel from '../components/NutritionLabel'
import { saveMealPlan } from '../services/api'
import { goals, classNames } from '../utils/goals'

export default function MealDetails () {
  const router = useRouter()
  const [plateRecipes, setPlateRecipes] = useState([])
  const [targetClass, setTargetClass] = useState(6)
  const [planName, setPlanName] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [savedPlanId, setSavedPlanId] = useState(null)
  const [qrCodeUrl, setQrCodeUrl] = useState(null)
  const [showQRModal, setShowQRModal] = useState(false)

  useEffect(() => {
    // Load plate recipes from localStorage
    const savedPlateRecipes = localStorage.getItem('plateRecipes')
    const savedTargetClass = localStorage.getItem('targetClass')
    const savedPlanName = localStorage.getItem('planName')

    if (savedPlateRecipes) {
      try {
        const recipes = JSON.parse(savedPlateRecipes)
        const parsedRecipes = recipes.map(recipe => ({
          ...recipe,
          rincian_bahan:
            typeof recipe.rincian_bahan === 'string'
              ? JSON.parse(recipe.rincian_bahan)
              : recipe.rincian_bahan,
          nutrisi:
            typeof recipe.nutrisi === 'string'
              ? JSON.parse(recipe.nutrisi)
              : recipe.nutrisi
        }))
        console.log('Loaded recipes with rincian_bahan:', parsedRecipes)
        setPlateRecipes(parsedRecipes)
      } catch (error) {
        console.error('Error parsing plate recipes:', error)
      }
    }

    if (savedTargetClass) {
      setTargetClass(parseInt(savedTargetClass))
    }

    if (savedPlanName) {
      setPlanName(savedPlanName)
    }
  }, [])

  const aggregateNutrients = () => {
    const result = plateRecipes.reduce(
      (acc, recipe) => {
        const nutrisi = recipe.nutrisi || {}
        const quantity = parseFloat(recipe.quantity) || 1
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

    return result
  }

  const getPlateNutritionData = () => {
    const aggregated = aggregateNutrients()
    const target = goals[targetClass]

    const totalGramasi = plateRecipes.reduce((sum, recipe) => {
      return (
        sum + (recipe.total_gramasi || 0) * (parseFloat(recipe.quantity) || 1)
      )
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

  const handleSaveMealPlan = async () => {
    setIsSaving(true)
    try {
      // Use planName or generate a default name
      const mealPlanName = planName.trim() || `Meal Plan ${new Date().toLocaleDateString('id-ID')}`

      const mealPlanData = {
        name: mealPlanName,
        recipes: plateRecipes.map(r => ({
          id: r.id,
          nama: r.nama,
          kategori: r.kategori,
          quantity: parseFloat(r.quantity) || 1,
          nutrisi: r.nutrisi,
          rincian_bahan: r.rincian_bahan,
          total_gramasi: r.total_gramasi
        })),
        targetClass: targetClass,
        totalNutrition: aggregateNutrients(),
        createdAt: new Date().toISOString()
      }

      const result = await saveMealPlan(mealPlanData)
      console.log('Save meal plan result:', result)

      const planId = result.data.id

      if (!planId) {
        console.error('No ID found in result:', result)
        throw new Error('Server tidak mengembalikan ID untuk meal plan')
      }

      setSavedPlanId(planId)

      const baseUrl = window.location.origin
      const planUrl = `${baseUrl}/saved-meal-plan/${planId}`

      // Use QR Server API for quick QR generation
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
        planUrl
      )}`
      setQrCodeUrl(qrUrl)
      setShowQRModal(true)

      alert('Meal plan berhasil disimpan!')
    } catch (error) {
      console.error('Error saving meal plan:', error)
      alert('Gagal menyimpan meal plan: ' + error.message)
    } finally {
      setIsSaving(false)
    }
  }

  const downloadQRCode = async () => {
    if (!qrCodeUrl) return

    try {
      const response = await fetch(qrCodeUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)

      const link = document.createElement('a')
      link.href = url
      link.download = `meal-plan-qr-${Date.now()}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      // Clean up the object URL
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error downloading QR code:', error)
      alert('Gagal mengunduh QR code. Silakan coba lagi.')
    }
  }

  if (plateRecipes.length === 0) {
    return (
      <div className='flex flex-col min-h-screen'>
        <ChefNavbar />
        <div className='flex-grow bg-gray-50 flex items-center justify-center'>
          <div className='text-center'>
            <svg
              className='w-20 h-20 mx-auto text-gray-400 mb-4'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={1.5}
                d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
              />
            </svg>
            <h2 className='text-2xl font-bold text-gray-800 mb-2'>
              Tidak Ada Menu
            </h2>
            <p className='text-gray-600 mb-6'>
              Silakan tambahkan menu di Meal Planner terlebih dahulu
            </p>
            <button
              onClick={() => router.push('/meal-planner')}
              className='px-6 py-3 bg-orange-400 hover:bg-orange-500 text-white rounded-lg transition-colors'
            >
              ← Kembali ke Meal Planner
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='flex flex-col min-h-screen'>
      <ChefNavbar />

      <div className='flex-grow bg-gray-50'>
        <div className='bg-white shadow-sm border-b border-gray-200 mb-6'>
          <div className='max-w-7xl mx-auto px-4 py-4'>
            <div className='flex items-center justify-between mb-3'>
              <div>
                <h1 className='text-2xl font-bold text-gray-800'>
                  Detail Rencana Makan
                </h1>
                <p className='text-sm text-gray-600 mt-1'>
                  Bahan-bahan dan informasi nutrisi untuk setiap menu
                </p>
              </div>
              <div className='flex gap-3'>
                <button
                  onClick={handleSaveMealPlan}
                  disabled={isSaving}
                  className='px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white rounded-lg transition-colors flex items-center gap-2'
                >
                  {isSaving ? (
                    <>
                      <svg
                        className='animate-spin h-5 w-5'
                        fill='none'
                        viewBox='0 0 24 24'
                      >
                        <circle
                          className='opacity-25'
                          cx='12'
                          cy='12'
                          r='10'
                          stroke='currentColor'
                          strokeWidth='4'
                        ></circle>
                        <path
                          className='opacity-75'
                          fill='currentColor'
                          d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                        ></path>
                      </svg>
                      Menyimpan...
                    </>
                  ) : (
                    <>
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
                          d='M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4'
                        />
                      </svg>
                      Simpan & Generate QR
                    </>
                  )}
                </button>
                <button
                  onClick={() => router.push('/meal-planner')}
                  className='px-4 py-2 bg-orange-400 hover:bg-orange-500 text-white rounded-lg transition-colors'
                >
                  ← Kembali ke Meal Planner
                </button>
              </div>
            </div>
            
            {/* Plan Name Display */}
            <div className='mt-4 pt-4 border-t border-gray-200'>
              <div className='flex items-center gap-3'>
                <label className='text-sm font-semibold text-gray-700 flex items-center gap-2'>
                  <svg className='w-5 h-5 text-orange-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z' />
                  </svg>
                  Nama Meal Plan:
                </label>
                <span className='text-sm font-medium text-gray-800 bg-orange-50 px-4 py-2 rounded-lg border border-orange-200'>
                  {planName || 'Belum ada nama (akan dibuat otomatis saat disimpan)'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className='max-w-7xl mx-auto px-4 pb-8'>
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
            {/* Ingredients List - Takes 2 columns */}
            <div className='lg:col-span-2'>
              <div className='bg-white rounded-lg shadow-md p-6'>
                <h2 className='text-xl font-bold text-gray-800 mb-6'>
                  Bahan-Bahan Menu
                </h2>
                <div className='space-y-6'>
                  {plateRecipes.map((recipe, index) => (
                    <div
                      key={recipe.id}
                      className='border-b border-gray-200 pb-6 last:border-b-0 last:pb-0'
                    >
                      <div className='flex items-start justify-between mb-3'>
                        <div className='flex-1'>
                          <h3 className='text-lg font-bold text-gray-800'>
                            {index + 1}. {recipe.nama}
                          </h3>
                          <div className='flex items-center gap-3 mt-1'>
                            <span className='text-sm text-gray-600'>
                              {recipe.kategori || 'Menu'}
                            </span>
                            <span className='text-sm font-semibold text-orange-600'>
                              {typeof recipe.quantity === 'number'
                                ? recipe.quantity.toFixed(1)
                                : recipe.quantity}
                              × porsi
                            </span>
                          </div>
                        </div>
                        <div className='bg-orange-50 px-3 py-1 rounded-lg'>
                          <p className='text-sm font-semibold text-orange-700'>
                            {(
                              (recipe.total_gramasi || 0) *
                              (parseFloat(recipe.quantity) || 1)
                            ).toFixed(1)}
                            g
                          </p>
                        </div>
                      </div>

                      {/* Ingredients List */}
                      <div className='bg-gray-50 rounded-lg p-4 mt-3'>
                        <h4 className='text-sm font-semibold text-gray-700 mb-3'>
                          Bahan:
                        </h4>
                        {(() => {
                          const ingredients =
                            recipe.rincian_bahan || recipe.bahan
                          console.log('Recipe ingredients:', ingredients)
                          console.log(
                            'Recipe ingredients type:',
                            typeof ingredients
                          )

                          if (!ingredients) {
                            return (
                              <p className='text-sm text-gray-500 italic'>
                                Tidak ada data bahan
                              </p>
                            )
                          }

                          // Handle if ingredients is an array
                          if (
                            Array.isArray(ingredients) &&
                            ingredients.length > 0
                          ) {
                            return (
                              <ul className='space-y-2'>
                                {ingredients.map((ingredient, idx) => (
                                  <li key={idx} className='flex items-start'>
                                    <span className='text-orange-500 mr-2'>
                                      •
                                    </span>
                                    <span className='text-sm text-gray-700'>
                                      <span className='font-medium'>
                                        {ingredient.nama ||
                                          ingredient.name ||
                                          'Bahan'}
                                      </span>
                                      {ingredient.gramasi && (
                                        <span className='text-gray-600'>
                                          {' '}
                                          -{' '}
                                          {(
                                            parseFloat(ingredient.gramasi) *
                                            (parseFloat(recipe.quantity) || 1)
                                          ).toFixed(1)}{' '}
                                          g
                                        </span>
                                      )}
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            )
                          }

                          return (
                            <p className='text-sm text-gray-500 italic'>
                              Tidak ada data bahan (format tidak valid)
                            </p>
                          )
                        })()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Total Nutrition Label - Takes 1 column */}
            <div className='lg:col-span-1'>
              <div className='bg-white rounded-lg shadow-md p-6 sticky top-6'>
                <div className='flex items-center justify-between mb-4'>
                  <h3 className='text-lg font-bold text-orange-500'>
                    Total Nilai Gizi
                  </h3>
                </div>
                <select
                  value={targetClass}
                  onChange={e => {
                    const newClass = parseInt(e.target.value)
                    setTargetClass(newClass)
                    localStorage.setItem('targetClass', newClass.toString())
                  }}
                  className='w-full mb-4 px-4 py-2 border border-orange-300 bg-white rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm font-medium'
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
                <div className='transform scale-90 origin-top'>
                  <NutritionLabel
                    data={getPlateNutritionData()}
                    goals={goals}
                    classGrade={targetClass}
                    isMini={false}
                  />
                </div>
                <p className='text-xs text-orange-600 mt-3 text-center'>
                  Persentase berdasarkan kebutuhan harian{' '}
                  {classNames[targetClass]}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* QR Code Modal */}
      {showQRModal && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
          <div className='bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative'>
            <button
              onClick={() => setShowQRModal(false)}
              className='absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors'
            >
              <svg
                className='w-6 h-6'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M6 18L18 6M6 6l12 12'
                />
              </svg>
            </button>

            <div className='text-center'>
              <div className='mb-4'>
                <div className='inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4'>
                  <svg
                    className='w-8 h-8 text-green-500'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M5 13l4 4L19 7'
                    />
                  </svg>
                </div>
                <h2 className='text-2xl font-bold text-gray-800 mb-2'>
                  Meal Plan Tersimpan!
                </h2>
                <p className='text-gray-600 mb-6'>
                  Scan QR code untuk mengakses meal plan ini kapan saja
                </p>
              </div>

              {qrCodeUrl && (
                <div className='bg-gray-50 rounded-xl p-6 mb-6'>
                  <img
                    src={qrCodeUrl}
                    alt='QR Code'
                    className='mx-auto w-64 h-64 border-4 border-white shadow-lg rounded-lg'
                  />
                </div>
              )}

              <div className='flex gap-3'>
                <button
                  onClick={downloadQRCode}
                  className='flex-1 px-4 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors font-medium flex items-center justify-center gap-2'
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
                      d='M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4'
                    />
                  </svg>
                  Download QR
                </button>
                <button
                  onClick={() => setShowQRModal(false)}
                  className='flex-1 px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors font-medium'
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
