// /frontend/src/services/api.js

const API_URL = "http://localhost:5000/api";

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

export const suggestMenu = async (newMenuName) => {
  try {
    const response = await fetch(`${API_URL}/suggest-menu`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ new_menu_name: newMenuName }),
    });
    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        message: errorData.message || "Terjadi error di server.",
      };
    }
    const data = await response.json();
    return { success: true, data: data };
  } catch (error) {
    console.error("Error di suggestMenu:", error);
    return { success: false, message: "Gagal menghubungi server." };
  }
};
