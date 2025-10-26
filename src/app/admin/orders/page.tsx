"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Eye, Clock, CheckCircle, XCircle, Package, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { OrderListSkeleton } from "@/components/skeletons/order-skeleton";

interface OrderItem {
  product: {
    _id: string;
    name: string;
    image: string;
  } | null;
  quantity: number;
  price: number;
}

interface Order {
  _id: string;
  orderNumber: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
  items: OrderItem[];
  total: number;
  status: string;
  createdAt: string;
  shippingAddress?: {
    street: string;
    city: string;
    province: string;
    zipCode: string;
    country: string;
    phone: string;
    fullName: string;
    email: string;
  };
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "pending":
      return <Badge className="bg-warning text-warning-foreground"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
    case "processing":
      return <Badge className="bg-primary text-primary-foreground"><Package className="h-3 w-3 mr-1" />Processing</Badge>;
    case "shipped":
      return <Badge className="bg-success text-success-foreground"><CheckCircle className="h-3 w-3 mr-1" />Shipped</Badge>;
    case "delivered":
      return <Badge className="bg-muted text-muted-foreground"><CheckCircle className="h-3 w-3 mr-1" />Delivered</Badge>;
    case "cancelled":
      return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Cancelled</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

const statusFlow: Record<string, string[]> = {
  pending: ["processing", "cancelled"],
  processing: ["shipped", "cancelled"],
  shipped: ["delivered"],
  delivered: [],
  cancelled: [],
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('tt_token') : null;
        const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
        
        const response = await fetch("http://localhost:4000/api/orders/admin/all", { 
          credentials: "include", 
          headers 
        });
        
        if (response.ok) {
          const data = await response.json();
          setOrders(data.orders || []);
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.items.some(item => item.product?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getItemsString = (items: OrderItem[]) => {
    return items.map(item => {
      const productName = item.product?.name || 'Deleted Product';
      return `${productName} x${item.quantity}`;
    }).join(", ");
  };

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    setUpdatingStatus(orderId);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('tt_token') : null;
      const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
      
      const response = await fetch(`http://localhost:4000/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...headers
        },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        // Update the order in the local state
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order._id === orderId 
              ? { ...order, status: newStatus }
              : order
          )
        );
      } else {
        console.error('Failed to update order status');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
    } finally {
      setUpdatingStatus(null);
    }
  };

  if (loading) {
    return (
      <main className="container p-6 space-y-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-foreground">Orders</h1>
          <p className="text-muted-foreground">Manage and track customer orders</p>
        </div>
        <div className="text-center py-8">
          <p className="text-muted-foreground">Loading orders...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="container p-6 space-y-6">
            <div className="flex flex-col gap-2"><h1 className="text-3xl font-bold text-foreground">Orders</h1><p className="text-muted-foreground">Manage and track customer orders</p></div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="border-border shadow-warm"><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-warning">{orders.filter(o => o.status === "pending").length}</div></CardContent></Card>
              <Card className="border-border shadow-warm"><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Processing</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-primary">{orders.filter(o => o.status === "processing").length}</div></CardContent></Card>
              <Card className="border-border shadow-warm"><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Delivered</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-success">{orders.filter(o => o.status === "delivered").length}</div></CardContent></Card>
              <Card className="border-border shadow-warm"><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-foreground">LKR {orders.filter(o => ["delivered", "shipped"].includes(o.status)).reduce((sum, o) => sum + o.total, 0).toFixed(2)}</div></CardContent></Card>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1 max-w-md"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" /><Input placeholder="Search orders..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 border-border" /></div>
              <Select value={statusFilter} onValueChange={setStatusFilter}><SelectTrigger className="w-48 border-border"><SelectValue placeholder="Filter by status" /></SelectTrigger><SelectContent><SelectItem value="all">All Orders</SelectItem><SelectItem value="pending">Pending</SelectItem><SelectItem value="processing">Processing</SelectItem><SelectItem value="shipped">Shipped</SelectItem><SelectItem value="delivered">Delivered</SelectItem><SelectItem value="cancelled">Cancelled</SelectItem></SelectContent></Select>
            </div>

            <Card className="border-border shadow-warm">
              <CardHeader><CardTitle className="text-foreground">Order Management</CardTitle><CardDescription className="text-muted-foreground">View and manage all customer orders</CardDescription></CardHeader>
              <CardContent>
                {loading ? (
                  <OrderListSkeleton count={6} />
                ) : (
                  <Table>
                    <TableHeader><TableRow className="border-border"><TableHead className="text-foreground">Order ID</TableHead><TableHead className="text-foreground">Customer</TableHead><TableHead className="text-foreground">Shipping Address</TableHead><TableHead className="text-foreground">Items</TableHead><TableHead className="text-foreground">Total</TableHead><TableHead className="text-foreground">Status</TableHead><TableHead className="text-foreground">Date & Time</TableHead><TableHead className="text-foreground">Actions</TableHead></TableRow></TableHeader>
                    <TableBody>
                    {filteredOrders.map((order) => (
                      <TableRow key={order._id} className="border-border">
                        <TableCell className="font-medium text-foreground">{order.orderNumber}</TableCell>
                        <TableCell className="text-foreground">{order.user.name}</TableCell>
                        <TableCell className="text-muted-foreground max-w-xs">
                          {order.shippingAddress ? (
                            <div className="space-y-1">
                              <div className="font-medium">{order.shippingAddress.fullName}</div>
                              <div className="text-xs">{order.shippingAddress.street}</div>
                              <div className="text-xs">{order.shippingAddress.city}, {order.shippingAddress.province}</div>
                              <div className="text-xs">{order.shippingAddress.zipCode}</div>
                              <div className="text-xs">{order.shippingAddress.phone}</div>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">No address</span>
                          )}
                        </TableCell>
                        <TableCell className="text-muted-foreground max-w-xs truncate">{getItemsString(order.items)}</TableCell>
                        <TableCell className="font-medium text-foreground">LKR {order.total.toFixed(2)}</TableCell>
                        <TableCell><StatusBadge status={order.status} /></TableCell>
                        <TableCell className="text-muted-foreground">{formatDate(order.createdAt)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0"><Eye className="h-4 w-4 text-muted-foreground" /></Button>
                            {statusFlow[order.status]?.length > 0 && (
                              <Select 
                                value={order.status} 
                                onValueChange={(newStatus) => handleStatusUpdate(order._id, newStatus)}
                                disabled={updatingStatus === order._id}
                              >
                                <SelectTrigger className="w-24 h-8 border-border">
                                  <SelectValue />
                                  {updatingStatus === order._id && (
                                    <Loader2 className="h-3 w-3 animate-spin ml-1" />
                                  )}
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value={order.status}>{order.status}</SelectItem>
                                  {statusFlow[order.status].map((s) => (
                                    <SelectItem key={s} value={s}>{s}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    </TableBody>
                  </Table>
                )}
                {!loading && filteredOrders.length === 0 && (<div className="text-center py-12"><Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" /><h3 className="text-lg font-medium text-foreground mb-2">No orders found</h3><p className="text-muted-foreground">Try adjusting your search or filter criteria.</p></div>)}
              </CardContent>
            </Card>
    </main>
  );
}


