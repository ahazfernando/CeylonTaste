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
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize auth status and cart on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('tt_token');
      const isAuthenticated = !!token;
      
      setIsLoggedIn(isAuthenticated);
      
      if (isAuthenticated) {
        // Load cart only if user is authenticated
        const savedCart = localStorage.getItem('truetaste_cart');
        if (savedCart) {
          try {
            const parsedCart = JSON.parse(savedCart);
            console.log('Loading cart from localStorage:', parsedCart);
            setCartItems(parsedCart);
          } catch (error) {
            console.error('Failed to load cart from localStorage:', error);
            setCartItems([]);
            localStorage.removeItem('truetaste_cart');
          }
        } else {
          console.log('No saved cart found in localStorage');
          setCartItems([]);
        }
      } else {
        // Clear cart immediately if not authenticated
        console.log('User not authenticated, clearing cart');
        setCartItems([]);
        localStorage.removeItem('truetaste_cart');
      }
      
      setIsInitialized(true);
    }
  }, []);

  // Check auth state periodically and listen for changes
  useEffect(() => {
    if (!isInitialized) return;
    
    const checkAuthState = () => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('tt_token') : null;
      const isAuthenticated = !!token;
      
      setIsLoggedIn(isAuthenticated);
      
      if (!isAuthenticated) {
        // Clear cart on logout
        setCartItems([]);
        localStorage.removeItem('truetaste_cart');
        console.log('Cart cleared due to logout');
      }
    };
    
    // Check immediately
    checkAuthState();
    
    // Check periodically (every 500ms)
    const interval = setInterval(checkAuthState, 500);
    
    // Also listen to storage events (for other tabs)
    const handleStorageChange = () => {
      checkAuthState();
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [isInitialized]);

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
      console.log('Cart cleared manually');
    }
  };

  // Debug function to clear all cart-related data
  const debugClearAllCartData = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('truetaste_cart');
      localStorage.removeItem('tt_token');
      setCartItems([]);
      setIsLoggedIn(false);
      console.log('All cart and auth data cleared for debugging');
    }
  };

  // Expose debug function in development
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    (window as any).debugClearCart = debugClearAllCartData;
  }

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

