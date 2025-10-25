// /frontend/src/contexts/AuthContext.js

import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // null = Guest, { role: '...' } = Logged In

  // --- FUNGSI LOGIN DIPERBARUI ---
  const login = (username, password) => {
    let loggedInUser = null;
    let success = false;
    let message = "Username atau password salah.";

    // Sesuai screenshot: "AhliGizi / chef"
    if (username === "Chef" && password === "chef") {
      loggedInUser = { role: "Chef", name: "Chef" };
      success = true;
    } else if (username === "AhliGizi" && password === "ahligizi") {
      // Disesuaikan agar unik
      loggedInUser = { role: "Ahli Gizi", name: "Ahli Gizi" };
      success = true;
    }

    setUser(loggedInUser);

    if (success) {
      return { success: true };
    } else {
      return { success: false, message };
    }
  };
  // --- AKHIR PERUBAHAN ---

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook kustom untuk memudahkan penggunaan
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth harus digunakan di dalam AuthProvider");
  }
  return context;
};