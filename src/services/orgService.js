import { createClient } from "@/lib/client";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

async function getAccessToken() {
  const supabase = createClient();
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) {
    throw new Error(error.message || "Failed to read auth session");
  }

  const token = session?.access_token;
  if (!token) {
    throw new Error("Not authenticated");
  }

  return token;
}

async function request(path, options = {}) {
  const token = await getAccessToken();

  const response = await fetch(`${API_URL}${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
    ...options,
  });

  const contentType = response.headers.get("content-type") || "";
  const payload = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const message =
      (typeof payload === "object" && (payload.message || payload.error)) ||
      (typeof payload === "string" && payload) ||
      "Request failed";
    throw new Error(message);
  }

  return payload;
}

function unwrap(payload, key) {
  if (!payload || typeof payload !== "object") return payload;
  if (key && key in payload) return payload[key];
  if ("data" in payload) return payload.data;
  return payload;
}

function pickObject(payload, keys) {
  if (!payload || typeof payload !== "object") return null;

  for (const key of keys) {
    if (payload[key] && typeof payload[key] === "object" && !Array.isArray(payload[key])) {
      return payload[key];
    }
  }

  const data = payload.data;
  if (data && typeof data === "object" && !Array.isArray(data)) {
    for (const key of keys) {
      if (data[key] && typeof data[key] === "object" && !Array.isArray(data[key])) {
        return data[key];
      }
    }

    if (data.id || data.owner_id || data.ownerId) return data;
  }

  if (payload.id || payload.owner_id || payload.ownerId) return payload;
  return null;
}

function pickArray(payload, keys) {
  if (!payload || typeof payload !== "object") return [];

  for (const key of keys) {
    if (Array.isArray(payload[key])) return payload[key];
  }

  const data = payload.data;
  if (data && typeof data === "object") {
    for (const key of keys) {
      if (Array.isArray(data[key])) return data[key];
    }
  }

  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.items)) return payload.items;
  if (Array.isArray(payload.rows)) return payload.rows;
  if (Array.isArray(data)) return data;

  return [];
}

export async function createOrganization({ name, description, memberEmails = [] }) {
  const payload = await request("/organizations", {
    method: "POST",
    body: JSON.stringify({ name, description, memberEmails }),
  });
  return unwrap(payload);
}

export async function createSubOrganization(parentOrgId, { name, description, memberEmails = [] }) {
  if (!parentOrgId) {
    throw new Error("Parent organization ID is required");
  }

  const payload = await request(`/organizations/${parentOrgId}/sub-organizations`, {
    method: "POST",
    body: JSON.stringify({ name, description, memberEmails }),
  });

  return unwrap(payload);
}

export async function getOrganization(orgId) {
  const payload = await request(`/organizations/${orgId}`);
  return pickObject(payload, ["organization", "org"]);
}

export async function updateOrganization(orgId, { name, description }) {
  const payload = await request(`/organizations/${orgId}`, {
    method: "PUT",
    body: JSON.stringify({ name, description }),
  });
  return pickObject(payload, ["organization", "org"]);
}

export async function getOrgMembers(orgId) {
  const payload = await request(`/organizations/${orgId}/members`);
  return pickArray(payload, ["members"]);
}

export async function requestToJoinByCode(inviteCode) {
  const payload = await request("/organizations/join-by-code", {
    method: "POST",
    body: JSON.stringify({ inviteCode }),
  });
  return unwrap(payload);
}

export async function acceptMember(_orgId, memberId) {
  const payload = await request(`/organizations/members/${memberId}/accept`, {
    method: "POST",
  });
  return pickObject(payload, ["member"]);
}

export async function rejectMember(_orgId, memberId) {
  const payload = await request(`/organizations/members/${memberId}/reject`, {
    method: "POST",
  });
  return pickObject(payload, ["member"]);
}

export async function removeMember(_orgId, memberId) {
  return request(`/organizations/members/${memberId}`, {
    method: "DELETE",
  });
}

export async function assignRole(_orgId, memberId, roleId) {
  const payload = await request(`/organizations/members/${memberId}/role`, {
    method: "PUT",
    body: JSON.stringify({ roleId }),
  });
  return pickObject(payload, ["member"]);
}

export async function getOrgRoles(orgId) {
  const payload = await request(`/organizations/${orgId}/roles`);
  return pickArray(payload, ["roles"]);
}

export async function getSubOrganizations(orgId) {
  const payload = await request(`/organizations/${orgId}/sub-organizations`);
  return pickArray(payload, ["subOrganizations", "sub_organizations", "organizations", "items"]);
}

export async function createRole(orgId, { name, permissions }) {
  const payload = await request(`/organizations/${orgId}/roles`, {
    method: "POST",
    body: JSON.stringify({ name, permissions }),
  });
  return pickObject(payload, ["role"]);
}

export async function updateRole(_orgId, roleId, { name, permissions }) {
  const payload = await request(`/organizations/roles/${roleId}`, {
    method: "PUT",
    body: JSON.stringify({ name, permissions }),
  });
  return pickObject(payload, ["role"]);
}

export async function deleteRole(_orgId, roleId) {
  return request(`/organizations/roles/${roleId}`, {
    method: "DELETE",
  });
}

export async function updateProfile({ fullName, phone, bio }) {
  const payload = await request("/users/profile", {
    method: "PUT",
    body: JSON.stringify({ fullName, phone, bio }),
  });
  return unwrap(payload, "profile");
}

export async function getAllOrganizations(query = {}) {
  const params = new URLSearchParams();
  if (query.status) params.append("status", query.status);
  if (query.page) params.append("page", query.page);
  if (query.limit) params.append("limit", query.limit);

  const queryString = params.toString();
  const payload = await request(`/organizations${queryString ? `?${queryString}` : ""}`);
  return pickArray(payload, ["data", "organizations"]) || [];
}

export async function getPendingOrganizations() {
  const payload = await request("/organizations/pending");
  return pickArray(payload, ["organizations", "data"]) || [];
}

export async function approveOrganization(orgId) {
  const payload = await request(`/organizations/${orgId}/approve`, {
    method: "POST",
  });
  return unwrap(payload);
}

export async function rejectOrganization(orgId, reason = "") {
  const payload = await request(`/organizations/${orgId}/reject`, {
    method: "POST",
    body: JSON.stringify({ reason }),
  });
  return unwrap(payload);
}

export async function acceptInvitation(token) {
  const payload = await request("/organizations/invitations/accept", {
    method: "POST",
    body: JSON.stringify({ token }),
  });
  return unwrap(payload);
}
