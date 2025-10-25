// /frontend/src/services/api.js

const API_URL = "http://localhost:5000/api";

// TETAP DIPAKAI: tapi payload-nya berubah
// Sekarang mengirim { target, karbo, ... }
export const generateNutrition = async (payload) => {
  try {
    const response = await fetch(`${API_URL}/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      throw new Error("Gagal men-generate nutrisi.");
    }
    return await response.json();
  } catch (error) {
    console.error("Error di generateNutrition:", error);
    return null;
  }
};

// --- FUNGSI BARU UNTUK MODAL ---

// BARU: Cek apakah bahan ada di DB
// (Ini hanya MOCKUP, sesuaikan dengan API Anda)
export const checkIngredient = async (name) => {
  console.log(`Checking ingredient: ${name}`);
  // Simulasi API call
  await new Promise((resolve) => setTimeout(resolve, 500));
  // Ganti logika ini dengan API call sungguhan
  if (name.toLowerCase().includes("testing")) {
    return { found: true };
  }
  return { found: false };
};

// BARU: Generate bahan baru via AI
// (Ini hanya MOCKUP, sesuaikan dengan API Anda)
export const generateIngredient = async (name) => {
  console.log(`Generating ingredient: ${name}`);
  // Simulasi API call AI yang butuh waktu
  await new Promise((resolve) => setTimeout(resolve, 2000));
  // Ganti logika ini dengan API call sungguhan
  if (name.toLowerCase().includes("error")) {
    return { success: false, message: "Simulasi error dari AI." };
  }
  return {
    success: true,
    data: { message: "Bahan berhasil di-generate oleh AI." },
  };
};

// BARU: Simpan resep baru ke DB
// (Ini hanya MOCKUP, sesuaikan dengan API Anda)
export const saveRecipe = async (recipeData) => {
  console.log("Saving new recipe:", recipeData);
  await new Promise((resolve) => setTimeout(resolve, 1000));
  // Ganti logika ini dengan API call sungguhan
  return { success: true };
};

// ------------------------------------
// (Fungsi getMenus dan suggestMenu yang lama bisa Anda hapus jika tidak dipakai lagi)
export const getMenus = async () => {
  try {
    const response = await fetch(`${API_URL}/menus`);
    if (!response.ok) {
      throw new Error("Gagal mengambil data menu.");
    }
    return await response.json();
  } catch (error) {
    console.error("Error di getMenus:", error);
    return null;
  }
};