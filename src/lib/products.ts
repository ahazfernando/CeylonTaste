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
  stock?: number;
  status?: 'active' | 'inactive';
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
        id: product._id,
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
        id: product._id,
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
        id: product._id,
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
        id: product._id,
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
        id: product._id,
      };
    } catch (error) {
      console.error('Error fetching product:', error);
      return null;
    }
  },

  // Get all categories
  getCategories: async (): Promise<string[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/products/categories/list`);
      if (!response.ok) throw new Error('Failed to fetch categories');
      return await response.json();
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  },
};

// Image upload utility
export const imageUploadService = {
  // Upload image to server
  uploadImage: async (file: File): Promise<string> => {
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch(`${API_BASE_URL}/upload/image`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload image');
      }

      const result = await response.json();
      return result.imageUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  },

  // Validate image file
  validateImage: (file: File): { valid: boolean; error?: string } => {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: 'Please upload a JPEG, PNG, or WebP image' };
    }

    if (file.size > maxSize) {
      return { valid: false, error: 'Image size must be less than 5MB' };
    }

    return { valid: true };
  },
};
