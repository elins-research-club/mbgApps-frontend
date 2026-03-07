// /frontend/src/components/LoginModal.js

import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";

const LoginModal = ({ onClose }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isLoading) return;

    setIsLoading(true);
    setError("");

    const result = login(username, password);

    if (result.success) {
      // --- PERBAIKAN DI SINI ---
      // Panggil onClose untuk menutup modal setelah login berhasil
      onClose();
      // Kita tidak perlu set isLoading(false) karena komponen akan di-unmount
    } else {
      // Login gagal, tampilkan error dan stop loading
      setError(result.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 m-4 relative">
        {/* Tombol Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <form onSubmit={handleSubmit}>
          <h2 className="text-3xl font-bold text-orange-500 text-center mb-8">
            LOGIN AKUN
          </h2>

          <div className="space-y-6">
            <div>
              <label
                htmlFor="username"
                className="text-lg font-semibold text-slate-700"
              >
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full mt-2 p-4 border-none rounded-lg text-lg bg-orange-100 text-orange-900 placeholder-orange-300 focus:ring-2 focus:ring-orange-500 outline-none"
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="text-lg font-semibold text-slate-700"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full mt-2 p-4 border-none rounded-lg text-lg bg-orange-100 text-orange-900 placeholder-orange-300 focus:ring-2 focus:ring-orange-500 outline-none"
              />
            </div>
          </div>

          {error && (
            <p className="mt-4 text-center text-red-600 text-sm">{error}</p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="mt-8 w-full py-4 bg-orange-500 text-white font-bold text-xl rounded-lg shadow-lg hover:bg-orange-600 transition-colors disabled:bg-slate-400"
          >
            {isLoading ? "Loading..." : "LOGIN"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginModal;