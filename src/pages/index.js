// /frontend/src/pages/index.js

import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import GuestView from "../components/GuestView";
import ChefDashboard from "../components/ChefDashboard"; // <-- Diganti namanya
import AhliGiziDashboard from "../components/AhliGiziDashboard"; // <-- BARU
import LoginModal from "../components/LoginModal";

export default function Home() {
  const { user } = useAuth();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Fungsi untuk menutup modal
  const handleCloseLogin = () => {
    setIsLoginModalOpen(false);
  };

  // --- RENDER LOGIC DIPERBARUI ---
  const renderView = () => {
    if (!user) {
      // Tampilan Tamu
      return <GuestView onLoginClick={() => setIsLoginModalOpen(true)} />;
    }

    if (user.role === "Chef") {
      // Tampilan Dashboard Chef
      return <ChefDashboard />;
    }

    if (user.role === "Ahli Gizi") {
      // Tampilan Dashboard Ahli Gizi
      return <AhliGiziDashboard />;
    }

    // Fallback jika role tidak dikenali
    return <GuestView onLoginClick={() => setIsLoginModalOpen(true)} />;
  };
  // --- AKHIR PERUBAHAN ---

  return (
    <>
      {/* 1. Tampilkan Modal Login jika state-nya true */}
      {isLoginModalOpen && <LoginModal onClose={handleCloseLogin} />}

      {/* 2. Pilih Tampilan berdasarkan status login */}
      {renderView()}
    </>
  );
}