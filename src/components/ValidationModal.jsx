// /frontend/src/components/ValidationModal.js

import { useState } from "react";
import NutritionLabel from "./NutritionLabel";
import { ChevronDown } from "lucide-react";

const ValidationModal = ({ ingredient, onClose, onValidate }) => {
  const [editableData, setEditableData] = useState(ingredient.nutritionData);
  const [validatorName, setValidatorName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const handleDataChange = (newData) => {
    setEditableData(newData);
  };

  const handleValidate = async () => {
    if (!validatorName.trim()) {
      setError("Nama ahli gizi harus diisi");
      return;
    }

    setIsSaving(true);
    setError("");

    console.log("Validating data:", editableData, "by:", validatorName);

    await onValidate(ingredient.id, editableData, validatorName);

    setIsSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col m-4">
        {/* Header */}
        <div className="bg-white0 px-8 py-5">
          <h2 className="text-xl font-semibold text-white">
            Validasi Data Gizi
          </h2>
          <p className="text-white/80 text-sm mt-1">{ingredient.nama}</p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          {/* Input Nama Ahli Gizi */}
          <div>
            <label className="text-sm font-medium text-[#37393B] mb-2 flex items-center gap-2">
              <svg
                className="w-4 h-4 text-white0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              Nama Ahli Gizi <span className="text-white0">*</span>
            </label>
            <input
              type="text"
              value={validatorName}
              onChange={(e) => {
                setValidatorName(e.target.value);
                setError("");
              }}
              placeholder="Contoh: Dr. Budi Santoso, S.Gz"
              className="w-full px-4 py-2.5 border border-[#D9C7B8] rounded-lg focus:ring-2 focus:ring-[#F3E8DF]0 focus:border-white0 outline-none transition-all"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
              <svg
                className="w-5 h-5 text-red-500 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Nutrition Data Editor */}
          <div>
            <details
              className="group bg-white rounded-lg border border-[#E8D1C5]"
              open
            >
              <summary className="flex items-center justify-between p-4 cursor-pointer select-none hover:bg-[#E8D1C5] transition-colors rounded-lg">
                <div className="flex items-center gap-3">
                  <svg
                    className="w-5 h-5 text-white0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <div>
                    <p className="font-medium text-black">Data Nutrisi</p>
                    <p className="text-xs text-white0 mt-1">
                      Takaran Saji: {ingredient.nutritionData.takaran_saji_g}g
                    </p>
                  </div>
                </div>
                <ChevronDown className="w-5 h-5 text-[#C9A89A] group-open:rotate-180 transition-transform" />
              </summary>

              <div className="px-4 pb-4 border-t border-[#E8D1C5]">
                <div className="pt-4">
                  <NutritionLabel
                    data={editableData}
                    onDataChange={handleDataChange}
                    isEditable={true}
                    isMini={true}
                  />
                </div>
              </div>
            </details>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-8 py-4 bg-white border-t border-[#E8D1C5] flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="px-5 py-2 text-[#37393B] font-medium rounded-lg hover:bg-[#D9C7B8] transition disabled:opacity-50"
          >
            Batal
          </button>
          <button
            onClick={handleValidate}
            disabled={isSaving || !validatorName.trim()}
            className="px-5 py-2 bg-white0 text-white font-medium rounded-lg hover:bg-[#37393B] transition disabled:opacity-50 flex items-center gap-2"
          >
            {isSaving ? (
              <>
                <svg
                  className="animate-spin h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Memvalidasi...
              </>
            ) : (
              <>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Validasi Data
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ValidationModal;
