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
  LayoutGrid,
  Plus,
  Ticket,
  X,
  Utensils,
  CheckCircle2,
} from "lucide-react";

export default function MainNavbar() {
  const { user, profile, orgMembership, organizations, isOrgOwner, canManagePlans, canManageUsers, canManageRoles, canSave, refresh, logout, isActiveOrg, isChef, isAhliGizi } = useAuth();
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteCode, setInviteCode] = useState("");
  const [inviteSubmitting, setInviteSubmitting] = useState(false);
  const [inviteError, setInviteError] = useState("");

  // Helper to organize orgs hierarchically
  const getOrganizationTree = () => {
    if (!allOrganizations.length) return [];
    
    const orgsWithDepth = allOrganizations.map(org => ({
      ...org,
      depth: org?.depth || org?.level || org?.hierarchyDepth || org?.hierarchy_depth || 0,
    }));
    
    // Sort by depth (roots first) then by name
    const sorted = orgsWithDepth.sort((a, b) => {
      if (a.depth !== b.depth) return a.depth - b.depth;
      return (a.name || '').localeCompare(b.name || '');
    });
    
    return sorted;
  };

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
    : router.query?.id || router.query?.orgId;
  const isDashboardRoute = router.pathname === "/organization/[id]/dashboard";
  const isSetMenuRoute = router.pathname === "/meal-planner";
  const showChefActions = isChef || canSave || canManagePlans;
  const showValidationAction = isAhliGizi;
  const orgFromRoute = (organizations || []).find((item) => item?.id === routeOrgId);
  const org = orgFromRoute || orgMembership?.organization || organizations?.[0] || null;
  const activeOrgId = routeOrgId || org?.id || null;
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
    <nav className="bg-white border-b border-[#E8D1C5] shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3 min-w-0">
            {/* Current organization as the leftmost navbar element */}
            {org && (
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-[#452829] border border-[#452829] rounded-full text-sm text-white font-medium min-w-0">
                <Building2 className="w-3.5 h-3.5 flex-shrink-0 text-white" />
                <span className="max-w-[220px] truncate">{org.name}</span>
              </div>
            )}

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 shrink-0">
              <div className="w-8 h-8 bg-[#452829] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">M</span>
              </div>
              <span className="font-bold text-lg text-[#17191B]">MBG Calc</span>
            </Link>
            {/* {showChefActions && (
              <Link
                href={activeOrgId ? `/meal-planner?orgId=${activeOrgId}` : "/meal-planner"}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold transition border ${
                  isSetMenuRoute
                    ? "bg-[#452829] text-white border-[#452829]"
                    : "bg-[#452829] hover:bg-[#6C2D19] text-white border-[#6C2D19]"
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                Set Menu
              </Link>
            )} */}
          </div>

          {/* Right section */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2">
              {/* {showChefActions && isActiveOrg && (
                <Link
                  href={activeOrgId ? `/meal-planner?orgId=${activeOrgId}` : "/meal-planner"}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold transition border ${
                    isSetMenuRoute
                      ? "bg-[#452829] text-white border-[#452829]"
                      : "bg-[#452829] hover:bg-[#6C2D19] text-white border-[#6C2D19]"
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  Set Menu
                </Link>
              )} */}

              {showChefActions && isActiveOrg && (
                <Link
                  href={activeOrgId ? `/create-menu?orgId=${activeOrgId}` : "/create-menu"}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold transition border bg-[#452829] hover:bg-[#6C2D19] text-white border-[#6C2D19]"
                >
                  <Utensils className="w-3.5 h-3.5" />
                  Create Menu
                </Link>
              )}

              {showValidationAction && isActiveOrg && (
                <Link
                  href={activeOrgId ? `/ahli-gizi?orgId=${activeOrgId}` : "/ahli-gizi"}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold transition border bg-[#452829] hover:bg-[#6C2D19] text-white border-[#6C2D19]"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Verify Bahan
                </Link>
              )}

              {/* {canOpenDashboard && org && (
                <Link
                  href={`/organization/${org.id}/dashboard`}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition border ${
                    isDashboardRoute && routeOrgId === org.id
                      ? "bg-[#452829] text-white border-[#452829]"
                      : "bg-[#452829] hover:bg-[#6C2D19] text-white border-[#6C2D19]"
                  }`}
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span>Dashboard</span>
                </Link>
              )} */}
              {showChefActions && (
              <>
              <Link
                href={activeOrgId ? `/meal-planner?orgId=${activeOrgId}` : "/meal-planner"}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold transition border ${
                  isSetMenuRoute
                    ? "bg-[#452829] text-white border-[#452829]"
                    : "bg-[#452829] hover:bg-[#6C2D19] text-white border-[#6C2D19]"
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                Set Menu
              </Link>
              <Link
                href={activeOrgId ? `/create-menu?orgId=${activeOrgId}` : "/create-menu"}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold transition border ${
                  isSetMenuRoute
                    ? "bg-[#452829] text-white border-[#452829]"
                    : "bg-[#452829] hover:bg-[#6C2D19] text-white border-[#6C2D19]"
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                Buat Menu
              </Link>
              </>
            )}
              {showValidationAction && (
                <Link
                href={activeOrgId ? `/ahli-gizi?orgId=${activeOrgId}` : "/ahli-gizi"}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold transition border ${
                  isSetMenuRoute
                    ? "bg-[#452829] text-white border-[#452829]"
                    : "bg-[#452829] hover:bg-[#6C2D19] text-white border-[#6C2D19]"
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                Validasi Bahan
              </Link>
              )}
            </div>

            {/* User dropdown */}
            <div className="relative">
              <button
                onClick={() => setDropdownOpen((v) => !v)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-[#E8D1C5] transition text-[#37393B]"
              >
                <div className="w-7 h-7 rounded-full bg-[#E8D1C5] flex items-center justify-center">
                  <User className="w-4 h-4 text-[#37393B]" />
                </div>
                <span className="hidden sm:block text-sm font-medium max-w-[100px] truncate">
                  {displayName}
                </span>
                <ChevronDown className="w-4 h-4 text-[#C9A89A]" />
              </button>

              {dropdownOpen && (
                <>
                  {/* Backdrop */}
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-white py-2 z-20 animate-in fade-in slide-in-from-top-2 duration-150">
                    {/* User info header */}
                    <div className="px-4 py-3 border-b border-white">
                      <p className="text-sm font-semibold text-[#17191B] truncate">
                        {displayName}
                      </p>
                      <p className="text-xs text-white0 truncate">
                        {user?.email}
                      </p>
                    </div>

                    <Link
                      href="/profile"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-black hover:bg-[#E8D1C5] hover:text-white transition rounded-xl"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <User className="w-4 h-4 text-[#C9A89A]" />
                      Profil Saya
                    </Link>

                    {showChefActions && (
                      <Link
                        href={activeOrgId ? `/meal-planner?orgId=${activeOrgId}` : "/meal-planner"}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-black hover:bg-[#E8D1C5] hover:text-white transition font-medium rounded-xl"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <LayoutGrid className="w-4 h-4" />
                        Set Menu
                      </Link>
                    )}

                    {showChefActions && (
                      <Link
                        href={activeOrgId ? `/create-menu?orgId=${activeOrgId}` : "/create-menu"}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-black hover:bg-[#E8D1C5] hover:text-white transition font-medium rounded-xl"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <Utensils className="w-4 h-4" />
                        Buat Menu
                      </Link>
                    )}

                    {showValidationAction && (
                      <Link
                        href={activeOrgId ? `/ahli-gizi?orgId=${activeOrgId}` : "/ahli-gizi"}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-black hover:bg-[#E8D1C5] hover:text-white transition font-medium rounded-xl"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Validasi Bahan
                      </Link>
                    )}

                    <div className="border-t border-[#E8D1C5] mt-1 pt-1">
                      <button
                        onClick={handleOpenInviteModal}
                        className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-black hover:bg-[#E8D1C5] hover:text-white transition font-medium rounded-xl"
                      >
                        <Ticket className="w-4 h-4" />
                        Masukkan Kode Undangan
                      </button>
{/* 
                      <Link
                        href="/organization/create"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-black hover:bg-[#E8D1C5] hover:text-white transition font-medium rounded-xl"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <Plus className="w-4 h-4" />
                        Buat Organisasi
                      </Link> */}

                      <div className="border-t border-[#E8D1C5] mt-1 pt-1" />

                      {allOrganizations.length > 0 ? (
                        <>
                        
                          <div className="px-4 py-2">
                            <p className="text-xs font-semibold text-[#37393B]">Organisasi</p>
                          </div>

                          <div className="px-2 pb-1 space-y-0.5 max-h-64 overflow-y-auto">
                            {getOrganizationTree().map((item) => {
                              const isActiveOrg = item?.id === routeOrgId || (!routeOrgId && item?.id === org?.id);
                              const canOpenItemDashboard =
                                item?.owner_id === user?.id || isOrgOwner || canManageUsers || canManageRoles;
                              const isSubOrg = item.depth > 0;
                              const isOwner = item?.owner_id === user?.id;
                              const indentLevel = item.depth;
                              const totalMembers = item?.memberCounts?.totalCount;

                              return (
                                <Link
                                  key={item.id}
                                  href={canOpenItemDashboard ? `/organization/${item.id}/dashboard` : "/profile"}
                                  className={`flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-sm transition ${
                                    isActiveOrg
                                      ? "bg-green-100 border border-green-300 text-green-900 font-semibold"
                                      : "bg-[#452829] text-white hover:bg-[#6C2D19]"
                                  }`}
                                  onClick={() => setDropdownOpen(false)}
                                  style={{ marginLeft: `${indentLevel * 100}px` }}
                                >
                                  <div className="flex items-center gap-2 min-w-0 flex-1">
                                    {isSubOrg && (
                                      <span className="text-xs text-[#C9A89A] flex-shrink-0 font-bold">└</span>
                                    )}
                                    <span className="min-w-0 truncate font-medium">{item.name}</span>
                                    {isOwner && !isActiveOrg && (
                                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full flex-shrink-0 whitespace-nowrap">
                                        Pemilik
                                      </span>
                                    )}
                                    {typeof totalMembers === "number" && (
                                      <span className={`px-2 py-0.5 text-xs font-semibold rounded-full flex-shrink-0 whitespace-nowrap ${
                                        isActiveOrg
                                          ? "bg-white/80 text-[#17191B]"
                                          : "bg-white/15 text-white"
                                      }`}>
                                        {totalMembers} anggota
                                      </span>
                                    )}
                                  </div>
                                  {canOpenItemDashboard && (
                                    <LayoutDashboard className="w-4 h-4 flex-shrink-0" />
                                  )}
                                </Link>
                              );
                            })}
                          </div>
                        </>
                      ) : null}
                    </div>

                    <div className="border-t border-[#E8D1C5] mt-1 pt-1">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-black hover:bg-[#E8D1C5] hover:text-white transition rounded-xl"
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
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl border border-[#E8D1C5]">
            <div className="flex items-center justify-between px-5 py-4 border-b border-white">
              <h3 className="text-base font-semibold text-[#17191B]">Masukkan Kode Undangan</h3>
              <button
                onClick={() => setInviteModalOpen(false)}
                className="p-1 rounded-lg hover:bg-[#E8D1C5] text-white0"
                aria-label="Tutup"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleJoinByCode} className="px-5 py-4 space-y-3">
              <p className="text-sm text-white0">
                Masukkan kode undangan organisasi untuk mengirim permintaan bergabung.
              </p>
              <input
                type="text"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                placeholder="Contoh: F80C3C96"
                className="w-full px-4 py-2.5 border border-[#D9C7B8] rounded-xl text-sm tracking-widest uppercase focus:outline-none focus:ring-2 focus:ring-[#D9C7B8]"
                maxLength={20}
              />
              {inviteError && (
                <p className="text-xs text-red-600">{inviteError}</p>
              )}

              <div className="pt-1 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setInviteModalOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-white rounded-xl bg-[#452829] hover:bg-[#6C2D19]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={inviteSubmitting}
                  className="px-4 py-2 text-sm font-semibold text-white bg-[#452829] hover:bg-[#6C2D19] rounded-xl  disabled:opacity-60"
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
