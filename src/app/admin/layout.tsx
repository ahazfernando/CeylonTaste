"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/toaster";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const token = typeof window !== 'undefined' ? localStorage.getItem('tt_token') : null;
    const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

    console.log("Admin Layout: Checking auth for", pathname);
    console.log("Admin Layout: Token from localStorage:", token);

    fetch("http://localhost:4000/api/auth/me", { credentials: "include", headers })
      .then(async (r) => {
        console.log("Admin Layout: Fetch response status:", r.status);
        if (r.ok) {
          const data = await r.json();
          console.log("Admin Layout: User data:", data);
          const role = data?.user?.role;
          console.log("Admin Layout: User role:", role);
          if (!cancelled && role === "admin") {
            console.log("Admin Layout: Setting authorized to true");
            setAuthorized(true);
            setLoading(false);
          } else {
            console.log("Admin Layout: Role not admin or cancelled, redirecting to /");
            if (!cancelled) router.replace("/");
          }
        } else {
          const errorText = await r.text();
          console.log("Admin Layout: Fetch failed with response:", errorText);
          throw new Error(`HTTP ${r.status}`);
        }
      })
      .catch((error) => {
        console.log("Admin Layout: Fetch error:", error);
        if (!cancelled) router.replace("/");
      });
    return () => { cancelled = true; };
  }, [router, pathname]);

  async function handleLogout() {
    try {
      await fetch("http://localhost:4000/api/auth/logout", { method: "POST", credentials: "include" });
    } finally {
      try { localStorage.removeItem('tt_token'); } catch {}
      router.replace("/");
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-cream">
        <div className="w-full bg-white/70 backdrop-blur border-b">
          <div className="container py-3" />
        </div>
        <main className="container py-8">
          <p className="text-muted-foreground">Checking access…</p>
        </main>
      </div>
    );
  }

  if (!authorized) {
    return (
      <div className="min-h-screen bg-gradient-cream">
        <div className="w-full bg-white/70 backdrop-blur border-b">
          <div className="container py-3" />
        </div>
        <main className="container py-8">
          <p className="text-muted-foreground">Access denied. Redirecting…</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-cream">
      <div className="flex">
        <AdminSidebar />
        <div className="flex-1">
          <div className="w-full bg-white/70 backdrop-blur border-b">
            <div className="container flex items-center justify-end py-3">
              <Button className="bg-amber-800 text-white hover:bg-amber-700" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>
          {children}
        </div>
      </div>
      <Toaster />
    </div>
  );
}