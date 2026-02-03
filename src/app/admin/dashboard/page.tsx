"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  ShoppingCart,
  Package,
  TrendingUp,
  Plus,
  Eye,
  Edit
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { RevenueChart } from "@/components/charts/revenue-chart";
import { TopProductsChart } from "@/components/charts/top-products-chart";
import { CustomerGrowthChart } from "@/components/charts/customer-growth-chart";
import { DashboardSkeleton } from "@/components/skeletons/dashboard-skeleton";
import { Skeleton } from "@/components/ui/skeleton";
import { getOrders } from "@/lib/aws-orders-api";
import { getProducts } from "@/lib/api";

interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalCustomers: number;
  revenueGrowth: number;
  orderGrowth: number;
}

interface RecentOrder {
  _id?: string;
  orderId?: string;
  id?: string;
  orderNumber?: string;
  user?: {
    name?: string;
    email?: string;
  } | null;
  userId?: string; // fallback
  shippingAddress?: {
    fullName?: string;
  };
  total: number;
  status: string;
  createdAt: string;
}

// Helper to safely get the order ID
const getOrderId = (order: RecentOrder | any): string => {
  return order._id || order.orderId || order.id || 'unknown-id';
};

interface LowStockProduct {
  _id: string;
  name: string;
  stock: number;
  price: number;
}

interface DashboardData {
  stats: DashboardStats;
  recentOrders: RecentOrder[];
  lowStockProducts: LowStockProduct[];
}

const RECENT_ORDERS_LIMIT = 10;

export default function AdminDashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const [ordersRes, products] = await Promise.all([
        getOrders().then((r) => r.orders).catch(() => []),
        getProducts().catch(() => [])
      ]);

      const orders = Array.isArray(ordersRes) ? ordersRes : [];
      const totalRevenue = orders
        .filter((o) => ["delivered", "shipped"].includes((o.status || "").toLowerCase()))
        .reduce((sum, o) => sum + (o.total ?? 0), 0);
      const totalOrders = orders.length;
      const uniqueCustomerIds = new Set(orders.map((o) => o.user?._id).filter(Boolean));
      const totalCustomers = uniqueCustomerIds.size;
      const totalProducts = products.length;

      const recentOrders: RecentOrder[] = [...orders]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, RECENT_ORDERS_LIMIT)
        .map((o) => {
          // Cast to any to access potential fields not in strict OrderListItem type yet
          const raw = o as any;
          return {
            _id: raw._id,
            orderId: raw.orderId,
            id: raw.id,
            orderNumber: raw.orderNumber,
            user: o.user ? { name: o.user.name, email: o.user.email } : null,
            userId: (o.user as any)?.userId || raw.userId,
            shippingAddress: typeof o.shippingAddress === 'object' ? o.shippingAddress : undefined,
            total: o.total ?? 0,
            status: o.status ?? "pending",
            createdAt: o.createdAt
          } as RecentOrder;
        });

      const lowStockProducts: LowStockProduct[] = [];
      if (products.some((p) => "stock" in p && typeof (p as { stock?: number }).stock === "number")) {
        (products as { id: string; name: string; price?: number; stock?: number }[])
          .filter((p) => (p.stock ?? 0) <= 10)
          .forEach((p) =>
            lowStockProducts.push({
              _id: p.id,
              name: p.name,
              stock: p.stock ?? 0,
              price: p.price ?? 0
            })
          );
      }

      setDashboardData({
        stats: {
          totalRevenue,
          totalOrders,
          totalProducts,
          totalCustomers,
          revenueGrowth: 0,
          orderGrowth: 0
        },
        recentOrders,
        lowStockProducts
      });
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch dashboard data");
      setDashboardData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "delivered":
        return <Badge variant="default">Delivered</Badge>;
      case "processing":
        return <Badge variant="secondary">Processing</Badge>;
      case "shipped":
        return <Badge variant="outline">Shipped</Badge>;
      case "pending":
        return <Badge variant="outline">Pending</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { status: "Out of Stock", variant: "destructive" as const };
    if (stock <= 10) return { status: "Low Stock", variant: "secondary" as const };
    return { status: "In Stock", variant: "default" as const };
  };

  if (loading) {
    return (
      <main className="container py-8">
        <div className="flex flex-col gap-2 mb-8">
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-5 w-80" />
        </div>
        <DashboardSkeleton />
      </main>
    );
  }

  if (error || !dashboardData) {
    return (
      <main className="container py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-destructive mb-4">{error || "Failed to load dashboard data"}</p>
            <p className="text-sm text-muted-foreground mb-4">Check NEXT_PUBLIC_API_BASE_URL and RUN-BACKENDS.md.</p>
            <Button onClick={() => fetchDashboardData()}>Retry</Button>
          </div>
        </div>
      </main>
    );
  }

  const { stats, recentOrders, lowStockProducts } = dashboardData;
  return (
    <main className="container py-8">
      {/* Admin Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground">Manage your CeylonTaste business</p>
        </div>
      </div>

      {/* Stats Overview */}
      {loading ? (
        <DashboardSkeleton />
      ) : (
        <>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="shadow-warm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Revenue</p>
                    <p className="text-2xl font-bold text-primary">
                      LKR {stats.totalRevenue.toLocaleString()}
                    </p>
                    <div className="flex items-center text-sm text-green-600 mt-1">
                      <TrendingUp className="w-4 h-4 mr-1" />
                      +{stats.revenueGrowth}%
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-warm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Orders</p>
                    <p className="text-2xl font-bold text-primary">{stats.totalOrders}</p>
                    <div className="flex items-center text-sm text-green-600 mt-1">
                      <TrendingUp className="w-4 h-4 mr-1" />
                      +{stats.orderGrowth}%
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
                    <p className="text-2xl font-bold text-primary">{stats.totalProducts}</p>
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
                    <p className="text-2xl font-bold text-primary">{stats.totalCustomers}</p>
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
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/admin/orders">
                      <Eye className="w-4 h-4 mr-2" />
                      View All Orders
                    </Link>
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentOrders.length > 0 ? (
                      recentOrders.map((order) => (
                        <div key={getOrderId(order)} className="flex items-center justify-between p-4 border rounded-[24px]">
                          <div>
                            <div className="font-semibold">{order.orderNumber || getOrderId(order).slice(0, 8)}</div>
                            <div className="text-sm text-muted-foreground">{order.user?.name || order.shippingAddress?.fullName || order.userId || 'Guest'}</div>
                            <div className="text-xs text-muted-foreground">{formatDate(order.createdAt)}</div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <div className="font-bold text-primary">LKR {order.total.toFixed(2)}</div>
                              {getStatusBadge(order.status)}
                            </div>
                            <Button variant="ghost" size="icon" asChild>
                              <Link href={`/admin/orders`}>
                                <Eye className="w-4 h-4" />
                              </Link>
                            </Button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <ShoppingCart className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No recent orders found</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="products">
              <Card className="shadow-warm">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Low Stock Products</CardTitle>
                    <CardDescription>Products that need restocking attention</CardDescription>
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
                    {lowStockProducts.length > 0 ? (
                      lowStockProducts.map((product) => {
                        const stockStatus = getStockStatus(product.stock);
                        return (
                          <div key={product._id} className="flex items-center justify-between p-4 border rounded-[24px]">
                            <div className="flex-1">
                              <div className="font-semibold">{product.name}</div>
                              <div className="text-sm text-muted-foreground">
                                Stock: {product.stock} units
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <div className="font-bold text-primary">LKR {product.price.toFixed(2)}</div>
                                <Badge variant={stockStatus.variant}>
                                  {stockStatus.status}
                                </Badge>
                              </div>
                              <div className="flex gap-2">
                                <Button variant="ghost" size="icon" asChild>
                                  <Link href={`/admin/products`}>
                                    <Eye className="w-4 h-4" />
                                  </Link>
                                </Button>
                                <Button variant="ghost" size="icon" asChild>
                                  <Link href={`/admin/products`}>
                                    <Edit className="w-4 h-4" />
                                  </Link>
                                </Button>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>All products are well stocked!</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics">
              <div className="space-y-6">
                {/* Revenue Chart */}
                <RevenueChart />

                {/* Charts Grid */}
                <div className="grid lg:grid-cols-2 gap-6">
                  <TopProductsChart />
                  <CustomerGrowthChart />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </>
      )}
    </main>
  );
}