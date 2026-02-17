// /frontend/src/components/Plate.js
import { useDroppable } from '@dnd-kit/core';

export default function Plate({ recipes, onRemove, onIncrease, onDecrease, onUpdateQuantity, onQuantityBlur }) {
  const { setNodeRef, isOver } = useDroppable({
    id: 'plate',
  });

  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-800 flex items-center">
          <svg className="w-6 h-6 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Piring Anda
        </h3>
        {recipes.length > 0 && (
          <span className="text-sm text-gray-600 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full shadow-sm">
            {recipes.length} resep
          </span>
        )}
      </div>

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
          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500">
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
            <div className="grid grid-cols-2 gap-3 max-w-md">
              {recipes.map(recipe => (
                <div
                  key={recipe.id}
                  className="relative group bg-white/95 backdrop-blur-sm border-2 border-green-300 rounded-xl p-3 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
                >
                  <div className="flex flex-col">
                    <h4 className="font-bold text-gray-800 text-sm line-clamp-2">{recipe.nama}</h4>
                    <p className="text-xs text-gray-600 mt-1">
                      {recipe.kategori || 'Menu'}
                    </p>
                    <p className="text-xs text-green-700 font-semibold mt-1">
                      {((recipe.total_gramasi || 0) * (recipe.quantity || 1)).toFixed(1)}g
                    </p>
                    
                    {/* Quantity Controls */}
                    <div className="flex items-center justify-center gap-2 mt-2 bg-orange-50 rounded-lg p-1">
                      <button
                        onClick={() => onDecrease(recipe.id)}
                        disabled={recipe.quantity <= 0.1}
                        className="w-6 h-6 flex items-center justify-center bg-orange-400 text-white rounded-md hover:bg-orange-500 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
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
                        className="w-14 text-sm font-bold text-gray-700 text-center border border-orange-200 rounded px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-orange-400 focus:border-orange-400 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      <span className="text-xs text-gray-600">×</span>
                      <button
                        onClick={() => onIncrease(recipe.id)}
                        className="w-6 h-6 flex items-center justify-center bg-orange-400 text-white rounded-md hover:bg-orange-500 transition-colors"
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
