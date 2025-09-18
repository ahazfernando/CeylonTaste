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

// Mock user data - replace with Supabase data
const mockUser = {
  name: "John Doe",
  email: "john.doe@example.com",
  avatar: "",
  memberSince: "January 2024",
  totalOrders: 12,
  loyaltyPoints: 2450,
  favoriteItems: 8
};

const mockOrders = [
  {
    id: "ORD-001",
    date: "2024-03-15",
    status: "Delivered",
    total: 45.99,
    items: ["Ceylon Gold Coffee", "Royal Chocolate Cake"]
  },
  {
    id: "ORD-002", 
    date: "2024-03-10",
    status: "Processing",
    total: 28.50,
    items: ["Ceylon Breakfast Blend"]
  }
];

export default function Profile() {
  return (
    <div className="min-h-screen bg-gradient-cream">
      <Navigation />
      <main className="container py-8">
        {/* Profile Header */}
        <Card className="mb-8 shadow-warm">
          <CardContent className="p-6">
            <div className="flex items-center gap-6">
              <Avatar className="h-20 w-20">
                <AvatarImage src={mockUser.avatar} />
                <AvatarFallback className="bg-gradient-coffee text-white text-xl">
                  {mockUser.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl font-bold">{mockUser.name}</h1>
                  <Badge className="bg-gradient-royal text-white">
                    <Crown className="w-3 h-3 mr-1" />
                    Royal Member
                  </Badge>
                </div>
                <p className="text-muted-foreground mb-3">{mockUser.email}</p>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  Member since {mockUser.memberSince}
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
              <ShoppingBag className="w-8 h-8 mx-auto mb-2 text-accent" />
              <div className="text-2xl font-bold text-primary">{mockUser.totalOrders}</div>
              <div className="text-sm text-muted-foreground">Total Orders</div>
            </CardContent>
          </Card>
          
          <Card className="shadow-warm">
            <CardContent className="p-6 text-center">
              <Crown className="w-8 h-8 mx-auto mb-2 text-accent" />
              <div className="text-2xl font-bold text-primary">{mockUser.loyaltyPoints}</div>
              <div className="text-sm text-muted-foreground">Loyalty Points</div>
            </CardContent>
          </Card>
          
          <Card className="shadow-warm">
            <CardContent className="p-6 text-center">
              <Heart className="w-8 h-8 mx-auto mb-2 text-accent" />
              <div className="text-2xl font-bold text-primary">{mockUser.favoriteItems}</div>
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
                <div className="space-y-4">
                  {mockOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <div className="font-semibold">{order.id}</div>
                        <div className="text-sm text-muted-foreground">
                          {order.items.join(", ")}
                        </div>
                        <div className="text-xs text-muted-foreground">{order.date}</div>
                      </div>
                      <div className="text-right">
                        <Badge variant={order.status === "Delivered" ? "default" : "secondary"}>
                          {order.status}
                        </Badge>
                        <div className="font-bold text-primary mt-1">
                          ${order.total.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="favorites">
            <Card className="shadow-warm">
              <CardHeader>
                <CardTitle>Favorite Items</CardTitle>
                <CardDescription>Your saved products for quick reordering</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <Heart className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  Connect to Supabase to save and view your favorite products
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="addresses">
            <Card className="shadow-warm">
              <CardHeader>
                <CardTitle>Delivery Addresses</CardTitle>
                <CardDescription>Manage your delivery locations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <MapPin className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  Connect to Supabase to manage your delivery addresses
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="account">
            <Card className="shadow-warm">
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>Update your personal information and preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" defaultValue="John" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" defaultValue="Doe" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" defaultValue={mockUser.email} />
                </div>
                
                <Separator />
                
                <div className="flex justify-end gap-4">
                  <Button variant="outline">Cancel</Button>
                  <Button className="bg-gradient-coffee text-white">Save Changes</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}