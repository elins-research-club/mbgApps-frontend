"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/client";
import AdminNavbar from "@/components/AdminNavbar";

async function getAccessToken() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [pendingOrgs, setPendingOrgs] = useState([]);
  const [allOrgs, setAllOrgs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("pending");
  const [actionInProgress, setActionInProgress] = useState(null);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedRejectId, setSelectedRejectId] = useState(null);
  const [suspendReason, setSuspendReason] = useState("");
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [selectedSuspendId, setSelectedSuspendId] = useState(null);

  useEffect(() => {
    checkAdmin();
  }, []);

  useEffect(() => {
    if (activeTab === "pending") {
      loadPendingOrgs();
    } else {
      loadAllOrgs();
    }
  }, [activeTab]);

  const checkAdmin = async () => {
    console.log('🔐 [ADMIN DASHBOARD] Checking admin access...');

    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      console.warn('⚠️ [ADMIN DASHBOARD] No session found, redirecting to login');
      router.push("/admin/login");
      return;
    }

    console.log('✅ [ADMIN DASHBOARD] Session found');
    console.log('👤 User ID:', session.user.id);
    console.log('📧 User Email:', session.user.email);

    try {
      const { data: profile, error: profileError } = await supabase
        .from("Userext")
        .select("is_super_admin")
        .eq("id", session.user.id)
        .maybeSingle();

      if (profileError) {
        console.error('❌ [ADMIN DASHBOARD] Profile query error:', profileError);
        // Don't redirect on query error, might be RLS issue
      }

      console.log('🔍 [ADMIN DASHBOARD] Profile query result:', profile);
      console.log('🔑 is_super_admin value:', profile?.is_super_admin);

      if (!profile?.is_super_admin) {
        console.error('❌ [ADMIN DASHBOARD] Access denied: is_super_admin is', profile?.is_super_admin);
        router.push("/admin/login");
        return;
      }

      console.log('✅ [ADMIN DASHBOARD] Access granted!');
      
      // Load initial data
      loadPendingOrgs();
    } catch (error) {
      console.error('❌ [ADMIN DASHBOARD] Error during check:', error);
    }
  };

  const loadPendingOrgs = async () => {
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("Organizations")
        .select(`
          id,
          name,
          description,
          status,
          owner_id,
          invite_code,
          created_at,
          updated_at
        `)
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      console.log('📋 [LOAD PENDING ORGS] Found', data?.length || 0, 'organizations');
      
      // Fetch owner details separately
      const orgsWithOwners = await Promise.all(
        (data || []).map(async (org) => {
          console.log('🔍 Fetching owner for org:', org.name, 'owner_id:', org.owner_id);
          
          // Fetch Userext for full_name
          const { data: userext, error: userextError } = await supabase
            .from("Userext")
            .select("full_name")
            .eq("id", org.owner_id)
            .maybeSingle();
          
          if (userextError) {
            console.error('❌ Error fetching Userext:', userextError);
          }
          
          console.log('👤 Userext data:', userext);
          
          return {
            ...org,
            Userext: userext,
            owner_email: org.owner_id, // Fallback to showing owner_id
          };
        })
      );
      
      console.log('✅ Loaded orgs with owners:', orgsWithOwners);
      setPendingOrgs(orgsWithOwners);
    } catch (err) {
      console.error('❌ [LOAD PENDING ORGS] Error:', err);
      setError(err.message || "Failed to load pending organizations");
    } finally {
      setLoading(false);
    }
  };

  const loadAllOrgs = async () => {
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("Organizations")
        .select(`
          id,
          name,
          description,
          status,
          owner_id,
          invite_code,
          suspension_reason,
          suspended_until,
          created_at,
          updated_at
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      // Fetch owner details separately
      const orgsWithOwners = await Promise.all(
        (data || []).map(async (org) => {
          console.log('🔍 Fetching owner for org:', org.name, 'owner_id:', org.owner_id);
          
          // Fetch Userext for full_name
          const { data: userext, error: userextError } = await supabase
            .from("Userext")
            .select("full_name")
            .eq("id", org.owner_id)
            .maybeSingle();
          
          if (userextError) {
            console.error('❌ Error fetching Userext:', userextError);
          }
          
          console.log('👤 Userext data:', userext);
          
          return {
            ...org,
            Userext: userext,
          };
        })
      );
      
      console.log('✅ Loaded orgs with owners:', orgsWithOwners);
      setAllOrgs(orgsWithOwners);
    } catch (err) {
      setError(err.message || "Failed to load organizations");
    } finally {
      setLoading(false);
    }
  };

  const handleApproveOrg = async (orgId) => {
    setActionInProgress(orgId);
    setError(null);
    try {
      const token = await getAccessToken();
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"}/organizations/${orgId}/approve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to approve organization");
      }

      setSuccessMessage("Organization approved successfully!");
      setTimeout(() => setSuccessMessage(null), 3000);
      
      // Update state directly without reloading
      setPendingOrgs(prev => prev.filter(org => org.id !== orgId));
      setAllOrgs(prev => prev.map(org => 
        org.id === orgId 
          ? { ...org, status: 'active', approved_at: new Date().toISOString() }
          : org
      ));
    } catch (err) {
      setError(err.message);
    } finally {
      setActionInProgress(null);
    }
  };

  const handleRejectOrg = async () => {
    if (!selectedRejectId) return;

    setActionInProgress(selectedRejectId);
    setError(null);
    setShowRejectModal(false);

    try {
      const token = await getAccessToken();
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"}/organizations/${selectedRejectId}/reject`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reason: rejectReason }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to reject organization");
      }

      setSuccessMessage("Organization rejected successfully!");
      setTimeout(() => setSuccessMessage(null), 3000);
      
      // Update state directly without reloading
      setPendingOrgs(prev => prev.filter(org => org.id !== selectedRejectId));
      setAllOrgs(prev => prev.map(org => 
        org.id === selectedRejectId 
          ? { ...org, status: 'rejected', rejection_reason: rejectReason, approved_at: new Date().toISOString() }
          : org
      ));
      
      setRejectReason("");
      setSelectedRejectId(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setActionInProgress(null);
    }
  };

  const handleSuspendOrg = async () => {
    if (!selectedSuspendId) return;

    setActionInProgress(selectedSuspendId);
    setError(null);
    setShowSuspendModal(false);

    try {
      const token = await getAccessToken();
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"}/organizations/${selectedSuspendId}/suspend`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          reason: suspendReason,
          suspendedUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to suspend organization");
      }

      setSuccessMessage("Organization suspended successfully!");
      setTimeout(() => setSuccessMessage(null), 3000);
      
      // Update state directly without reloading
      setAllOrgs(prev => prev.map(org => 
        org.id === selectedSuspendId 
          ? { ...org, status: 'suspended', suspension_reason: suspendReason, suspended_until: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() }
          : org
      ));
      
      setSuspendReason("");
      setSelectedSuspendId(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setActionInProgress(null);
    }
  };

  const handleUnsuspendOrg = async (orgId) => {
    setActionInProgress(orgId);
    setError(null);

    try {
      const token = await getAccessToken();
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"}/organizations/${orgId}/unsuspend`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to unsuspend organization");
      }

      setSuccessMessage("Organization unsuspended successfully!");
      setTimeout(() => setSuccessMessage(null), 3000);
      
      // Update state directly without reloading
      setAllOrgs(prev => prev.map(org => 
        org.id === orgId 
          ? { ...org, status: 'active', suspension_reason: null, suspended_until: null }
          : org
      ));
    } catch (err) {
      setError(err.message);
    } finally {
      setActionInProgress(null);
    }
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-700";
      case "pending":
        return "bg-blue-100 text-blue-700";
      case "rejected":
        return "bg-red-100 text-red-700";
      case "suspended":
        return "bg-[#E8D1C5] text-[#37393B]";
      default:
        return "bg-[#E8D1C5] text-[#37393B]";
    }
  };

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case "SuperAdmin":
        return "bg-purple-100 text-purple-700";
      case "Chef":
        return "bg-[#E8D1C5] text-[#17191B]";
      case "Ahli Gizi":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-[#E8D1C5] text-[#37393B]";
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <AdminNavbar onLogout={handleLogout} />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#17191B]">Admin Dashboard</h1>
          <p className="text-[#452829] mt-1">Manage user registrations and permissions</p>
        </div>

        {/* Success/Error Messages */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
            <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-green-700">{successMessage}</span>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span className="text-red-700">{error}</span>
          </div>
        )}

        {/* Tabs */}
        <div className="mb-6 bg-white rounded-lg shadow-sm border border-[#E8D1C5] overflow-hidden">
          <div className="flex">
            <button
              onClick={() => setActiveTab("pending")}
              className={`flex-1 px-6 py-4 text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${
                activeTab === "pending"
                  ? "bg-[#452829] text-white border-b-2 border-[#E8D1C5]"
                  : "text-[#57595B] hover:text-[#452829] hover:bg-white"
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Pending Approval
              {pendingOrgs.length > 0 && (
                <span className="bg-[#452829] text-white text-xs px-2 py-0.5 rounded-full">
                  {pendingOrgs.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("all")}
              className={`flex-1 px-6 py-4 text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${
                activeTab === "all"
                  ? "bg-[#452829] text-white border-b-2 border-[#E8D1C5]"
                  : "text-[#57595B] hover:text-[#452829] hover:bg-white"
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              All Organizations
            </button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white0"></div>
          </div>
        ) : activeTab === "pending" ? (
          <PendingOrgsTable
            orgs={pendingOrgs}
            onApprove={handleApproveOrg}
            onRejectClick={(orgId) => {
              setSelectedRejectId(orgId);
              setRejectReason("");
              setShowRejectModal(true);
            }}
            actionInProgress={actionInProgress}
            formatDate={formatDate}
          />
        ) : (
          <AllOrgsTable
            orgs={allOrgs}
            onSuspendClick={(orgId) => {
              setSelectedSuspendId(orgId);
              setSuspendReason("");
              setShowSuspendModal(true);
            }}
            onUnsuspendClick={handleUnsuspendOrg}
            formatDate={formatDate}
          />
        )}
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-[#17191B] mb-4">Reject Organization</h3>
            <p className="text-sm text-[#452829] mb-4">
              Please provide a reason for rejecting this organization:
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g., Incomplete information, invalid organization name..."
              className="w-full px-4 py-3 border border-[#D9C7B8] rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
              rows={4}
            />
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleRejectOrg}
                className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
              >
                Confirm Rejection
              </button>
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setSelectedRejectId(null);
                  setRejectReason("");
                }}
                className="flex-1 px-4 py-2 bg-[#D9C7B8] hover:bg-[#C9A89A] text-[#37393B] rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Suspend Modal */}
      {showSuspendModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-[#17191B] mb-4">Suspend Organization</h3>
            <p className="text-sm text-[#452829] mb-4">
              Please provide a reason for suspending this organization (7 days):
            </p>
            <textarea
              value={suspendReason}
              onChange={(e) => setSuspendReason(e.target.value)}
              placeholder="e.g., Violation of terms, suspicious activity..."
              className="w-full px-4 py-3 border border-[#D9C7B8] rounded-lg focus:ring-2 focus:ring-[#F3E8DF]0 focus:border-transparent resize-none"
              rows={4}
            />
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSuspendOrg}
                className="flex-1 px-4 py-2 bg-white0 hover:bg-[#37393B] text-white rounded-lg font-medium transition-colors"
              >
                Suspend (7 days)
              </button>
              <button
                onClick={() => {
                  setShowSuspendModal(false);
                  setSelectedSuspendId(null);
                  setSuspendReason("");
                }}
                className="flex-1 px-4 py-2 bg-[#D9C7B8] hover:bg-[#C9A89A] text-[#37393B] rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PendingUsersTable({ users, onApprove, onRejectClick, actionInProgress, formatDate, getStatusBadgeClass, getRoleBadgeClass }) {
  if (users.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-[#E8D1C5] p-12 text-center">
        <svg className="w-16 h-16 mx-auto text-green-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="text-lg font-semibold text-[#17191B] mb-2">All Caught Up!</h3>
        <p className="text-[#452829]">No pending user registrations awaiting approval.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-[#E8D1C5] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-white border-b border-[#E8D1C5]">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-white0 uppercase tracking-wider">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white0 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white0 uppercase tracking-wider">Phone</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white0 uppercase tracking-wider">Registered</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white0 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-white0 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-white">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-black">{user.full_name || "N/A"}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-[#452829]">{user.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-[#452829]">{user.phone || "N/A"}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-[#452829]">{formatDate(user.created_at)}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClass(user.status)}`}>
                    {user.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onApprove(user.id)}
                      disabled={actionInProgress === user.id}
                      className="px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-[#AA7F7F] text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {actionInProgress === user.id ? "Approving..." : "Approve"}
                    </button>
                    <button
                      onClick={() => onRejectClick(user.id)}
                      disabled={actionInProgress === user.id}
                      className="px-4 py-2 bg-red-500 hover:bg-red-600 disabled:bg-[#AA7F7F] text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      {actionInProgress === user.id ? "Rejecting..." : "Reject"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AllUsersTable({ users, onRoleChange, onDeleteUser, actionInProgress, formatDate, getStatusBadgeClass, getRoleBadgeClass, ROLE_OPTIONS }) {
  if (users.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-[#E8D1C5] p-12 text-center">
        <svg className="w-16 h-16 mx-auto text-[#C9A89A] mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        <h3 className="text-lg font-semibold text-[#17191B] mb-2">No Users Found</h3>
        <p className="text-[#452829]">There are no registered users yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-[#E8D1C5] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-white border-b border-[#E8D1C5]">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-white0 uppercase tracking-wider">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white0 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white0 uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white0 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white0 uppercase tracking-wider">Registered</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-white0 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-white">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-black">{user.full_name || "N/A"}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-[#452829]">{user.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    value={user.role || "User"}
                    onChange={(e) => onRoleChange(user.id, e.target.value)}
                    disabled={actionInProgress === user.id}
                    className="text-sm border border-[#D9C7B8] rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-[#F3E8DF]0 focus:border-transparent disabled:bg-[#E8D1C5]"
                  >
                    {ROLE_OPTIONS.map((role) => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClass(user.status)}`}>
                    {user.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-[#452829]">{formatDate(user.created_at)}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <button
                    onClick={() => onDeleteUser(user.id)}
                    disabled={actionInProgress === user.id}
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 disabled:bg-[#AA7F7F] text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-1 ml-auto"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    {actionInProgress === user.id ? "Deleting..." : "Delete"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PendingOrgsTable({ orgs, onApprove, onRejectClick, actionInProgress, formatDate }) {
  if (orgs.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-[#E8D1C5] p-12 text-center">
        <svg className="w-16 h-16 mx-auto text-green-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="text-lg font-semibold text-[#17191B] mb-2">All Caught Up!</h3>
        <p className="text-[#452829]">No pending organizations awaiting approval.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-[#E8D1C5] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-white border-b border-[#E8D1C5]">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-white0 uppercase tracking-wider">Organization</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white0 uppercase tracking-wider">Owner</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white0 uppercase tracking-wider">Invite Code</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white0 uppercase tracking-wider">Created</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-white0 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {orgs.map((org) => (
              <tr key={org.id} className="hover:bg-white">
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-black">{org.name}</div>
                  {org.description && (
                    <div className="text-sm text-white0 truncate max-w-xs">{org.description}</div>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-black">{org.Userext?.full_name || "Unknown"}</div>
                  <div className="text-sm text-white0">{org.owner_id}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-mono text-[#37393B] bg-[#E8D1C5] px-2 py-1 rounded inline-block">
                    {org.invite_code}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-[#452829]">{formatDate(org.created_at)}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onApprove(org.id)}
                      disabled={actionInProgress === org.id}
                      className="px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-[#AA7F7F] text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {actionInProgress === org.id ? "Approving..." : "Approve"}
                    </button>
                    <button
                      onClick={() => onRejectClick(org.id)}
                      disabled={actionInProgress === org.id}
                      className="px-4 py-2 bg-red-500 hover:bg-red-600 disabled:bg-[#AA7F7F] text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      {actionInProgress === org.id ? "Rejecting..." : "Reject"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AllOrgsTable({ orgs, onSuspendClick, onUnsuspendClick, formatDate }) {
  if (orgs.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-[#E8D1C5] p-12 text-center">
        <svg className="w-16 h-16 mx-auto text-[#C9A89A] mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
        <h3 className="text-lg font-semibold text-[#17191B] mb-2">No Organizations Found</h3>
        <p className="text-[#452829]">There are no registered organizations yet.</p>
      </div>
    );
  }

  const getDurationText = (createdAt) => {
    const now = new Date();
    const created = new Date(createdAt);
    const diffMs = now - created;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-700";
      case "pending":
        return "bg-blue-100 text-blue-700";
      case "rejected":
        return "bg-red-100 text-red-700";
      case "suspended":
        return "bg-[#E8D1C5] text-[#17191B]";
      default:
        return "bg-[#E8D1C5] text-[#37393B]";
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-[#E8D1C5] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-white border-b border-[#E8D1C5]">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-white0 uppercase tracking-wider">Organization</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white0 uppercase tracking-wider">Owner</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white0 uppercase tracking-wider">Joined</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white0 uppercase tracking-wider">Duration</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white0 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-white0 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {orgs.map((org) => (
              <tr key={org.id} className="hover:bg-white">
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-black">{org.name}</div>
                  {org.description && (
                    <div className="text-sm text-white0 truncate max-w-xs">{org.description}</div>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-black">{org.Userext?.full_name || "Unknown"}</div>
                  <div className="text-sm text-white0">{org.owner_id}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-[#452829]">{formatDate(org.created_at)}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-[#37393B]">{getDurationText(org.created_at)}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClass(org.status)}`}>
                    {org.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  {org.status === 'active' && (
                    <button
                      onClick={() => onSuspendClick(org.id)}
                      className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-1 ml-auto"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Suspend
                    </button>
                  )}
                  {org.status === 'suspended' && (
                    <button
                      onClick={() => onUnsuspendClick(org.id)}
                      className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-1 ml-auto"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Unsuspend
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
