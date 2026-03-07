// src/components/MainNavbar.jsx
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAuth } from "@/contexts/AuthContext";
import {
  User,
  Building2,
  LogOut,
  ChevronDown,
  LayoutDashboard,
  Plus,
} from "lucide-react";

export default function MainNavbar() {
  const { user, profile, orgMembership, isOrgOwner, logout } = useAuth();
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push("/auth/login");
  };

  const displayName =
    profile?.full_name || user?.email?.split("@")[0] || "Pengguna";

  const org = orgMembership?.organizations;

  return (
    <nav className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">M</span>
            </div>
            <span className="font-bold text-lg text-slate-800">MBG Calc</span>
          </Link>

          {/* Right section */}
          <div className="flex items-center gap-3">
            {/* Org info or Create Org button */}
            {org ? (
              <div className="hidden sm:flex items-center gap-2">
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 border border-orange-200 rounded-full text-sm text-orange-700 font-medium">
                  <Building2 className="w-3.5 h-3.5" />
                  <span className="max-w-[120px] truncate">{org.name}</span>
                </div>
                {isOrgOwner && (
                  <Link
                    href={`/organization/${org.id}/dashboard`}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-full text-sm text-slate-700 font-medium transition"
                  >
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    <span>Dashboard Org</span>
                  </Link>
                )}
              </div>
            ) : (
              <Link
                href="/organization/create"
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded-full text-sm font-semibold transition shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                Buat Organisasi
              </Link>
            )}

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
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-20 animate-in fade-in slide-in-from-top-2 duration-150">
                    {/* User info header */}
                    <div className="px-4 py-3 border-b border-slate-100">
                      <p className="text-sm font-semibold text-slate-800 truncate">
                        {displayName}
                      </p>
                      <p className="text-xs text-slate-500 truncate">
                        {user?.email}
                      </p>
                    </div>

                    {/* Mobile org info */}
                    <div className="sm:hidden px-4 py-2 border-b border-slate-100">
                      {org ? (
                        <div>
                          <p className="text-xs text-slate-500 mb-1">Organisasi</p>
                          <p className="text-sm font-medium text-orange-700 truncate">
                            {org.name}
                          </p>
                          {isOrgOwner && (
                            <Link
                              href={`/organization/${org.id}/dashboard`}
                              className="block mt-1 text-xs text-slate-600 hover:text-slate-800"
                              onClick={() => setDropdownOpen(false)}
                            >
                              Dashboard Organisasi
                            </Link>
                          )}
                        </div>
                      ) : (
                        <Link
                          href="/organization/create"
                          className="block text-sm text-orange-600 font-medium"
                          onClick={() => setDropdownOpen(false)}
                        >
                          + Buat Organisasi
                        </Link>
                      )}
                    </div>

                    <Link
                      href="/profile"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <User className="w-4 h-4 text-slate-400" />
                      Profil Saya
                    </Link>

                    {org && isOrgOwner && (
                      <Link
                        href={`/organization/${org.id}/dashboard`}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition sm:hidden"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <LayoutDashboard className="w-4 h-4 text-slate-400" />
                        Dashboard Organisasi
                      </Link>
                    )}

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
    </nav>
  );
}
