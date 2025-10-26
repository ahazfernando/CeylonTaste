// Shared product management utilities - Using Firebase
import { collection, getDocs, getDoc, addDoc, updateDoc, deleteDoc, doc, query, where } from 'firebase/firestore';
import { db } from './firebase';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  category: string;
  isNewProduct?: boolean;
  isFeatured?: boolean;
  image: string;
  availability?: 'Available' | 'Unavailable' | 'In House Only' | 'Breakfast' | 'Lunch' | 'Dinner';
  status?: 'active' | 'inactive';
  createdAt?: string;
  updatedAt?: string;
}

// Firebase service for products
export const productService = {
  // Get all products from Firebase
  getAllProducts: async (): Promise<Product[]> => {
    try {
      const productsRef = collection(db, 'products');
      const snapshot = await getDocs(productsRef);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        rating: 0,
        reviewCount: 0,
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
        rating: 0,
        reviewCount: 0,
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
          rating: 0,
          reviewCount: 0,
          ...productSnap.data()
        } as Product;
      }
      return null;
    } catch (error) {
      console.error('Error fetching product from Firebase:', error);
      return null;
    }
  },

  // Add new product to Firebase
  addProduct: async (productData: Omit<Product, 'id'>): Promise<Product | null> => {
    try {
      const productsRef = collection(db, 'products');
      const docRef = await addDoc(productsRef, {
        ...productData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      
      const productSnap = await getDoc(docRef);
      if (productSnap.exists()) {
        return {
          id: productSnap.id,
          ...productSnap.data()
        } as Product;
      }
      return null;
    } catch (error) {
      console.error('Error adding product to Firebase:', error);
      throw error;
    }
  },

  // Update product in Firebase
  updateProduct: async (id: string, updates: Partial<Product>): Promise<Product | null> => {
    try {
      const productRef = doc(db, 'products', id);
      await updateDoc(productRef, {
        ...updates,
        updatedAt: new Date().toISOString(),
      });
      
      const productSnap = await getDoc(productRef);
      if (productSnap.exists()) {
        return {
          id: productSnap.id,
          ...productSnap.data()
        } as Product;
      }
      return null;
    } catch (error) {
      console.error('Error updating product in Firebase:', error);
      throw error;
    }
  },

  // Delete product from Firebase
  deleteProduct: async (id: string): Promise<boolean> => {
    try {
      const productRef = doc(db, 'products', id);
      await deleteDoc(productRef);
      return true;
    } catch (error) {
      console.error('Error deleting product from Firebase:', error);
      throw error;
    }
  },

  // Get all categories from Firebase
  getCategories: async (): Promise<string[]> => {
    try {
      const categoriesRef = collection(db, 'categories');
      const snapshot = await getDocs(categoriesRef);
      return snapshot.docs.map(doc => doc.data().name as string);
    } catch (error) {
      console.error('Error fetching categories from Firebase:', error);
      // Fallback: get unique categories from products
      try {
        const products = await productService.getAllProducts();
        return Array.from(new Set(products.map(p => p.category)));
      } catch (err) {
        console.error('Error getting categories from products:', err);
        return [];
      }
    }
  },
};

// Image upload utility
export const imageUploadService = {
  // Upload image to Cloudinary
  uploadImage: async (file: File): Promise<string> => {
    try {
      const { uploadImageToCloudinary } = await import('./cloudinary-client');
      return await uploadImageToCloudinary(file);
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  },

  // Validate image file
  validateImage: (file: File): { valid: boolean; error?: string } => {
    const maxSize = 10 * 1024 * 1024; // 10MB (Cloudinary supports larger files)
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: 'Please upload a JPEG, PNG, WebP, or GIF image' };
    }

    if (file.size > maxSize) {
      return { valid: false, error: 'Image size must be less than 10MB' };
    }

    return { valid: true };
  },
};
