// /frontend/src/services/api.js

const API_URL = "http://localhost:5000/api";

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

export const searchIngredients = async (query) => {
  if (query.length < 2) return [];

  try {
    const response = await fetch(
      `${API_URL}/ingredients/search?q=${encodeURIComponent(query)}`
    );

    if (!response.ok) {
      throw new Error("Gagal memuat rekomendasi bahan.");
    }
    const data = await response.json();
    return data.ingredients.map((item) => ({
      id: item.id,
      name: item.nama,
    }));
  } catch (error) {
    console.error("Error di searchIngredients (autocomplete):", error);
    return [];
  }
};

export const checkIngredient = async (name) => {
  try {
    const response = await fetch(
      `${API_URL}/ingredients/search?q=${encodeURIComponent(name)}&exact=true`
    );

    if (!response.ok) {
      console.error("Backend error in checkIngredient:", response.statusText);
      throw new Error("Backend error while checking ingredient.");
    }

    const data = await response.json();

    if (data.ingredients && data.ingredients.length > 0) {
      return { found: true, data: data.ingredients[0] };
    }

    return { found: false };
  } catch (error) {
    console.error("Error di checkIngredient:", error);
    return { found: false, error: error.message };
  }
};

export const generateIngredient = async (name) => {
  try {
    const response = await fetch(`${API_URL}/ingredients/get-ingredients`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name }),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || "Gagal men-generate bahan");
    }

    return await response.json();
  } catch (error) {
    console.error("Error di generateIngredient:", error);
    return { success: false, message: error.message };
  }
};

export const saveRecipe = async (recipeData) => {
  console.log("Menyimpan resep baru ke backend:", recipeData);
  try {
    const response = await fetch(`${API_URL}/menu`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(recipeData),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || "Gagal menyimpan resep");
    }

    return await response.json();
  } catch (error) {
    console.error("Error di saveRecipe:", error);
    return { success: false, message: error.message };
  }
};

export const getNotValidatedIngredients = async () => {
  try {
    const response = await fetch(`${API_URL}/ingredients/get-not-validated`);
    if (!response.ok) {
      throw new Error("Gagal mengambil data untuk validasi");
    }
    const data = await response.json();
    return data.ingredients;
  } catch (error) {
    console.error("Error di getNotValidatedIngredients:", error);
    return [];
  }
};

export const validateIngredient = async (id, nutritionData) => {
  try {
    const payload = {
      ingredientData: nutritionData,
    };

    const response = await fetch(`${API_URL}/ingredients/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || "Gagal memvalidasi bahan");
    }

    return await response.json();
  } catch (error) {
    console.error("Error di validateIngredient:", error);
    return { success: false, message: error.message };
  }
};

export const getAllMenus = async () => {
  try {
    const response = await fetch(`${API_URL}/menus`);

    if (!response.ok) {
      throw new Error("Gagal mengambil daftar menu.");
    }

    const data = await response.json();
    return data.menus || data;
  } catch (error) {
    console.error("Error di getAllMenus:", error);
    return [];
  }
};

// ✅ PERBAIKAN: Endpoint yang benar untuk getMenuNutritionById
export const getMenuNutritionById = async (menuId, target) => {
  try {
    console.log(
      "[API] Fetching nutrition for menu ID:",
      menuId,
      "target:",
      target
    );

    // 🔹 Kirim query target kalau tersedia
    const url = target
      ? `${API_URL}/menu/${menuId}?target=${target}`
      : `${API_URL}/menu/${menuId}`;

    const response = await fetch(url);

    if (!response.ok) {
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("text/html")) {
        console.error("❌ Server returned HTML instead of JSON");
        throw new Error(
          "Server error: Endpoint tidak ditemukan atau server crash"
        );
      }

      const errorData = await response.json();
      throw new Error(errorData.message || "Gagal mengambil data gizi menu.");
    }

    const data = await response.json();
    console.log("[API] Received nutrition data:", data);
    return data;
  } catch (error) {
    console.error("Error di getMenuNutritionById:", error);
    throw error;
  }
};

const getMenuIdByName = async (name) => {
  if (!name || name.trim() === "") return null;
  try {
    const response = await fetch(
      `${API_URL}/search?q=${encodeURIComponent(name.trim())}`
    );
    if (!response.ok) return null;
    const suggestions = await response.json();
    const exactMatch = suggestions.find(
      (m) => m.nama.toLowerCase() === name.trim().toLowerCase()
    );
    return exactMatch ? exactMatch.id : null;
  } catch (err) {
    console.error(`Gagal fetch ID untuk "${name.trim()}":`, err);
    return null;
  }
};

// --- FUNGSI BARU: Menyimpan Komposisi Menu Baru ---
export const saveNewMenuComposition = async (formData) => {
  const payload = {
    nama: formData.nama,
    komposisi: formData.komposisi,
  };

  const validIdsCount = Object.values(payload.komposisi).filter(
    (id) => id !== null && id !== 0
  ).length;

  if (validIdsCount === 0) {
    throw new Error(
      "Tidak ada resep yang valid ditemukan untuk komposisi ini. Menu tidak dapat disimpan."
    );
  }

  try {
    const response = await fetch(`${API_URL}/menu/composition`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Gagal menyimpan Menu Komposisi.");
    }

    return await response.json();
  } catch (error) {
    console.error("Error di saveNewMenuComposition:", error);
    throw error;
  }
};
