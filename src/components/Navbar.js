// /frontend/src/components/Navbar.js

const Navbar = () => {
  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo atau Nama Aplikasi */}
          <div className="flex-shrink-0">
            <span className="text-2xl font-bold text-orange-400">
              Kalkulator Gizi MBG
            </span>
          </div>

          {/* Menu Navigasi (jika ada halaman lain) */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {/* Contoh link navigasi, bisa ditambahkan nanti */}
              <a
                href="#"
                className="bg-gray-600 text-white px-3 py-2 rounded-md text-sm font-medium"
              >
                Dashboard
              </a>
              {/* <a href="#" className="text-gray-500 hover:bg-gray-200 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                  Laporan
                </a> */}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
