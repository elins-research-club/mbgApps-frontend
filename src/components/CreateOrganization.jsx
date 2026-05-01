// src/components/CreateOrganization.jsx
import { useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/contexts/AuthContext";
import { createOrganization, createSubOrganization, requestToJoinByCode } from "@/services/orgService";
import MainNavbar from "./MainNavbar";
import Footer from "./Footer";
import { Building2, ArrowRight, Info, CheckCircle, AlertCircle, Plus, X } from "lucide-react";

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
  const [memberEmailInput, setMemberEmailInput] = useState("");
  const [memberEmails, setMemberEmails] = useState([]);
  const [joinCode, setJoinCode] = useState("");
  const [joinLoading, setJoinLoading] = useState(false);
  const [joinError, setJoinError] = useState(null);
  const [entryMode, setEntryMode] = useState("create");

  const parentId = toStringQueryValue(router.query?.parentId).trim();
  const parentName = toStringQueryValue(router.query?.parentName).trim();
  const parentDepth = toNumberDepth(toStringQueryValue(router.query?.parentDepth));
  const isSubOrgMode = !!parentId;
  const nextDepth = parentDepth + 1;
  const depthLimitReached = isSubOrgMode && nextDepth > MAX_ORG_DEPTH;

  const addMemberEmail = () => {
    const email = memberEmailInput.trim().toLowerCase();
    if (!email) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Format email anggota tidak valid");
      return;
    }
    if (memberEmails.includes(email)) {
      setError("Email anggota sudah ditambahkan");
      return;
    }

    setMemberEmails((prev) => [...prev, email]);
    setMemberEmailInput("");
    setError(null);
  };

  const removeMemberEmail = (email) => {
    setMemberEmails((prev) => prev.filter((item) => item !== email));
  };

  const handleJoinByCode = async (e) => {
    e.preventDefault();
    const normalized = joinCode.trim().toUpperCase();
    if (!normalized) {
      setJoinError("Kode undangan wajib diisi");
      return;
    }

    setJoinLoading(true);
    setJoinError(null);

    try {
      await requestToJoinByCode(normalized);
      await refresh();
      router.push("/");
    } catch (err) {
      setJoinError(err.message || "Gagal bergabung ke organisasi");
    } finally {
      setJoinLoading(false);
    }
  };

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
        ? await createSubOrganization(parentId, { name, description, memberEmails })
        : await createOrganization({ name, description, memberEmails });

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

          {!isSubOrgMode && (
            <div className="mb-5 grid grid-cols-2 gap-2 rounded-2xl border border-[#E8D1C5] bg-[#FAF6F3] p-2">
              <button
                type="button"
                onClick={() => setEntryMode("create")}
                className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                  entryMode === "create"
                    ? "bg-[#452829] text-white"
                    : "bg-white text-[#37393B] hover:bg-[#E8D1C5]"
                }`}
              >
                Buat Organisasi
              </button>
              <button
                type="button"
                onClick={() => setEntryMode("join")}
                className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                  entryMode === "join"
                    ? "bg-[#452829] text-white"
                    : "bg-white text-[#37393B] hover:bg-[#E8D1C5]"
                }`}
              >
                Gabung dengan Kode
              </button>
            </div>
          )}

          <div className="bg-white rounded-2xl shadow-sm border border-[#E8D1C5] p-6">
            {isSubOrgMode || entryMode === "create" ? (
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

              <div>
                <label className="block text-sm font-semibold text-[#37393B] mb-1.5">
                  Tambah Anggota Awal
                  <span className="text-[#C9A89A] font-normal ml-1">(opsional)</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={memberEmailInput}
                    onChange={(e) => setMemberEmailInput(e.target.value)}
                    placeholder="email@contoh.com"
                    className="flex-1 px-4 py-3 border border-[#D9C7B8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D9C7B8] focus:border-white0 text-sm"
                  />
                  <button
                    type="button"
                    onClick={addMemberEmail}
                    className="px-4 py-3 bg-[#452829] hover:bg-[#6C2D19] text-white rounded-xl font-semibold text-sm transition flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Tambah
                  </button>
                </div>

                {memberEmails.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {memberEmails.map((email) => (
                      <span
                        key={email}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#E8D1C5] text-[#17191B] text-xs font-medium"
                      >
                        {email}
                        <button
                          type="button"
                          onClick={() => removeMemberEmail(email)}
                          className="text-[#452829] hover:text-red-600"
                          aria-label={`Hapus ${email}`}
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
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
            ) : (
              <form onSubmit={handleJoinByCode} className="space-y-5">
                <div className="flex items-start gap-2.5 p-3 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-700">
                  <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>
                    Masukkan kode undangan untuk bergabung ke organisasi yang sudah ada.
                  </span>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#37393B] mb-1.5">
                    Kode Undangan <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value)}
                    placeholder="Contoh: F80C3C96"
                    className="w-full px-4 py-3 border border-[#D9C7B8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D9C7B8] focus:border-white0 text-sm uppercase tracking-widest"
                  />
                </div>

                {joinError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                    {joinError}
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => router.back()}
                    disabled={joinLoading}
                    className="px-5 py-2.5 bg-[#452829] hover:bg-[#6C2D19] text-white font-semibold rounded-xl text-sm transition disabled:opacity-60"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={joinLoading || !joinCode.trim()}
                    className="flex items-center gap-2 px-5 py-2.5 bg-[#452829] hover:bg-[#6C2D19] text-white font-semibold rounded-xl text-sm transition disabled:opacity-60 shadow-sm"
                  >
                    {joinLoading ? (
                      <span className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Memproses...
                      </span>
                    ) : (
                      <>
                        Gabung Organisasi
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
