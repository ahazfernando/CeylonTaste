"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Menu, X, User, Crown } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import primaryLogo from "@/assets/Home/CeylonTaste-Primary-2.png";
import { useCart } from "@/contexts/CartContext";

interface NavigationProps {
  cartItemCount?: number;
}

export function Navigation({ cartItemCount }: NavigationProps) {
  const { getTotalItems } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<null | { id: string; role: string; name?: string; email?: string }>(null);
  
  // Use cart context count if no prop is provided
  const actualCartCount = cartItemCount !== undefined ? cartItemCount : getTotalItems();

  useEffect(() => {
    let cancelled = false;
    const token = typeof window !== 'undefined' ? localStorage.getItem('tt_token') : null;
    const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
    fetch("http://localhost:4000/api/auth/me", { credentials: "include", headers })
      .then(async (r) => (r.ok ? r.json() : Promise.reject()))
      .then((data) => {
        if (!cancelled) setCurrentUser(data?.user || null);
      })
      .catch(() => {
        if (!cancelled) setCurrentUser(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleLogout() {
    try {
      await fetch("http://localhost:4000/api/auth/logout", { method: "POST", credentials: "include" });
    } finally {
      try { localStorage.removeItem('tt_token'); } catch {}
      setCurrentUser(null);
      setIsMenuOpen(false);
    }
  }

  return (
    <div className="sticky top-0 z-50 pt-3 px-4">
      <nav className="w-90% rounded-2xl bg-white">
        <div className="mx-4 flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <Link href="/" className="flex items-center gap-2">
<Image
  src={primaryLogo.src}
  alt="CeylonTaste Logo"
  width={80}
  height={80}
  className="h-20 w-auto"
/>
            </Link>
          </div>

          {/* Desktop Navigation - Centered */}
          <div className="hidden md:flex items-center gap-8 flex-1 justify-center">
            <Button 
              variant="ghost" 
              className="text-amber-900 hover:text-amber-700 hover:bg-amber-100/50 font-medium px-4" 
              asChild
            >
              <Link href="/">Home</Link>
            </Button>
            <Button 
              variant="ghost" 
              className="text-amber-900 hover:text-amber-700 hover:bg-amber-100/50 font-medium px-4" 
              asChild
            >
              <Link href="/products">Products</Link>
            </Button>
            <Button 
              variant="ghost" 
              className="text-amber-900 hover:text-amber-700 hover:bg-amber-100/50 font-medium px-4" 
              asChild
            >
              <Link href="/about">About</Link>
            </Button>
            <Button 
              variant="ghost" 
              className="text-amber-900 hover:text-amber-700 hover:bg-amber-100/50 font-medium px-4" 
              asChild
            >
              <Link href="/services">Services</Link>
            </Button>
            {currentUser?.role === "admin" && (
              <Button 
                variant="ghost" 
                className="text-amber-900 hover:text-amber-700 hover:bg-amber-100/50 font-medium flex items-center gap-1 px-4" 
                asChild
              >
                <Link href="/admin/dashboard">
                  <Crown className="h-4 w-4" />
                  Admin
                </Link>
              </Button>
            )}
          </div>

          {/* Desktop Actions - Right aligned */}
          <div className="hidden md:flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon" 
              className="relative text-amber-900 hover:text-amber-700 hover:bg-amber-100/50" 
              asChild
            >
              <Link href="/cart">
                <ShoppingCart className="h-5 w-5" />
                {actualCartCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs bg-amber-600 text-white">
                    {actualCartCount}
                  </Badge>
                )}
              </Link>
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-amber-900 hover:text-amber-700 hover:bg-amber-100/50" 
              asChild
            >
              <Link href="/profile">
                <User className="h-5 w-5" />
              </Link>
            </Button>
            {currentUser ? (
              <Button 
                className="bg-amber-800 text-white hover:bg-amber-700 px-6 py-2 rounded-full font-medium shadow-sm ml-2" 
                onClick={handleLogout}
              >
                Logout
              </Button>
            ) : (
              <Button 
                className="bg-amber-800 text-white hover:bg-amber-700 px-6 py-2 rounded-full font-medium shadow-sm ml-2" 
                asChild
              >
                <Link href="/login">Login</Link>
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-amber-900 hover:text-amber-700 hover:bg-amber-100/50"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-amber-200/30" style={{ backgroundColor: '#EFE2D1' }}>
            <div className="mx-4 py-4 space-y-2">
              <Button 
                variant="ghost" 
                className="w-full justify-start text-amber-900 hover:text-amber-700 hover:bg-amber-100/50" 
                asChild
              >
                <Link href="/">Home</Link>
              </Button>
              <Button 
                variant="ghost" 
                className="w-full justify-start text-amber-900 hover:text-amber-700 hover:bg-amber-100/50" 
                asChild
              >
                <Link href="/products">Products</Link>
              </Button>
              <Button 
                variant="ghost" 
                className="w-full justify-start text-amber-900 hover:text-amber-700 hover:bg-amber-100/50" 
                asChild
              >
                <Link href="/about">About</Link>
              </Button>
              <Button 
                variant="ghost" 
                className="w-full justify-start text-amber-900 hover:text-amber-700 hover:bg-amber-100/50" 
                asChild
              >
                <Link href="/services">Services</Link>
              </Button>
              {currentUser?.role === "admin" && (
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-amber-900 hover:text-amber-700 hover:bg-amber-100/50 flex items-center gap-2" 
                  asChild
                >
                  <Link href="/admin/dashboard">
                    <Crown className="h-4 w-4" />
                    Admin
                  </Link>
                </Button>
              )}
              <div className="flex items-center gap-3 pt-4 border-t border-amber-200/30">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="relative text-amber-900 hover:text-amber-700 hover:bg-amber-100/50" 
                  asChild
                >
                  <Link href="/cart">
                    <ShoppingCart className="h-5 w-5" />
                    {actualCartCount > 0 && (
                      <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs bg-amber-600 text-white">
                        {actualCartCount}
                      </Badge>
                    )}
                  </Link>
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-amber-900 hover:text-amber-700 hover:bg-amber-100/50" 
                  asChild
                >
                  <Link href="/profile">
                    <User className="h-5 w-5" />
                  </Link>
                </Button>
                {currentUser ? (
                  <Button 
                    className="bg-amber-800 text-white hover:bg-amber-700 flex-1 rounded-full font-medium" 
                    onClick={handleLogout}
                  >
                    Logout
                  </Button>
                ) : (
                  <Button 
                    className="bg-amber-800 text-white hover:bg-amber-700 flex-1 rounded-full font-medium" 
                    asChild
                  >
                    <Link href="/login">Login</Link>
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </div>
  );
}