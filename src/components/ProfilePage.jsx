// src/components/ProfilePage.jsx
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { createClient } from "@/lib/client";
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
  const { user, profile, orgMembership, organizations, loading, refresh, switchOrganization } = useAuth();
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState(null); // { type: 'success'|'error', text }

  const [inviteCode, setInviteCode] = useState("");
  const [joining, setJoining] = useState(false);
  const [joinMsg, setJoinMsg] = useState(null);

  const [allMemberships, setAllMemberships] = useState([]);
  const [loadingMemberships, setLoadingMemberships] = useState(false);

  // Pre-fill form from profile
  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "");
      setPhone(profile.phone || "");
      setBio(profile.bio || "");
    }
  }, [profile]);

  // Fetch all memberships for this user
  useEffect(() => {
  const fetchAllMemberships = async () => {
    if (!user?.id) return;
    setLoadingMemberships(true);
    try {
      const supabase = createClient();

      // Fetch memberships
      const { data: memberships, error } = await supabase
        .from("Membership")
        .select(`
          id, status, role_id, joined_at, invite_method,
          organization:Organizations ( id, name, description, owner_id, invite_code, status ),
          role:Roles ( id, name, permissions )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch owned orgs not already in memberships
      const { data: ownedOrgs } = await supabase
        .from("Organizations")
        .select("id, name, description, owner_id, invite_code, status")
        .eq("owner_id", user.id)
        .order("created_at", { ascending: false });

      const membershipOrgIds = new Set((memberships || []).map(m => m.organization?.id));

      // Convert owned orgs to membership-shaped objects for uniform rendering
      const ownedAsMemberships = (ownedOrgs || [])
        .filter(org => !membershipOrgIds.has(org.id))
        .map(org => ({
          id: `owner-${org.id}`,   // synthetic id
          status: "active",
          role_id: null,
          joined_at: null,
          invite_method: "owner",
          organization: org,
          role: null,
        }));

      setAllMemberships([...ownedAsMemberships, ...(memberships || [])]);
    } catch (err) {
      console.error("Failed to fetch memberships:", err);
    } finally {
      setLoadingMemberships(false);
    }
  };

  fetchAllMemberships();
}, [user?.id]);

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
        <div className="w-8 h-8 border-4 border-white0 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const org = orgMembership?.organization;
  const memberStatus = orgMembership?.status;
  const ownedOrganizations = (organizations || []).filter((o) => o?.owner_id === user?.id);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <MainNavbar />

      <main className="flex-grow max-w-3xl w-full mx-auto px-4 py-10 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-[#17191B]">Profil Saya</h1>
          <p className="text-white0 text-sm mt-1">
            Kelola informasi akun dan keanggotaan organisasi Anda
          </p>
        </div>

        {/* Profile form */}
        <section className="bg-white rounded-2xl shadow-sm border border-[#E8D1C5] p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-[#E8D1C5] flex items-center justify-center">
              <User className="w-5 h-5 text-[#37393B]" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-[#17191B]">
                Informasi Pribadi
              </h2>
              <p className="text-xs text-white0">{user?.email}</p>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#37393B] mb-1">
                Nama Lengkap
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Masukkan nama lengkap"
                className="w-full px-4 py-2.5 border border-[#D9C7B8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D9C7B8] focus:border-white0 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#37393B] mb-1">
                Nomor Telepon
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Contoh: 08123456789"
                className="w-full px-4 py-2.5 border border-[#D9C7B8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D9C7B8] focus:border-white0 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#37393B] mb-1">
                Bio
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Ceritakan sedikit tentang Anda..."
                rows={3}
                className="w-full px-4 py-2.5 border border-[#D9C7B8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D9C7B8] focus:border-white0 text-sm resize-none"
              />
            </div>

            {saveMsg && (
              <div
                className={`flex items-center gap-2 p-3 rounded-xl text-sm ${saveMsg.type === "success"
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
              className="px-5 py-2.5 bg-[#17191B] hover:bg-[#37393B] text-white font-semibold rounded-xl text-sm transition disabled:opacity-60"
            >
              {saving ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </form>
        </section>

        {/* Organization memberships */}
        <section className="bg-white rounded-2xl shadow-sm border border-[#E8D1C5] p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-[#452829] flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-[#17191B]">
                Keanggotaan Organisasi
              </h2>
              <p className="text-xs text-white0">
                {loadingMemberships ? "Memuat..." : `${allMemberships.length} organisasi`}
              </p>
            </div>
          </div>

          {loadingMemberships ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-[#C9A89A] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : allMemberships.length > 0 ? (
            <div className="space-y-3">
              {allMemberships.map((membership) => {
                const membershipOrg = membership.organization;
                if (!membershipOrg) return null;

                const isOwner = membershipOrg.owner_id === user?.id;

                return (
                  <div
                    key={membership.id}
                    className="flex items-start gap-3 p-4 bg-white rounded-xl border border-[#E8D1C5]"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-[#17191B]">{membershipOrg.name}</p>
                        {isOwner && (
                          <span className="px-2 py-0.5 bg-[#E8D1C5] text-[#452829] text-xs font-semibold rounded-full">
                            Pemilik
                          </span>
                        )}
                      </div>
                      {membershipOrg.description && (
                        <p className="text-sm text-white0 mt-0.5">{membershipOrg.description}</p>
                      )}
                      <p className="text-xs text-[#C9A89A] mt-1">
                        Kode Undangan: <span className="font-mono font-semibold">{membershipOrg.invite_code}</span>
                      </p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {/* Membership Status */}
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${membership.status === "active"
                              ? "bg-green-100 text-green-700"
                              : membership.status === "pending"
                                ? "bg-yellow-100 text-yellow-700"
                                : membership.status === "rejected"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-gray-100 text-gray-700"
                            }`}
                        >
                          {membership.status === "active" && <CheckCircle className="w-3 h-3" />}
                          {membership.status === "pending" && <Clock className="w-3 h-3" />}
                          {membership.status === "rejected" && <AlertCircle className="w-3 h-3" />}
                          {membership.status === "active"
                            ? "Anggota"
                            : membership.status === "pending"
                              ? "Menunggu"
                              : membership.status === "rejected"
                                ? "Ditolak"
                                : "Nonaktif"}
                        </span>

                        {/* Organization Status */}
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${membershipOrg.status === "active"
                              ? "bg-green-100 text-green-700"
                              : membershipOrg.status === "pending"
                                ? "bg-blue-100 text-blue-700"
                                : membershipOrg.status === "rejected"
                                  ? "bg-red-100 text-red-700"
                                  : membershipOrg.status === "suspended"
                                    ? "bg-orange-100 text-orange-700"
                                    : "bg-gray-100 text-gray-700"
                            }`}
                        >
                          {membershipOrg.status === "active" && <CheckCircle className="w-3 h-3" />}
                          {membershipOrg.status === "pending" && <Clock className="w-3 h-3" />}
                          {membershipOrg.status === "rejected" && <AlertCircle className="w-3 h-3" />}
                          {membershipOrg.status === "suspended" && <AlertCircle className="w-3 h-3" />}
                          {membershipOrg.status === "active"
                            ? "Aktif"
                            : membershipOrg.status === "pending"
                              ? "Pending"
                              : membershipOrg.status === "rejected"
                                ? "Ditolak"
                                : membershipOrg.status === "suspended"
                                  ? "Disuspend"
                                  : "Nonaktif"}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 flex-shrink-0">
                      <Link
                        href={`/organization/${membershipOrg.id}/dashboard`}
                        onClick={() => switchOrganization(membershipOrg.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#17191B] hover:bg-[#37393B] text-white text-xs font-semibold transition"
                      >
                        Dashboard
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-white0">
                Anda belum bergabung dengan organisasi manapun. Buat organisasi
                baru atau masukkan kode undangan untuk bergabung.
              </p>

              <div className="flex gap-3">
                <Link
                  href="/organization/create"
                  className="flex items-center gap-2 px-4 py-2.5 bg-[#452829] hover:bg-[#6C2D19] text-white rounded-xl text-sm font-semibold transition"
                >
                  <Building2 className="w-4 h-4" />
                  Buat Organisasi
                </Link>
              </div>

              {/* Join by code */}
              <div className="border-t border-white pt-4">
                <p className="text-sm font-medium text-[#37393B] mb-3">
                  Gabung dengan kode undangan
                </p>
                <form onSubmit={handleJoinByCode} className="flex gap-2">
                  <div className="relative flex-1">
                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#C9A89A]" />
                    <input
                      type="text"
                      value={inviteCode}
                      onChange={(e) =>
                        setInviteCode(e.target.value.toUpperCase())
                      }
                      placeholder="Masukkan kode undangan"
                      maxLength={8}
                      className="w-full pl-9 pr-4 py-2.5 border border-[#D9C7B8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D9C7B8] text-sm"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={joining || !inviteCode.trim()}
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-[#17191B] hover:bg-[#37393B] text-white rounded-xl text-sm font-semibold transition"
                  >
                    {joining ? "..." : (
                      <>Gabung <ArrowRight className="w-3.5 h-3.5" /></>
                    )}
                  </button>
                </form>

                {joinMsg && (
                  <div
                    className={`mt-3 flex items-start gap-2 p-3 rounded-xl text-sm ${joinMsg.type === "success"
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
