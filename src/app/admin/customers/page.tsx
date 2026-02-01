"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Search, Eye, Mail, Phone, Users, MoreHorizontal, Edit, Loader2, Gift } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { CustomerDetailsModal } from "@/components/ui/customer-details-modal";
import { getOrders } from "@/lib/aws-orders-api";
import { CustomerListSkeleton } from "@/components/skeletons/customer-skeleton";
import type { OrderListItem } from "@/lib/aws-orders-api";

interface Customer {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  customerStatus?: string;
  address?: {
    street?: string;
    city?: string;
    province?: string;
    zipCode?: string;
    country?: string;
    phone?: string;
  };
  totalOrders: number;
  totalSpent: number;
  lastOrder?: string;
  createdAt: string;
}

/** Derive unique customers from orders (group by user id). */
function deriveCustomersFromOrders(orders: OrderListItem[]): Customer[] {
  const byUserId = new Map<string, OrderListItem[]>();
  for (const order of orders) {
    const uid = order.user?._id ?? "";
    if (!uid) continue;
    if (!byUserId.has(uid)) byUserId.set(uid, []);
    byUserId.get(uid)!.push(order);
  }
  const customers: Customer[] = [];
  for (const [userId, userOrders] of byUserId) {
    const sorted = [...userOrders].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    const latest = sorted[0];
    const totalSpent = userOrders.reduce((sum, o) => sum + (o.total ?? 0), 0);
    const addr = latest.shippingAddress as Record<string, unknown> | undefined;
    const street = (addr?.street ?? addr?.address ?? "") as string;
    const city = (addr?.city ?? "") as string;
    const province = (addr?.province ?? "") as string;
    const zipCode = (addr?.zipCode ?? addr?.postalCode ?? "") as string;
    const country = (addr?.country ?? "") as string;
    const phone = (addr?.phone as string) || undefined;
    customers.push({
      _id: userId,
      name: (latest.user?.name ?? "Customer") as string,
      email: (latest.user?.email ?? "") as string,
      phone: (addr?.phone as string) || undefined,
      customerStatus: "active",
      address:
        street || city || province || zipCode || country
          ? { street, city, province, zipCode, country, phone: (addr?.phone as string) || "" }
          : undefined,
      totalOrders: userOrders.length,
      totalSpent,
      lastOrder: sorted[0]?.createdAt,
      createdAt: sorted[sorted.length - 1]?.createdAt ?? new Date().toISOString(),
    });
  }
  return customers.sort((a, b) => new Date(b.lastOrder ?? 0).getTime() - new Date(a.lastOrder ?? 0).getTime());
}

function StatusBadge({ status }: { status?: string }) {
  const statusValue = status || 'active';
  switch (statusValue) {
    case "premium":
      return <Badge className="bg-purple-100 text-purple-800 border-purple-200">Premium</Badge>;
    case "gold":
      return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Gold</Badge>;
    case "bronze":
      return <Badge className="bg-orange-100 text-orange-800 border-orange-200">Bronze</Badge>;
    case "active":
      return <Badge className="bg-green-100 text-green-800 border-green-200">Active</Badge>;
    case "inactive":
      return <Badge variant="outline" className="text-muted-foreground">Inactive</Badge>;
    default:
      return <Badge className="bg-green-100 text-green-800 border-green-200">Active</Badge>;
  }
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [phoneValue, setPhoneValue] = useState("");
  const [updatingPhone, setUpdatingPhone] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [offerCustomer, setOfferCustomer] = useState<Customer | null>(null);
  const [offerForm, setOfferForm] = useState({
    type: "percentage" as "percentage" | "fixed",
    value: "",
    code: "",
    message: "",
    expiry: "",
  });
  const [sendingOffer, setSendingOffer] = useState(false);
  const { toast } = useToast();

  const fetchCustomers = useCallback(async () => {
    setFetchError(null);
    setLoading(true);
    try {
      const { orders } = await getOrders();
      const derived = deriveCustomersFromOrders(orders);
      setCustomers(derived);
    } catch (error) {
      setFetchError(
        error instanceof Error
          ? error.message
          : "Could not load customers. Customers are derived from orders—check NEXT_PUBLIC_API_BASE_URL and RUN-BACKENDS.md."
      );
      setCustomers([]);
      console.error("Error fetching orders for customers:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (customer.phone && customer.phone.includes(searchTerm))
  );

  const handleStatusUpdate = async (customerId: string, newStatus: string) => {
    setUpdatingStatus(customerId);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('tt_token') : null;
      const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
      
      const response = await fetch(`http://localhost:4000/api/admin/customers/${customerId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...headers
        },
        credentials: 'include',
        body: JSON.stringify({ customerStatus: newStatus })
      });

      if (response.ok) {
        setCustomers(prevCustomers => 
          prevCustomers.map(customer => 
            customer._id === customerId 
              ? { ...customer, customerStatus: newStatus }
              : customer
          )
        );
      } else {
        console.error('Failed to update customer status');
      }
    } catch (error) {
      console.error('Error updating customer status:', error);
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handlePhoneUpdate = async () => {
    if (!editingCustomer) return;
    
    setUpdatingPhone(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('tt_token') : null;
      const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
      
      const response = await fetch(`http://localhost:4000/api/admin/customers/${editingCustomer._id}/phone`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...headers
        },
        credentials: 'include',
        body: JSON.stringify({ phone: phoneValue })
      });

      if (response.ok) {
        setCustomers(prevCustomers => 
          prevCustomers.map(customer => 
            customer._id === editingCustomer._id 
              ? { ...customer, phone: phoneValue }
              : customer
          )
        );
        setEditingCustomer(null);
        setPhoneValue("");
      } else {
        console.error('Failed to update customer phone');
      }
    } catch (error) {
      console.error('Error updating customer phone:', error);
    } finally {
      setUpdatingPhone(false);
    }
  };

  const openEditDialog = (customer: Customer) => {
    setEditingCustomer(customer);
    setPhoneValue(customer.phone || "");
  };

  const handleViewDetails = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowCustomerModal(true);
  };

  const openOfferDialog = (customer: Customer) => {
    setOfferCustomer(customer);
    setOfferForm({
      type: "percentage",
      value: "",
      code: "",
      message: "",
      expiry: "",
    });
  };

  const handleSendOffer = async () => {
    if (!offerCustomer) return;
    const valueNum = parseFloat(offerForm.value);
    if (!offerForm.value || (offerForm.type === "percentage" && (valueNum <= 0 || valueNum > 100)) || (offerForm.type === "fixed" && valueNum <= 0)) {
      toast({
        title: "Invalid offer",
        description: "Please enter a valid discount value.",
        variant: "destructive",
      });
      return;
    }
    setSendingOffer(true);
    try {
      // TODO: Connect to offers API when available. For now we show success.
      toast({
        title: "Offer sent",
        description: `Offer sent to ${offerCustomer.name} (${offerCustomer.email}). They will receive it via email when the backend is connected.`,
      });
      setOfferCustomer(null);
    } catch (error) {
      toast({
        title: "Failed to send offer",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setSendingOffer(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <main className="container p-6 space-y-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-foreground">Customers</h1>
          <p className="text-muted-foreground">Manage your customer relationships. Customers are derived from orders.</p>
        </div>
        <CustomerListSkeleton count={6} />
      </main>
    );
  }

  return (
    <main className="container p-6 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-foreground">Customers</h1>
        <p className="text-muted-foreground">Manage your customer relationships. Customers are derived from orders.</p>
      </div>

      {fetchError && (
        <Card className="border-destructive/50 bg-destructive/10">
          <CardContent className="pt-6">
            <p className="text-destructive font-medium mb-2">Could not load customers</p>
            <p className="text-sm text-muted-foreground mb-4">{fetchError}</p>
            <Button variant="outline" onClick={() => fetchCustomers()}>
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-border shadow-warm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{customers.length}</div>
          </CardContent>
        </Card>
        <Card className="border-border shadow-warm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">VIP Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">
              {customers.filter(c => ["premium", "gold", "bronze"].includes(c.customerStatus || 'active')).length}
            </div>
          </CardContent>
        </Card>
        <Card className="border-border shadow-warm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {customers.filter(c => {
                if (!c.lastOrder) return false;
                const d = new Date(c.lastOrder);
                const now = new Date();
                return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
              }).length}
            </div>
          </CardContent>
        </Card>
        <Card className="border-border shadow-warm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              LKR {customers.reduce((sum, c) => sum + c.totalSpent, 0).toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input 
          placeholder="Search customers..." 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)} 
          className="pl-10 border-border" 
        />
      </div>

      <Card className="border-border shadow-warm">
        <CardHeader>
          <CardTitle className="text-foreground">Customer Management</CardTitle>
          <CardDescription className="text-muted-foreground">View and manage customer information</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-border">
                <TableHead className="text-foreground">Customer</TableHead>
                <TableHead className="text-foreground">Contact</TableHead>
                <TableHead className="text-foreground">Orders</TableHead>
                <TableHead className="text-foreground">Total Spent</TableHead>
                <TableHead className="text-foreground">Last Order</TableHead>
                <TableHead className="text-foreground">Status</TableHead>
                <TableHead className="text-foreground">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.map((customer) => (
                <TableRow key={customer._id} className="border-border">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-accent">
                        <Users className="h-5 w-5 text-accent-foreground" />
                      </div>
                      <div>
                        <div className="font-medium text-foreground">{customer.name}</div>
                        <div className="text-sm text-muted-foreground">ID: {customer._id.slice(-6)}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="h-3 w-3" />
                        {customer.email}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="h-3 w-3" />
                        {customer.phone || "No phone"}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium text-foreground">{customer.totalOrders}</TableCell>
                  <TableCell className="font-medium text-foreground">LKR {customer.totalSpent.toFixed(2)}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {customer.lastOrder ? formatDate(customer.lastOrder) : "No orders"}
                  </TableCell>
                  <TableCell>
                    <Select 
                      value={customer.customerStatus || 'active'} 
                      onValueChange={(newStatus) => handleStatusUpdate(customer._id, newStatus)}
                      disabled={updatingStatus === customer._id}
                    >
                      <SelectTrigger className="w-32 border-border">
                        <SelectValue />
                        {updatingStatus === customer._id && (
                          <Loader2 className="h-3 w-3 animate-spin ml-1" />
                        )}
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="premium">Premium</SelectItem>
                        <SelectItem value="gold">Gold</SelectItem>
                        <SelectItem value="bronze">Bronze</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEditDialog(customer)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Phone
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleViewDetails(customer)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openOfferDialog(customer)}>
                          <Gift className="h-4 w-4 mr-2" />
                          Give offer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {!fetchError && filteredCustomers.length === 0 && (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No customers found</h3>
              <p className="text-muted-foreground">Customers are derived from orders. Place orders at checkout to see them here.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Phone Dialog */}
      <Dialog open={!!editingCustomer} onOpenChange={() => setEditingCustomer(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Customer Phone</DialogTitle>
            <DialogDescription>
              Update the phone number for {editingCustomer?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right">
                Phone
              </Label>
              <Input
                id="phone"
                value={phoneValue}
                onChange={(e) => setPhoneValue(e.target.value)}
                className="col-span-3"
                placeholder="Enter phone number"
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setEditingCustomer(null)}
              disabled={updatingPhone}
            >
              Cancel
            </Button>
            <Button 
              onClick={handlePhoneUpdate}
              disabled={updatingPhone}
            >
              {updatingPhone && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Give offer dialog */}
      <Dialog open={!!offerCustomer} onOpenChange={(open) => !open && setOfferCustomer(null)}>
        <DialogContent className="sm:max-w-md rounded-[24px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5 text-primary" />
              Give offer
            </DialogTitle>
            <DialogDescription>
              Create a discount offer for {offerCustomer?.name} ({offerCustomer?.email})
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="offer-type" className="text-right">
                Type
              </Label>
              <Select
                value={offerForm.type}
                onValueChange={(v: "percentage" | "fixed") => setOfferForm((f) => ({ ...f, type: v }))}
              >
                <SelectTrigger id="offer-type" className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Percentage off</SelectItem>
                  <SelectItem value="fixed">Fixed amount off (LKR)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="offer-value" className="text-right">
                Value
              </Label>
              <Input
                id="offer-value"
                type="number"
                min={offerForm.type === "percentage" ? 1 : 0}
                max={offerForm.type === "percentage" ? 100 : undefined}
                step={offerForm.type === "percentage" ? 1 : 0.01}
                value={offerForm.value}
                onChange={(e) => setOfferForm((f) => ({ ...f, value: e.target.value }))}
                className="col-span-3"
                placeholder={offerForm.type === "percentage" ? "e.g. 10" : "e.g. 500"}
              />
              <span className="col-span-4 col-start-2 text-xs text-muted-foreground">
                {offerForm.type === "percentage" ? "Percent (1–100)" : "Amount in LKR"}
              </span>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="offer-code" className="text-right">
                Promo code
              </Label>
              <Input
                id="offer-code"
                value={offerForm.code}
                onChange={(e) => setOfferForm((f) => ({ ...f, code: e.target.value }))}
                className="col-span-3"
                placeholder="e.g. SAVE10 (optional)"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="offer-expiry" className="text-right">
                Expiry
              </Label>
              <Input
                id="offer-expiry"
                type="date"
                value={offerForm.expiry}
                onChange={(e) => setOfferForm((f) => ({ ...f, expiry: e.target.value }))}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="offer-message" className="text-right">
                Message
              </Label>
              <Input
                id="offer-message"
                value={offerForm.message}
                onChange={(e) => setOfferForm((f) => ({ ...f, message: e.target.value }))}
                className="col-span-3"
                placeholder="Optional message to customer"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOfferCustomer(null)} disabled={sendingOffer}>
              Cancel
            </Button>
            <Button onClick={handleSendOffer} disabled={sendingOffer}>
              {sendingOffer && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Send offer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Customer Details Modal */}
      <CustomerDetailsModal
        isOpen={showCustomerModal}
        onClose={() => setShowCustomerModal(false)}
        customer={selectedCustomer}
      />
    </main>
  );
}