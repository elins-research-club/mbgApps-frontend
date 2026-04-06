// /frontend/src/components/Plate.js
import { useDroppable } from '@dnd-kit/core';

export default function Plate({ recipes, planName, onPlanNameChange, onRemove, onIncrease, onDecrease, onUpdateQuantity, onQuantityBlur }) {
  const { setNodeRef, isOver } = useDroppable({
    id: 'plate',
  });

  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-[#17191B] flex items-center">
          <svg className="w-6 h-6 mr-2 text-[#452829]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Piring Anda
        </h3>
        {recipes.length > 0 && (
          <span className="text-sm text-[#452829] bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full shadow-sm">
            {recipes.length} resep
          </span>
        )}
      </div>

      {/* Name Input Field */}
      {recipes.length > 0 && (
        <div className="mb-4">
          <label className="block text-sm font-semibold text-[#37393B] mb-2">
            Nama Meal Plan
          </label>
          <input
            type="text"
            value={planName}
            onChange={(e) => onPlanNameChange(e.target.value)}
            placeholder="Contoh: Menu Sehat Anak SD Kelas 4"
            className="w-full px-4 py-2.5 border-2 border-[#D9C7B8] rounded-lg focus:ring-2 focus:ring-[#F3E8DF]0 focus:border-white0 text-sm transition-colors"
          />
        </div>
      )}

      <div
        ref={setNodeRef}
        className={`plate relative min-h-[500px] rounded-lg transition-all ${
          isOver ? 'scale-105' : 'scale-100'
        }`}
        style={{
          backgroundImage: 'url(/plate.png)',
          backgroundSize: 'contain',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        {/* Overlay for hover effect */}
        {isOver && (
          <div className="absolute inset-0 bg-blue-400/20 rounded-lg pointer-events-none" />
        )}

        {recipes.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white0">
            <svg className="w-16 h-16 mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
            </svg>
            <p className="text-lg font-medium bg-white/80 backdrop-blur-sm px-4 py-2 rounded-lg">
              Seret menu ke sini
            </p>
            <p className="text-sm mt-2 bg-white/80 backdrop-blur-sm px-3 py-1 rounded">
              Drag and drop untuk menambahkan
            </p>
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center p-12">
            <div className="grid grid-cols-3 gap-2 w-full max-w-3xl px-8 md:px-12 justify-items-center">
              {recipes.map(recipe => (
                <div
                  key={recipe.id}
                  className="relative group w-full max-w-[170px] bg-white/95 backdrop-blur-sm border-2 border-green-300 rounded-xl p-3 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
                >
                  <div className="flex flex-col">
                    <h4 className="font-bold text-[#17191B] text-sm line-clamp-2">{recipe.nama}</h4>
                    <p className="text-xs text-[#452829] mt-1">
                      {recipe.kategori || 'Menu'}
                    </p>
                    <p className="text-xs text-green-700 font-semibold mt-1">
                      {((recipe.total_gramasi || 0) * (recipe.quantity || 1)).toFixed(1)}g
                    </p>
                    
                    {/* Quantity Controls */}
                    <div className="flex items-center justify-center gap-2 mt-2 bg-white rounded-lg p-1">
                      <button
                        onClick={() => onDecrease(recipe.id)}
                        disabled={recipe.quantity <= 0.1}
                        className="w-6 h-6 flex items-center justify-center bg-white0 text-white rounded-md hover:bg-white0 disabled:bg-[#C9A89A] disabled:cursor-not-allowed transition-colors"
                        title="Kurangi"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M20 12H4" />
                        </svg>
                      </button>
                      <input
                        type="number"
                        step="0.1"
                        value={recipe.quantity === '' || recipe.quantity === undefined ? '' : recipe.quantity}
                        onChange={(e) => onUpdateQuantity(recipe.id, e.target.value)}
                        onBlur={(e) => onQuantityBlur(recipe.id, e.target.value)}
                        className="w-14 text-sm font-bold text-[#37393B] text-center border border-[#E8D1C5] rounded px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-[#F3E8DF]0 focus:border-white0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      <span className="text-xs text-[#452829]">×</span>
                      <button
                        onClick={() => onIncrease(recipe.id)}
                        className="w-6 h-6 flex items-center justify-center bg-white0 text-white rounded-md hover:bg-white0 transition-colors"
                        title="Tambah"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={() => onRemove(recipe.id)}
                    className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-full shadow-md hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                    title="Hapus dari piring"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
