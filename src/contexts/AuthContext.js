import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@/lib/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]               = useState(null);
  const [profile, setProfile]         = useState(null);
  const [orgMembership, setOrgMembership] = useState(null); // active membership
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  const supabaseRef = useRef(null);
  if (!supabaseRef.current) supabaseRef.current = createClient();
  const supabase = supabaseRef.current;

  const fetchProfile = useCallback(async (userId) => {
    const { data } = await supabase
      .from("Userext")
      .select("*")
      .eq("id", userId)
      .maybeSingle();
    setProfile(data ?? null);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchOrgMemberships = useCallback(async (userId) => {
    // Get all memberships (all statuses)
    const { data: allMemberships } = await supabase
      .from("Membership")
      .select(`
        id, status, invite_method, role_id, joined_at,
        organization:Organizations ( id, name, owner_id, invite_code, description, status ),
        role:Roles ( id, name, permissions )
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    // Get owned organizations
    const { data: ownedOrgs } = await supabase
      .from("Organizations")
      .select("id, name, owner_id, invite_code, description, status")
      .eq("owner_id", userId)
      .order("created_at", { ascending: false });

    // Combine memberships and owned orgs
    const memberships = allMemberships || [];
    const owned = ownedOrgs || [];
    
    // Extract organizations from memberships
    const membershipOrgs = memberships.map(m => m.organization).filter(Boolean);
    
    // Combine all organizations and remove duplicates by id
    const allOrgs = [...owned, ...membershipOrgs];
    const uniqueOrgs = allOrgs.filter(
      (org, index, self) => index === self.findIndex(o => o.id === org.id)
    );
    
    setOrganizations(uniqueOrgs);
    
    // Set first active membership as primary, or first membership, or null
    const activeMembership = memberships.find(m => m.status === "active");
    if (activeMembership) {
      setOrgMembership(activeMembership);
    } else if (memberships.length > 0) {
      setOrgMembership(memberships[0]);
    } else if (owned.length > 0) {
      // Fallback for owners without membership record
      setOrgMembership({
        id: null,
        status: owned[0].status === "active" ? "active" : "pending",
        invite_method: "owner",
        role_id: null,
        organization: owned[0],
        role: null,
      });
    } else {
      setOrgMembership(null);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    let isMounted = true;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!isMounted) return;
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        if (!currentUser) {
          setProfile(null);
          setOrgMembership(null);
          setOrganizations([]);
          setLoading(false);
          setAuthChecked(true);
          return;
        }

        // User exists: mark loading false but defer "authChecked"
        // until profile and org membership fetch completes.
        setLoading(false);
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!user) {
      setAuthChecked(true);
      return;
    }
    let isMounted = true;
    Promise.all([
      fetchProfile(user.id),
      fetchOrgMemberships(user.id),
    ]).then(() => {
      setAuthChecked(true);
    });
    return () => { isMounted = false; };
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const organization =
    orgMembership?.organization ??
    orgMembership?.organizations ??
    orgMembership?.Organizations ??
    null;

  const role =
    orgMembership?.role ??
    orgMembership?.roles ??
    orgMembership?.Roles ??
    null;

  const isChef = (role?.name || "").toLowerCase() === "chef";
  const isAhliGizi = ["ahli gizi", "nutritionist"].includes((role?.name || "").toLowerCase());

  const isOrgOwner = !!(
    user &&
    organization?.owner_id === user.id
  );

  const orgStatus = organization?.status || null;
  const isOrgPending = orgStatus === "pending";
  const isOrgRejected = orgStatus === "rejected";
  const isOrgActive = orgStatus === "active" || orgStatus === null;

  const permissions = role?.permissions ?? {};
  const canSave          = isOrgOwner || !!permissions.can_save_menu;
  const canValidate      = isOrgOwner || !!permissions.can_validate_ingredients;
  const canManagePlans   = isOrgOwner || !!permissions.can_manage_meal_plans;
  const canEditRecipe    = isOrgOwner || !!permissions.can_edit_recipe;
  const canManageUsers   =
    isOrgOwner ||
    !!permissions.can_manage_users ||
    !!permissions.can_add_users ||
    !!permissions.can_delete_users ||
    !!permissions.can_approve_members;
  const canManageRoles   = isOrgOwner || !!permissions.can_manage_roles;

  const logout = async () => {
    await supabase.auth.signOut();
  };

  const refresh = useCallback(async () => {
    if (!user) return;
    await Promise.all([fetchProfile(user.id), fetchOrgMemberships(user.id)]);
  }, [user, fetchProfile, fetchOrgMemberships]);

  const orgStatusMap = Object.fromEntries(
    organizations.map(org => [org.id, org.status])
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        orgMembership,
        organizations,
        loading,
        authChecked,
        isOrgOwner,
        isOrgPending,
        isOrgRejected,
        isOrgActive,
        orgStatus,
        isChef,
        isAhliGizi,
        canSave,
        canValidate,
        canManagePlans,
        canEditRecipe,
        canManageUsers,
        canManageRoles,
        logout,
        refresh,
        orgStatusMap,
        organization,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};