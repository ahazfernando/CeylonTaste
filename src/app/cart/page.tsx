"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navigation } from "@/components/ui/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Plus, Minus, Trash2, ShoppingBag, ArrowLeft, Tag } from "lucide-react";
import Link from "next/link";
import { getImageUrl } from "@/lib/utils";
import { useCart } from "@/contexts/CartContext";

export default function Cart() {
  const router = useRouter();
  const { cartItems, updateQuantity, removeFromCart, getTotalPrice } = useCart();
  const [currentUser, setCurrentUser] = useState<null | { id: string; role: string; name?: string; email?: string }>(null);
  const [loading, setLoading] = useState(true);

  const subtotal = getTotalPrice();
  const shipping = 5.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  // Check authentication status
  useEffect(() => {
    let cancelled = false;
    const token = typeof window !== 'undefined' ? localStorage.getItem('tt_token') : null;
    const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
    
    fetch("http://localhost:4000/api/auth/me", { credentials: "include", headers })
      .then(async (r) => (r.ok ? r.json() : Promise.reject()))
      .then((data) => {
        if (!cancelled) {
          setCurrentUser(data?.user || null);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setCurrentUser(null);
          setLoading(false);
        }
      });
    
    return () => {
      cancelled = true;
    };
  }, []);

  const handleProceedToCheckout = () => {
    if (!currentUser) {
      // Redirect to login page if user is not authenticated
      router.push('/login');
      return;
    }
    // Redirect to checkout page for authenticated users
    router.push('/checkout');
  };

  return (
    <div className="min-h-screen bg-gradient-cream">
      <Navigation />
      <main className="container py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/products">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold bg-gradient-coffee bg-clip-text text-transparent">
            Shopping Cart
          </h1>
          <Badge className="bg-accent/20 text-accent-foreground">
            {cartItems.length} items
          </Badge>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.length === 0 ? (
              <Card className="shadow-warm">
                <CardContent className="p-12 text-center">
                  <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Your cart is empty</h3>
                  <p className="text-muted-foreground mb-4">Add some products to get started!</p>
                  <Button asChild>
                    <Link href="/products">Browse Products</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              cartItems.map((item) => (
                <Card key={item.id} className="shadow-warm">
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      <img 
                        src={getImageUrl(item.image)} 
                        alt={item.name}
                        className="w-24 h-24 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-semibold text-lg">{item.name}</h3>
                            <Badge variant="outline" className="text-xs">
                              {item.category}
                            </Badge>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-destructive"
                            onClick={() => removeFromCart(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Button 
                              variant="outline" 
                              size="icon" 
                              className="h-8 w-8"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="w-8 text-center font-medium">{item.quantity}</span>
                            <Button 
                              variant="outline" 
                              size="icon" 
                              className="h-8 w-8"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          <div className="text-right">
                            <div className="text-lg font-bold text-primary">
                              LKR {(item.price * item.quantity).toFixed(2)}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              LKR {item.price.toFixed(2)} each
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}

            {/* Promo Code */}
            <Card className="shadow-warm">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Tag className="h-5 w-5 text-accent" />
                  Promo Code
                </h3>
                <div className="flex gap-2">
                  <Input placeholder="Enter promo code" />
                  <Button variant="outline">Apply</Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div>
            <Card className="shadow-coffee sticky top-8">
              <CardHeader>
                <CardTitle className="bg-gradient-coffee bg-clip-text text-transparent">
                  Order Summary
                </CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>LKR {subtotal.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>LKR {shipping.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>LKR {tax.toFixed(2)}</span>
                </div>
                
                <Separator />
                
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-primary">LKR {total.toFixed(2)}</span>
                </div>
              </CardContent>
              
              <CardFooter className="flex flex-col gap-3">
                <Button 
                  className="w-full bg-gradient-coffee text-white hover:opacity-90 shadow-warm"
                  onClick={handleProceedToCheckout}
                  disabled={loading}
                >
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  {loading ? "Loading..." : currentUser ? "Proceed to Checkout" : "Login to Checkout"}
                </Button>
                <Button variant="outline" asChild className="w-full">
                  <Link href="/products">
                    Continue Shopping
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
        <div className="mt-12 p-6 bg-card rounded-lg border border-accent/20 shadow-warm">
          <h3 className="font-semibold mb-2 text-primary">Shopping Cart Ready</h3>
        </div>
      </main>
    </div>
  );
}