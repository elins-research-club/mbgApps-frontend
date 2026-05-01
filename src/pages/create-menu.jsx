import { useRouter } from "next/router";
import { useAuth } from "@/contexts/AuthContext";
import MainNavbar from "@/components/MainNavbar";
import Footer from "@/components/Footer";
import AddRecipeModal from "@/components/AddRecipeModal";

export default function CreateMenuPage() {
  const router = useRouter();
  const { user, canSave, isChef, canManagePlans, loading, orgMembership, organizations } = useAuth();
  const orgId = Array.isArray(router.query?.orgId)
    ? router.query.orgId[0]
    : router.query?.orgId || orgMembership?.organization?.id || organizations?.[0]?.id || null;

  const canAccessCreateMenu = isChef || canSave || canManagePlans;

  const goBackToMealPlanner = () => {
    router.push(orgId ? `/meal-planner?orgId=${orgId}` : "/meal-planner");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="w-8 h-8 border-4 border-white0 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!canAccessCreateMenu) {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        <MainNavbar />
        <main className="flex-grow max-w-3xl mx-auto w-full px-4 py-10">
          <div className="rounded-2xl border border-[#E8D1C5] p-6 text-center">
            <h1 className="text-xl font-bold text-[#17191B] mb-2">Akses Ditolak</h1>
            <p className="text-sm text-white0">Anda tidak memiliki izin untuk membuat menu.</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!orgId) {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        <MainNavbar />
        <main className="flex-grow max-w-3xl mx-auto w-full px-4 py-10">
          <div className="rounded-2xl border border-[#E8D1C5] p-6 text-center">
            <h1 className="text-xl font-bold text-[#17191B] mb-2">Organisasi Belum Dipilih</h1>
            <p className="text-sm text-white0 mb-4">
              orgId wajib ada untuk membuat menu. Buka dashboard organisasi lalu coba lagi.
            </p>
            <button
              onClick={() => router.push("/")}
              className="px-4 py-2 rounded-xl bg-[#452829] text-white text-sm font-semibold hover:bg-[#6C2D19] transition"
            >
              Kembali ke Beranda
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <MainNavbar />
      <main className="flex-grow max-w-5xl mx-auto w-full px-4 py-8">
        <div className="rounded-2xl border border-[#E8D1C5]">
          <AddRecipeModal
            canSave={canSave || isChef || canManagePlans}
            userId={user?.id}
            orgId={orgId}
            onClose={goBackToMealPlanner}
            onRecipeAdded={goBackToMealPlanner}
            onNutritionCalculated={() => {}}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
}
