// src/components/CreateOrganization.jsx
import { useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/contexts/AuthContext";
import { createOrganization } from "@/services/orgService";
import MainNavbar from "./MainNavbar";
import Footer from "./Footer";
import { Building2, ArrowRight, Info } from "lucide-react";

export default function CreateOrganization() {
  const { refresh } = useAuth();
  const router = useRouter();

  const [name, setName]               = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const org = await createOrganization({ name, description });
      const orgId = org?.id || org?.organization?.id || org?.data?.id;
      if (!orgId) throw new Error("Organisasi berhasil dibuat, tapi ID organisasi tidak ditemukan");
      await refresh();
      router.push(`/organization/${orgId}/dashboard`);
    } catch (err) {
      setError(err.message || "Gagal membuat organisasi");
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <MainNavbar />

      <main className="flex-grow flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center">
              <Building2 className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">
                Buat Organisasi
              </h1>
              <p className="text-sm text-slate-500">
                Kelola tim dan akses anggota dalam satu tempat
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Nama Organisasi <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: SD Negeri Maju Bersama"
                  required
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Deskripsi
                  <span className="text-slate-400 font-normal ml-1">(opsional)</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Jelaskan tujuan atau kegiatan organisasi Anda..."
                  rows={3}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400 text-sm resize-none"
                />
              </div>

              {/* Info box */}
              <div className="flex items-start gap-2.5 p-3 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-700">
                <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>
                  Setelah membuat organisasi, kode undangan akan dibuat secara
                  otomatis. Anggota dapat bergabung menggunakan kode tersebut,
                  lalu menunggu persetujuan pemilik organisasi.
                </span>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                  {error}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => router.back()}
                  disabled={loading}
                  className="px-5 py-2.5 text-slate-700 font-semibold rounded-xl hover:bg-slate-100 transition text-sm disabled:opacity-60"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading || !name.trim()}
                  className="flex items-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl text-sm transition disabled:opacity-60 shadow-sm"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Membuat...
                    </span>
                  ) : (
                    <>
                      Buat Organisasi
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
