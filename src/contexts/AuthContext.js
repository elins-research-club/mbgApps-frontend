// /frontend/src/contexts/AuthContext.js
import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user from sessionStorage on mount
  useEffect(() => {
    const storedUser = sessionStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Failed to parse user from session:", error);
        sessionStorage.removeItem("user");
      }
    }
    setLoading(false);
  }, []);

  // Save user to sessionStorage whenever it changes
  useEffect(() => {
    if (user) {
      sessionStorage.setItem("user", JSON.stringify(user));
    } else {
      sessionStorage.removeItem("user");
    }
  }, [user]);

  const login = (username, password) => {
    let loggedInUser = null;
    let success = false;
    let message = "Username atau password salah.";

    // Sesuai screenshot: "AhliGizi / chef"
    if (username === "Chef" && password === "chef") {
      loggedInUser = { role: "Chef", name: "Chef" };
      success = true;
    } else if (username === "AhliGizi" && password === "ahligizi") {
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

  const logout = () => {
    setUser(null);
  };

  // Show loading state while checking session
  if (loading) {
    return null; // or a loading spinner if you prefer
  }

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