// /frontend/src/components/Plate.js
import { useDroppable } from '@dnd-kit/core';

export default function Plate({ recipes, onRemove }) {
  const { setNodeRef, isOver } = useDroppable({
    id: 'plate',
  });

  return (
    <div
      ref={setNodeRef}
      className={`plate min-h-[400px] bg-white rounded-lg shadow-md p-6 border-4 border-dashed transition-all ${
        isOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-800 flex items-center">
          <svg className="w-6 h-6 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Piring Anda
        </h3>
        {recipes.length > 0 && (
          <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
            {recipes.length} resep
          </span>
        )}
      </div>

      {recipes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
          <svg className="w-20 h-20 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
          </svg>
          <p className="text-lg font-medium">Seret resep ke sini</p>
          <p className="text-sm mt-1">Drag and drop resep untuk menambahkan ke piring</p>
        </div>
      ) : (
        <div className="space-y-3">
          {recipes.map(recipe => (
            <div
              key={recipe.id}
              className="flex items-center justify-between bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex-1">
                <h4 className="font-bold text-gray-800">{recipe.nama}</h4>
                <p className="text-sm text-gray-600 mt-1">
                  {recipe.kategori || 'Menu'} • {recipe.total_gramasi || 0}g
                </p>
              </div>
              <button
                onClick={() => onRemove(recipe.id)}
                className="ml-4 p-2 text-red-500 hover:bg-red-100 rounded-lg transition-colors"
                title="Hapus dari piring"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
