"use client";

import { useState, useEffect } from "react";
import { Navigation } from "@/components/ui/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { User, Crown, ShoppingBag, Heart, Settings, Star, Calendar, MapPin, Plus, Edit, Smile } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Order interface
interface OrderItem {
  product: {
    _id: string;
    name: string;
    image: string;
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
        const token = typeof window !== 'undefined' ? localStorage.getItem('tt_token') : null;
        const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
        
        // Fetch user data
        const userResponse = await fetch("http://localhost:4000/api/auth/me", { 
          credentials: "include", 
          headers 
        });
        
        if (!userResponse.ok) {
          throw new Error('Failed to fetch user data');
        }
        
        const userData = await userResponse.json();
        setUser(userData.user);
        
        // Fetch user orders
        const ordersResponse = await fetch("http://localhost:4000/api/orders", { 
          credentials: "include", 
          headers 
        });
        
        if (ordersResponse.ok) {
          const ordersData = await ordersResponse.json();
          setOrders(ordersData.orders || []);
        }
        
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-cream">
        <Navigation />
        <main className="container py-8">
          <div className="text-center">
            <p className="text-muted-foreground">Loading profile...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-gradient-cream">
        <Navigation />
        <main className="container py-8">
          <div className="text-center">
            <p className="text-red-500">Error: {error || 'User not found'}</p>
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
  const loyaltyPoints = totalOrders * 100; // Simple calculation
  const favoriteItems = 0; // Could be implemented later

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'default';
      case 'processing':
        return 'secondary';
      case 'shipped':
        return 'outline';
      case 'cancelled':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

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
      const token = typeof window !== 'undefined' ? localStorage.getItem('tt_token') : null;
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      };

      const response = await fetch(`http://localhost:4000/api/auth/profile`, {
        method: 'PUT',
        headers,
        credentials: 'include',
        body: JSON.stringify({ address: addressForm })
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUser(updatedUser.user);
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
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: errorData.error || "Failed to save address. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Failed to save address:', error);
      toast({
        title: "Error",
        description: "Network error. Please check your connection and try again.",
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
    <div className="min-h-screen bg-gradient-cream">
      <Navigation />
      <main className="container py-8">
        {/* Profile Header */}
        <Card className="mb-8 shadow-warm">
          <CardContent className="p-6">
            <div className="flex items-center gap-6">
              <Avatar className="h-20 w-20">
                <AvatarImage src="" />
                <AvatarFallback className="bg-[#B37142] text-white text-xl">
                  {user.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl font-bold">{user.name}</h1>
                </div>
                <p className="text-muted-foreground mb-3">{user.email}</p>
              </div>
              
              <Button variant="outline">
                <Settings className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="shadow-warm">
            <CardContent className="p-6 text-center">
              <ShoppingBag className="w-8 h-8 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold text-primary">{totalOrders}</div>
              <div className="text-sm text-muted-foreground">Total Orders</div>
            </CardContent>
          </Card>
          
          <Card className="shadow-warm">
            <CardContent className="p-6 text-center">
              <Smile className="w-8 h-8 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold text-primary">{loyaltyPoints}</div>
              <div className="text-sm text-muted-foreground">Loyalty Points</div>
            </CardContent>
          </Card>
          
          <Card className="shadow-warm">
            <CardContent className="p-6 text-center">
              <Heart className="w-8 h-8 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold text-primary">{favoriteItems}</div>
              <div className="text-sm text-muted-foreground">Favorites</div>
            </CardContent>
          </Card>
        </div>

        {/* Profile Tabs */}
        <Tabs defaultValue="orders" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="orders">Order History</TabsTrigger>
            <TabsTrigger value="favorites">Favorites</TabsTrigger>
            <TabsTrigger value="addresses">Addresses</TabsTrigger>
            <TabsTrigger value="account">Account</TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="space-y-4">
            <Card className="shadow-warm">
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>View and track your recent purchases</CardDescription>
              </CardHeader>
              <CardContent>
                {orders.length === 0 ? (
                  <div className="text-center py-8">
                    <ShoppingBag className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">No orders yet</p>
                    <p className="text-sm text-muted-foreground">Start shopping to see your orders here</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div key={order._id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <div className="font-semibold">{order.orderNumber}</div>
                          <div className="text-sm text-muted-foreground">
                            {order.items.map(item => `${item.product.name} x${item.quantity}`).join(", ")}
                          </div>
                          <div className="text-xs text-muted-foreground">{formatDate(order.createdAt)}</div>
                        </div>
                        <div className="text-right">
                          <Badge variant={getStatusBadgeVariant(order.status)}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </Badge>
                          <div className="font-bold text-primary mt-1">
                            LKR {order.total.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="favorites">
            <Card className="shadow-warm">
              <CardHeader>
                <CardTitle>Favorite Items</CardTitle>
                <CardDescription>Your saved favorite products</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Heart className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No favorites yet</p>
                  <p className="text-sm text-muted-foreground">Add items to your favorites while shopping</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="addresses">
            <Card className="shadow-warm">
              <CardHeader>
                <CardTitle>Saved Addresses</CardTitle>
                <CardDescription>Manage your delivery addresses</CardDescription>
              </CardHeader>
              <CardContent>
                {user.address ? (
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg bg-muted/30">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-medium text-lg">Default Address</h4>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={handleEditAddress}
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-start gap-2">
                          <MapPin className="w-5 h-5 text-primary mt-0.5" />
                          <div>
                            <p className="font-medium">{user.address.street}</p>
                            <p className="text-muted-foreground">
                              {user.address.city}, {user.address.province} {user.address.zipCode}
                            </p>
                            <p className="text-muted-foreground">{user.address.country}</p>
                            <p className="text-sm text-muted-foreground mt-1">
                              Phone: {user.address.phone}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <Button 
                        variant="outline"
                        onClick={() => setShowAddressForm(true)}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Another Address
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <MapPin className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">No saved addresses</p>
                    <p className="text-sm text-muted-foreground mb-4">Add your first address to get started</p>
                    <Button 
                      variant="outline"
                      onClick={() => setShowAddressForm(true)}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Address
                    </Button>
                  </div>
                )}

                {showAddressForm && (
                  <div className="mt-6 p-4 border rounded-lg bg-muted/20">
                    <h4 className="font-medium mb-4">Address Information</h4>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="street">Street Address</Label>
                        <Input
                          id="street"
                          name="street"
                          value={addressForm.street}
                          onChange={handleAddressInputChange}
                          placeholder="Enter street address"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="city">City</Label>
                          <Input
                            id="city"
                            name="city"
                            value={addressForm.city}
                            onChange={handleAddressInputChange}
                            placeholder="Enter city"
                          />
                        </div>
                        <div>
                          <Label htmlFor="province">State</Label>
                          <Input
                            id="province"
                            name="province"
                            value={addressForm.province}
                            onChange={handleAddressInputChange}
                            placeholder="Enter province"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="zipCode">Postal Code</Label>
                          <Input
                            id="zipCode"
                            name="zipCode"
                            value={addressForm.zipCode}
                            onChange={handleAddressInputChange}
                            placeholder="Enter postal code"
                          />
                        </div>
                        <div>
                          <Label htmlFor="phone">Phone Number</Label>
                          <Input
                            id="phone"
                            name="phone"
                            value={addressForm.phone}
                            onChange={handleAddressInputChange}
                            placeholder="Enter phone number"
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          onClick={handleSaveAddress}
                          disabled={savingAddress}
                        >
                          {savingAddress ? "Saving..." : "Save Address"}
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => setShowAddressForm(false)}
                          disabled={savingAddress}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="account">
            <Card className="shadow-warm">
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>Manage your account information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" value={user.name} readOnly />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" value={user.email} readOnly />
                  </div>
                </div>
                
                <div>
                  <Label>User Address</Label>
                  {user.address ? (
                    <div className="space-y-3">
                      <div className="p-4 border rounded-lg bg-muted/30">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium">Current Address</h4>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={handleEditAddress}
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
                        </div>
                        <div className="text-sm space-y-1">
                          <p>{user.address.street}</p>
                          <p>{user.address.city}, {user.address.province} {user.address.zipCode}</p>
                          <p>{user.address.country}</p>
                          <p className="text-muted-foreground">Phone: {user.address.phone}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6 border-2 border-dashed border-muted-foreground/25 rounded-lg">
                      <MapPin className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-muted-foreground mb-3">No address saved</p>
                      <Button 
                        variant="outline"
                        onClick={() => setShowAddressForm(true)}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Address
                      </Button>
                    </div>
                  )}
                </div>

                {showAddressForm && (
                  <div className="p-4 border rounded-lg bg-muted/20">
                    <h4 className="font-medium mb-4">Address Information</h4>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="street">Street Address</Label>
                        <Input
                          id="street"
                          name="street"
                          value={addressForm.street}
                          onChange={handleAddressInputChange}
                          placeholder="Enter street address"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="city">City</Label>
                          <Input
                            id="city"
                            name="city"
                            value={addressForm.city}
                            onChange={handleAddressInputChange}
                            placeholder="Enter city"
                          />
                        </div>
                        <div>
                          <Label htmlFor="province">State</Label>
                          <Input
                            id="province"
                            name="province"
                            value={addressForm.province}
                            onChange={handleAddressInputChange}
                            placeholder="Enter province"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="zipCode">Postal Code</Label>
                          <Input
                            id="zipCode"
                            name="zipCode"
                            value={addressForm.zipCode}
                            onChange={handleAddressInputChange}
                            placeholder="Enter postal code"
                          />
                        </div>
                        <div>
                          <Label htmlFor="phone">Phone Number</Label>
                          <Input
                            id="phone"
                            name="phone"
                            value={addressForm.phone}
                            onChange={handleAddressInputChange}
                            placeholder="Enter phone number"
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          onClick={handleSaveAddress}
                          disabled={savingAddress}
                        >
                          {savingAddress ? "Saving..." : "Save Address"}
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => setShowAddressForm(false)}
                          disabled={savingAddress}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                <Separator />
                <div className="flex justify-end">
                  <Button variant="outline">
                    <Settings className="w-4 h-4 mr-2" />
                    Update Account
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}