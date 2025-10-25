import { collection, getDocs, getDoc, addDoc, updateDoc, deleteDoc, doc, query, where, orderBy } from 'firebase/firestore';
import { db } from './firebase';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  reviewCount?: number;
  category: string;
  image: string;
  availability: 'Available' | 'Unavailable' | 'In House Only' | 'Breakfast' | 'Lunch' | 'Dinner';
  status?: 'active' | 'inactive';
  isNewProduct?: boolean;
  isFeatured?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const API_BASE_URL = 'http://localhost:4000/api';

// Firebase service for products
export const firebaseProductService = {
  // Get all products from Firebase
  getAllProducts: async (): Promise<Product[]> => {
    try {
      const productsRef = collection(db, 'products');
      const snapshot = await getDocs(productsRef);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Product));
    } catch (error) {
      console.error('Error fetching products from Firebase:', error);
      return [];
    }
  },

  // Get products by category from Firebase
  getProductsByCategory: async (category: string): Promise<Product[]> => {
    try {
      const productsRef = collection(db, 'products');
      const q = category === "All" 
        ? productsRef
        : query(productsRef, where('category', '==', category));
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Product));
    } catch (error) {
      console.error('Error fetching products by category from Firebase:', error);
      return [];
    }
  },

  // Get single product from Firebase
  getProductById: async (id: string): Promise<Product | null> => {
    try {
      const productRef = doc(db, 'products', id);
      const productSnap = await getDoc(productRef);
      
      if (productSnap.exists()) {
        return {
          id: productSnap.id,
          ...productSnap.data()
        } as Product;
      }
      return null;
    } catch (error) {
      console.error('Error fetching product from Firebase:', error);
      return null;
    }
  }
};

// API service for MongoDB integration (fallback)
export const productService = {
  // Get all products
  getAllProducts: async (): Promise<Product[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/products`);
      if (!response.ok) throw new Error('Failed to fetch products');
      const products = await response.json();
      return products.map((product: any) => ({
        ...product,
        id: product._id || product.id,
      }));
    } catch (error) {
      console.error('Error fetching products:', error);
      return [];
    }
  },

  // Get products by category
  getProductsByCategory: async (category: string): Promise<Product[]> => {
    try {
      const url = category === "All" 
        ? `${API_BASE_URL}/products`
        : `${API_BASE_URL}/products?category=${encodeURIComponent(category)}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch products');
      const products = await response.json();
      return products.map((product: any) => ({
        ...product,
        id: product._id || product.id,
      }));
    } catch (error) {
      console.error('Error fetching products by category:', error);
      return [];
    }
  },

  // Get single product
  getProductById: async (id: string): Promise<Product | null> => {
    try {
      const response = await fetch(`${API_BASE_URL}/products/${id}`);
      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error('Failed to fetch product');
      }
      const product = await response.json();
      return {
        ...product,
        id: product._id || product.id,
      };
    } catch (error) {
      console.error('Error fetching product:', error);
      return null;
    }
  },

  // Add new product
  addProduct: async (productData: Omit<Product, 'id' | 'rating' | 'reviewCount'>): Promise<Product | null> => {
    try {
      const response = await fetch(`${API_BASE_URL}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create product');
      }
      
      const product = await response.json();
      return {
        ...product,
        id: product._id || product.id,
      };
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  },

  // Update product
  updateProduct: async (id: string, productData: Partial<Product>): Promise<Product | null> => {
    try {
      const response = await fetch(`${API_BASE_URL}/products/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update product');
      }
      
      const product = await response.json();
      return {
        ...product,
        id: product._id || product.id,
      };
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  },

  // Delete product
  deleteProduct: async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/products/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete product');
      }
      
      return true;
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  },

  // Get categories
  getCategories: async (): Promise<string[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/products/categories/list`);
      if (!response.ok) throw new Error('Failed to fetch categories');
      return await response.json();
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  }
};
