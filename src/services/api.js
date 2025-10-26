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
  
  try {
    const response = await fetch(`${API_URL}/ingredients/search?q=${encodeURIComponent(name)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    const found = (result.ingredients || []).length > 0;
    return { found };
  } catch (error) {
    console.error('Error checking ingredient:', error);
    return { found: false };
  }
};

// BARU: Generate bahan baru via AI
// (Ini hanya MOCKUP, sesuaikan dengan API Anda)
export const generateIngredient = async (name) => {
  console.log(`Generating ingredient: ${name}`);
  
  try {
    const response = await fetch(`${API_URL}/ingredients/get-ingredients`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error('Error generating ingredient:', error);
    return {
      success: false,
      message: error.message || 'Failed to generate ingredient.',
    };
  }
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