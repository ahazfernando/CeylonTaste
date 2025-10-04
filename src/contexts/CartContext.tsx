"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  category: string;
  image: string;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'>) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  isLoggedIn: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Immediate cart clearing on mount if not logged in
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('tt_token');
      if (!token) {
        // Clear cart immediately if no token
        setCartItems([]);
        localStorage.removeItem('truetaste_cart');
        console.log('Cart cleared - no auth token found');
      }
    }
  }, []);

  // Check if user is logged in
  useEffect(() => {
    const checkAuthStatus = () => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('tt_token') : null;
      const isAuthenticated = !!token;
      setIsLoggedIn(isAuthenticated);
      
      // Clear cart if user is not logged in
      if (!isAuthenticated) {
        setCartItems([]);
        // Also clear from localStorage
        if (typeof window !== 'undefined') {
          localStorage.removeItem('truetaste_cart');
        }
      }
    };

    checkAuthStatus();
    
    // Listen for storage changes (login/logout)
    const handleStorageChange = () => {
      checkAuthStatus();
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Load cart from localStorage on mount (only if logged in)
  useEffect(() => {
    if (typeof window !== 'undefined' && isLoggedIn) {
      const savedCart = localStorage.getItem('truetaste_cart');
      if (savedCart) {
        try {
          const parsedCart = JSON.parse(savedCart);
          console.log('Loading cart from localStorage:', parsedCart);
          setCartItems(parsedCart);
        } catch (error) {
          console.error('Failed to load cart from localStorage:', error);
          setCartItems([]);
        }
      } else {
        console.log('No saved cart found in localStorage');
        setCartItems([]);
      }
    } else if (typeof window !== 'undefined' && !isLoggedIn) {
      console.log('User not logged in, keeping cart empty');
      setCartItems([]);
    }
  }, [isLoggedIn]);

  // Save cart to localStorage whenever cartItems changes (only if logged in)
  useEffect(() => {
    if (typeof window !== 'undefined' && isLoggedIn) {
      localStorage.setItem('truetaste_cart', JSON.stringify(cartItems));
    }
  }, [cartItems, isLoggedIn]);

  const addToCart = (item: Omit<CartItem, 'quantity'>) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(cartItem => cartItem.id === item.id);
      
      if (existingItem) {
        // If item already exists, increase quantity
        return prevItems.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      } else {
        // If item doesn't exist, add it with quantity 1
        return [...prevItems, { ...item, quantity: 1 }];
      }
    });
  };

  const removeFromCart = (itemId: string) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }

    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === itemId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('truetaste_cart');
    }
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const value: CartContextType = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalItems,
    getTotalPrice,
    isLoggedIn,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

