"use client";

import { useEffect, useState } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Eye, Mail, Phone, Users } from "lucide-react";
import { useRouter } from "next/navigation";

const mockCustomers = [
  { id: 1, name: "Sarah Johnson", email: "sarah.johnson@email.com", phone: "+1 (555) 123-4567", totalOrders: 24, totalSpent: 340.50, lastOrder: "2024-01-15", status: "active" },
  { id: 2, name: "Mike Chen", email: "mike.chen@email.com", phone: "+1 (555) 234-5678", totalOrders: 18, totalSpent: 275.25, lastOrder: "2024-01-14", status: "active" },
  { id: 3, name: "Emma Davis", email: "emma.davis@email.com", phone: "+1 (555) 345-6789", totalOrders: 32, totalSpent: 450.75, lastOrder: "2024-01-13", status: "vip" },
  { id: 4, name: "David Wilson", email: "david.wilson@email.com", phone: "+1 (555) 456-7890", totalOrders: 8, totalSpent: 125.00, lastOrder: "2024-01-10", status: "active" },
  { id: 5, name: "Lisa Brown", email: "lisa.brown@email.com", phone: "+1 (555) 567-8901", totalOrders: 5, totalSpent: 89.50, lastOrder: "2024-01-05", status: "inactive" },
];

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "vip":
      return <Badge className="bg-accent text-accent-foreground">VIP</Badge>;
    case "active":
      return <Badge className="bg-success text-success-foreground">Active</Badge>;
    case "inactive":
      return <Badge variant="outline" className="text-muted-foreground">Inactive</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

export default function AdminCustomersPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const token = typeof window !== 'undefined' ? localStorage.getItem('tt_token') : null;
    const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
    fetch("http://localhost:4000/api/auth/me", { credentials: "include", headers })
      .then(async (r) => (r.ok ? r.json() : Promise.reject()))
      .then((data) => {
        const role = data?.user?.role;
        if (!cancelled && role === "admin") setAuthorized(true);
        else router.replace("/");
      })
      .catch(() => { if (!cancelled) router.replace("/"); });
    return () => { cancelled = true; };
  }, [router]);

  async function handleLogout() {
    try { await fetch("http://localhost:4000/api/auth/logout", { method: "POST", credentials: "include" }); } finally { try { localStorage.removeItem('tt_token'); } catch {} router.replace("/"); }
  }

  const [customers] = useState(mockCustomers);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!authorized) {
    return (<div className="min-h-screen bg-gradient-cream"><div className="w-full bg-white/70 backdrop-blur border-b"><div className="container py-3"/></div><main className="container py-8"><p className="text-muted-foreground">Checking access…</p></main></div>);
  }

  return (
    <div className="min-h-screen bg-gradient-cream">
      <div className="flex">
        <AdminSidebar />
        <div className="flex-1">
          <div className="w-full bg-white/70 backdrop-blur border-b"><div className="container flex items-center justify-end py-3"><Button className="bg-amber-800 text-white hover:bg-amber-700" onClick={handleLogout}>Logout</Button></div></div>
          <main className="container p-6 space-y-6">
            <div className="flex flex-col gap-2"><h1 className="text-3xl font-bold text-foreground">Customers</h1><p className="text-muted-foreground">Manage your customer relationships</p></div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="border-border shadow-warm"><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total Customers</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-foreground">{customers.length}</div></CardContent></Card>
              <Card className="border-border shadow-warm"><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">VIP Customers</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-accent">{customers.filter(c => c.status === "vip").length}</div></CardContent></Card>
              <Card className="border-border shadow-warm"><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Active This Month</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-success">{customers.filter(c => c.status === "active").length}</div></CardContent></Card>
              <Card className="border-border shadow-warm"><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-foreground">${customers.reduce((sum, c) => sum + c.totalSpent, 0).toFixed(2)}</div></CardContent></Card>
            </div>

            <div className="relative max-w-md"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" /><Input placeholder="Search customers..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 border-border" /></div>

            <Card className="border-border shadow-warm">
              <CardHeader><CardTitle className="text-foreground">Customer Management</CardTitle><CardDescription className="text-muted-foreground">View and manage customer information</CardDescription></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader><TableRow className="border-border"><TableHead className="text-foreground">Customer</TableHead><TableHead className="text-foreground">Contact</TableHead><TableHead className="text-foreground">Orders</TableHead><TableHead className="text-foreground">Total Spent</TableHead><TableHead className="text-foreground">Last Order</TableHead><TableHead className="text-foreground">Status</TableHead><TableHead className="text-foreground">Actions</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {filteredCustomers.map((customer) => (
                      <TableRow key={customer.id} className="border-border">
                        <TableCell><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-accent"><Users className="h-5 w-5 text-accent-foreground" /></div><div><div className="font-medium text-foreground">{customer.name}</div><div className="text-sm text-muted-foreground">ID: {customer.id}</div></div></div></TableCell>
                        <TableCell><div className="space-y-1"><div className="flex items-center gap-2 text-sm text-muted-foreground"><Mail className="h-3 w-3" />{customer.email}</div><div className="flex items-center gap-2 text-sm text-muted-foreground"><Phone className="h-3 w-3" />{customer.phone}</div></div></TableCell>
                        <TableCell className="font-medium text-foreground">{customer.totalOrders}</TableCell>
                        <TableCell className="font-medium text-foreground">${customer.totalSpent.toFixed(2)}</TableCell>
                        <TableCell className="text-muted-foreground">{customer.lastOrder}</TableCell>
                        <TableCell><StatusBadge status={customer.status} /></TableCell>
                        <TableCell><Button variant="ghost" size="sm" className="h-8 w-8 p-0"><Eye className="h-4 w-4 text-muted-foreground" /></Button></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {filteredCustomers.length === 0 && (<div className="text-center py-12"><Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" /><h3 className="text-lg font-medium text-foreground mb-2">No customers found</h3><p className="text-muted-foreground">Try adjusting your search criteria.</p></div>)}
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </div>
  );
}


