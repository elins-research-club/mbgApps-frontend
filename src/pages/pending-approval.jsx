"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/client";
import { Clock, AlertCircle, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function PendingApprovalPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [orgStatus, setOrgStatus] = useState("pending");
  const [rejectionReason, setRejectionReason] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    checkStatus();
    // Poll for status changes every 5 seconds
    const interval = setInterval(checkStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const checkStatus = async () => {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      router.push("/auth/login");
      return;
    }

    setUser(session.user);

    // Check organization status
    const { data: org } = await supabase
      .from("Organizations")
      .select("id, name, status, rejection_reason")
      .eq("owner_id", session.user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (org) {
      setOrgStatus(org.status);
      setRejectionReason(org.rejection_reason);
      setChecking(false);

      // If approved, redirect to dashboard
      if (org.status === "active") {
        setTimeout(() => {
          router.push(`/organization/${org.id}/dashboard`);
        }, 2000);
      }
    } else {
      setChecking(false);
    }

    setLoading(false);
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  };

  if (loading || checking) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="w-12 h-12 border-4 border-orange-400 border-t-transparent rounded-full animate-spin" />
              <p className="text-[#452829]">Checking approval status...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          {orgStatus === "pending" && (
            <>
              <div className="w-16 h-16 mx-auto mb-4 bg-amber-100 rounded-full flex items-center justify-center">
                <Clock className="w-8 h-8 text-amber-600" />
              </div>
              <CardTitle className="text-2xl">Registration Under Review</CardTitle>
              <CardDescription>
                Your organization registration is being checked by our admin team
              </CardDescription>
            </>
          )}

          {orgStatus === "active" && (
            <>
              <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl">Approved!</CardTitle>
              <CardDescription>
                Your organization has been approved. Redirecting to dashboard...
              </CardDescription>
            </>
          )}

          {orgStatus === "rejected" && (
            <>
              <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
              <CardTitle className="text-2xl">Registration Rejected</CardTitle>
              <CardDescription>
                Your organization registration was not approved
              </CardDescription>
            </>
          )}
        </CardHeader>

        <CardContent className="space-y-6">
          {orgStatus === "pending" && (
            <>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-amber-800">
                    <p className="font-semibold mb-1">What's happening?</p>
                    <p>
                      Our admin team is reviewing your organization registration. 
                      This usually takes 24-48 hours.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm text-[#452829]">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <span>Account created successfully</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-[#452829]">
                  <div className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center">
                    <Clock className="w-4 h-4 text-amber-600" />
                  </div>
                  <span>Organization pending approval</span>
                </div>
              </div>

              <div className="pt-4 border-t">
                <p className="text-xs text-white0 text-center mb-3">
                  We'll notify you once your registration is approved.
                </p>
                <Button 
                  onClick={handleLogout} 
                  variant="outline" 
                  className="w-full"
                >
                  Sign Out
                </Button>
              </div>
            </>
          )}

          {orgStatus === "active" && (
            <div className="text-center">
              <p className="text-green-600 mb-4">
                🎉 Welcome aboard! Your organization is now active.
              </p>
              <Button onClick={() => router.push("/")} className="w-full">
                Go to Dashboard
              </Button>
            </div>
          )}

          {orgStatus === "rejected" && (
            <>
              {rejectionReason && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm font-semibold text-red-800 mb-2">Reason for rejection:</p>
                  <p className="text-sm text-red-700">{rejectionReason}</p>
                </div>
              )}

              <div className="space-y-3">
                <Button onClick={() => router.push("/organization/create")} className="w-full">
                  Create New Organization
                </Button>
                <Button onClick={handleLogout} variant="outline" className="w-full">
                  Sign Out
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
