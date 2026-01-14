// /frontend/src/services/api.js

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
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
			console.error(`❌ [API] HTTP Error ${response.status}:`, errorText);

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
		console.log(`✅ [API] Success response:`, data);

		return data;
	} catch (error) {
		console.error(`💥 [API] Exception in generateIngredient:`, error);
		return {
			success: false,
			error: error.message,
			message: "Gagal menghubungi server",
		};
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

export const validateIngredient = async (id, nutritionData, validatorName) => {
	try {
		const payload = {
			ingredientData: nutritionData,
			validatedBy: validatorName, // ✅ KIRIM NAMA AHLI GIZI
		};

		console.log("Validating ingredient:", payload);

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
			target,
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
export const saveNewMenuComposition = async (formData) => {
	try {
		console.log("📤 [API] Menerima formData:", formData);

		// ✅ PERBAIKAN: Validasi dan build payload dengan benar
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
		};

		console.log("📦 [API] Sending payload:", JSON.stringify(payload, null, 2));

		const response = await fetch(`${API_URL}/menu/composition`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(payload),
		});

		if (!response.ok) {
			const errorData = await response.json();
			console.error("❌ [API] Backend error:", errorData);
			throw new Error(errorData.message || "Gagal menyimpan Menu Komposisi.");
		}

		const result = await response.json();
		console.log("✅ [API] Save successful:", result);
		return result;
	} catch (error) {
		console.error("💥 [API] Error di saveNewMenuComposition:", error);
		throw error;
	}
};
