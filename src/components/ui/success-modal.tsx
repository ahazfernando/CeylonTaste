"use client";

import { useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, Package, Calendar, CreditCard } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderNumber: string;
  total: number;
  onContinueShopping?: () => void;
}

export function SuccessModal({ 
  isOpen, 
  onClose, 
  orderNumber, 
  total, 
  onContinueShopping 
}: SuccessModalProps) {
  // Auto-close after 10 seconds
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <DialogTitle className="text-2xl font-bold text-green-600">
            Order Placed Successfully!
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Order Details */}
          <div className="rounded-lg bg-gradient-to-r from-coffee-50 to-cream-50 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-coffee-600" />
                <span className="font-semibold text-coffee-800">Order Number</span>
              </div>
              <Badge variant="secondary" className="bg-coffee-100 text-coffee-800">
                {orderNumber}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-coffee-600" />
                <span className="font-semibold text-coffee-800">Total Amount</span>
              </div>
              <span className="text-lg font-bold text-coffee-800">
                LKR {total.toFixed(2)}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-coffee-600" />
              <span className="text-sm text-coffee-600">
                Order placed on {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>
          </div>

          {/* Success Message */}
          <div className="text-center space-y-2">
            <p className="text-muted-foreground">
              Thank you for your order! We'll send you a confirmation email shortly.
            </p>
            <p className="text-sm text-muted-foreground">
              You can track your order status in your profile page.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              onClick={onContinueShopping}
              className="flex-1 bg-[#B37142] text-white hover:from-orange-600 hover:to-orange-700 focus:ring-1 focus:ring-offset-2 transform hover:scale-105 transition-all duration-200 shadow-lg"
            >
              Continue Shopping
            </Button>
            <Button 
              onClick={onClose}
              variant="outline" 
              className="flex-1"
            >
              View Profile
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
