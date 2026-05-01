import { useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../contexts/AuthContext";

export default function Home() {
  const router = useRouter();
  const { user, loading, authChecked, organizations, organization } = useAuth();

  const hasRedirected = useRef(false);

  useEffect(() => {
    if (!authChecked || loading) return;
    if (!user) return;
    if (hasRedirected.current) return;

    const hasOrgs = (organizations || []).length > 0;

    let target;
    if (hasOrgs) {
      const orgId = organization?.id || organizations[0]?.id;
      if (!orgId) return;
      target = `/organization/${orgId}/dashboard`;
    } else {
      target = "/organization/create";
    }

    hasRedirected.current = true;

    if (router.asPath !== target) {
      router.replace(target);
    }
  }, [authChecked, loading, user, organizations, organization, router]);

  if (loading || !authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p>Loading...</p>
      </div>
    );
  }

  return null;
}