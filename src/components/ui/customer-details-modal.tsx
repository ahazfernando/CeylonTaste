"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { MapPin, Mail, Phone, Calendar, ShoppingBag, DollarSign, User } from "lucide-react";

interface CustomerDetails {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  customerStatus?: string;
  address?: {
    street: string;
    city: string;
    province: string;
    zipCode: string;
    country: string;
    phone: string;
  };
  totalOrders: number;
  totalSpent: number;
  lastOrder?: string;
  createdAt: string;
}

interface CustomerDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: CustomerDetails | null;
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

export function CustomerDetailsModal({ isOpen, onClose, customer }: CustomerDetailsModalProps) {
  if (!customer) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <User className="h-6 w-6 text-primary" />
            Customer Details
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Customer Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{customer.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{customer.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{customer.phone || "No phone"}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Member since {formatDate(customer.createdAt)}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Status:</span>
                <StatusBadge status={customer.customerStatus} />
              </div>
            </CardContent>
          </Card>

          {/* Address Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Address Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              {customer.address ? (
                <div className="space-y-2">
                  <p className="font-medium">{customer.address.street}</p>
                  <p className="text-muted-foreground">
                    {customer.address.city}, {customer.address.province} {customer.address.zipCode}
                  </p>
                  <p className="text-muted-foreground">{customer.address.country}</p>
                  {customer.address.phone && (
                    <p className="text-sm text-muted-foreground">Phone: {customer.address.phone}</p>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground">No address information available</p>
              )}
            </CardContent>
          </Card>

          {/* Order Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-primary" />
                Order Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-muted/30 rounded-lg">
                  <div className="text-2xl font-bold text-primary">{customer.totalOrders}</div>
                  <div className="text-sm text-muted-foreground">Total Orders</div>
                </div>
                <div className="text-center p-4 bg-muted/30 rounded-lg">
                  <div className="text-2xl font-bold text-primary">LKR {customer.totalSpent.toFixed(2)}</div>
                  <div className="text-sm text-muted-foreground">Total Spent</div>
                </div>
              </div>
              
              {customer.lastOrder && (
                <div className="mt-4 pt-4 border-t">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Last Order: {formatDate(customer.lastOrder)}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
