// src/components/CreateOrganization.jsx
import { useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/contexts/AuthContext";
import { createOrganization, createSubOrganization } from "@/services/orgService";
import MainNavbar from "./MainNavbar";
import Footer from "./Footer";
import { Building2, ArrowRight, Info, CheckCircle, AlertCircle } from "lucide-react";

const MAX_ORG_DEPTH = 2;

function toStringQueryValue(value) {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

function toNumberDepth(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

export default function CreateOrganization() {
  const { refresh } = useAuth();
  const router = useRouter();

  const [name, setName]               = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState(null);
  const [successOrg, setSuccessOrg]   = useState(null);

  const parentId = toStringQueryValue(router.query?.parentId).trim();
  const parentName = toStringQueryValue(router.query?.parentName).trim();
  const parentDepth = toNumberDepth(toStringQueryValue(router.query?.parentDepth));
  const isSubOrgMode = !!parentId;
  const nextDepth = parentDepth + 1;
  const depthLimitReached = isSubOrgMode && nextDepth > MAX_ORG_DEPTH;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    setError(null);

    try {
      if (depthLimitReached) {
        throw new Error(`Sub-organisasi maksimal sampai kedalaman ${MAX_ORG_DEPTH}`);
      }

      const org = isSubOrgMode
        ? await createSubOrganization(parentId, { name, description })
        : await createOrganization({ name, description });

      const orgId = org?.id || org?.organization?.id || org?.data?.id;
      if (!orgId) throw new Error("Organisasi berhasil dibuat, tapi ID organisasi tidak ditemukan");
      
      // Store success org info for display, ensuring id is set
      setSuccessOrg({ ...org, id: orgId });
      await refresh();
      
      // Don't redirect immediately - let user see the success message
      // They can click to go to dashboard or continue browsing
    } catch (err) {
      setError(err.message || "Gagal membuat organisasi");
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <MainNavbar />

      <main className="flex-grow flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-[#E8D1C5] flex items-center justify-center">
              <Building2 className="w-6 h-6 text-[#37393B]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#17191B]">
                {isSubOrgMode ? "Buat Sub-Organisasi" : "Buat Organisasi"}
              </h1>
              <p className="text-sm text-white0">
                {isSubOrgMode
                  ? "Buat unit turunan di dalam organisasi saat ini"
                  : "Kelola tim dan akses anggota dalam satu tempat"}
              </p>
            </div>
          </div>

          {/* Success Message */}
          {successOrg && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-2xl p-5">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-green-800 mb-2">
                    {successOrg.status === 'pending' 
                      ? "Organisasi Berhasil Dibuat!" 
                      : "Organisasi Berhasil Dibuat!"}
                  </h3>
                  {successOrg.status === 'pending' ? (
                    <div className="space-y-2 text-sm text-green-700">
                      <p>
                        <strong>{successOrg.name}</strong> telah berhasil dibuat.
                      </p>
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-2">
                        <p className="font-medium text-amber-800 mb-1">Menunggu Persetujuan Admin</p>
                        <p className="text-xs text-amber-700">
                          Organisasi Anda sedang menunggu persetujuan dari administrator. 
                          Anda akan menerima notifikasi setelah organisasi disetujui.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-green-700">
                      <strong>{successOrg.name}</strong> telah berhasil dibuat dan siap digunakan.
                    </p>
                  )}
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => router.push(`/organization/${successOrg.id}/dashboard`)}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
                    >
                      <Building2 className="w-4 h-4" />
                      Lihat Dashboard
                    </button>
                    <button
                      onClick={() => {
                        setSuccessOrg(null);
                        setName("");
                        setDescription("");
                      }}
                      className="px-4 py-2 bg-white hover:bg-green-50 text-green-700 border border-green-300 text-sm font-medium rounded-lg transition-colors"
                    >
                      Buat Organisasi Lain
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-2xl shadow-sm border border-[#E8D1C5] p-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              {isSubOrgMode && (
                <div className="flex items-start gap-2.5 p-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
                  <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>
                    Parent: <b>{parentName || parentId}</b> • Kedalaman baru: <b>{nextDepth}</b>/{MAX_ORG_DEPTH}
                    {depthLimitReached && " • Batas kedalaman tercapai, tidak bisa membuat sub-organisasi lagi."}
                  </span>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-[#37393B] mb-1.5">
                  Nama {isSubOrgMode ? "Sub-Organisasi" : "Organisasi"} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={
                    isSubOrgMode
                      ? "Contoh: Unit Gizi Regional"
                      : "Contoh: SD Negeri Maju Bersama"
                  }
                  required
                  className="w-full px-4 py-3 border border-[#D9C7B8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D9C7B8] focus:border-white0 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#37393B] mb-1.5">
                  Deskripsi
                  <span className="text-[#C9A89A] font-normal ml-1">(opsional)</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Jelaskan tujuan atau kegiatan organisasi Anda..."
                  rows={3}
                  className="w-full px-4 py-3 border border-[#D9C7B8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D9C7B8] focus:border-white0 text-sm resize-none"
                />
              </div>

              {/* Info box */}
              <div className="flex items-start gap-2.5 p-3 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-700">
                <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>
                  Setelah membuat {isSubOrgMode ? "sub-organisasi" : "organisasi"}, 
                  <strong> organisasi akan menunggu persetujuan dari administrator</strong>. 
                  Setelah disetujui, Anda dapat mengundang anggota menggunakan kode undangan yang tersedia.
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
                  className="px-5 py-2.5 bg-[#452829] hover:bg-[#6C2D19] text-white font-semibold rounded-xl text-sm transition disabled:opacity-60"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading || !name.trim() || depthLimitReached}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#452829] hover:bg-[#6C2D19] text-white font-semibold rounded-xl text-sm transition disabled:opacity-60 shadow-sm"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Membuat...
                    </span>
                  ) : (
                    <>
                      {isSubOrgMode ? "Buat Sub-Organisasi" : "Buat Organisasi"}
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
