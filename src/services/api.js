// /frontend/src/services/api.js
import { createClient } from "@/lib/client";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

async function getAccessToken() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token;
}

function normalizeRequestContext(context = {}) {
  if (!context || typeof context !== "object") {
    return { userId: null, orgId: null };
  }

  return {
    userId: context.userId || context.user_id || null,
    orgId:
      context.orgId ||
      context.org_id ||
      context.organizationId ||
      context.organization_id ||
      null,
  };
}

function buildContextHeaders(context = {}) {
  const { userId, orgId } = normalizeRequestContext(context);
  return {
    ...(userId ? { "x-user-id": String(userId) } : {}),
    ...(orgId ? { "x-org-id": String(orgId) } : {}),
  };
}

function requireOrgId(context = {}, action = "operation") {
  const { orgId } = normalizeRequestContext(context);
  if (!orgId) {
    throw new Error(`orgId is required to ${action}`);
  }
}

export const generateNutrition = async (payload) => {
  try {
    const token = await getAccessToken();
    const response = await fetch(`${API_URL}/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
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
      `${API_URL}/ingredients/search?q=${encodeURIComponent(query)}`,
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
      `${API_URL}/ingredients/search?q=${encodeURIComponent(name)}&exact=true`,
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
    console.log(`📤 [API] Generating ingredient: "${name}"`);

    const response = await fetch(`${API_URL}/ingredients/get-ingredients`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name }),
    });

    console.log(`📥 [API] Response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[API] HTTP Error ${response.status}:`, errorText);

      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { error: errorText };
      }

      return {
        success: false,
        error: errorData.error || `HTTP ${response.status}`,
        message:
          errorData.error || errorData.message || "Gagal men-generate bahan",
      };
    }

    const data = await response.json();
    console.log(`[API] Success response:`, data);

    return data;
  } catch (error) {
    console.error(`[API] Exception in generateIngredient:`, error);
    return {
      success: false,
      error: error.message,
      message: "Gagal menghubungi server",
    };
  }
};

export const getRecipeById = async (recipeId, context = {}) => {
  try {
    console.log("[API] Fetching recipe details for ID:", recipeId);
    const response = await fetch(`${API_URL}/recipes/${recipeId}`, {
      headers: {
        ...buildContextHeaders(context),
      },
    });
    if (!response.ok) {
      throw new Error("Gagal mengambil detail resep");
    }
    const data = await response.json();
    console.log("[API] Recipe details received:", data);
    return data;
  } catch (error) {
    console.error("Error di getRecipeById:", error);
    return null;
  }
};
export const getAllRecipes = async (context = {}) => {
  try {
    console.log("[API] Fetching all recipes");
    const response = await fetch(`${API_URL}/recipes`, {
      headers: {
        ...buildContextHeaders(context),
      },
    });

    if (!response.ok) {
      throw new Error("Gagal mengambil daftar resep.");
    }

    const data = await response.json();
    console.log("[API] All recipes received:", data);
    return data.recipes || data;
  } catch (error) {
    console.error("Error di getAllRecipes:", error);
    return [];
  }
};
export const updateRecipe = async (recipeId, recipeData, context = {}) => {
  console.log("Updating recipe ID:", recipeId, recipeData);
  try {
    requireOrgId(context, "update a menu");
    const token = await getAccessToken();
    const response = await fetch(`${API_URL}/recipes/${recipeId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...buildContextHeaders(context),
      },
      body: JSON.stringify(recipeData),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || "Gagal mengupdate resep");
    }

    return await response.json();
  } catch (error) {
    console.error("Error di updateRecipe:", error);
    return { success: false, message: error.message };
  }
};

export const saveRecipe = async (recipeData, context = {}) => {
  console.log("Menyimpan resep baru ke backend:", recipeData);
  try {
    requireOrgId(context, "create a menu");
    const token = await getAccessToken();
    const response = await fetch(`${API_URL}/menu`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...buildContextHeaders(context),
      },
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

export const getNotValidatedIngredients = async (context = {}) => {
  try {
    const response = await fetch(`${API_URL}/ingredients/get-not-validated`, {
      headers: {
        ...buildContextHeaders(context),
      },
    });
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

export const getAllIngredients = async (context = {}) => {
  try {
    const response = await fetch(`${API_URL}/ingredients`, {
      headers: {
        ...buildContextHeaders(context),
      },
    });
    if (!response.ok) {
      throw new Error("Gagal mengambil daftar bahan");
    }
    const data = await response.json();
    return data.ingredients || data;
  } catch (error) {
    console.error("Error di getAllIngredients:", error);
    return [];
  }
};

export const createIngredient = async (ingredientData, context = {}) => {
  try {
    const token = await getAccessToken();
    const response = await fetch(`${API_URL}/ingredients`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...buildContextHeaders(context),
      },
      body: JSON.stringify(ingredientData),
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || "Gagal membuat bahan");
    }
    return await response.json();
  } catch (error) {
    console.error("Error di createIngredient:", error);
    return { success: false, message: error.message };
  }
};

export const updateIngredient = async (id, ingredientData, context = {}) => {
  try {
    const token = await getAccessToken();
    const response = await fetch(`${API_URL}/ingredients/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...buildContextHeaders(context),
      },
      body: JSON.stringify(ingredientData),
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || "Gagal mengupdate bahan");
    }
    return await response.json();
  } catch (error) {
    console.error("Error di updateIngredient:", error);
    return { success: false, message: error.message };
  }
};

export const validateIngredient = async (id, nutritionData, validatorName, context = {}) => {
  try {
    const payload = {
      ingredientData: nutritionData,
      validatedBy: validatorName, // KIRIM NAMA AHLI GIZI
    };

    console.log("Validating ingredient:", payload, "context:", context);

    const token = await getAccessToken();
    const response = await fetch(`${API_URL}/ingredients/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...buildContextHeaders(context),
      },
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

export const getAllMenus = async (context = {}) => {
  try {
    const response = await fetch(`${API_URL}/menus`, {
      headers: {
        ...buildContextHeaders(context),
      },
    });

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

// PERBAIKAN: Endpoint yang benar untuk getMenuNutritionById
export const getMenuNutritionById = async (menuId, targetOrContext, maybeContext) => {
  try {
    const hasTarget = typeof targetOrContext === "string" || typeof targetOrContext === "number";
    const target = hasTarget ? targetOrContext : null;
    const context = hasTarget ? maybeContext : targetOrContext;

    console.log(
      "[API] Fetching nutrition for menu ID:",
      menuId,
      "target:",
      target,
    );

    // 🔹 Kirim query target kalau tersedia
    const url =
      target
        ? `${API_URL}/menu/${menuId}?target=${target}`
        : `${API_URL}/menu/${menuId}`;

    const response = await fetch(url, {
      headers: {
        ...buildContextHeaders(context),
      },
    });

    if (!response.ok) {
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("text/html")) {
        console.error("Server returned HTML instead of JSON");
        throw new Error(
          "Server error: Endpoint tidak ditemukan atau server crash",
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
      `${API_URL}/search?q=${encodeURIComponent(name.trim())}`,
    );
    if (!response.ok) return null;
    const suggestions = await response.json();
    const exactMatch = suggestions.find(
      (m) => m.nama.toLowerCase() === name.trim().toLowerCase(),
    );
    return exactMatch ? exactMatch.id : null;
  } catch (err) {
    console.error(`Gagal fetch ID untuk "${name.trim()}":`, err);
    return null;
  }
};

// --- FUNGSI BARU: Menyimpan Komposisi Menu Baru ---
export const saveNewMenuComposition = async (formData, context = {}) => {
  try {
    requireOrgId(context, "create a menu composition");
    const { orgId, userId } = normalizeRequestContext(context);
    console.log("📤 [API] Menerima formData:", formData);

    // PERBAIKAN: Validasi dan build payload dengan benar
    const { nama, komposisi } = formData;

    if (!nama || !nama.trim()) {
      throw new Error("Nama menu tidak boleh kosong");
    }

    if (!komposisi || typeof komposisi !== "object") {
      throw new Error("Data komposisi tidak valid");
    }

    // Hitung berapa banyak resep yang valid
    const validIdsCount = Object.values(komposisi).filter(
      (id) => id !== null && id !== undefined && id !== 0,
    ).length;

    console.log("📊 [API] Valid IDs count:", validIdsCount);
    console.log("📋 [API] Komposisi:", komposisi);

    if (validIdsCount === 0) {
      throw new Error(
        "Tidak ada menu yang valid ditemukan. Minimal 1 menu harus dipilih.",
      );
    }

    const payload = {
      nama: nama.trim(),
      komposisi: komposisi,
      orgId,
      ...(userId ? { userId } : {}),
    };

    console.log("📦 [API] Sending payload:", JSON.stringify(payload, null, 2));

    const token = await getAccessToken();
    const response = await fetch(`${API_URL}/menu/composition`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...buildContextHeaders(context),
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("[API] Backend error:", errorData);
      throw new Error(errorData.message || "Gagal menyimpan Menu Komposisi.");
    }

    const result = await response.json();
    console.log("[API] Save successful:", result);
    return result;
  } catch (error) {
    console.error("[API] Error di saveNewMenuComposition:", error);
    throw error;
  }
};

// Save meal plan
export const saveMealPlan = async (mealPlanData, context = {}) => {
  try {
    console.log("📤 [API] Saving meal plan:", mealPlanData);

    const token = await getAccessToken();
    const response = await fetch(`${API_URL}/meal-plans`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...buildContextHeaders(context),
      },
      body: JSON.stringify(mealPlanData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("[API] Backend error:", errorData);
      throw new Error(errorData.message || "Gagal menyimpan meal plan.");
    }

    const result = await response.json();
    console.log("[API] Meal plan saved:", result);
    return result;
  } catch (error) {
    console.error("[API] Error di saveMealPlan:", error);
    throw error;
  }
};

// Get meal plan by ID
export const getMealPlanById = async (id, context = {}) => {
  try {
    const response = await fetch(`${API_URL}/meal-plans/${id}`, {
      headers: {
        ...buildContextHeaders(context),
      },
    });

    if (!response.ok) {
      throw new Error("Gagal memuat meal plan.");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("[API] Error di getMealPlanById:", error);
    throw error;
  }
};

// Get all meal plans
export const getAllMealPlans = async (context = {}) => {
  try {
    const response = await fetch(`${API_URL}/meal-plans`, {
      headers: {
        ...buildContextHeaders(context),
      },
    });

    if (!response.ok) {
      throw new Error("Gagal memuat daftar meal plans.");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("[API] Error di getAllMealPlans:", error);
    throw error;
  }
};

export const getAllRecommendations = async (currentFoods) => {
  try {
    const token = await getAccessToken();
    const response = await fetch(`${API_URL}/get_all_recommendations`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify(currentFoods),
    });
    if (!response.ok) {
      const errorData = await response.json();
      console.error("[API] Backend error:", errorData);
      throw new Error(errorData.message || "Gagal mendapatkan rekomendasi.");
    }
    return response.json(); // ✅ add this line
  } catch (error) {
    console.error("[API] Error di getAllRecommendations:", error);
    throw error;
  }
};

export const calculateTotalIngredients = async (plateRecipes, portion) => {
  try {
    const token = await getAccessToken();
    const response = await fetch(`${API_URL}/generate-total-ingredients`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify({ plateRecipes, portion }),
    });
    if (!response.ok) {
      const errorData = await response.json();
      console.error("[API] Backend error:", errorData);
      throw new Error(errorData.message || "Gagal menghitung total bahan.");
    }
    return response.json(); // ✅ add this line 
  } catch (error) {    
    console.error("[API] Error di calculateTotalIngredients:", error);
    throw error;
  }
};