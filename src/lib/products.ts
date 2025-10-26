// Shared product management utilities
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
}

const API_BASE_URL = 'http://localhost:4000/api';

// API service for MongoDB integration
export const productService = {
  // Get all products
  getAllProducts: async (): Promise<Product[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/products`);
      if (!response.ok) throw new Error('Failed to fetch products');
      const products = await response.json();
      return products.map((product: any) => ({
        ...product,
        id: product._id || product.id, // Handle both MongoDB and Firebase formats
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
        id: product._id || product.id, // Handle both MongoDB and Firebase formats
      }));
    } catch (error) {
      console.error('Error fetching products by category:', error);
      return [];
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
        id: product._id || product.id, // Handle both MongoDB and Firebase formats
      };
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  },

  // Update product
  updateProduct: async (id: string, updates: Partial<Product>): Promise<Product | null> => {
    try {
      const response = await fetch(`${API_BASE_URL}/products/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update product');
      }
      
      const product = await response.json();
      return {
        ...product,
        id: product._id || product.id, // Handle both MongoDB and Firebase formats
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

  // Get product by ID
  getProductById: async (id: string): Promise<Product | null> => {
    try {
      const response = await fetch(`${API_BASE_URL}/products/${id}`);
      if (!response.ok) throw new Error('Failed to fetch product');
      const product = await response.json();
      return {
        ...product,
        id: product._id || product.id, // Handle both MongoDB and Firebase formats
      };
    } catch (error) {
      console.error('Error fetching product:', error);
      return null;
    }
  },

  // Get all categories from the categories collection
  getCategories: async (): Promise<string[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/categories`);
      if (!response.ok) throw new Error('Failed to fetch categories');
      const data = await response.json();
      return data.categories.map((cat: any) => cat.name);
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
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
