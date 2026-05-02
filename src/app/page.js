import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export default async function Home() {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        get: (name) => cookieStore.get(name)?.value,
      },
    }
  );

  // 1. Get user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 👤 Not logged in → stay on home (or redirect to login if you want)
  if (!user) {
    return null;
  }

  // 2. Fetch memberships
  const { data: memberships } = await supabase
    .from("Membership")
    .select(`
      organization:Organizations ( id )
    `)
    .eq("user_id", user.id);

  // 3. Fetch owned orgs
  const { data: owned } = await supabase
    .from("Organizations")
    .select("id")
    .eq("owner_id", user.id);

  const orgs = [
    ...(memberships || []).map((m) => m.organization).filter(Boolean),
    ...(owned || []),
  ];

  const unique = orgs.filter(
    (org, i, self) => i === self.findIndex((o) => o.id === org.id)
  );

  // 4. Find the highest-level accessible organization
  if (unique.length > 0) {
    const accessibleOrgIds = new Set(unique.map((o) => o.id));
    console.log("🔍 [HOME] Accessible orgs:", Array.from(accessibleOrgIds));

    // Fetch initial hierarchy info for accessible orgs.
    // Use only known columns to avoid empty data caused by invalid select fields.
    const { data: orgDetails, error: orgDetailsError } = await supabase
      .from("Organizations")
      .select("id, parent_id, name")
      .in("id", Array.from(accessibleOrgIds));

    if (orgDetailsError) {
      console.log("❌ [HOME] Failed to fetch org details:", orgDetailsError.message);
    }

    console.log("📊 [HOME] Org details:", orgDetails);

    const orgMap = new Map(orgDetails?.map((o) => [o.id, o]) || []);

    // Cache helper to fetch org rows not present in the initial map.
    const loadOrgNode = async (orgId) => {
      if (!orgId) return null;
      if (orgMap.has(orgId)) return orgMap.get(orgId);

      const { data, error } = await supabase
        .from("Organizations")
        .select("id, parent_id, name")
        .eq("id", orgId)
        .maybeSingle();

      if (error) {
        console.log(`❌ [HOME] Failed to load org ${orgId}:`, error.message);
        return null;
      }

      if (data) {
        orgMap.set(data.id, data);
      }

      return data || null;
    };

    // Helper: find the highest accessible parent
    const findRootAccessibleOrg = async (orgId) => {
      let current = orgId;
      let highest = orgId;
      const visited = new Set();
      console.log(`  🔗 Finding root for org ${orgId}`);

      while (current) {
        if (visited.has(current)) {
          console.log(`    ⚠️ Cycle detected at ${current}, stopping traversal`);
          break;
        }
        visited.add(current);

        const org = await loadOrgNode(current);
        if (!org) {
          console.log(`    ❌ Org ${current} not in map`);
          break;
        }

        const parentId = org.parent_id;
        console.log(`    📍 Current: ${current} (${org.name}), Parent: ${parentId}`);

        if (!parentId) {
          console.log(`    ✅ Reached top root: ${highest}`);
          return highest;
        }

        // Always climb to the true top-level parent,
        // even if that parent is not in the user's immediate accessible set.
        highest = parentId;
        current = parentId;
      }

      console.log(`    ✅ Final root: ${highest}`);
      return highest;
    };

    // Find roots for all accessible orgs
    const roots = new Map();
    for (const orgId of accessibleOrgIds) {
      const root = await findRootAccessibleOrg(orgId);
      if (!roots.has(root)) {
        roots.set(root, root);
      }
    }

    // Get the root org(s)
    const rootOrgIds = Array.from(roots.keys());
    console.log("🎯 [HOME] Root org IDs:", rootOrgIds);
    console.log("👨‍💼 [HOME] Owned orgs:", (owned || []).map((o) => o.id));

    if (rootOrgIds.length > 0) {
      // Prefer the root that's NOT owned (parent org)
      const ownedRootIds = new Set((owned || []).map((o) => o.id));
      const notOwnedRoot = rootOrgIds.find((id) => !ownedRootIds.has(id));
      
      const targetOrgId = notOwnedRoot || rootOrgIds[0];
      console.log("🚀 [HOME] Redirecting to:", targetOrgId, notOwnedRoot ? "(not owned)" : "(owned)");
      redirect(`/organization/${targetOrgId}/dashboard`);
    }
  }

  redirect("/organization/create");
}