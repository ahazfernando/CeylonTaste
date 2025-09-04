"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Menu, X, User, Crown } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface NavigationProps {
  cartItemCount?: number;
}

export function Navigation({ cartItemCount = 0 }: NavigationProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <Link href="/" className="font-bold text-xl bg-gradient-coffee bg-clip-text text-transparent">
            CeylonTaste
          </Link>
          <span className="hidden sm:inline text-sm text-muted-foreground">Baked + Coffee</span>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          <Button variant="ghost" className="text-foreground hover:text-accent" asChild>
            <Link href="/">Home</Link>
          </Button>
          <Button variant="ghost" className="text-foreground hover:text-accent" asChild>
            <Link href="/products">Products</Link>
          </Button>
          <Button variant="ghost" className="text-foreground hover:text-accent" asChild>
            <Link href="/about">About</Link>
          </Button>
          <Button variant="ghost" className="text-foreground hover:text-accent flex items-center gap-1" asChild>
            <Link href="/admin/dashboard">
              <Crown className="h-4 w-4" />
              Admin
            </Link>
          </Button>
        </div>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-4">
          <Button variant="ghost" size="icon" className="relative" asChild>
            <Link href="/cart">
              <ShoppingCart className="h-5 w-5" />
              {cartItemCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs bg-accent text-accent-foreground">
                  {cartItemCount}
                </Badge>
              )}
            </Link>
          </Button>
          <Button variant="ghost" size="icon" asChild>
            <Link href="/profile">
              <User className="h-5 w-5" />
            </Link>
          </Button>
          <Button className="bg-gradient-coffee text-primary-foreground hover:opacity-90" asChild>
            <Link href="/login">Sign In</Link>
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t bg-card">
          <div className="container py-4 space-y-4">
            <Button variant="ghost" className="w-full justify-start" asChild>
              <Link href="/">Home</Link>
            </Button>
            <Button variant="ghost" className="w-full justify-start" asChild>
              <Link href="/products">Products</Link>
            </Button>
            <Button variant="ghost" className="w-full justify-start" asChild>
              <Link href="/about">About</Link>
            </Button>
            <Button variant="ghost" className="w-full justify-start flex items-center gap-2" asChild>
              <Link href="/admin/dashboard">
                <Crown className="h-4 w-4" />
                Admin
              </Link>
            </Button>
            <div className="flex items-center gap-4 pt-4">
              <Button variant="ghost" size="icon" className="relative" asChild>
                <Link href="/cart">
                  <ShoppingCart className="h-5 w-5" />
                  {cartItemCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs bg-accent text-accent-foreground">
                      {cartItemCount}
                    </Badge>
                  )}
                </Link>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <Link href="/profile">
                  <User className="h-5 w-5" />
                </Link>
              </Button>
              <Button className="bg-gradient-coffee text-primary-foreground hover:opacity-90 flex-1" asChild>
                <Link href="/login">Sign In</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}