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
        // Get user data from localStorage (set by Firebase)
        const token = typeof window !== 'undefined' ? localStorage.getItem('tt_token') : null;
        const userStr = typeof window !== 'undefined' ? localStorage.getItem('tt_user') : null;
        
        if (!token || !userStr) {
          console.log("Admin Layout: No token or user data, redirecting to /");
          router.replace("/");
          return;
        }
        
        const userData = JSON.parse(userStr);
        const role = userData?.role;
        
        console.log("Admin Layout: User role:", role);
        
        if (role === "admin") {
          console.log("Admin Layout: Setting authorized to true");
          setAuthorized(true);
        } else {
          console.log("Admin Layout: Role not admin, redirecting to /");
          router.replace("/");
        }
      } catch (error) {
        console.log("Admin Layout: Error checking auth:", error);
        router.replace("/");
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