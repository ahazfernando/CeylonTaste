"use client";

import { useEffect, useState } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Eye, Clock, CheckCircle, XCircle, Package } from "lucide-react";
import { useRouter } from "next/navigation";

const mockOrders = [
  { id: "ORD-001", customer: "Sarah Johnson", items: "Chocolate Croissant x2, Cappuccino x1", total: 14.00, status: "pending", date: "2024-01-15", time: "09:30 AM" },
  { id: "ORD-002", customer: "Mike Chen", items: "Red Velvet Cake x1", total: 28.00, status: "preparing", date: "2024-01-15", time: "10:15 AM" },
  { id: "ORD-003", customer: "Emma Davis", items: "Blueberry Muffin x3, Coffee x2", total: 22.25, status: "ready", date: "2024-01-15", time: "11:00 AM" },
  { id: "ORD-004", customer: "David Wilson", items: "Espresso x3, Croissant x1", total: 13.25, status: "completed", date: "2024-01-15", time: "08:45 AM" },
  { id: "ORD-005", customer: "Lisa Brown", items: "Custom Birthday Cake", total: 45.00, status: "cancelled", date: "2024-01-14", time: "02:30 PM" },
];

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "pending":
      return <Badge className="bg-warning text-warning-foreground"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
    case "preparing":
      return <Badge className="bg-primary text-primary-foreground"><Package className="h-3 w-3 mr-1" />Preparing</Badge>;
    case "ready":
      return <Badge className="bg-success text-success-foreground"><CheckCircle className="h-3 w-3 mr-1" />Ready</Badge>;
    case "completed":
      return <Badge className="bg-muted text-muted-foreground"><CheckCircle className="h-3 w-3 mr-1" />Completed</Badge>;
    case "cancelled":
      return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Cancelled</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

const statusFlow: Record<string, string[]> = {
  pending: ["preparing", "cancelled"],
  preparing: ["ready", "cancelled"],
  ready: ["completed"],
  completed: [],
  cancelled: [],
};

export default function AdminOrdersPage() {
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

  const [orders] = useState(mockOrders);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.customer.toLowerCase().includes(searchTerm.toLowerCase()) || order.id.toLowerCase().includes(searchTerm.toLowerCase()) || order.items.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
            <div className="flex flex-col gap-2"><h1 className="text-3xl font-bold text-foreground">Orders</h1><p className="text-muted-foreground">Manage and track customer orders</p></div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="border-border shadow-warm"><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-warning">{orders.filter(o => o.status === "pending").length}</div></CardContent></Card>
              <Card className="border-border shadow-warm"><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Preparing</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-primary">{orders.filter(o => o.status === "preparing").length}</div></CardContent></Card>
              <Card className="border-border shadow-warm"><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Ready</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-success">{orders.filter(o => o.status === "ready").length}</div></CardContent></Card>
              <Card className="border-border shadow-warm"><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Today's Revenue</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-foreground">${orders.filter(o => o.date === "2024-01-15" && o.status !== "cancelled").reduce((sum, o) => sum + o.total, 0).toFixed(2)}</div></CardContent></Card>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1 max-w-md"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" /><Input placeholder="Search orders..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 border-border" /></div>
              <Select value={statusFilter} onValueChange={setStatusFilter}><SelectTrigger className="w-48 border-border"><SelectValue placeholder="Filter by status" /></SelectTrigger><SelectContent><SelectItem value="all">All Orders</SelectItem><SelectItem value="pending">Pending</SelectItem><SelectItem value="preparing">Preparing</SelectItem><SelectItem value="ready">Ready</SelectItem><SelectItem value="completed">Completed</SelectItem><SelectItem value="cancelled">Cancelled</SelectItem></SelectContent></Select>
            </div>

            <Card className="border-border shadow-warm">
              <CardHeader><CardTitle className="text-foreground">Order Management</CardTitle><CardDescription className="text-muted-foreground">View and manage all customer orders</CardDescription></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader><TableRow className="border-border"><TableHead className="text-foreground">Order ID</TableHead><TableHead className="text-foreground">Customer</TableHead><TableHead className="text-foreground">Items</TableHead><TableHead className="text-foreground">Total</TableHead><TableHead className="text-foreground">Status</TableHead><TableHead className="text-foreground">Date & Time</TableHead><TableHead className="text-foreground">Actions</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {filteredOrders.map((order) => (
                      <TableRow key={order.id} className="border-border">
                        <TableCell className="font-medium text-foreground">{order.id}</TableCell>
                        <TableCell className="text-foreground">{order.customer}</TableCell>
                        <TableCell className="text-muted-foreground max-w-xs truncate">{order.items}</TableCell>
                        <TableCell className="font-medium text-foreground">${order.total.toFixed(2)}</TableCell>
                        <TableCell><StatusBadge status={order.status} /></TableCell>
                        <TableCell className="text-muted-foreground"><div><div>{order.date}</div><div className="text-xs">{order.time}</div></div></TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0"><Eye className="h-4 w-4 text-muted-foreground" /></Button>
                            {statusFlow[order.status]?.length > 0 && (
                              <Select defaultValue={order.status}>
                                <SelectTrigger className="w-24 h-8 border-border"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value={order.status}>{order.status}</SelectItem>
                                  {statusFlow[order.status].map((s) => (<SelectItem key={s} value={s}>{s}</SelectItem>))}
                                </SelectContent>
                              </Select>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {filteredOrders.length === 0 && (<div className="text-center py-12"><Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" /><h3 className="text-lg font-medium text-foreground mb-2">No orders found</h3><p className="text-muted-foreground">Try adjusting your search or filter criteria.</p></div>)}
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </div>
  );
}


