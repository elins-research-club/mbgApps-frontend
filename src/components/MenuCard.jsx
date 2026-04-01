// /frontend/src/components/MenuCard.js

import NextImage from "next/image";

const MenuCard = ({ menu, onSelect }) => {
  const { id, nama, kategori, estimasi_energi } = menu;

  return (
    <div
      onClick={() => onSelect(id)} // Panggil handler saat diklik
      className="bg-white p-5 rounded-xl shadow-md border border-[#E8D1C5] 
                 cursor-pointer hover:shadow-lg hover:border-white0 transition-all 
                 flex flex-col h-full"
    >
      <div className="flex-grow">
        <h4 className="text-xl font-bold text-[#17191B] line-clamp-2">
          {nama}
        </h4>
        <p className="text-sm font-medium text-white0 mt-1">{kategori}</p>
        <p className="text-sm text-white0 mt-3">
          Menu ini dapat dianalisis untuk melihat detail gizi per bahan.
        </p>
      </div>

      <div className="mt-4 pt-3 border-t border-white flex justify-between items-center">
        <span className="text-xs font-semibold text-[#452829]">
          Energi:{" "}
          {estimasi_energi ? `${estimasi_energi.toFixed(0)} kkal` : "N/A"}
        </span>
        <button className="text-sm font-semibold text-white bg-white0 py-1.5 px-3 rounded-lg hover:bg-[#37393B] transition">
          Lihat Gizi
        </button>
      </div>
    </div>
  );
};

export default MenuCard;
