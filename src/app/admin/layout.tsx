"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/toaster";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";

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
    const checkAdminAccess = async () => {
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("tt_token") : null;
        const userStr = typeof window !== "undefined" ? localStorage.getItem("tt_user") : null;

        if (!token || !userStr) {
          // No login: still show admin UI so /admin/dashboard works (e.g. dev or demo)
          setAuthorized(true);
          setLoading(false);
          return;
        }

        const userData = JSON.parse(userStr);
        const role = userData?.role;

        if (role === "admin") {
          setAuthorized(true);
        } else {
          // Logged in but not admin: redirect home
          router.replace("/");
        }
      } catch {
        // On parse error, allow access so dashboard link still works
        setAuthorized(true);
      } finally {
        setLoading(false);
      }
    };

    checkAdminAccess();
  }, [router, pathname]);

  async function handleLogout() {
    try {
      // Import Firebase sign out
      const { apiAuthService } = await import('@/lib/auth-firebase');
      await apiAuthService.signOut();
    } catch (error) {
      console.error('Logout error:', error);
      // Clear localStorage anyway
      try { 
        localStorage.removeItem('tt_token');
        localStorage.removeItem('tt_user');
      } catch {}
    } finally {
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
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset>
        <div className="w-full bg-white/70 backdrop-blur border-b">
          <div className="container flex items-center justify-between py-3">
            <SidebarTrigger />
            <Button className="bg-amber-800 text-white hover:bg-amber-700" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
        <div className="min-h-screen bg-gradient-cream">
          {children}
        </div>
      </SidebarInset>
      <Toaster />
    </SidebarProvider>
  );
}