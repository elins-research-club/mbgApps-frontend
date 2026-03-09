// src/components/MainNavbar.jsx
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAuth } from "@/contexts/AuthContext";
import { requestToJoinByCode } from "@/services/orgService";
import {
  User,
  Building2,
  LogOut,
  ChevronDown,
  LayoutDashboard,
  Plus,
  Ticket,
  X,
} from "lucide-react";

export default function MainNavbar() {
  const { user, profile, orgMembership, organizations, isOrgOwner, canManageUsers, canManageRoles, refresh, logout } = useAuth();
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteCode, setInviteCode] = useState("");
  const [inviteSubmitting, setInviteSubmitting] = useState(false);
  const [inviteError, setInviteError] = useState("");

  const handleLogout = async () => {
    await logout();
    router.push("/auth/login");
  };

  const displayName =
    profile?.full_name || user?.email?.split("@")[0] || "Pengguna";

  const handleOpenInviteModal = () => {
    setDropdownOpen(false);
    setInviteCode("");
    setInviteError("");
    setInviteModalOpen(true);
  };

  const handleJoinByCode = async (e) => {
    e.preventDefault();
    const normalized = inviteCode.trim().toUpperCase();
    if (!normalized) {
      setInviteError("Kode undangan wajib diisi");
      return;
    }

    setInviteSubmitting(true);
    setInviteError("");
    try {
      await requestToJoinByCode(normalized);
      await refresh();
      setInviteModalOpen(false);
      router.push("/profile");
    } catch (error) {
      setInviteError(error?.message || "Gagal menggunakan kode undangan");
    } finally {
      setInviteSubmitting(false);
    }
  };

  const routeOrgId = Array.isArray(router.query?.id)
    ? router.query.id[0]
    : router.query?.id;
  const isDashboardRoute = router.pathname === "/organization/[id]/dashboard";
  const orgFromRoute = (organizations || []).find((item) => item?.id === routeOrgId);
  const org = orgFromRoute || orgMembership?.organization || organizations?.[0] || null;
  const canOpenDashboard = !!(
    org &&
    (org.owner_id === user?.id || isOrgOwner || canManageUsers || canManageRoles)
  );
  const allOrganizations = (organizations || []).length
    ? organizations
    : org
    ? [org]
    : [];

  return (
    <nav className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3 min-w-0">
            {/* Current organization as the leftmost navbar element */}
            {org && (
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 border border-orange-200 rounded-full text-sm text-orange-700 font-medium min-w-0">
                <Building2 className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="max-w-[220px] truncate">{org.name}</span>
              </div>
            )}

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 shrink-0">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">M</span>
              </div>
              <span className="font-bold text-lg text-slate-800">MBG Calc</span>
            </Link>
          </div>

          {/* Right section */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2">
              {canOpenDashboard && org && (
                <Link
                  href={`/organization/${org.id}/dashboard`}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition border ${
                    isDashboardRoute && routeOrgId === org.id
                      ? "bg-slate-100 text-slate-800 border-slate-400 ring-2 ring-slate-300"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-700 border-transparent"
                  }`}
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span>Dashboard Org</span>
                </Link>
              )}
              <button
                onClick={handleOpenInviteModal}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-full text-sm font-semibold transition shadow-sm"
              >
                <Ticket className="w-3.5 h-3.5" />
                Masukkan Kode
              </button>
              <Link
                href="/organization/create"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded-full text-sm font-semibold transition shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                Buat Organisasi
              </Link>
            </div>

            {/* User dropdown */}
            <div className="relative">
              <button
                onClick={() => setDropdownOpen((v) => !v)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-100 transition text-slate-700"
              >
                <div className="w-7 h-7 rounded-full bg-orange-100 flex items-center justify-center">
                  <User className="w-4 h-4 text-orange-600" />
                </div>
                <span className="hidden sm:block text-sm font-medium max-w-[100px] truncate">
                  {displayName}
                </span>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>

              {dropdownOpen && (
                <>
                  {/* Backdrop */}
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-20 animate-in fade-in slide-in-from-top-2 duration-150">
                    {/* User info header */}
                    <div className="px-4 py-3 border-b border-slate-100">
                      <p className="text-sm font-semibold text-slate-800 truncate">
                        {displayName}
                      </p>
                      <p className="text-xs text-slate-500 truncate">
                        {user?.email}
                      </p>
                    </div>

                    <Link
                      href="/profile"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <User className="w-4 h-4 text-slate-400" />
                      Profil Saya
                    </Link>

                    <div className="border-t border-slate-100 mt-1 pt-1">
                      <button
                        onClick={handleOpenInviteModal}
                        className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-blue-600 hover:bg-blue-50 transition font-medium"
                      >
                        <Ticket className="w-4 h-4" />
                        Masukkan Kode Undangan
                      </button>

                      <Link
                        href="/organization/create"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-orange-600 hover:bg-orange-50 transition font-medium"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <Plus className="w-4 h-4" />
                        Buat Organisasi
                      </Link>

                      <div className="border-t border-slate-100 mt-1 pt-1" />

                      {allOrganizations.length > 0 ? (
                        <>
                          <div className="px-4 py-2">
                            <p className="text-xs text-slate-500">Organisasi</p>
                          </div>

                          <div className="px-2 pb-1 space-y-1 max-h-64 overflow-y-auto">
                            {allOrganizations.map((item) => {
                              const isActiveOrg = item?.id === routeOrgId || (!routeOrgId && item?.id === org?.id);
                              const canOpenItemDashboard =
                                item?.owner_id === user?.id || isOrgOwner || canManageUsers || canManageRoles;
                              const isActiveDashboardItem = isDashboardRoute && routeOrgId === item?.id;

                              return (
                                <Link
                                  key={item.id}
                                  href={canOpenItemDashboard ? `/organization/${item.id}/dashboard` : "/profile"}
                                  className={`flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-sm transition ${
                                    isActiveOrg
                                      ? `bg-orange-50 border text-orange-700 ${
                                          isActiveDashboardItem ? "border-orange-400 ring-2 ring-orange-200" : "border-orange-200"
                                        }`
                                      : "text-slate-700 hover:bg-slate-50 border border-transparent"
                                  }`}
                                  onClick={() => setDropdownOpen(false)}
                                >
                                  <span className="min-w-0 truncate font-medium">{item.name}</span>
                                  {canOpenItemDashboard && (
                                    <LayoutDashboard className="w-4 h-4 flex-shrink-0 text-slate-400" />
                                  )}
                                </Link>
                              );
                            })}
                          </div>
                        </>
                      ) : null}
                    </div>

                    <div className="border-t border-slate-100 mt-1 pt-1">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition"
                      >
                        <LogOut className="w-4 h-4" />
                        Keluar
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {inviteModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h3 className="text-base font-semibold text-slate-800">Masukkan Kode Undangan</h3>
              <button
                onClick={() => setInviteModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-500"
                aria-label="Tutup"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleJoinByCode} className="px-5 py-4 space-y-3">
              <p className="text-sm text-slate-500">
                Masukkan kode undangan organisasi untuk mengirim permintaan bergabung.
              </p>
              <input
                type="text"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                placeholder="Contoh: F80C3C96"
                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm tracking-widest uppercase focus:outline-none focus:ring-2 focus:ring-orange-300"
                maxLength={20}
              />
              {inviteError && (
                <p className="text-xs text-red-600">{inviteError}</p>
              )}

              <div className="pt-1 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setInviteModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-700 rounded-xl hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={inviteSubmitting}
                  className="px-4 py-2 text-sm font-semibold text-white bg-orange-500 rounded-xl hover:bg-orange-600 disabled:opacity-60"
                >
                  {inviteSubmitting ? "Memproses..." : "Gabung"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </nav>
  );
}
