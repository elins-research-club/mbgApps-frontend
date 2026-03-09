import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@/lib/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]               = useState(null);
  const [profile, setProfile]         = useState(null);
  const [orgMembership, setOrgMembership] = useState(null); // active membership
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading]         = useState(true);

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

  const fetchOrgMembership = useCallback(async (userId) => {
    const { data: membership } = await supabase
      .from("Membership")
      .select(`
        id, status, invite_method, role_id,
        organization:Organizations ( id, name, owner_id, invite_code, description ),
        role:Roles ( id, name, permissions )
      `)
      .eq("user_id", userId)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const { data: ownedOrgs } = await supabase
      .from("Organizations")
      .select("id, name, owner_id, invite_code, description")
      .eq("owner_id", userId)
      .order("created_at", { ascending: false });

    const orgsFromMembership = membership?.organization ? [membership.organization] : [];
    const merged = [...orgsFromMembership, ...(ownedOrgs ?? [])];
    const uniqueOrgs = merged.filter(
      (org, index, arr) => arr.findIndex((x) => x?.id === org?.id) === index
    );
    setOrganizations(uniqueOrgs);

    if (membership) {
      setOrgMembership(membership);
      return;
    }

    // Fallback for owners that do not have an active row in Membership yet.
    const ownedOrg = uniqueOrgs[0] ?? null;

    if (ownedOrg) {
      setOrgMembership({
        id: null,
        status: "active",
        invite_method: "owner",
        role_id: null,
        organization: ownedOrg,
        role: null,
      });
      return;
    }

    setOrgMembership(null);
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
        }
        setLoading(false); 
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!user) return;
    let isMounted = true;
    Promise.all([
      fetchProfile(user.id),
      fetchOrgMembership(user.id),
    ]).then(() => {
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

  const isOrgOwner = !!(
    user &&
    organization?.owner_id === user.id
  );
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
    await Promise.all([fetchProfile(user.id), fetchOrgMembership(user.id)]);
  }, [user, fetchProfile, fetchOrgMembership]);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        orgMembership,
        organizations,
        loading,
        isOrgOwner,
        canSave,
        canValidate,
        canManagePlans,
        canEditRecipe,
        canManageUsers,
        canManageRoles,
        logout,
        refresh,
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