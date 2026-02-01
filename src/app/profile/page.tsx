"use client";

import { useState, useEffect, useCallback } from "react";
import { Navigation } from "@/components/ui/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { User, Crown, ShoppingBag, Star, Calendar, MapPin, Plus, Edit, Lock, Loader2, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getOrders } from "@/lib/aws-orders-api";
import { ProfileSkeleton } from "@/components/skeletons/profile-skeleton";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

// Order interface
interface OrderItem {
  product?: {
    _id: string;
    name: string;
    image?: string;
  };
  quantity: number;
  price: number;
}

interface Order {
  _id: string;
  orderNumber: string;
  items: OrderItem[];
  total: number;
  status: string;
  createdAt: string;
  shippingAddress?: {
    fullName?: string;
    email?: string;
    phone?: string;
    street?: string;
    address?: string;
    city?: string;
    province?: string;
    zipCode?: string;
    postalCode?: string;
    country?: string;
  };
}

interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  address?: {
    street: string;
    city: string;
    province: string;
    zipCode: string;
    country: string;
    phone: string;
  };
}

export default function Profile() {
  const [user, setUser] = useState<UserData | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressForm, setAddressForm] = useState({
    street: "",
    city: "",
    province: "",
    zipCode: "",
    country: "Sri Lanka",
    phone: ""
  });
  const [savingAddress, setSavingAddress] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Get user data from localStorage (set by Cognito auth)
        const token = typeof window !== 'undefined' ? localStorage.getItem('tt_token') : null;
        const userStr = typeof window !== 'undefined' ? localStorage.getItem('tt_user') : null;

        if (!token || !userStr) {
          throw new Error('User not authenticated');
        }

        const userData = JSON.parse(userStr);

        // Map auth user to the expected format
        setUser({
          id: userData.id || userData.uid,
          name: userData.name,
          email: userData.email,
          role: userData.role || 'user',
          createdAt: userData.createdAt || new Date().toISOString(),
          address: userData.address
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const fetchUserOrders = useCallback(async (userId: string) => {
    setOrdersError(null);
    setOrdersLoading(true);
    try {
      const { orders: allOrders } = await getOrders();
      const myOrders = allOrders.filter((o) => o.user?._id === userId) as Order[];
      setOrders(myOrders);
    } catch (err) {
      setOrdersError(err instanceof Error ? err.message : "Could not load your orders.");
      setOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user?.id) return;
    fetchUserOrders(user.id);
  }, [user?.id, fetchUserOrders]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black">
        <Navigation />
        <main className="container py-8">
          <ProfileSkeleton />
        </main>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black">
        <Navigation />
        <main className="container py-20">
          <div className="max-w-md mx-auto text-center space-y-6">
            <div className="bg-black border border-sky-400/50 w-20 h-20 mx-auto rounded-full flex items-center justify-center">
              <Lock className="w-10 h-10 text-sky-400" />
            </div>
            <h1 className="text-3xl font-serif font-bold text-white">Please Log In</h1>
            <p className="text-white/70 text-lg">
              Sign in to view your profile, track your orders, and manage your account settings.
            </p>
            <div className="flex gap-4 justify-center pt-4">
              <Button asChild size="lg" className="w-full sm:w-auto bg-sky-500 hover:bg-sky-400 text-white border-0">
                <Link href="/login">Log In</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="w-full sm:w-auto border-sky-400 text-sky-400 hover:bg-sky-400/10 hover:text-sky-300">
                <Link href="/signup">Create Account</Link>
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const memberSince = user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  }) : 'Unknown';

  const totalOrders = orders.length;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleAddressInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAddressForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveAddress = async () => {
    if (!user) return;

    // Validate required fields
    if (!addressForm.street || !addressForm.city || !addressForm.province || !addressForm.zipCode || !addressForm.phone) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields (Street, City, Province, Postal Code, Phone)",
        variant: "destructive",
      });
      return;
    }

    setSavingAddress(true);

    try {
      // Update user address in localStorage
      const userStr = typeof window !== 'undefined' ? localStorage.getItem('tt_user') : null;
      if (userStr) {
        const userData = JSON.parse(userStr);
        const updatedUser = {
          ...userData,
          address: addressForm
        };

        // Save back to localStorage
        localStorage.setItem('tt_user', JSON.stringify(updatedUser));

        // Update state
        setUser({
          ...user,
          address: addressForm
        });

        setShowAddressForm(false);
        setAddressForm({
          street: "",
          city: "",
          province: "",
          zipCode: "",
          country: "Sri Lanka",
          phone: ""
        });

        toast({
          title: "Success!",
          description: "Your address has been saved successfully.",
        });
      }
    } catch (error) {
      console.error('Failed to save address:', error);
      toast({
        title: "Error",
        description: "Failed to save address. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSavingAddress(false);
    }
  };

  const handleEditAddress = () => {
    if (user?.address) {
      setAddressForm(user.address);
    }
    setShowAddressForm(true);
  };

  return (
    <div className="min-h-screen bg-black">
      <Navigation />
      <main className="container py-8">
        {/* Profile Header */}
        <Card className="mb-8 shadow-lg bg-black border border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <Avatar className="h-20 w-20 border-2 border-sky-400/50">
                  <AvatarImage src="" />
                  <AvatarFallback className="bg-sky-500/20 text-sky-400 text-xl border border-sky-400/30">
                    {user.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-2xl font-bold text-white">{user.name}</h1>
                  </div>
                  <p className="text-white mb-3">{user.email}</p>
                </div>
              </div>

              {/* Total Orders Card */}
              <div className="bg-black border border-sky-400/40 rounded-lg p-4 text-center min-w-[120px]">
                <ShoppingBag className="w-6 h-6 mx-auto mb-2 text-sky-400" />
                <div className="text-xl font-bold text-sky-400">{totalOrders}</div>
                <div className="text-xs text-white/60">Total Orders</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Tabs */}
        <Tabs defaultValue="orders" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-black border border-white/10 p-1">
            <TabsTrigger value="orders" className="data-[state=active]:bg-sky-500/20 data-[state=active]:text-sky-400 data-[state=active]:border-sky-400/50 text-white/80 border border-transparent data-[state=active]:border-sky-400/50">Order History</TabsTrigger>
            <TabsTrigger value="account" className="data-[state=active]:bg-sky-500/20 data-[state=active]:text-sky-400 data-[state=active]:border-sky-400/50 text-white/80 border border-transparent data-[state=active]:border-sky-400/50">Account</TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="space-y-4">
            <Card className="shadow-lg bg-black border border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Recent Orders</CardTitle>
                <CardDescription className="text-white/60">View and track your recent purchases</CardDescription>
              </CardHeader>
              <CardContent>
                {ordersLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="flex items-center justify-between p-4 rounded-lg border border-white/10 bg-white/5">
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-24 bg-white/10" />
                          <Skeleton className="h-3 w-48 bg-white/10" />
                          <Skeleton className="h-3 w-20 bg-white/10" />
                        </div>
                        <div className="flex items-center gap-4">
                          <Skeleton className="h-6 w-16 rounded-full bg-white/10" />
                          <Skeleton className="h-5 w-20 bg-white/10" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : ordersError ? (
                  <div className="text-center py-8">
                    <p className="text-white/80 mb-2">{ordersError}</p>
                    <p className="text-sm text-white/50 mb-4">Ensure NEXT_PUBLIC_API_BASE_URL is set in .env and the API is running. See RUN-BACKENDS.md.</p>
                    <Button
                      variant="outline"
                      onClick={() => user?.id && fetchUserOrders(user.id)}
                      className="border-sky-400/50 text-sky-400 hover:bg-sky-400/10"
                    >
                      Retry
                    </Button>
                  </div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-8">
                    <ShoppingBag className="w-12 h-12 mx-auto mb-4 text-sky-400/80" />
                    <p className="text-white/80">No orders yet</p>
                    <p className="text-sm text-white/50">Start shopping to see your orders here</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <button
                        key={order._id}
                        type="button"
                        onClick={() => setSelectedOrder(order)}
                        className="w-full flex items-center justify-between p-4 border border-white/10 rounded-lg bg-white/5 hover:bg-white/10 hover:border-sky-400/30 transition-colors text-left cursor-pointer"
                      >
                        <div>
                          <div className="font-semibold text-white">{order.orderNumber}</div>
                          <div className="text-sm text-white/60">
                            {order.items.map(item => `${item.product?.name || 'Unknown Product'} x${item.quantity}`).join(", ")}
                          </div>
                          <div className="text-xs text-white/50">{formatDate(order.createdAt)}</div>
                        </div>
                        <div className="text-right flex items-center gap-2">
                          <Badge className="bg-sky-500/20 text-sky-400 border border-sky-400/40">
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </Badge>
                          <div className="font-bold text-sky-400 mt-1">
                            LKR {order.total.toFixed(2)}
                          </div>
                          <ChevronRight className="w-4 h-4 text-white/50" />
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="account">
            <Card className="shadow-lg bg-black border border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Account Settings</CardTitle>
                <CardDescription className="text-white/60">Manage your account information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name" className="text-white/90">Full Name</Label>
                    <Input id="name" value={user.name} readOnly className="bg-white/5 border-white/20 text-white placeholder:text-white/40" />
                  </div>
                  <div>
                    <Label htmlFor="email" className="text-white/90">Email</Label>
                    <Input id="email" value={user.email} readOnly className="bg-white/5 border-white/20 text-white placeholder:text-white/40" />
                  </div>
                </div>

                <div>
                  <Label className="text-white/90">User Address</Label>
                  {user.address ? (
                    <div className="space-y-3">
                      <div className="p-4 border border-white/10 rounded-lg bg-white/5">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium text-white">Current Address</h4>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleEditAddress}
                            className="border-sky-400/50 text-sky-400 hover:bg-sky-400/10"
                          >
                            <Edit className="w-4 h-4 mr-1 text-sky-400" />
                            Edit
                          </Button>
                        </div>
                        <div className="text-sm space-y-1 text-white/80">
                          <p>{user.address.street}</p>
                          <p>{user.address.city}, {user.address.province} {user.address.zipCode}</p>
                          <p>{user.address.country}</p>
                          <p className="text-white/60">Phone: {user.address.phone}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6 border-2 border-dashed border-sky-400/30 rounded-lg">
                      <MapPin className="w-8 h-8 mx-auto mb-2 text-sky-400" />
                      <p className="text-white/70 mb-3">No address saved</p>
                      <Button
                        variant="outline"
                        onClick={() => setShowAddressForm(true)}
                        className="border-sky-400/50 text-sky-400 hover:bg-sky-400/10"
                      >
                        <Plus className="w-4 h-4 mr-2 text-sky-400" />
                        Add Address
                      </Button>
                    </div>
                  )}
                </div>

                {showAddressForm && (
                  <div className="p-4 border border-white/10 rounded-lg bg-white/5">
                    <h4 className="font-medium mb-4 text-white">Address Information</h4>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="street" className="text-white/90">Street Address</Label>
                        <Input
                          id="street"
                          name="street"
                          value={addressForm.street}
                          onChange={handleAddressInputChange}
                          placeholder="Enter street address"
                          className="bg-white/5 border-white/20 text-white placeholder:text-white/40"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="city" className="text-white/90">City</Label>
                          <Input
                            id="city"
                            name="city"
                            value={addressForm.city}
                            onChange={handleAddressInputChange}
                            placeholder="Enter city"
                            className="bg-white/5 border-white/20 text-white placeholder:text-white/40"
                          />
                        </div>
                        <div>
                          <Label htmlFor="province" className="text-white/90">State</Label>
                          <Input
                            id="province"
                            name="province"
                            value={addressForm.province}
                            onChange={handleAddressInputChange}
                            placeholder="Enter province"
                            className="bg-white/5 border-white/20 text-white placeholder:text-white/40"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="zipCode" className="text-white/90">Postal Code</Label>
                          <Input
                            id="zipCode"
                            name="zipCode"
                            value={addressForm.zipCode}
                            onChange={handleAddressInputChange}
                            placeholder="Enter postal code"
                            className="bg-white/5 border-white/20 text-white placeholder:text-white/40"
                          />
                        </div>
                        <div>
                          <Label htmlFor="phone" className="text-white/90">Phone Number</Label>
                          <Input
                            id="phone"
                            name="phone"
                            value={addressForm.phone}
                            onChange={handleAddressInputChange}
                            placeholder="Enter phone number"
                            className="bg-white/5 border-white/20 text-white placeholder:text-white/40"
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={handleSaveAddress}
                          disabled={savingAddress}
                          className="bg-sky-500 hover:bg-sky-400 text-white border-0"
                        >
                          {savingAddress ? "Saving..." : "Save Address"}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setShowAddressForm(false)}
                          disabled={savingAddress}
                          className="border-sky-400/50 text-sky-400 hover:bg-sky-400/10"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                <Separator className="bg-white/10" />
                <div className="flex justify-end">
                  <Button variant="outline" className="border-sky-400/50 text-sky-400 hover:bg-sky-400/10">
                    <Edit className="w-4 h-4 mr-2 text-sky-400" />
                    Update Account
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Order details dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <DialogContent className="bg-black border border-white/10 text-white max-w-lg max-h-[90vh] overflow-y-auto rounded-[24px]">
          <DialogHeader>
            <DialogTitle className="text-white">
              Order {selectedOrder?.orderNumber}
            </DialogTitle>
            <DialogDescription className="text-white/60">
              Placed on {selectedOrder ? formatDate(selectedOrder.createdAt) : ""} ·{" "}
              <Badge className="bg-sky-500/20 text-sky-400 border border-sky-400/40 inline">
                {selectedOrder?.status ? selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1) : ""}
              </Badge>
            </DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-white/80 mb-2">Items</h4>
                <div className="space-y-2 border border-white/10 rounded-lg divide-y divide-white/10">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center py-2 px-3">
                      <div className="text-sm text-white">
                        <span className="font-medium">{item.product?.name || "Unknown Product"}</span>
                        <span className="text-white/60 ml-1">× {item.quantity}</span>
                      </div>
                      <div className="text-sky-400 font-medium">
                        LKR {(item.quantity * item.price).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-between text-lg font-semibold pt-2 border-t border-white/10">
                <span className="text-white">Total</span>
                <span className="text-sky-400">LKR {selectedOrder.total.toFixed(2)}</span>
              </div>
              {selectedOrder.shippingAddress && (
                <div>
                  <h4 className="text-sm font-medium text-white/80 mb-2">Shipping address</h4>
                  <div className="text-sm text-white/70 border border-white/10 rounded-lg p-3 space-y-1">
                    {selectedOrder.shippingAddress.fullName && (
                      <p>{selectedOrder.shippingAddress.fullName}</p>
                    )}
                    {(selectedOrder.shippingAddress.address || selectedOrder.shippingAddress.street) && (
                      <p>{selectedOrder.shippingAddress.address || selectedOrder.shippingAddress.street}</p>
                    )}
                    {(selectedOrder.shippingAddress.city || selectedOrder.shippingAddress.province) && (
                      <p>
                        {[selectedOrder.shippingAddress.city, selectedOrder.shippingAddress.province]
                          .filter(Boolean)
                          .join(", ")}
                        {(selectedOrder.shippingAddress.zipCode || selectedOrder.shippingAddress.postalCode) && (
                          <> {selectedOrder.shippingAddress.zipCode || selectedOrder.shippingAddress.postalCode}</>
                        )}
                      </p>
                    )}
                    {selectedOrder.shippingAddress.country && (
                      <p>{selectedOrder.shippingAddress.country}</p>
                    )}
                    {selectedOrder.shippingAddress.phone && (
                      <p>Phone: {selectedOrder.shippingAddress.phone}</p>
                    )}
                    {selectedOrder.shippingAddress.email && (
                      <p>Email: {selectedOrder.shippingAddress.email}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSelectedOrder(null)}
              className="border-sky-400/50 text-sky-400 hover:bg-sky-400/10"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}