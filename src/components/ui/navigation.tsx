"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Menu, X, User, Crown } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/contexts/CartContext";

interface NavigationProps {
  cartItemCount?: number;
}

export function Navigation({ cartItemCount }: NavigationProps) {
  const { getTotalItems, clearCart } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<null | { id: string; role: string; name?: string; email?: string }>(null);

  // Use cart context count if no prop is provided
  const actualCartCount = cartItemCount !== undefined ? cartItemCount : getTotalItems();

  useEffect(() => {
    let cancelled = false;

    // Check localStorage for user
    const userStr = typeof window !== 'undefined' ? localStorage.getItem('tt_user') : null;
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (!cancelled) setCurrentUser(user);
      } catch (e) {
        if (!cancelled) setCurrentUser(null);
      }
    } else {
      if (!cancelled) setCurrentUser(null);
    }

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleLogout() {
    try {
      // Clear Firebase session
      try { localStorage.removeItem('tt_user'); } catch { }
      try { localStorage.removeItem('tt_token'); } catch { }
    } finally {
      setCurrentUser(null);
      clearCart(); // Clear cart on logout
      setIsMenuOpen(false);
    }
  }

  return (
    <div className="sticky top-0 z-50 pt-3 px-4">
      <nav className="w-90% rounded-2xl bg-card border border-border">
        <div className="mx-4 flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/logo/abteclogomain.png"
                alt="Logo"
                width={36}
                height={36}
                className="h-9 w-auto"
              />
            </Link>
          </div>

          {/* Desktop Navigation - Centered */}
          <div className="hidden md:flex items-center gap-6 flex-1 justify-center">
            <Button
              variant="ghost"
              className="text-foreground hover:text-primary hover:bg-accent font-medium px-3"
              asChild
            >
              <Link href="/">Home</Link>
            </Button>
            <Button
              variant="ghost"
              className="text-foreground hover:text-primary hover:bg-accent font-medium px-3"
              asChild
            >
              <Link href="/products">Products</Link>
            </Button>
            <Button
              variant="ghost"
              className="text-foreground hover:text-primary hover:bg-accent font-medium px-3"
              asChild
            >
              <Link href="/about">About</Link>
            </Button>
            <Button
              variant="ghost"
              className="text-foreground hover:text-primary hover:bg-accent font-medium px-3"
              asChild
            >
              <Link href="/services">Services</Link>
            </Button>
            {currentUser?.role === "admin" && (
              <Button
                variant="ghost"
                className="text-foreground hover:text-primary hover:bg-accent font-medium flex items-center gap-1 px-3"
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
              className="relative text-foreground hover:text-primary hover:bg-accent"
              asChild
            >
              <Link href="/cart">
                <ShoppingCart className="h-5 w-5" />
                {actualCartCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs bg-primary text-primary-foreground flex items-center justify-center">
                    {actualCartCount}
                  </Badge>
                )}
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-foreground hover:text-primary hover:bg-accent"
              asChild
            >
              <Link href="/profile">
                <User className="h-5 w-5" />
              </Link>
            </Button>
            {currentUser ? (
              <Button
                className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-2 rounded-full font-medium shadow-sm ml-2"
                onClick={handleLogout}
              >
                Logout
              </Button>
            ) : (
              <Button
                className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-2 rounded-full font-medium shadow-sm ml-2"
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
            className="md:hidden text-foreground hover:text-primary hover:bg-accent"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-border bg-card">
            <div className="mx-4 py-4 space-y-2">
              <Button
                variant="ghost"
                className="w-full justify-start text-foreground hover:text-primary hover:bg-accent"
                asChild
              >
                <Link href="/">Home</Link>
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start text-foreground hover:text-primary hover:bg-accent"
                asChild
              >
                <Link href="/products">Products</Link>
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start text-foreground hover:text-primary hover:bg-accent"
                asChild
              >
                <Link href="/about">About</Link>
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start text-foreground hover:text-primary hover:bg-accent"
                asChild
              >
                <Link href="/services">Services</Link>
              </Button>
              {currentUser?.role === "admin" && (
                <Button
                  variant="ghost"
                  className="w-full justify-start text-foreground hover:text-primary hover:bg-accent flex items-center gap-2"
                  asChild
                >
                  <Link href="/admin/dashboard">
                    <Crown className="h-4 w-4" />
                    Admin
                  </Link>
                </Button>
              )}
              <div className="flex items-center gap-3 pt-4 border-t border-border">
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative text-foreground hover:text-primary hover:bg-accent"
                  asChild
                >
                  <Link href="/cart">
                    <ShoppingCart className="h-5 w-5" />
                    {actualCartCount > 0 && (
                      <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs bg-primary text-primary-foreground flex items-center justify-center">
                        {actualCartCount}
                      </Badge>
                    )}
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-foreground hover:text-primary hover:bg-accent"
                  asChild
                >
                  <Link href="/profile">
                    <User className="h-5 w-5" />
                  </Link>
                </Button>
                {currentUser ? (
                  <Button
                    className="bg-primary text-primary-foreground hover:bg-primary/90 flex-1 rounded-full font-medium"
                    onClick={handleLogout}
                  >
                    Logout
                  </Button>
                ) : (
                  <Button
                    className="bg-primary text-primary-foreground hover:bg-primary/90 flex-1 rounded-full font-medium"
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