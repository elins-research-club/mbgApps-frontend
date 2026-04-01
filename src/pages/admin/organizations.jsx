"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/client";
import { getPendingOrganizations, getAllOrganizations, approveOrganization, rejectOrganization } from "@/services/orgService";
import AdminNavbar from "@/components/AdminNavbar";

export default function AdminOrganizationsDashboard() {
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
    console.log('🔐 [ADMIN ORGS] Checking admin access...');
    
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      console.warn('⚠️ [ADMIN ORGS] No session found, redirecting to login');
      router.push("/admin/login");
      return;
    }

    console.log('✅ [ADMIN ORGS] Session found');
    console.log('👤 User ID:', session.user.id);
    console.log('📧 User Email:', session.user.email);

    const { data: profile } = await supabase
      .from("Userext")
      .select("is_super_admin")
      .eq("id", session.user.id)
      .maybeSingle();

    console.log('🔍 [ADMIN ORGS] Profile query result:', profile);
    console.log('🔑 is_super_admin value:', profile?.is_super_admin);

    if (!profile?.is_super_admin) {
      console.error('❌ [ADMIN ORGS] Access denied: is_super_admin is', profile?.is_super_admin);
      router.push("/admin/login");
      return;
    }

    console.log('✅ [ADMIN ORGS] Access granted!');
  };

  const loadPendingOrgs = async () => {
    setLoading(true);
    setError(null);
    try {
      const orgs = await getPendingOrganizations();
      setPendingOrgs(orgs);
    } catch (err) {
      setError(err.message || "Failed to load pending organizations");
    } finally {
      setLoading(false);
    }
  };

  const loadAllOrgs = async () => {
    setLoading(true);
    setError(null);
    try {
      const orgs = await getAllOrganizations();
      setAllOrgs(orgs);
    } catch (err) {
      setError(err.message || "Failed to load organizations");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (orgId) => {
    setActionInProgress(orgId);
    setError(null);
    try {
      await approveOrganization(orgId);
      setSuccessMessage("Organization approved successfully!");
      setTimeout(() => setSuccessMessage(null), 3000);
      loadPendingOrgs();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionInProgress(null);
    }
  };

  const handleRejectClick = (orgId) => {
    setSelectedRejectId(orgId);
    setRejectReason("");
    setShowRejectModal(true);
  };

  const handleReject = async () => {
    if (!selectedRejectId) return;

    setActionInProgress(selectedRejectId);
    setError(null);
    setShowRejectModal(false);

    try {
      await rejectOrganization(selectedRejectId, rejectReason);
      setSuccessMessage("Organization rejected successfully!");
      setTimeout(() => setSuccessMessage(null), 3000);
      loadPendingOrgs();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionInProgress(null);
      setSelectedRejectId(null);
      setRejectReason("");
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
        return "bg-yellow-100 text-yellow-700";
      case "rejected":
        return "bg-red-100 text-red-700";
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
          <h1 className="text-3xl font-bold text-[#17191B]">Organization Management</h1>
          <p className="text-[#452829] mt-1">Review and approve organization registrations</p>
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
                  ? "bg-yellow-50 text-yellow-700 border-b-2 border-yellow-400"
                  : "text-white0 hover:text-[#37393B] hover:bg-white"
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Pending Approval
              {pendingOrgs.length > 0 && (
                <span className="bg-yellow-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {pendingOrgs.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("all")}
              className={`flex-1 px-6 py-4 text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${
                activeTab === "all"
                  ? "bg-blue-50 text-blue-700 border-b-2 border-blue-400"
                  : "text-white0 hover:text-[#37393B] hover:bg-white"
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              All Organizations
            </button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          </div>
        ) : activeTab === "pending" ? (
          <PendingOrgsTable
            orgs={pendingOrgs}
            onApprove={handleApprove}
            onRejectClick={handleRejectClick}
            actionInProgress={actionInProgress}
            formatDate={formatDate}
            getStatusBadgeClass={getStatusBadgeClass}
          />
        ) : (
          <AllOrgsTable
            orgs={allOrgs}
            formatDate={formatDate}
            getStatusBadgeClass={getStatusBadgeClass}
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
                onClick={handleReject}
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
    </div>
  );
}

function PendingOrgsTable({ orgs, onApprove, onRejectClick, actionInProgress, formatDate, getStatusBadgeClass }) {
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
              <th className="px-6 py-3 text-left text-xs font-medium text-white0 uppercase tracking-wider">Description</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white0 uppercase tracking-wider">Owner ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white0 uppercase tracking-wider">Invite Code</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white0 uppercase tracking-wider">Created</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-white0 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {orgs.map((org) => (
              <tr key={org.id} className="hover:bg-white">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-black">{org.name}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-[#452829] max-w-xs truncate">
                    {org.description || "—"}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-[#452829] font-mono">{org.owner_id}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-mono text-[#37393B] bg-[#E8D1C5] px-2 py-1 rounded inline-block">
                    {org.invite_code}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-[#452829]">{formatDate(org.createdAt)}</div>
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

function AllOrgsTable({ orgs, formatDate, getStatusBadgeClass }) {
  if (orgs.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-[#E8D1C5] p-12 text-center">
        <svg className="w-16 h-16 mx-auto text-[#C9A89A] mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
        <h3 className="text-lg font-semibold text-[#17191B] mb-2">No Organizations Found</h3>
        <p className="text-[#452829]">There are no registered organizations yet.</p>
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
              <th className="px-6 py-3 text-left text-xs font-medium text-white0 uppercase tracking-wider">Description</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white0 uppercase tracking-wider">Owner ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white0 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white0 uppercase tracking-wider">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {orgs.map((org) => (
              <tr key={org.id} className="hover:bg-white">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-black">{org.name}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-[#452829] max-w-xs truncate">
                    {org.description || "—"}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-[#452829] font-mono">{org.owner_id}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClass(org.status)}`}>
                    {org.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-[#452829]">{formatDate(org.createdAt)}</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
