// src/pages/organization/[id]/dashboard.jsx
import { useRouter } from "next/router";
import OrgOwnerDashboard from "@/components/OrgOwnerDashboard";

export default function OrgDashboardPage() {
  const { query } = useRouter();
  const orgId = query.id;

  if (!orgId) return null;

  return <OrgOwnerDashboard orgId={orgId} />;
}
