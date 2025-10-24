// /frontend/src/components/Navbar.js

const Navbar = () => {
  return (
    <nav className="sticky top-0 z-50 bg-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* flex-col agar isi center */}
        <div className="flex items-center justify-center h-16">
          {/* Logo dan Nama Aplikasi */}
          <div className="flex items-center gap-3">
            {/* <div className="flex items-center justify-center w-10 h-10 bg-orange-400 rounded-lg shadow-sm">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div> */}
            {/* <span className="text-xl font-semibold text-[#202020] tracking-tight">
              Kalkulator Gizi MBG
            </span> */}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
