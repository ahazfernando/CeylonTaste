"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart, 
  Users, 
  ShoppingCart, 
  Package, 
  TrendingUp, 
  DollarSign,
  Crown,
  Coffee,
  Plus,
  Eye,
  Edit,
  Trash2
} from "lucide-react";
import Link from "next/link";

// Mock admin data - replace with Supabase data
const mockStats = {
  totalRevenue: 15420.50,
  totalOrders: 342,
  totalProducts: 48,
  totalCustomers: 1250,
  revenueGrowth: 12.5,
  orderGrowth: 8.3
};

const mockRecentOrders = [
  { id: "ORD-345", customer: "John Doe", total: 45.99, status: "Processing" },
  { id: "ORD-344", customer: "Jane Smith", total: 28.50, status: "Delivered" },
  { id: "ORD-343", customer: "Mike Johnson", total: 67.25, status: "Shipped" }
];

const mockProducts = [
  { id: "1", name: "Ceylon Gold Coffee", stock: 45, price: 24.99, status: "In Stock" },
  { id: "2", name: "Royal Chocolate Cake", stock: 12, price: 18.50, status: "Low Stock" },
  { id: "3", name: "Ceylon Breakfast Blend", stock: 0, price: 19.99, status: "Out of Stock" }
];

export default function AdminDashboard() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  async function handleLogout() {
    try {
      await fetch("http://localhost:4000/api/auth/logout", { method: "POST", credentials: "include" });
    } finally {
      try { localStorage.removeItem('tt_token'); } catch {}
      router.replace("/");
    }
  }

  useEffect(() => {
    let cancelled = false;
    const token = typeof window !== 'undefined' ? localStorage.getItem('tt_token') : null;
    const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

    console.log("Dashboard: Token from localStorage:", token);
    console.log("Dashboard: Headers:", headers);

    fetch("http://localhost:4000/api/auth/me", { credentials: "include", headers })
      .then(async (r) => {
        console.log("Dashboard: Fetch response status:", r.status);
        if (r.ok) {
          const data = await r.json();
          console.log("Dashboard: User data:", data);
          const role = data?.user?.role;
          console.log("Dashboard: User role:", role);
          if (!cancelled && role === "admin") {
            console.log("Dashboard: Setting authorized to true");
            setAuthorized(true);
          } else {
            console.log("Dashboard: Role not admin or cancelled, redirecting to /");
            if (!cancelled) router.replace("/");
          }
        } else {
          const errorText = await r.text();
          console.log("Dashboard: Fetch failed with response:", errorText);
          throw new Error(`HTTP ${r.status}`);
        }
      })
      .catch((error) => {
        console.log("Dashboard: Fetch error:", error);
        if (!cancelled) router.replace("/");
      });
    return () => { cancelled = true; };
  }, [router]);

  if (!authorized) {
    return (
      <div className="min-h-screen bg-gradient-cream">
        <main className="container py-8">
          <p className="text-muted-foreground">Checking access…</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-cream">
      <div className="flex">
        <AdminSidebar />
        <div className="flex-1">
          {/* Minimal admin header with only Logout */}
          <div className="w-full bg-white/70 backdrop-blur border-b">
            <div className="container flex items-center justify-end py-3">
              <Button className="bg-amber-800 text-white hover:bg-amber-700" onClick={handleLogout}>Logout</Button>
            </div>
          </div>
          <main className="container py-8">
        {/* Admin Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-coffee bg-clip-text text-transparent flex items-center gap-2">
              <Crown className="w-8 h-8 text-accent" />
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground">Manage your CeylonTaste business</p>
          </div>
          <Badge className="bg-gradient-royal text-white">
            <Coffee className="w-4 h-4 mr-1" />
            Admin Access
          </Badge>
        </div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-warm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Revenue</p>
                  <p className="text-2xl font-bold text-primary">
                    ${mockStats.totalRevenue.toLocaleString()}
                  </p>
                  <div className="flex items-center text-sm text-green-600 mt-1">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    +{mockStats.revenueGrowth}%
                  </div>
                </div>
                <DollarSign className="w-8 h-8 text-accent" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-warm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Orders</p>
                  <p className="text-2xl font-bold text-primary">{mockStats.totalOrders}</p>
                  <div className="flex items-center text-sm text-green-600 mt-1">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    +{mockStats.orderGrowth}%
                  </div>
                </div>
                <ShoppingCart className="w-8 h-8 text-accent" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-warm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Products</p>
                  <p className="text-2xl font-bold text-primary">{mockStats.totalProducts}</p>
                  <p className="text-sm text-muted-foreground mt-1">Active inventory</p>
                </div>
                <Package className="w-8 h-8 text-accent" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-warm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Customers</p>
                  <p className="text-2xl font-bold text-primary">{mockStats.totalCustomers}</p>
                  <p className="text-sm text-muted-foreground mt-1">Registered users</p>
                </div>
                <Users className="w-8 h-8 text-accent" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Management Tabs */}
        <Tabs defaultValue="orders" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="orders">Recent Orders</TabsTrigger>
            <TabsTrigger value="products">Product Management</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="orders">
            <Card className="shadow-warm">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Recent Orders</CardTitle>
                  <CardDescription>Latest customer orders and their status</CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <Eye className="w-4 h-4 mr-2" />
                  View All Orders
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockRecentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <div className="font-semibold">{order.id}</div>
                        <div className="text-sm text-muted-foreground">{order.customer}</div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="font-bold text-primary">${order.total}</div>
                          <Badge variant={
                            order.status === "Delivered" ? "default" : 
                            order.status === "Processing" ? "secondary" : 
                            "outline"
                          }>
                            {order.status}
                          </Badge>
                        </div>
                        <Button variant="ghost" size="icon">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="products">
            <Card className="shadow-warm">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Product Management</CardTitle>
                  <CardDescription>Manage your product inventory and pricing</CardDescription>
                </div>
                <Button className="bg-gradient-coffee text-white" asChild>
                  <Link href="/admin/products/new">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Product
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockProducts.map((product) => (
                    <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="font-semibold">{product.name}</div>
                        <div className="text-sm text-muted-foreground">
                          Stock: {product.stock} units
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="font-bold text-primary">${product.price}</div>
                          <Badge variant={
                            product.status === "In Stock" ? "default" :
                            product.status === "Low Stock" ? "secondary" :
                            "destructive"
                          }>
                            {product.status}
                          </Badge>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="icon">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-destructive">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card className="shadow-warm">
              <CardHeader>
                <CardTitle>Sales Analytics</CardTitle>
                <CardDescription>Business performance insights and trends</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <BarChart className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">Analytics Dashboard</h3>
                  <p className="max-w-md mx-auto">
                    Connect to Supabase to unlock detailed analytics including sales trends, 
                    customer insights, and performance metrics.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

          </main>
        </div>
      </div>
    </div>
  );
}