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
import { User, Crown, ShoppingBag, Heart, Settings, Star, Calendar, MapPin } from "lucide-react";

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
}

export default function Profile() {
  const [user, setUser] = useState<UserData | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
                <AvatarFallback className="bg-gradient-coffee text-white text-xl">
                  {user.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl font-bold">{user.name}</h1>
                  <Badge className="bg-gradient-royal text-white">
                    <Crown className="w-3 h-3 mr-1" />
                    Royal Member
                  </Badge>
                </div>
                <p className="text-muted-foreground mb-3">{user.email}</p>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  Member since {memberSince}
                </div>
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
              <Crown className="w-8 h-8 mx-auto mb-2 text-primary" />
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
                <div className="text-center py-8">
                  <MapPin className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No saved addresses</p>
                  <p className="text-sm text-muted-foreground">Add addresses during checkout</p>
                </div>
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
                  <Label htmlFor="role">Account Type</Label>
                  <Input id="role" value={user.role.charAt(0).toUpperCase() + user.role.slice(1)} readOnly />
                </div>
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