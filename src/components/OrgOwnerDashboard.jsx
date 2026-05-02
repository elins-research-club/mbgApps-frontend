// src/components/OrgOwnerDashboard.jsx
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/contexts/AuthContext";
import { createClient } from "@/lib/client";
import {
  getOrganization,
  getOrgMembers,
  getOrgRoles,
  getSubOrganizations,
  acceptMember,
  rejectMember,
  removeMember,
  assignRole,
  createRole,
  updateRole,
  deleteRole,
} from "@/services/orgService";
import MainNavbar from "./MainNavbar";
import Footer from "./Footer";
import OrgApprovalBanner from "./OrgApprovalBanner";
import {
  Users,
  Clock,
  Shield,
  Copy,
  Check,
  X,
  Plus,
  Trash2,
  Edit2,
  RefreshCcw,
  AlertCircle,
  CheckCircle,
  GitBranch,
  Info,
} from "lucide-react";

const MAX_ORG_DEPTH = 2;

function resolveOrgDepth(org) {
  const candidates = [
    org?.depth,
    org?.level,
    org?.hierarchyDepth,
    org?.hierarchy_depth,
  ];

  for (const value of candidates) {
    const num = Number(value);
    if (Number.isFinite(num)) return num;
  }

  return 0;
}

function getOrgDisplayName(org) {
  return org?.name || org?.organizationName || org?.title || "Sub-organisasi";
}

function getOrgParentId(org) {
  return org?.parent_id || org?.parentId || org?.parent?.id || null;
}

async function loadOrgAncestorChain(orgNode) {
  const chain = [];
  const visited = new Set();
  let current = orgNode;

  while (current?.id && !visited.has(current.id)) {
    visited.add(current.id);
    chain.unshift(current);

    const parentId = getOrgParentId(current);
    if (!parentId) break;

    try {
      current = await getOrganization(parentId);
    } catch {
      break;
    }
  }

  return chain;
}

function getOrgMemberCount(org) {
  const direct = Number(org?.memberCounts?.totalCount);
  return Number.isFinite(direct) ? direct : 0;
}

function summarizeMembers(members) {
  const list = Array.isArray(members) ? members : [];
  const activeCount = list.filter((member) => (member?.status || "").toLowerCase() === "active").length;
  const pendingCount = list.filter((member) => (member?.status || "").toLowerCase() === "pending").length;
  return {
    activeCount,
    pendingCount,
    totalCount: list.length,
  };
}

function combineMemberCounts(baseCounts, childNodes) {
  const base = {
    activeCount: Number(baseCounts?.activeCount) || 0,
    pendingCount: Number(baseCounts?.pendingCount) || 0,
    totalCount: Number(baseCounts?.totalCount) || 0,
  };

  const childTotals = (Array.isArray(childNodes) ? childNodes : []).reduce(
    (sum, child) => {
      const childCounts = child?.memberCounts || {};
      return {
        activeCount: sum.activeCount + (Number(childCounts.activeCount) || 0),
        pendingCount: sum.pendingCount + (Number(childCounts.pendingCount) || 0),
        totalCount: sum.totalCount + (Number(childCounts.totalCount) || 0),
      };
    },
    { activeCount: 0, pendingCount: 0, totalCount: 0 }
  );

  return {
    activeCount: base.activeCount + childTotals.activeCount,
    pendingCount: base.pendingCount + childTotals.pendingCount,
    totalCount: base.totalCount + childTotals.totalCount,
  };
}

async function loadOrgTree(orgNode, visited = new Set(), preloadedMembers = null) {
  if (!orgNode?.id || visited.has(orgNode.id)) {
    return {
      ...orgNode,
      memberCounts: orgNode?.memberCounts ?? summarizeMembers(preloadedMembers),
      children: [],
    };
  }

  const nextVisited = new Set(visited);
  nextVisited.add(orgNode.id);

  const [members, children] = await Promise.all([
    preloadedMembers ? Promise.resolve(preloadedMembers) : getOrgMembers(orgNode.id).catch(() => []),
    getSubOrganizations(orgNode.id).catch(() => []),
  ]);

  const enrichedChildren = await Promise.all(
    (Array.isArray(children) ? children : []).map(async (child) => {
      return loadOrgTree(child, nextVisited);
    })
  );

  const backendCounts = orgNode?.memberCounts;
  const resolvedMemberCounts = Number.isFinite(Number(backendCounts?.totalCount))
    ? backendCounts
    : combineMemberCounts(summarizeMembers(members), enrichedChildren);

  return {
    ...orgNode,
    memberCounts: resolvedMemberCounts,
    children: enrichedChildren,
    computedMemberCounts: combineMemberCounts(summarizeMembers(members), enrichedChildren),
    rawMemberCounts: backendCounts ?? null,
  };
}

function flattenOrgTree(nodes, parentChain = []) {
  return (nodes || []).flatMap((node) => {
    const name = getOrgDisplayName(node);
    const chain = [...parentChain, name];
    const children = flattenOrgTree(node?.children || [], chain);
    return [
      {
        ...node,
        displayChain: chain,
      },
      ...children,
    ];
  });
}

// ─── Permission definitions ───────────────────────────────────────────────────
const PERMISSION_DEFS = [
  { key: "can_manage_users",          label: "Kelola Pengguna",        description: "Akses manajemen anggota organisasi" },
  { key: "can_add_users",             label: "Tambah Pengguna",        description: "Mengundang atau menambahkan anggota" },
  { key: "can_approve_members",       label: "Setujui Permintaan",     description: "Menerima atau menolak permintaan gabung" },
  { key: "can_delete_users",          label: "Hapus Pengguna",         description: "Menghapus anggota dari organisasi" },
  { key: "can_manage_roles",          label: "Kelola Peran",           description: "Membuat, mengubah, dan menghapus peran" },
  { key: "can_save_menu",              label: "Simpan Menu",             description: "Menyimpan dan mengedit resep menu" },
  { key: "can_edit_recipe",            label: "Edit Resep",              description: "Mengubah resep yang sudah ada" },
  { key: "can_validate_ingredients",   label: "Validasi Bahan",          description: "Memvalidasi bahan makanan (Ahli Gizi)" },
  { key: "can_manage_meal_plans",      label: "Kelola Rencana Makan",    description: "Membuat dan mengelola meal plan" },
  { key: "can_generate_ai",            label: "Generate AI",             description: "Menggunakan AI untuk generate bahan" },
];

// ─── Small reusable components ────────────────────────────────────────────────
function TabButton({ active, onClick, icon: Icon, label, badge }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition whitespace-nowrap ${
        active
          ? "bg-[#452829] text-white shadow-sm"
          : "text-[#452829] hover:bg-[#E8D1C5]"
      }`}
    >
      <Icon className="w-4 h-4" />
      {label}
      {badge > 0 && (
        <span
          className={`min-w-[1.25rem] h-5 px-1 rounded-full text-xs flex items-center justify-center font-bold ${
            active ? "bg-white/30 text-white" : "bg-red-100 text-red-600"
          }`}
        >
          {badge}
        </span>
      )}
    </button>
  );
}

function Toast({ msg }) {
  if (!msg) return null;
  return (
    <div
      className={`fixed bottom-6 right-6 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium z-50 animate-in slide-in-from-bottom-4 duration-300 ${
        msg.type === "success"
          ? "bg-green-600 text-white"
          : "bg-red-600 text-white"
      }`}
    >
      {msg.type === "success" ? (
        <CheckCircle className="w-4 h-4" />
      ) : (
        <AlertCircle className="w-4 h-4" />
      )}
      {msg.text}
    </div>
  );
}

// ─── Role Form Modal ──────────────────────────────────────────────────────────
function RoleFormModal({ initial, onSave, onClose, saving }) {
  const [name, setName] = useState(initial?.name ?? "");
  const [perms, setPerms] = useState(initial?.permissions ?? {});

  const toggle = (key) => setPerms((p) => ({ ...p, [key]: !p[key] }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({ name, permissions: perms });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8D1C5]">
          <h3 className="text-lg font-bold text-[#17191B]">
            {initial ? "Edit Peran" : "Buat Peran Baru"}
          </h3>
          <button onClick={onClose} className="text-[#C9A89A] hover:text-[#452829]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-[#37393B] mb-1.5">
              Nama Peran <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Chef, Ahli Gizi, Pengelola"
              required
              className="w-full px-4 py-2.5 border border-[#D9C7B8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D9C7B8] text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#37393B] mb-3">
              Hak Akses
            </label>
            <div className="space-y-2">
              {PERMISSION_DEFS.map((p) => (
                <label
                  key={p.key}
                  className="flex items-start gap-3 p-3 rounded-xl border border-[#E8D1C5] hover:bg-white cursor-pointer transition"
                >
                  <div className="pt-0.5">
                    <input
                      type="checkbox"
                      checked={!!perms[p.key]}
                      onChange={() => toggle(p.key)}
                      className="w-4 h-4 accent-slate-500"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#17191B]">{p.label}</p>
                    <p className="text-xs text-white0">{p.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 text-sm font-semibold text-white bg-[#452829] hover:bg-[#6C2D19] rounded-xl transition"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={saving || !name.trim()}
              className="px-4 py-2 text-sm font-semibold bg-[#452829] hover:bg-[#6C2D19] text-white rounded-xl transition disabled:opacity-60"
            >
              {saving ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function OrgOwnerDashboard({ orgId }) {
  const { user, canManageUsers, canManageRoles, refresh: refreshAuth, isOrgPending, isOrgRejected, organization, orgStatusMap } = useAuth();
  const router = useRouter();
  const debugFlag = (process.env.NEXT_PUBLIC_DEBUG_ORG_PAYLOAD || "").toLowerCase();
  const showDebug = debugFlag === "true" || debugFlag === "1";
  const appEnv = process.env.NEXT_PUBLIC_APP_ENV;


  const [org, setOrg]               = useState(null);
  const [members, setMembers]       = useState([]);
  const [roles, setRoles]           = useState([]);
  const [subOrganizationTree, setSubOrganizationTree] = useState([]);
  const [subOrganizations, setSubOrganizations] = useState([]);
  const [orgTitleChain, setOrgTitleChain] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [tab, setTab]               = useState("pending");
  const [toast, setToast]           = useState(null);

  // Role modal
  const [roleModal, setRoleModal]   = useState(null); // null | 'new' | { editing role }
  const [roleSaving, setRoleSaving] = useState(false);

  // Copy invite code
  const [codeCopied, setCodeCopied] = useState(false);

  // Invitation form
  const [invitationEmailInput, setInvitationEmailInput] = useState("");
  const [invitationEmails, setInvitationEmails] = useState([]);
  const [invitationResults, setInvitationResults] = useState([]);
  const [invitationLoading, setInvitationLoading] = useState(false);

  const showToast = (type, text) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 3500);
  };

  // Check if current user is the organization owner
  const currentUserIsOrgOwner = user?.id === (org?.ownerId || org?.owner_id);

  // If the current user is not the owner, default to the members tab
  // but only when the tab is still the initial "pending" value.
  useEffect(() => {
    if (!currentUserIsOrgOwner && tab === "pending") {
      setTab("members");
    }
  }, [currentUserIsOrgOwner, tab]);

  const loadAll = useCallback(async () => {
    setLoadingData(true);
    try {
      const [orgData, membersData, rolesData] = await Promise.all([
        getOrganization(orgId),
        getOrgMembers(orgId),
        getOrgRoles(orgId),
      ]);
      const enrichedRoot = await loadOrgTree(orgData, new Set(), membersData);
      setOrg(enrichedRoot);
      setOrgTitleChain(
        (await loadOrgAncestorChain(enrichedRoot)).map((item) => getOrgDisplayName(item))
      );
      setMembers(membersData);
      setRoles(rolesData);

      if (showDebug) {
        console.log("[OrgOwnerDashboard] orgData", orgData);
        console.log("[OrgOwnerDashboard] enrichedRoot", enrichedRoot);
        console.log("[OrgOwnerDashboard] membersData", membersData);
        console.log("[OrgOwnerDashboard] rolesData", rolesData);
      }

      try {
        const subsTree = Array.isArray(enrichedRoot?.children) ? enrichedRoot.children : [];
        setSubOrganizationTree(subsTree);
        setSubOrganizations(flattenOrgTree(subsTree));
        if (showDebug) {
          console.log("[OrgOwnerDashboard] subOrganizationTree", subsTree);
        }
      } catch {
        setSubOrganizationTree([]);
        setSubOrganizations([]);
      }
    } catch (err) {
      showToast("error", err.message || "Gagal memuat data");
    } finally {
      setLoadingData(false);
    }
  }, [orgId]);

  useEffect(() => {
    if (orgId) loadAll();
  }, [orgId, loadAll]);

  useEffect(() => {
    if (!showDebug) return;
    console.log("[OrgOwnerDashboard] env", {
      NODE_ENV: process.env.NODE_ENV,
      NEXT_PUBLIC_APP_ENV: process.env.NEXT_PUBLIC_APP_ENV,
      NEXT_PUBLIC_DEBUG_ORG_PAYLOAD: process.env.NEXT_PUBLIC_DEBUG_ORG_PAYLOAD,
    });
  }, [showDebug]);

  useEffect(() => {
    if (!canManageUsers && canManageRoles && tab !== "roles") {
      setTab("roles");
    }
    if (canManageUsers && tab === "roles" && !canManageRoles) {
      setTab("pending");
    }
  }, [canManageUsers, canManageRoles, tab]);

  const pending  = members.filter((m) => m.status === "pending");
  const active   = members.filter((m) => m.status === "active");
  const currentOrgDepth = resolveOrgDepth(org);
  const canCreateSubOrg = currentOrgDepth < MAX_ORG_DEPTH;
  const rootOrgName = getOrgDisplayName(org);
  const rootMemberCounts = org?.memberCounts || {};
  const rootActiveCount = Number(rootMemberCounts.activeCount);
  const rootPendingCount = Number(rootMemberCounts.pendingCount);
  const rootTotalCount = Number(rootMemberCounts.totalCount);
  const fallbackRootCounts = combineMemberCounts(summarizeMembers(members), subOrganizationTree);
  const resolvedRootCounts = Number.isFinite(rootTotalCount)
    ? {
        activeCount: Number.isFinite(rootActiveCount) ? rootActiveCount : active.length,
        pendingCount: Number.isFinite(rootPendingCount) ? rootPendingCount : pending.length,
        totalCount: rootTotalCount,
      }
    : fallbackRootCounts;
  const displayRootActiveCount = resolvedRootCounts.activeCount;
  const displayRootPendingCount = resolvedRootCounts.pendingCount;
  const displayRootTotalCount = resolvedRootCounts.totalCount;
  
  // Helper to get user display name from either structure
  const getUserName = (member) => {
    return member.user?.fullName || member.user?.full_name || 
           member.userext?.fullName || member.userext?.full_name || 
           "Pengguna";
  };
  
  // Helper to get member user_id from either structure
  const getMemberUserId = (member) => {
    return member.userId || member.user_id;
  };

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleAccept = async (memberId) => {
    if (!canManageUsers) return showToast("error", "Anda tidak memiliki izin untuk menerima anggota");
    try {
      await acceptMember(orgId, memberId);
      showToast("success", "Anggota berhasil diterima");
      loadAll(); refreshAuth();
    } catch (err) { showToast("error", err.message); }
  };

  const handleReject = async (memberId) => {
    if (!canManageUsers) return showToast("error", "Anda tidak memiliki izin untuk menolak anggota");
    if (!confirm("Tolak permintaan bergabung ini?")) return;
    try {
      await rejectMember(orgId, memberId);
      showToast("success", "Permintaan ditolak");
      loadAll();
    } catch (err) { showToast("error", err.message); }
  };

  const handleRemove = async (memberId, name) => {
    if (!currentUserIsOrgOwner) return showToast("error", "Hanya owner organisasi yang dapat menghapus anggota");
    if (!canManageUsers) return showToast("error", "Anda tidak memiliki izin untuk menghapus anggota");
    if (!confirm(`Hapus ${name} dari organisasi?`)) return;
    try {
      await removeMember(orgId, memberId);
      showToast("success", "Anggota dihapus");
      loadAll(); refreshAuth();
    } catch (err) { showToast("error", err.message); }
  };

  const handleAssignRole = async (memberId, roleId) => {
    if (!currentUserIsOrgOwner) return showToast("error", "Hanya owner organisasi yang dapat mengubah peran anggota");
    if (!canManageUsers) return showToast("error", "Anda tidak memiliki izin untuk mengubah peran anggota");
    try {
      await assignRole(orgId, memberId, roleId || null);
      showToast("success", "Peran diperbarui");
      loadAll(); refreshAuth();
    } catch (err) { showToast("error", err.message); }
  };

  const handleSaveRole = async ({ name, permissions }) => {
    if (!canManageRoles) return showToast("error", "Anda tidak memiliki izin untuk mengelola peran");
    setRoleSaving(true);
    try {
      if (roleModal?.id) {
        await updateRole(orgId, roleModal.id, { name, permissions });
        showToast("success", "Peran diperbarui");
      } else {
        await createRole(orgId, { name, permissions });
        showToast("success", "Peran baru dibuat");
      }
      setRoleModal(null);
      loadAll();
    } catch (err) { showToast("error", err.message); }
    finally { setRoleSaving(false); }
  };

  const handleDeleteRole = async (roleId, roleName) => {
    if (!canManageRoles) return showToast("error", "Anda tidak memiliki izin untuk menghapus peran");
    if (!confirm(`Hapus peran "${roleName}"? Anggota dengan peran ini akan kehilangan perannya.`)) return;
    try {
      await deleteRole(orgId, roleId);
      showToast("success", "Peran dihapus");
      loadAll();
    } catch (err) { showToast("error", err.message); }
  };

  const copyCode = () => {
    const code = org?.inviteCode || org?.invite_code || "";
    navigator.clipboard.writeText(code);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  };

  const addInvitationEmail = () => {
    const email = invitationEmailInput.trim().toLowerCase();
    if (!email) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showToast("error", "Format email tidak valid");
      return;
    }
    if (invitationEmails.includes(email)) {
      showToast("error", "Email sudah ditambahkan");
      return;
    }
    setInvitationEmails((prev) => [...prev, email]);
    setInvitationEmailInput("");
  };

  const removeInvitationEmail = (email) => {
    setInvitationEmails((prev) => prev.filter((item) => item !== email));
  };

  const handleInviteMembers = async (e) => {
    e.preventDefault();
    if (!canManageUsers) {
      showToast("error", "Anda tidak memiliki izin untuk mengundang anggota");
      return;
    }
    if (invitationEmails.length === 0) {
      showToast("error", "Tambahkan minimal satu email");
      return;
    }

    setInvitationLoading(true);
    try {
      const supabase = createClient();
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session?.access_token) {
        throw new Error("Session tidak valid. Silakan login kembali.");
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"}/organizations/${orgId}/invite-members`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ emails: invitationEmails }),
        }
      );

      const contentType = response.headers.get("content-type") || "";
      const payload = contentType.includes("application/json")
        ? await response.json()
        : await response.text();

      if (!response.ok) {
        const message =
          (typeof payload === "object" && (payload.message || payload.error)) ||
          (typeof payload === "string" && payload) ||
          "Gagal mengirim undangan";
        throw new Error(message);
      }

      // Extract invitation results from response
      const results = payload?.results || payload?.invitationResults || payload?.data?.results || [];
      setInvitationResults(Array.isArray(results) ? results : []);
      setInvitationEmails([]);
      showToast("success", `${invitationEmails.length} undangan berhasil diproses`);
    } catch (err) {
      showToast("error", err.message || "Gagal mengirim undangan");
    } finally {
      setInvitationLoading(false);
    }
  };

  const handleCreateSubOrganization = () => {
    if (!org?.id || !canCreateSubOrg) return;

    const query = new URLSearchParams({
      parentId: String(org.id),
      parentName: String(org.name || ""),
      parentDepth: String(currentOrgDepth),
    });

    router.push(`/organization/create?${query.toString()}`);
  };

  // ── Render ───────────────────────────────────────────────────────────────────
  if (loadingData) {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        <MainNavbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-white0 border-t-transparent rounded-full animate-spin" />
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <MainNavbar />
      <OrgApprovalBanner />
      <Toast msg={toast} />

      {roleModal !== null && (
        <RoleFormModal
          initial={typeof roleModal === "object" ? roleModal : null}
          onSave={handleSaveRole}
          onClose={() => setRoleModal(null)}
          saving={roleSaving}
        />
      )}
      {console.log("Org data:", isOrgPending)}
      {/* Pending Approval Overlay */}
      {orgStatusMap[org?.id] === "pending" && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 text-center">
            <Clock className="w-16 h-16 text-[#452829] mx-auto mb-4" />
            <h2 className="text-xl font-bold text-[#17191B] mb-2">
              Menunggu Persetujuan Admin
            </h2>
            <p className="text-[#452829] text-sm mb-6">
              Organisasi <strong>{org?.name || organization?.name}</strong> sedang menunggu persetujuan dari administrator. 
              Anda dapat melihat dashboard ini, tetapi belum dapat mengakses fitur organisasi.
            </p>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
              <p className="text-xs text-amber-700">
                💡 Hubungi administrator untuk mempercepat proses persetujuan.
              </p>
            </div>
            <button
              onClick={loadAll}
              className="w-full px-4 py-2.5 bg-[#17191B] hover:bg-[#37393B] text-white font-semibold rounded-xl transition"
            >
              Refresh Status
            </button>
          </div>
        </div>
      )}

      {/* Rejected Overlay */}
      {orgStatusMap[org?.id] === "rejected" && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-[#17191B] mb-2">
              Organisasi Ditolak
            </h2>
            <p className="text-[#452829] text-sm mb-6">
              Organisasi <strong>{org?.name || organization?.name}</strong> telah ditolak oleh administrator.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => router.push("/organization/create")}
                className="flex-1 px-4 py-2.5 bg-white0 hover:bg-[#37393B] text-white font-semibold rounded-xl transition"
              >
                Buat Organisasi Baru
              </button>
              <button
                onClick={loadAll}
                className="flex-1 px-4 py-2.5 bg-[#D9C7B8] hover:bg-[#C9A89A] text-[#37393B] font-semibold rounded-xl transition"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="flex-grow max-w-5xl w-full mx-auto px-4 py-8 space-y-6">
        {showDebug && (
          <section className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-semibold text-sm">Debug Org Payload</h2>
              <span className="px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 font-semibold">
                {appEnv}
              </span>
            </div>
            <div>
              <p className="font-semibold mb-1">org.memberCounts (resolved)</p>
              <pre className="overflow-auto whitespace-pre-wrap break-words bg-white/70 border border-amber-200 rounded-xl p-3">
{JSON.stringify(org?.memberCounts ?? null, null, 2)}
              </pre>
            </div>
            <div>
              <p className="font-semibold mb-1">org.memberCounts (raw backend)</p>
              <pre className="overflow-auto whitespace-pre-wrap break-words bg-white/70 border border-amber-200 rounded-xl p-3 max-h-40">
{JSON.stringify(org?.rawMemberCounts ?? null, null, 2)}
              </pre>
            </div>
            <div>
              <p className="font-semibold mb-1">subOrganizations raw</p>
              <pre className="overflow-auto whitespace-pre-wrap break-words bg-white/70 border border-amber-200 rounded-xl p-3 max-h-64">
{JSON.stringify(subOrganizations, null, 2)}
              </pre>
            </div>
            <div>
              <p className="font-semibold mb-1">subOrganizations memberCounts summary</p>
              <pre className="overflow-auto whitespace-pre-wrap break-words bg-white/70 border border-amber-200 rounded-xl p-3 max-h-64">
{JSON.stringify(
  subOrganizations.map((sub) => ({
    id: sub.id,
    name: sub.name,
    memberCounts: sub.memberCounts ?? null,
    rawMemberCounts: sub.rawMemberCounts ?? null,
    displayChain: sub.displayChain ?? null,
  })),
  null,
  2
)}
              </pre>
            </div>
          </section>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#17191B]">
              {orgTitleChain.length > 0
                ? orgTitleChain.join(" / ")
                : org?.name ?? "Dashboard Organisasi"}
            </h1>
            {org?.description && (
              <p className="text-white0 text-sm mt-0.5">{org.description}</p>
            )}
          </div>
          <button
            onClick={loadAll}
            className="flex items-center gap-1.5 px-3 py-2 text-sm text-[#452829] hover:bg-[#D9C7B8] rounded-xl transition self-start sm:self-auto"
          >
            <RefreshCcw className="w-4 h-4" /> Refresh
          </button>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Anggota Aktif",    value: displayRootActiveCount,      color: "text-black" },
            { label: "Menunggu",         value: displayRootPendingCount,     color: "text-black" },
            { label: "Peran",            value: roles.length,       color: "text-black" },
            { label: "Total Anggota",    value: displayRootTotalCount,     color: "text-black" },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl border border-[#E8D1C5] p-4 text-center">
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-[#57595B] mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {currentUserIsOrgOwner && (
          <>
            {/* Organization hierarchy */}
            <section className="bg-white rounded-2xl border border-[#E8D1C5] p-5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 text-[#17191B] font-semibold">
                    <GitBranch className="w-4 h-4 text-white0" />
                    Struktur Organisasi
                  </div>
                  <p className="text-sm text-white0 mt-1">
                    Kedalaman saat ini: {currentOrgDepth}/{MAX_ORG_DEPTH}. Sub-organisasi hanya bisa dibuat hingga kedalaman {MAX_ORG_DEPTH}.
                  </p>
                </div>
                <button
                  onClick={handleCreateSubOrganization}
                  disabled={!canCreateSubOrg}
                  className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-[#452829] hover:bg-[#6C2D19] text-white rounded-xl text-sm font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
                  title={
                    canCreateSubOrg
                      ? "Buat sub-organisasi"
                      : `Batas kedalaman ${MAX_ORG_DEPTH} sudah tercapai`
                  }
                >
                  <Plus className="w-4 h-4" /> Buat Sub-Organisasi
                </button>
              </div>
            </section>

            <section className="bg-white rounded-2xl border border-[#E8D1C5] p-5">
              <div className="flex items-center justify-between gap-3 mb-4">
                <div>
                  <h3 className="text-[#17191B] font-semibold">Sub-Organisasi</h3>
                  <p className="text-sm text-white0 mt-0.5">
                    Daftar organisasi turunan beserta cabang parent-child-nya.
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-[#452829] text-white text-xs font-semibold">
                  {subOrganizations.length} item • {displayRootTotalCount} anggota total
                </span>
              </div>

              {subOrganizations.length === 0 ? (
                <div className="rounded-xl border border-dashed border-[#D9C7B8] bg-white px-4 py-6 text-sm text-white0 text-center">
                  Belum ada sub-organisasi.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {subOrganizations.map((sub) => {
                    const subId = sub?.id;
                    const subName = sub?.name || "Sub-organisasi";
                    const subDescription = sub?.description || "Tanpa deskripsi";
                    const subDepth = resolveOrgDepth(sub);
                    const subTotalMembers = Number(sub?.memberCounts?.totalCount);
                    const displaySubTotalMembers = Number.isFinite(subTotalMembers)
                      ? subTotalMembers
                      : Number(sub?.computedMemberCounts?.totalCount) || 0;
                    const titleChain = [rootOrgName, ...(sub?.displayChain || [subName])].filter(Boolean);
                    return (
                      <div
                        key={subId || `${subName}-${subDepth}`}
                        className="rounded-xl border border-[#E8D1C5] px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 min-w-0 flex-wrap">
                            <p className="text-sm font-semibold text-[#17191B] truncate">
                              {titleChain.join(" / ")}
                            </p>
                            <span className="px-2 py-0.5 rounded-full bg-[#E8D1C5] text-[#17191B] text-xs font-semibold flex-shrink-0 whitespace-nowrap">
                              {displaySubTotalMembers} anggota total
                            </span>
                          </div>
                          <p className="text-xs text-white0 truncate mt-0.5">{subDescription}</p>
                          <p className="text-xs text-[#C9A89A] mt-1">Depth: {subDepth}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => subId && router.push(`/organization/${subId}/dashboard`)}
                          disabled={!subId}
                          className="px-3 py-2 rounded-lg text-xs font-semibold bg-[#17191B] text-white hover:bg-[#37393B] transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Buka Dashboard
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </>
        )}

        {/* Tabs */}
        <div className="flex gap-2 flex-wrap">
          {canManageUsers && (
            <TabButton active={tab === "pending"} onClick={() => setTab("pending")} icon={Clock} label="Permintaan" badge={pending.length} />
          )}
          {canManageUsers && (
            <TabButton active={tab === "invite"} onClick={() => setTab("invite")} icon={Plus} label="Undang Anggota" badge={0} />
          )}
            <TabButton active={tab === "members"} onClick={() => setTab("members")} icon={Users} label="Anggota" badge={0} />
          {canManageRoles && (
            <TabButton active={tab === "roles"} onClick={() => setTab("roles")} icon={Shield} label="Peran & Akses" badge={0} />
          )}
        </div>

        {/* TAB: Pending requests */}
        {tab === "pending" && canManageUsers && (
          <section className="bg-white rounded-2xl border border-[#E8D1C5] shadow-sm">
            <div className="px-6 py-4 border-b border-white">
              <h2 className="font-semibold text-[#17191B]">Permintaan Bergabung</h2>
              <p className="text-xs text-white0 mt-0.5">
                Terima atau tolak pengguna yang ingin bergabung ke organisasi Anda
              </p>
            </div>
            {pending.length === 0 ? (
              <div className="px-6 py-10 text-center text-[#C9A89A] text-sm">
                Tidak ada permintaan yang menunggu
              </div>
            ) : (
              <ul className="divide-y divide-slate-100">
                {pending.map((m) => {
                  const userId = getMemberUserId(m);
                  const inviteMethod = m.inviteMethod || m.invite_method || 'request';
                  return (
                  <li key={m.id} className="flex items-center justify-between px-6 py-4 gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-[#17191B] truncate">
                        {getUserName(m)}
                      </p>
                      <p className="text-xs text-white0 truncate">
                        ID: {userId?.slice(0, 8)}… · via {inviteMethod}
                      </p>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleAccept(m.id)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg text-xs font-semibold transition"
                      >
                        <Check className="w-3.5 h-3.5" /> Terima
                      </button>
                      <button
                        onClick={() => handleReject(m.id)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-xs font-semibold transition"
                      >
                        <X className="w-3.5 h-3.5" /> Tolak
                      </button>
                    </div>
                  </li>
                  );
                })}
              </ul>
            )}
          </section>
        )}

        {/* TAB: Invite members */}
        {tab === "invite" && canManageUsers && (
          <section className="bg-white rounded-2xl border border-[#E8D1C5] shadow-sm">
            <div className="px-6 py-4 border-b border-white">
              <h2 className="font-semibold text-[#17191B]">Undang Anggota</h2>
              <p className="text-xs text-white0 mt-0.5">
                Kirim undangan kepada anggota baru untuk bergabung dengan organisasi
              </p>
            </div>

            <form onSubmit={handleInviteMembers} className="p-6 space-y-5">
              {/* Email input section */}
              <div>
                <label className="block text-sm font-semibold text-[#37393B] mb-1.5">
                  Email Anggota
                  <span className="text-[#C9A89A] font-normal ml-1">(opsional)</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={invitationEmailInput}
                    onChange={(e) => setInvitationEmailInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addInvitationEmail();
                      }
                    }}
                    placeholder="email@contoh.com"
                    className="flex-1 px-4 py-3 border border-[#D9C7B8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D9C7B8] focus:border-white0 text-sm"
                  />
                  <button
                    type="button"
                    onClick={addInvitationEmail}
                    disabled={invitationLoading}
                    className="px-4 py-3 bg-[#452829] hover:bg-[#6C2D19] text-white rounded-xl font-semibold text-sm transition disabled:opacity-60 flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Tambah
                  </button>
                </div>
              </div>

              {/* Added emails display */}
              {invitationEmails.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {invitationEmails.map((email) => (
                    <span
                      key={email}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#E8D1C5] text-[#17191B] text-xs font-medium"
                    >
                      {email}
                      <button
                        type="button"
                        onClick={() => removeInvitationEmail(email)}
                        className="text-[#452829] hover:text-red-600"
                        aria-label={`Hapus ${email}`}
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Info box */}
              <div className="flex items-start gap-2.5 p-3 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-700">
                <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>
                  Undangan akan dikirim ke email yang ditambahkan. Penerima dapat mengklik link di email untuk bergabung.
                </span>
              </div>

              {/* Submit button */}
              <div className="flex justify-end gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setInvitationEmails([]);
                    setInvitationEmailInput("");
                    setInvitationResults([]);
                  }}
                  disabled={invitationLoading}
                  className="px-5 py-2.5 bg-white hover:bg-gray-50 text-[#37393B] font-semibold rounded-xl text-sm transition disabled:opacity-60 border border-[#D9C7B8]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={invitationLoading || invitationEmails.length === 0}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#452829] hover:bg-[#6C2D19] text-white font-semibold rounded-xl text-sm transition disabled:opacity-60"
                >
                  {invitationLoading ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Mengirim...
                    </span>
                  ) : (
                    <>
                      Kirim Undangan ({invitationEmails.length})
                    </>
                  )}
                </button>
              </div>

              {/* Invitation results table */}
              {invitationResults.length > 0 && (
                <div className="mt-6 pt-6 border-t border-[#E8D1C5]">
                  <h3 className="font-semibold text-[#17191B] mb-3">Hasil Undangan</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-4 py-3 text-left font-semibold text-[#37393B]">Email</th>
                          <th className="px-4 py-3 text-left font-semibold text-[#37393B]">Status</th>
                          <th className="px-4 py-3 text-left font-semibold text-[#37393B]">Keterangan</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {invitationResults.map((result, idx) => (
                          <tr key={idx} className="hover:bg-gray-50 transition">
                            <td className="px-4 py-3 font-medium text-[#17191B] break-all">
                              {result.email}
                            </td>
                            <td className="px-4 py-3">
                              {result.errors ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-100 text-red-700 text-xs font-medium">
                                  <AlertCircle className="w-3 h-3" />
                                  Gagal
                                </span>
                              ) : result.delivery === "email" ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-medium">
                                  <CheckCircle className="w-3 h-3" />
                                  Email Terkirim
                                </span>
                              ) : result.inviteUrl ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                                  <CheckCircle className="w-3 h-3" />
                                  Link Tersedia
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-medium">
                                  Diproses
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-[#37393B]">
                              {result.errors ? (
                                <span className="text-red-600 text-xs break-all">
                                  {Array.isArray(result.errors) 
                                    ? result.errors.join(", ") 
                                    : result.errors}
                                </span>
                              ) : result.delivery === "email" ? (
                                <span className="text-blue-600 text-xs">
                                  Undangan dikirim melalui email
                                </span>
                              ) : result.inviteUrl ? (
                                <a
                                  href={result.inviteUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[#452829] hover:text-[#6C2D19] text-xs font-medium underline break-all"
                                >
                                  Buka Undangan
                                </a>
                              ) : (
                                <span className="text-gray-500 text-xs">-</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </form>
          </section>
        )}

        {/* TAB: Active members */}
        {tab === "members" && (
          <section className="bg-white rounded-2xl border border-[#E8D1C5] shadow-sm">
            <div className="px-6 py-4 border-b border-white">
              <h2 className="font-semibold text-[#17191B]">Daftar Anggota Aktif</h2>
            </div>
            {active.length === 0 ? (
              <div className="px-6 py-10 text-center text-[#C9A89A] text-sm">
                Belum ada anggota aktif
              </div>
            ) : (
              <ul className="divide-y divide-slate-100">
                {active.map((m) => {
                  const memberUserId = getMemberUserId(m);
                  const isOwner = memberUserId === (org?.ownerId || org?.owner_id);
                  const userName = getUserName(m);
                  const joinedDate = m.joinedAt || m.joined_at;
                  const roleId = m.roleId || m.role_id;
                  return (
                  <li key={m.id} className="flex items-center gap-4 px-6 py-4">
                    <div className="w-9 h-9 rounded-full bg-[#E8D1C5] flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-white0">
                        {userName[0].toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-[#17191B] truncate">
                          {userName}
                        </p>
                        {isOwner && (
                          <span className="px-2 py-0.5 bg-[#E8D1C5] text-[#17191B] rounded-full text-xs font-semibold">
                            Owner
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-white0">
                        Bergabung {joinedDate ? new Date(joinedDate).toLocaleDateString("id-ID") : "—"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <select
                        value={isOwner ? "owner" : (roleId ?? "")}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value && value !== "owner") {
                            handleAssignRole(m.id, value);
                          }
                        }}
                        disabled={isOwner || roles.length === 0 || !currentUserIsOrgOwner}
                        className="text-xs border border-[#D9C7B8] rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#D9C7B8] bg-white text-[#37393B] disabled:opacity-50 disabled:cursor-not-allowed"
                        title={
                          !currentUserIsOrgOwner
                            ? "Hanya owner organisasi yang dapat mengubah peran anggota"
                            : isOwner
                            ? "Owner tidak dapat diubah perannya"
                            : "Pilih peran untuk anggota"
                        }
                      >
                        {isOwner ? (
                          <option value="owner">Admin (owner)</option>
                        ) : (
                          <>
                            <option value="">Pilih peran</option>
                            {roles.length === 0 ? (
                              <option disabled>Tidak ada peran tersedia</option>
                            ) : (
                              roles.map((r) => (
                                <option key={r.id} value={r.id}>
                                  {r.name || "Peran tanpa nama"}
                                </option>
                              ))
                            )}
                          </>
                        )}
                      </select>
                      <button
                        onClick={() => handleRemove(m.id, userName)}
                        disabled={isOwner || !currentUserIsOrgOwner}
                        className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-30 disabled:cursor-not-allowed"
                        title={
                          !currentUserIsOrgOwner
                            ? "Hanya owner organisasi yang dapat menghapus anggota"
                            : isOwner
                            ? "Owner tidak dapat dihapus"
                            : "Hapus anggota"
                        }
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </li>
                  );
                })}
              </ul>
            )}
          </section>
        )}

        {/* TAB: Roles */}
        {tab === "roles" && canManageRoles && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-[#17191B]">Peran & Hak Akses</h2>
              <button
                onClick={() => setRoleModal("new")}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#452829] hover:bg-[#6C2D19] text-white rounded-xl text-sm font-semibold transition shadow-sm"
              >
                <Plus className="w-4 h-4" /> Tambah Peran
              </button>
            </div>

            {roles.length === 0 ? (
              <div className="bg-white rounded-2xl border border-[#E8D1C5] px-6 py-10 text-center text-[#C9A89A] text-sm">
                Belum ada peran. Buat peran untuk mengatur hak akses anggota.
              </div>
            ) : (
              <div className="space-y-3">
                {roles.map((role) => {
                  const grantedPerms = PERMISSION_DEFS.filter(
                    (p) => role.permissions?.[p.key]
                  );
                  return (
                    <div
                      key={role.id}
                      className="bg-white rounded-2xl border border-[#E8D1C5] p-5"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <p className="font-semibold text-[#17191B]">
                            {role.name}
                          </p>
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {grantedPerms.length === 0 ? (
                              <span className="text-xs text-[#C9A89A]">
                                {/* Tidak ada hak akses */}
                              </span>
                            ) : (
                              grantedPerms.map((p) => (
                                <span
                                  key={p.key}
                                  className="px-2 py-0.5 bg-[#E8D1C5] text-[#17191B] rounded-full text-xs font-medium"
                                >
                                  {p.label}
                                </span>
                              ))
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          <button
                            onClick={() => setRoleModal(role)}
                            className="p-2 text-white0 hover:text-[#37393B] hover:bg-[#E8D1C5] rounded-lg transition"
                            title="Edit peran"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteRole(role.id, role.name)}
                            className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Hapus peran"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* Invite code card */}
        <section className="bg-white rounded-2xl border border-[#E8D1C5] p-6">
          <h3 className="font-semibold text-[#17191B] mb-1">Kode Undangan</h3>
          <p className="text-sm text-white0 mb-4">
            Bagikan kode ini kepada siapa saja yang ingin Anda ajak bergabung
          </p>
          <div className="flex items-center gap-3">
            <div className="flex-1 flex items-center justify-center bg-white border-2 border-dashed border-[#D9C7B8] rounded-xl px-6 py-4">
              <span className="text-2xl font-bold tracking-widest text-[#17191B]">
                {org?.inviteCode || org?.invite_code || "—"}
              </span>
            </div>
            <button
              onClick={copyCode}
              disabled={!org?.inviteCode && !org?.invite_code}
              className="flex items-center gap-2 px-4 py-3 bg-[#17191B] hover:bg-[#37393B] text-white rounded-xl text-sm font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {codeCopied ? (
                <><Check className="w-4 h-4" /> Tersalin</>
              ) : (
                <><Copy className="w-4 h-4" /> Salin</>
              )}
            </button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
