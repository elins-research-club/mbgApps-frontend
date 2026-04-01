"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    console.log('🔐 [ADMIN LOGIN] Starting admin login...');
    console.log('📧 Email:', email);

    try {
      // Use backend admin sign-in API
      console.log('📡 Calling backend admin sign-in...');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/auth/admin/sign-in`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('❌ [ADMIN LOGIN] Backend error:', data);
        throw new Error('Invalid credentials');
      }

      console.log('✅ [ADMIN LOGIN] Admin auth successful');
      console.log('👤 Admin:', data.admin);
      console.log('🔑 Tokens received');

      // Set session in Supabase
      const supabase = createClient();
      const { error: sessionError } = await supabase.auth.setSession({
        access_token: data.accessToken,
        refresh_token: data.refreshToken,
      });

      if (sessionError) {
        console.error('❌ [ADMIN LOGIN] Session error:', sessionError);
        throw new Error('Invalid credentials');
      }

      console.log('✅ [ADMIN LOGIN] Session set');
      console.log('🚀 Redirecting to admin dashboard...');
      
      // Hard redirect to ensure clean state
      window.location.href = '/admin/dashboard';
    } catch (error) {
      console.error('❌ [ADMIN LOGIN] Error:', error);
      setError('Invalid credentials');
    } finally {
      setIsLoading(false);
      console.log('🏁 [ADMIN LOGIN] Process completed');
    }
  };

  return (
    <div className={cn("flex min-h-svh w-full items-center justify-center p-6 md:p-10")}>
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Admin Login</CardTitle>
            <CardDescription>
              Enter your credentials to access the admin dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin}>
              <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center">
                    <Label htmlFor="password">Password</Label>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                {error && <p className="text-sm text-red-500">{error}</p>}
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Logging in..." : "Login as Admin"}
                </Button>
              </div>
              <div className="mt-4 text-center text-sm">
                <Link
                  href="/auth/login"
                  className="text-[#452829] hover:underline underline-offset-4"
                >
                  ← Back to regular login
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
