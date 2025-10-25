// /frontend/src/components/ValidationModal.js

import { useState } from "react";
import NutritionLabel from "./NutritionLabel";
import { ChevronDown } from "lucide-react";

const ValidationModal = ({ ingredient, onClose, onValidate }) => {
  // Simpan data gizi di state lokal agar bisa diedit
  const [editableData, setEditableData] = useState(ingredient.nutritionData);
  const [isSaving, setIsSaving] = useState(false);

  const handleDataChange = (newData) => {
    setEditableData(newData);
  };

  const handleValidate = async () => {
    setIsSaving(true);
    // Kirim data yang sudah diedit ke parent/API
    console.log("Validating data:", editableData);
    await onValidate(ingredient.id, editableData);
    setIsSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-8 m-4">
        <h2 className="text-2xl font-bold text-orange-500 mb-6">
          Validasi Data Gizi
        </h2>

        {/* Rincian Bahan yang Dapat Diedit */}
        <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-2">
          <details
            className="group bg-white rounded-xl shadow-sm border border-slate-200"
            open // Langsung terbuka
          >
            <summary className="flex items-center justify-between p-4 cursor-pointer select-none">
              <div className="flex items-center gap-3">
                <span className="flex items-center justify-center w-7 h-7 bg-[#202020]/10 text-[#202020]90 rounded-full text-xs font-bold">
                  1
                </span>
                <div>
                  <p className="font-semibold text-slate-800">
                    {ingredient.nama}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Takaran Saji: {ingredient.nutritionData.takaran_saji_g}g
                  </p>
                </div>
              </div>
              <ChevronDown className="w-5 h-5 text-slate-400 group-open:rotate-180 transition-transform duration-200" />
            </summary>

            <div className="px-4 pb-4 border-t border-slate-100">
              <div className="pt-4">
                <NutritionLabel
                  data={editableData}
                  onDataChange={handleDataChange}
                  isEditable={true} // <-- INI KUNCINYA
                  isMini={true}
                />
              </div>
            </div>
          </details>
        </div>

        {/* Tombol Aksi */}
        <div className="flex items-center justify-end gap-4 mt-8">
          <button
            type="button"
            onClick={onClose}
            className="py-2 px-5 text-slate-600 font-medium rounded-lg hover:bg-slate-100 transition"
          >
            Batal
          </button>
          <button
            onClick={handleValidate}
            disabled={isSaving}
            className="py-2 px-5 bg-orange-400 text-white font-bold rounded-lg shadow-md hover:bg-orange-500 transition disabled:bg-slate-300"
          >
            {isSaving ? "Menyimpan..." : "Validasi"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ValidationModal;