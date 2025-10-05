const API_BASE_URL = "http://localhost:5000/api"; // Alamat backend kita

export const getMenus = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/menus`);
    if (!response.ok) {
      throw new Error("Gagal mengambil data menu");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
    return null; // Mengembalikan null jika ada error
  }
};

export const generateNutrition = async (selectedIds) => {
  try {
    const response = await fetch(`${API_BASE_URL}/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(selectedIds),
    });
    if (!response.ok) {
      throw new Error("Gagal men-generate nutrisi");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
    return null; // Mengembalikan null jika ada error
  }
};
