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

    // --- PERBAIKAN DITAMBAHKAN DI SINI ---
    // Cek apakah respons dari backend adalah error (seperti 500, 404, dll)
    if (!response.ok) {
      console.error("Backend error in checkIngredient:", response.statusText);
      // Jika error, langsung lempar error agar ditangkap oleh 'catch'
      throw new Error("Backend error while checking ingredient.");
    }
    // --- AKHIR PERBAIKAN ---

    const data = await response.json(); // Baris ini sekarang aman

    if (data.ingredients && data.ingredients.length > 0) {
      return { found: true, data: data.ingredients[0] };
    }

    return { found: false };
  } catch (error) {
    console.error("Error di checkIngredient:", error);
    // Selalu kembalikan 'found: false' jika ada error apapun
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
    // Backend Anda (getNotValidatedIngredients) mengembalikan { ingredients: [...] }
    return data.ingredients;
  } catch (error) {
    console.error("Error di getNotValidatedIngredients:", error);
    return []; // Kembalikan array kosong jika error
  }
};

export const validateIngredient = async (id, nutritionData) => {
  try {
    // Backend Anda (editIngredientsNutritions) mengharapkan payload
    // dalam format: { ingredientData: {...} }
    // Backend juga akan OTOMATIS mengatur 'isValidated = true'
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

    // Backend mengembalikan { success: true, ingredient: {...} }
    return await response.json();
  } catch (error) {
    console.error("Error di validateIngredient:", error);
    return { success: false, message: error.message };
  }
};

// Fungsi BARU 1: Mengambil Daftar Menu Tervalidasi
export const getAllMenus = async () => {
  try {
    // UBAH ENDPOINT DARI '/menus/validated' menjadi '/menus'
    const response = await fetch(`${API_URL}/menus`);

    if (!response.ok) {
      throw new Error("Gagal mengambil daftar menu.");
    }

    const data = await response.json();
    // Asumsi backend mengembalikan array menu di data.menus (atau data saja)
    return data.menus || data;
  } catch (error) {
    console.error("Error di getAllMenus:", error);
    return [];
  }
};

// Fungsi BARU 2: Mengambil Nutrisi Menu berdasarkan ID (menggantikan fetch manual di GuestView)
export const getMenuNutritionById = async (menuId) => {
  try {
    const response = await fetch(`${API_URL}/generate-by-id`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ menu_id: menuId }),
    });

    if (!response.ok) {
      throw new Error("Gagal menghitung gizi menu.");
    }
    return await response.json();
  } catch (error) {
    console.error("Error di getMenuNutritionById:", error);
    return null;
  }
};
