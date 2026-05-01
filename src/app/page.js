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

    // Fetch all org hierarchy info for accessible orgs
    const { data: orgDetails } = await supabase
      .from("Organizations")
      .select("id, parent_id, parentId, name")
      .in("id", Array.from(accessibleOrgIds));

    console.log("📊 [HOME] Org details:", orgDetails);

    const orgMap = new Map(orgDetails?.map((o) => [o.id, o]) || []);

    // Helper: find the highest accessible parent
    const findRootAccessibleOrg = (orgId) => {
      let current = orgId;
      let highest = orgId;
      console.log(`  🔗 Finding root for org ${orgId}`);

      while (current) {
        const org = orgMap.get(current);
        if (!org) {
          console.log(`    ❌ Org ${current} not in map`);
          break;
        }

        const parentId = org.parent_id || org.parentId;
        console.log(`    📍 Current: ${current} (${org.name}), Parent: ${parentId}`);

        if (!parentId || !accessibleOrgIds.has(parentId)) {
          console.log(`    ✅ Parent not accessible, root is: ${highest}`);
          return highest;
        }

        // Parent is accessible, keep going up
        highest = parentId;
        current = parentId;
      }

      console.log(`    ✅ Final root: ${highest}`);
      return highest;
    };

    // Find roots for all accessible orgs
    const roots = new Map();
    for (const orgId of accessibleOrgIds) {
      const root = findRootAccessibleOrg(orgId);
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