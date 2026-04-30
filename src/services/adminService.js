import { createClient } from "@/lib/client";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

async function getAccessToken() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token;
}

export async function getPendingUsers() {
  try {
    const token = await getAccessToken();
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from("Userext")
      .select(`
        id,
        email,
        full_name,
        phone,
        role,
        status,
        created_at
      `)
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching pending users:", error);
    return [];
  }
}

export async function approveUser(userId) {
  try {
    const token = await getAccessToken();
    const response = await fetch(`${API_URL}/admin/users/${userId}/approve`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "Failed to approve user" }));
      throw new Error(errorData.error || "Failed to approve user");
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error approving user:", error);
    throw error;
  }
}

export async function rejectUser(userId, reason = "") {
  try {
    const token = await getAccessToken();
    const response = await fetch(`${API_URL}/admin/users/${userId}/reject`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ reason }),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "Failed to reject user" }));
      throw new Error(errorData.error || "Failed to reject user");
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error rejecting user:", error);
    throw error;
  }
}

export async function getAllUsers() {
  try {
    const token = await getAccessToken();
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from("Userext")
      .select(`
        id,
        email,
        full_name,
        phone,
        role,
        status,
        created_at
      `)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching all users:", error);
    return [];
  }
}

export async function updateUserRole(userId, role) {
  try {
    const token = await getAccessToken();
    const response = await fetch(`${API_URL}/admin/users/${userId}/role`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ role }),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "Failed to update role" }));
      throw new Error(errorData.error || "Failed to update role");
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error updating user role:", error);
    throw error;
  }
}

export async function deleteUser(userId) {
  try {
    const token = await getAccessToken();
    const response = await fetch(`${API_URL}/admin/users/${userId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "Failed to delete user" }));
      throw new Error(errorData.error || "Failed to delete user");
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  }
}
