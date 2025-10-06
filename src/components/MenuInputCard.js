// /frontend/src/components/MenuInputCard.js

import { MenuIcon, PlateIcon, CarrotIcon, BreadIcon, AppleIcon } from "./Icons";

// Daftar ikon untuk setiap kategori
const categoryIcons = {
  karbo: <MenuIcon />,
  lauk: <PlateIcon />,
  sayur: <CarrotIcon />,
  side_dish: <BreadIcon />,
  buah: <AppleIcon />,
};

const MenuInputCard = ({
  menus,
  selections,
  handleSelectionChange,
  handleSubmit,
  isLoading,
  error,
}) => {
  return (
    <div className="bg-white p-8 rounded-2xl shadow-lg">
      <h2 className="text-2xl font-bold text-slate-700">
        Pilih Komposisi Menu
      </h2>
      <p className="text-slate-500 mt-2">
        Pilih item dari setiap kategori untuk menghitung total gizinya.
      </p>

      <div className="space-y-6 mt-8">
        {menus ? (
          Object.keys(menus).map((category) => (
            <div key={category}>
              <label className="flex items-center text-lg font-semibold text-slate-600 capitalize">
                {categoryIcons[category]}
                <span className="ml-3">{category.replace("_", " ")}</span>
              </label>
              <select
                className="w-full mt-2 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gray-500 outline-none transition"
                value={selections[category]}
                onChange={(e) =>
                  handleSelectionChange(category, e.target.value)
                }
              >
                <option value="">
                  -- Pilih {category.replace("_", " ")} --
                </option>
                {menus[category].map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.nama}
                  </option>
                ))}
              </select>
            </div>
          ))
        ) : (
          <p className="text-center text-slate-500">Memuat menu...</p>
        )}
      </div>

      <button
        onClick={handleSubmit}
        disabled={isLoading}
        className="mt-10 w-full py-4 bg-orange-400 text-white font-bold text-lg rounded-lg shadow-lg hover:bg-gray-700 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed"
      >
        {isLoading ? "Menganalisis..." : "Generate Menu"}
      </button>

      {error && (
        <p className="mt-4 p-4 bg-red-100 text-red-700 border border-red-300 rounded-lg text-center">
          {error}
        </p>
      )}
    </div>
  );
};

export default MenuInputCard;
