"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navigation } from "@/components/ui/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, CreditCard, MapPin, User, Phone, Mail } from "lucide-react";
import Link from "next/link";
import { useCart } from "@/contexts/CartContext";
import { SuccessModal } from "@/components/ui/success-modal";

export default function Checkout() {
  const router = useRouter();
  const { cartItems, getTotalPrice, clearCart } = useCart();
  const [currentUser, setCurrentUser] = useState<null | { id: string; role: string; name?: string; email?: string }>(null);
  const [loading, setLoading] = useState(true);
  const [orderLoading, setOrderLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");

  // Form state
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    paymentMethod: "credit_card",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardName: ""
  });

  const subtotal = getTotalPrice();
  const shipping = 5.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  // Use same auth source as Navigation/cart (tt_user in localStorage) so logged-in users stay on checkout
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const userStr = localStorage.getItem('tt_user');
    if (!userStr) {
      setCurrentUser(null);
      setLoading(false);
      router.push('/login');
      return;
    }
    try {
      const user = JSON.parse(userStr);
      setCurrentUser(user);
      // Pre-fill form from stored user (matches profile page address shape)
      const addr = user.address || {};
      setFormData(prev => ({
        ...prev,
        fullName: user.name || "",
        email: user.email || "",
        phone: addr.phone || "",
        address: addr.street || "",
        city: addr.city || "",
        postalCode: addr.zipCode || ""
      }));
    } catch {
      setCurrentUser(null);
      router.push('/login');
    }
    setLoading(false);
  }, [router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePlaceOrder = async () => {
    if (!currentUser) {
      router.push('/login');
      return;
    }

    if (cartItems.length === 0) {
      alert('Your cart is empty. Please add items before placing an order.');
      return;
    }

    setOrderLoading(true);
    try {
      // Import AWS orders API (dynamic import to avoid issues)
      const { placeOrder, formatCartItemsForApi } = await import('@/lib/aws-orders-api');

      // Get Firebase user ID
      // Note: We're using currentUser.id from the local backend for now
      // In a production app with Firebase Auth, you would use: auth.currentUser?.uid
      const userId = currentUser.id;

      // Format cart items for AWS API
      const formattedItems = formatCartItemsForApi(cartItems);

      // Prepare additional order data
      const additionalData = {
        subtotal: subtotal,
        shipping: shipping,
        tax: tax,
        shippingAddress: {
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          postalCode: formData.postalCode,
          country: "Sri Lanka"
        },
        paymentMethod: formData.paymentMethod,
        notes: `Payment method: ${formData.paymentMethod}`
      };

      console.log('[Checkout] Placing order via AWS API...');
      console.log('[Checkout] User ID:', userId);
      console.log('[Checkout] Items:', formattedItems);
      console.log('[Checkout] Total:', total);

      // Call AWS API to place order
      const result = await placeOrder(userId, formattedItems, total, additionalData);

      console.log('[Checkout] Order placed successfully:', result);

      // Clear cart after successful order
      clearCart();

      // Show success modal with order details
      setOrderNumber(result.orderNumber || result.orderId);
      setShowSuccessModal(true);

    } catch (error) {
      console.error('[Checkout] Order placement failed:', error);

      // Show user-friendly error message
      const errorMessage = error instanceof Error
        ? error.message
        : 'An unexpected error occurred while placing your order.';

      alert(`Failed to place order: ${errorMessage}\n\nPlease try again or contact support if the problem persists.`);
    } finally {
      setOrderLoading(false);
    }
  };

  const handleContinueShopping = () => {
    setShowSuccessModal(false);
    router.push('/');
  };

  const handleViewProfile = () => {
    setShowSuccessModal(false);
    router.push('/profile');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-cream flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading checkout...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return null; // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-gradient-cream">
      <Navigation />
      <main className="container py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/cart">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-[#B37142]">
            Checkout
          </h1>
          <Badge className="bg-accent/20 text-accent-foreground">
            {cartItems.length} items
          </Badge>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Information */}
            <Card className="shadow-warm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-accent" />
                  Shipping Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Enter your phone number"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address *</Label>
                  <Textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Enter your full address"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="Enter your city"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="postalCode">Postal Code *</Label>
                    <Input
                      id="postalCode"
                      name="postalCode"
                      value={formData.postalCode}
                      onChange={handleInputChange}
                      placeholder="Enter postal code"
                      required
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Information */}
            <Card className="shadow-warm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-accent" />
                  Payment Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="paymentMethod">Payment Method</Label>
                  <select
                    id="paymentMethod"
                    name="paymentMethod"
                    value={formData.paymentMethod}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-border rounded-md"
                  >
                    <option value="credit_card">Credit/Debit Card</option>
                    <option value="cash_on_delivery">Cash on Delivery</option>
                  </select>
                </div>

                {formData.paymentMethod === "credit_card" && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="cardName">Name on Card *</Label>
                      <Input
                        id="cardName"
                        name="cardName"
                        value={formData.cardName}
                        onChange={handleInputChange}
                        placeholder="Enter name on card"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cardNumber">Card Number *</Label>
                      <Input
                        id="cardNumber"
                        name="cardNumber"
                        value={formData.cardNumber}
                        onChange={handleInputChange}
                        placeholder="1234 5678 9012 3456"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="expiryDate">Expiry Date *</Label>
                        <Input
                          id="expiryDate"
                          name="expiryDate"
                          value={formData.expiryDate}
                          onChange={handleInputChange}
                          placeholder="MM/YY"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cvv">CVV *</Label>
                        <Input
                          id="cvv"
                          name="cvv"
                          value={formData.cvv}
                          onChange={handleInputChange}
                          placeholder="123"
                          required
                        />
                      </div>
                    </div>
                  </>
                )}
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
                {/* Order Items */}
                <div className="space-y-3">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex justify-between items-center">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{item.name}</p>
                        <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                      </div>
                      <div className="text-sm font-medium">
                        LKR {(item.price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>

                <Separator />

                <div className="space-y-2">
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
                </div>
              </CardContent>

              <CardFooter>
                <Button
                  className="w-full bg-[#B37142] text-white hover:from-orange-600 hover:to-orange-700 focus:ring-1 focus:ring-offset-2 transform hover:scale-105 transition-all duration-200 shadow-lg"
                  onClick={handlePlaceOrder}
                  disabled={orderLoading}
                >
                  {orderLoading ? "Placing Order..." : "Place Order"}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </main>

      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        orderNumber={orderNumber}
        total={total}
        onContinueShopping={handleContinueShopping}
      />
    </div>
  );
}
