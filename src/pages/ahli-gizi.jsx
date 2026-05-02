import { useAuth } from "@/contexts/AuthContext";
import AhliGiziDashboard from "@/components/AhliGiziDashboard";

export default function AhliGiziPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-white0 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-white0">Silakan login terlebih dahulu</p>
      </div>
    );
  }

  return (
    <>
      <AhliGiziDashboard />
    </>
  );
}
