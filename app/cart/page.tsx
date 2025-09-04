import Link from "next/link";
import { Navigation } from "@/components/ui/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Plus, Minus, Trash2, ShoppingBag, ArrowLeft, Tag } from "lucide-react";

// Mock cart data - replace with Supabase data
const mockCartItems = [
  {
    id: "1",
    name: "Ceylon Gold Premium Coffee",
    price: 24.99,
    quantity: 2,
    image: "/lovable-uploads/6f585580-b495-45ec-9ac2-b6521c1b4b70.png",
    category: "Coffee"
  },
  {
    id: "2",
    name: "Royal Chocolate Cake",
    price: 18.50,
    quantity: 1,
    image: "/lovable-uploads/6f585580-b495-45ec-9ac2-b6521c1b4b70.png",
    category: "Cakes"
  }
];

export default function Cart() {
  const subtotal = mockCartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = 5.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

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
            {mockCartItems.length} items
          </Badge>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {mockCartItems.map((item) => (
              <Card key={item.id} className="shadow-warm">
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    <img
                      src={item.image}
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
                        <Button variant="ghost" size="icon" className="text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Button variant="outline" size="icon" className="h-8 w-8">
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-8 text-center font-medium">{item.quantity}</span>
                          <Button variant="outline" size="icon" className="h-8 w-8">
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="text-right">
                          <div className="text-lg font-bold text-primary">
                            ${(item.price * item.quantity).toFixed(2)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            ${item.price.toFixed(2)} each
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

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
                  <span>${subtotal.toFixed(2)}</span>
                </div>

                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>${shipping.toFixed(2)}</span>
                </div>

                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>${tax.toFixed(2)}</span>
                </div>

                <Separator />

                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-primary">${total.toFixed(2)}</span>
                </div>
              </CardContent>

              <CardFooter className="flex flex-col gap-3">
                <Button className="w-full bg-gradient-coffee text-white hover:opacity-90 shadow-warm">
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  Proceed to Checkout
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

        {/* Supabase Integration Notice */}
        <div className="mt-12 p-6 bg-card rounded-lg border border-accent/20 shadow-warm">
          <h3 className="font-semibold mb-2 text-primary">Shopping Cart Ready</h3>
          <p className="text-muted-foreground text-sm">
            Connect to Supabase to enable persistent cart storage, user sessions,
            and checkout functionality with payment processing.
          </p>
        </div>
      </main>
    </div>
  );
}