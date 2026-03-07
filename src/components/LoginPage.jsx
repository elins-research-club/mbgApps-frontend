import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const result = login(username, password);
    if (!result.success) {
      setError(result.message);
    } else {
      setError("");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="w-full max-w-md">
        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-orange-400 px-6 sm:px-8 pt-8 pb-8">
            <div className="flex items-center gap-3 mb-3">
              <h2 className="text-base sm:text-sm font-semibold text-white/90">
                MBG Calculator Apps
              </h2>
            </div>
            <h1 className="text-2xl sm:text-4xl font-bold text-white mb-2">
              Selamat Datang
            </h1>
            <p className="text-orange-100 text-sm">
              Silakan login untuk melanjutkan
            </p>
          </div>

          {/* Form Area */}
          <div className="px-6 sm:px-8 py-6 bg-white">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="username"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  placeholder="Masukkan username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-orange-400 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  placeholder="Masukkan password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit(e)}
                  className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-orange-400 focus:bg-white transition-all"
                />
              </div>

              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-orange-400 text-white py-3 rounded-xl font-semibold hover:bg-orange-500 cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 transition-colors"
              >
                Login
              </button>
            </form>
          </div>
        </div>

        {/* Footer */}
        <p className="text-xs text-center text-gray-500 mt-4">
          © {new Date().getFullYear()} MBGCalc. Semua hak dilindungi.
        </p>
      </div>
    </div>
  );
}
