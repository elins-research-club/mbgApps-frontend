// /frontend/src/components/RecipeItem.js
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

export default function RecipeItem({ recipe }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: recipe.id.toString(),
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  };

  // Use total_gramasi from backend, or calculate from rincian_bahan
  const totalGramasi = recipe.total_gramasi || 
    (recipe.rincian_bahan && Array.isArray(recipe.rincian_bahan) 
      ? recipe.rincian_bahan.reduce((sum, item) => sum + (parseFloat(item.gramasi) || 0), 0)
      : 0);

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="recipe-item bg-white border-2 border-gray-200 hover:border-orange-400 rounded-lg p-4 cursor-grab active:cursor-grabbing transition-all hover:shadow-md"
    >
      <h4 className="font-bold text-gray-800 mb-2">{recipe.nama}</h4>
      <p className="text-sm text-gray-600 mb-2">
        {recipe.kategori && <span className="inline-block bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs">{recipe.kategori}</span>}
      </p>
      {totalGramasi > 0 && (
        <div className="mt-2 text-xs text-gray-500">
          Total: {totalGramasi}g
        </div>
      )}
    </div>
  );
}
