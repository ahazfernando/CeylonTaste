"use client";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminInventoryPlaceholder() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  useEffect(() => {
    let cancelled = false;
    const token = typeof window !== 'undefined' ? localStorage.getItem('tt_token') : null;
    const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
    fetch("http://localhost:4000/api/auth/me", { credentials: "include", headers })
      .then(async (r) => (r.ok ? r.json() : Promise.reject()))
      .then((data) => { if (!cancelled && data?.user?.role === "admin") setAuthorized(true); else router.replace("/"); })
      .catch(() => { if (!cancelled) router.replace("/"); });
    return () => { cancelled = true; };
  }, [router]);

  async function handleLogout() {
    try { await fetch("http://localhost:4000/api/auth/logout", { method: "POST", credentials: "include" }); } finally { try { localStorage.removeItem('tt_token'); } catch {} router.replace("/"); }
  }

  if (!authorized) return null;

  return (
    <div className="min-h-screen bg-gradient-cream">
      <div className="flex">
        <AdminSidebar />
        <div className="flex-1">
          <div className="w-full bg-white/70 backdrop-blur border-b"><div className="container flex items-center justify-end py-3"><Button className="bg-amber-800 text-white hover:bg-amber-700" onClick={handleLogout}>Logout</Button></div></div>
          <main className="container p-6">
            <h1 className="text-3xl font-bold">Inventory (Coming Soon)</h1>
            <p className="text-muted-foreground">Track stock levels, suppliers, and restock alerts.</p>
          </main>
        </div>
      </div>
    </div>
  );
}


