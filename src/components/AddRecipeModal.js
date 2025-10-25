// /frontend/src/components/AddRecipeModal.js

import { useState } from "react";
import {
  checkIngredient,
  generateIngredient,
  saveRecipe,
} from "../services/api";
import { PlusIcon, TrashIcon } from "./Icons";

const AddRecipeModal = ({ onClose, onRecipeAdded }) => {
  const [menuName, setMenuName] = useState("");
  const [ingredients, setIngredients] = useState([
    { id: 1, name: "", gramasi: "", status: "idle" }, // <-- DIUBAH
  ]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const handleAddIngredient = () => {
    setIngredients([
      ...ingredients,
      { id: Date.now(), name: "", gramasi: "", status: "idle" }, // <-- DIUBAH
    ]);
  };

  const handleRemoveIngredient = (id) => {
    setIngredients(ingredients.filter((item) => item.id !== id));
  };

  // --- HANDLER BARU ---
  // Mengelola perubahan untuk nama dan gramasi
  const handleIngredientDataChange = (id, field, value) => {
    const newIngredients = ingredients.map((item) => {
      if (item.id === id) {
        // Jika mengubah nama, reset status pengecekan
        if (field === "name") {
          return { ...item, name: value, status: "idle" };
        }
        // Jika mengubah gramasi, biarkan status apa adanya
        return { ...item, [field]: value };
      }
      return item;
    });
    setIngredients(newIngredients);
  };
  // --- Akhir Handler Baru ---

  const updateIngredientStatus = (id, status, message = "") => {
    setIngredients((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status, message } : item
      )
    );
  };

  // Cek ke DB saat input 'Bahan' di-blur (fokus hilang)
  const handleIngredientBlur = async (id, name) => {
    if (!name.trim()) return;

    updateIngredientStatus(id, "checking");
    const res = await checkIngredient(name); // API call

    if (res.found) {
      updateIngredientStatus(id, "found", "Bahan ditemukan di database");
    } else {
      updateIngredientStatus(id, "not_found", "Bahan tidak ditemukan");
    }
  };

  // Panggil AI untuk generate bahan yg 'not_found'
  const handleGenerateClick = async (id, name) => {
    updateIngredientStatus(id, "generating");
    const res = await generateIngredient(name); // API call

    if (res.success) {
      updateIngredientStatus(id, "generated", "Sukses! Bahan akan divalidasi.");
    } else {
      updateIngredientStatus(
        id,
        "error",
        res.message || "Gagal generate."
      );
    }
  };

  // Render status & tombol untuk setiap bahan
  const renderIngredientStatus = (item) => {
    switch (item.status) {
      case "checking":
        return <span className="text-xs text-blue-500">Mengecek...</span>;
      case "found":
        return <span className="text-xs text-green-600">✓ Ditemukan</span>;
      case "not_found":
        return (
          <div className="flex items-center gap-2">
            <span className="text-xs text-red-500">✗ Tidak ditemukan</span>
            <button
              type="button"
              onClick={() => handleGenerateClick(item.id, item.name)}
              className="px-2 py-0.5 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
            >
              Generate
            </button>
          </div>
        );
      case "generating":
        return <span className="text-xs text-blue-500">Generating...</span>;
      case "generated":
        return <span className="text-xs text-purple-600">✓ Generated</span>;
      case "error":
        return (
          <span className="text-xs text-red-600" title={item.message}>
            Error!
          </span>
        );
      default:
        return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSaving) return;

    // --- VALIDASI BARU ---
    if (!menuName.trim()) {
      setError("Nama menu tidak boleh kosong.");
      return;
    }
    const emptyGramasi = ingredients.find(
      (item) => !item.gramasi.trim() || parseFloat(item.gramasi) <= 0
    );
    if (emptyGramasi) {
      setError("Gramasi untuk semua bahan tidak boleh kosong.");
      return;
    }
    const unreadyIngredients = ingredients.filter(
      (item) =>
        item.status !== "found" &&
        item.status !== "generated" &&
        item.name.trim() !== "" // Abaikan jika barisnya kosong
    );
    if (unreadyIngredients.length > 0) {
      setError("Pastikan semua bahan 'Ditemukan' atau telah di-'Generate'.");
      return;
    }
    // --- Akhir Validasi Baru ---

    setIsSaving(true);
    setError("");

    // --- PAYLOAD BARU ---
    const payload = {
      nama_menu: menuName,
      bahan: ingredients
        .filter((item) => item.name.trim() !== "") // Hanya kirim bahan yang terisi
        .map((item) => ({
          name: item.name,
          gramasi: parseFloat(item.gramasi), // Kirim sebagai angka
        })),
    };
    // --- Akhir Payload Baru ---

    const res = await saveRecipe(payload); // API call

    if (res.success) {
      alert("Resep baru berhasil ditambahkan!");
      if (onRecipeAdded) onRecipeAdded(); // Refresh data di page
      onClose(); // Tutup modal
    } else {
      setError(res.message || "Gagal menyimpan resep baru.");
    }
    setIsSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-8 m-4">
        <form onSubmit={handleSubmit}>
          <h2 className="text-2xl font-bold text-slate-800 mb-6">
            Tambahkan Resep Baru
          </h2>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="menu-name"
                className="text-sm font-semibold text-slate-600"
              >
                Nama Menu
              </label>
              <input
                id="menu-name"
                type="text"
                value={menuName}
                onChange={(e) => setMenuName(e.target.value)}
                placeholder="Ketik nama menu..."
                className="w-full mt-1 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gray-500 outline-none transition"
              />
            </div>

            <hr />

            <label className="text-sm font-semibold text-slate-600">
              Bahan-bahan
            </label>
            <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
              {/* --- UI INPUT BAHAN DIUBAH --- */}
              {ingredients.map((item, index) => (
                <div
                  key={item.id}
                  className="space-y-1 p-2 rounded-md bg-slate-50 border"
                >
                  <div className="flex items-center gap-2">
                    {/* Input Nama Bahan */}
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) =>
                        handleIngredientDataChange(item.id, "name", e.target.value)
                      }
                      onBlur={(e) =>
                        handleIngredientBlur(item.id, e.target.value)
                      }
                      placeholder={`Bahan ${index + 1}`}
                      className="flex-grow p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gray-500 outline-none transition"
                      disabled={item.status === "checking"}
                    />
                    {/* Input Gramasi */}
                    <input
                      type="number"
                      value={item.gramasi}
                      onChange={(e) =>
                        handleIngredientDataChange(
                          item.id,
                          "gramasi",
                          e.target.value
                        )
                      }
                      placeholder="Gram"
                      className="w-20 p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gray-500 outline-none transition"
                      min="0"
                    />
                    {/* Tombol Hapus */}
                    {ingredients.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveIngredient(item.id)}
                        className="p-1 text-red-400 hover:text-red-600 flex-shrink-0"
                      >
                        <TrashIcon />
                      </button>
                    )}
                  </div>
                  {/* Status Pengecekan */}
                  <div className="pl-1 h-4">
                    {renderIngredientStatus(item)}
                  </div>
                </div>
              ))}
              {/* --- Akhir Perubahan UI --- */}
            </div>

            <button
              type="button"
              onClick={handleAddIngredient}
              className="w-full flex items-center justify-center gap-2 py-2 border-2 border-dashed border-slate-300 rounded-lg text-slate-500 hover:bg-slate-50 transition"
            >
              <PlusIcon />
              Tambahkan Bahan
            </button>
          </div>

          {error && (
            <p className="mt-4 text-center text-sm text-red-600">{error}</p>
          )}

          <div className="flex items-center justify-end gap-4 mt-8">
            <button
              type="button"
              onClick={onClose}
              className="py-2 px-5 text-slate-600 font-medium rounded-lg hover:bg-slate-100 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="py-2 px-5 bg-orange-400 text-white font-bold rounded-lg shadow-md hover:bg-orange-500 transition disabled:bg-slate-300"
            >
              {isSaving ? "Menyimpan..." : "Simpan Resep"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddRecipeModal;