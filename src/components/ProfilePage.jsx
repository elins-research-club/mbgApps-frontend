// src/components/ProfilePage.jsx
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { updateProfile, requestToJoinByCode } from "@/services/orgService";
import MainNavbar from "./MainNavbar";
import Footer from "./Footer";
import {
  User,
  Building2,
  Key,
  CheckCircle,
  AlertCircle,
  Clock,
  ArrowRight,
} from "lucide-react";

export default function ProfilePage() {
  const { user, profile, orgMembership, organizations, loading, refresh } = useAuth();
  const router = useRouter();

  const [fullName, setFullName]   = useState("");
  const [phone, setPhone]         = useState("");
  const [bio, setBio]             = useState("");
  const [saving, setSaving]       = useState(false);
  const [saveMsg, setSaveMsg]     = useState(null); // { type: 'success'|'error', text }

  const [inviteCode, setInviteCode] = useState("");
  const [joining, setJoining]       = useState(false);
  const [joinMsg, setJoinMsg]       = useState(null);

  // Pre-fill form from profile
  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "");
      setPhone(profile.phone || "");
      setBio(profile.bio || "");
    }
  }, [profile]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveMsg(null);
    try {
      await updateProfile({ fullName, phone, bio });
      await refresh();
      setSaveMsg({ type: "success", text: "Profil berhasil diperbarui" });
    } catch (err) {
      setSaveMsg({ type: "error", text: err.message });
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMsg(null), 4000);
    }
  };

  const handleJoinByCode = async (e) => {
    e.preventDefault();
    if (!inviteCode.trim()) return;
    setJoining(true);
    setJoinMsg(null);
    try {
      const result = await requestToJoinByCode(inviteCode);
      setJoinMsg({
        type: "success",
        text: `Permintaan bergabung ke "${result.org.name}" telah terkirim. Tunggu persetujuan pemilik organisasi.`,
      });
      setInviteCode("");
      await refresh();
    } catch (err) {
      setJoinMsg({ type: "error", text: err.message });
    } finally {
      setJoining(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-orange-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const org = orgMembership?.organization;
  const memberStatus = orgMembership?.status;
  const ownedOrganizations = (organizations || []).filter((o) => o?.owner_id === user?.id);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <MainNavbar />

      <main className="flex-grow max-w-3xl w-full mx-auto px-4 py-10 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Profil Saya</h1>
          <p className="text-slate-500 text-sm mt-1">
            Kelola informasi akun dan keanggotaan organisasi Anda
          </p>
        </div>

        {/* Profile form */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
              <User className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-800">
                Informasi Pribadi
              </h2>
              <p className="text-xs text-slate-500">{user?.email}</p>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Nama Lengkap
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Masukkan nama lengkap"
                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Nomor Telepon
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Contoh: 08123456789"
                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Bio
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Ceritakan sedikit tentang Anda..."
                rows={3}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400 text-sm resize-none"
              />
            </div>

            {saveMsg && (
              <div
                className={`flex items-center gap-2 p-3 rounded-xl text-sm ${
                  saveMsg.type === "success"
                    ? "bg-green-50 border border-green-200 text-green-700"
                    : "bg-red-50 border border-red-200 text-red-700"
                }`}
              >
                {saveMsg.type === "success" ? (
                  <CheckCircle className="w-4 h-4 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                )}
                {saveMsg.text}
              </div>
            )}

            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl text-sm transition disabled:opacity-60"
            >
              {saving ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </form>
        </section>

        {/* Organization status */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-base font-semibold text-slate-800">
              Organisasi
            </h2>
          </div>

          {org ? (
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex-1">
                  <p className="font-semibold text-slate-800">{org.name}</p>
                  {org.description && (
                    <p className="text-sm text-slate-500 mt-0.5">{org.description}</p>
                  )}
                </div>
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                    memberStatus === "active"
                      ? "bg-green-100 text-green-700"
                      : memberStatus === "pending"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {memberStatus === "active" && (
                    <CheckCircle className="w-3 h-3" />
                  )}
                  {memberStatus === "pending" && <Clock className="w-3 h-3" />}
                  {memberStatus === "active"
                    ? "Aktif"
                    : memberStatus === "pending"
                    ? "Menunggu"
                    : "Ditolak"}
                </span>
              </div>
              {orgMembership?.role && (
                <div className="text-sm text-slate-600">
                  <span className="font-medium">Peran: </span>
                  {orgMembership.role.name}
                </div>
              )}

              {ownedOrganizations.length > 1 && (
                <div className="mt-4 border-t border-slate-100 pt-4">
                  <p className="text-sm font-semibold text-slate-700 mb-2">
                    Organisasi Yang Anda Miliki ({ownedOrganizations.length})
                  </p>
                  <div className="space-y-2">
                    {ownedOrganizations.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-white"
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-800 truncate">{item.name}</p>
                          <p className="text-xs text-slate-500 truncate">{item.id}</p>
                        </div>
                        <Link
                          href={`/organization/${item.id}/dashboard`}
                          className="ml-3 inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition"
                        >
                          Dashboard
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-slate-500">
                Anda belum bergabung dengan organisasi manapun. Buat organisasi
                baru atau masukkan kode undangan untuk bergabung.
              </p>

              <div className="flex gap-3">
                <Link
                  href="/organization/create"
                  className="flex items-center gap-2 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-semibold transition"
                >
                  <Building2 className="w-4 h-4" />
                  Buat Organisasi
                </Link>
              </div>

              {/* Join by code */}
              <div className="border-t border-slate-100 pt-4">
                <p className="text-sm font-medium text-slate-700 mb-3">
                  Gabung dengan kode undangan
                </p>
                <form onSubmit={handleJoinByCode} className="flex gap-2">
                  <div className="relative flex-1">
                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={inviteCode}
                      onChange={(e) =>
                        setInviteCode(e.target.value.toUpperCase())
                      }
                      placeholder="Masukkan kode undangan"
                      maxLength={8}
                      className="w-full pl-9 pr-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-300 text-sm"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={joining || !inviteCode.trim()}
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm font-semibold transition disabled:opacity-60"
                  >
                    {joining ? "..." : (
                      <>Gabung <ArrowRight className="w-3.5 h-3.5" /></>
                    )}
                  </button>
                </form>

                {joinMsg && (
                  <div
                    className={`mt-3 flex items-start gap-2 p-3 rounded-xl text-sm ${
                      joinMsg.type === "success"
                        ? "bg-green-50 border border-green-200 text-green-700"
                        : "bg-red-50 border border-red-200 text-red-700"
                    }`}
                  >
                    {joinMsg.type === "success" ? (
                      <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    )}
                    <span>{joinMsg.text}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
