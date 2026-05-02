import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/contexts/AuthContext";
import { createClient } from "@/lib/client";
import MainNavbar from "@/components/MainNavbar";
import Footer from "@/components/Footer";
import { CheckCircle, AlertCircle, LogIn } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

export default function InviteAcceptPage() {
  const router = useRouter();
  const { user, refresh, isLoading: authLoading } = useAuth();
  const { token } = router.query;

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("idle"); // idle, processing, success, error
  const [error, setError] = useState(null);
  const [orgName, setOrgName] = useState(null);

  // Step 1: Check if user is authenticated
  useEffect(() => {
    if (authLoading) return; // Wait for auth to load

    if (!token) {
      setStatus("error");
      setError("Token undangan tidak ditemukan. Silakan periksa URL Anda.");
      return;
    }

    if (!user) {
      // User not authenticated, redirect to login with callback
      const returnUrl = `/invite/accept?token=${encodeURIComponent(token)}`;
      router.push(`/auth/login?redirect=${encodeURIComponent(returnUrl)}`);
      return;
    }

    // User is authenticated, accept the invitation
    handleAcceptInvitation();
  }, [token, user, authLoading]);

  // Step 2: Accept the invitation
  const handleAcceptInvitation = async () => {
    if (loading || status === "success") return;

    setLoading(true);
    setStatus("processing");

    try {
      const supabase = createClient();
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session?.access_token) {
        throw new Error("Session tidak valid. Silakan login kembali.");
      }

      const response = await fetch(`${API_URL}/organizations/invitations/accept`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ token }),
      });

      const contentType = response.headers.get("content-type") || "";
      const payload = contentType.includes("application/json")
        ? await response.json()
        : await response.text();

      if (!response.ok) {
        const message =
          (typeof payload === "object" && (payload.message || payload.error)) ||
          (typeof payload === "string" && payload) ||
          "Gagal menerima undangan";
        throw new Error(message);
      }

      // Extract org name from response
      const org = payload?.organization || payload?.org || payload?.data?.organization;
      if (org?.name) {
        setOrgName(org.name);
      }

      // Refresh user state to include new organization membership
      await refresh();

      setStatus("success");

      // Redirect to organization dashboard after 2 seconds
      setTimeout(() => {
        router.push("/");
      }, 2000);
    } catch (err) {
      console.error("Invitation acceptance error:", err);
      setStatus("error");
      setError(err.message || "Terjadi kesalahan saat menerima undangan");
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        <MainNavbar />
        <main className="flex-grow flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-lg text-center">
            <div className="inline-flex items-center gap-2">
              <div className="w-6 h-6 border-2 border-[#452829] border-t-transparent rounded-full animate-spin" />
              <p className="text-[#37393B] font-medium">Memuat...</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <MainNavbar />

      <main className="flex-grow flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg">
          {status === "processing" && (
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-8 text-center">
              <div className="flex justify-center mb-4">
                <div className="w-10 h-10 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
              </div>
              <h2 className="text-xl font-bold text-blue-900 mb-2">Memproses Undangan</h2>
              <p className="text-sm text-blue-700">
                Kami sedang mengaktifkan akun Anda dalam organisasi...
              </p>
            </div>
          )}

          {status === "success" && (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-8">
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle className="w-7 h-7 text-green-600" />
                </div>
              </div>
              <h2 className="text-xl font-bold text-green-900 text-center mb-2">
                Selamat Datang!
              </h2>
              <p className="text-sm text-green-700 text-center mb-6">
                Anda berhasil bergabung dengan{" "}
                <strong>{orgName || "organisasi"}</strong>. Anda akan diarahkan ke dashboard
                dalam beberapa detik...
              </p>
              <div className="text-center">
                <button
                  onClick={() => router.push("/")}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl text-sm transition"
                >
                  Lanjut ke Dashboard
                </button>
              </div>
            </div>
          )}

          {status === "error" && !user && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8">
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                  <LogIn className="w-7 h-7 text-amber-600" />
                </div>
              </div>
              <h2 className="text-xl font-bold text-amber-900 text-center mb-2">
                Silakan Login Terlebih Dahulu
              </h2>
              <p className="text-sm text-amber-700 text-center mb-6">
                Untuk menerima undangan organisasi, Anda perlu login atau membuat akun terlebih dahulu.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    const returnUrl = `/invite/accept?token=${encodeURIComponent(token)}`;
                    router.push(`/auth/login?redirect=${encodeURIComponent(returnUrl)}`);
                  }}
                  className="flex-1 px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl text-sm transition"
                >
                  Login
                </button>
                <button
                  onClick={() => {
                    const returnUrl = `/invite/accept?token=${encodeURIComponent(token)}`;
                    router.push(`/auth/sign-up?redirect=${encodeURIComponent(returnUrl)}`);
                  }}
                  className="flex-1 px-6 py-3 bg-white hover:bg-amber-50 text-amber-600 font-semibold rounded-xl text-sm transition border border-amber-200"
                >
                  Daftar
                </button>
              </div>
            </div>
          )}

          {status === "error" && user && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-8">
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                  <AlertCircle className="w-7 h-7 text-red-600" />
                </div>
              </div>
              <h2 className="text-xl font-bold text-red-900 text-center mb-2">
                Terjadi Kesalahan
              </h2>
              <p className="text-sm text-red-700 text-center mb-6 break-words">
                {error || "Gagal menerima undangan. Silakan coba lagi."}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleAcceptInvitation}
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl text-sm transition disabled:opacity-60"
                >
                  Coba Lagi
                </button>
                <button
                  onClick={() => router.push("/")}
                  className="flex-1 px-6 py-3 bg-white hover:bg-red-50 text-red-600 font-semibold rounded-xl text-sm transition border border-red-200"
                >
                  Ke Dashboard
                </button>
              </div>
            </div>
          )}

          {status === "idle" && (
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 text-center">
              <div className="w-10 h-10 border-3 border-gray-200 border-t-gray-400 rounded-full animate-spin mx-auto mb-4" />
              <p className="text-[#37393B] font-medium">Memproses undangan Anda...</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
