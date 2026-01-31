/**
 * Product management — all product data from AWS API (no Firebase).
 */
import {
  Product,
  getProducts,
  getProductById as fetchProductById,
  createProduct,
  ApiError,
} from './api';

export type { Product };

/** Product service backed by AWS API Gateway + Lambda */
export const productService = {
  async getAllProducts(): Promise<Product[]> {
    return getProducts();
  },

  async getProductsByCategory(category: string): Promise<Product[]> {
    const all = await getProducts();
    if (category === 'All') return all;
    return all.filter((p) => (p.category || '').toLowerCase() === category.toLowerCase());
  },

  async getProductById(id: string): Promise<Product | null> {
    try {
      return await fetchProductById(id);
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) return null;
      throw err;
    }
  },

  async addProduct(data: Omit<Product, 'id'>): Promise<Product | null> {
    const id = typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `prod-${Date.now()}`;
    const product: Product = { id, name: data.name, ...data };
    return createProduct(product);
  },

  async updateProduct(_id: string, _updates: Partial<Product>): Promise<Product | null> {
    throw new Error('Update product is not supported by the current API. Use AWS API Gateway/Lambda to add PATCH/DELETE if needed.');
  },

  async deleteProduct(_id: string): Promise<boolean> {
    throw new Error('Delete product is not supported by the current API. Use AWS API Gateway/Lambda to add DELETE if needed.');
  },

  async getCategories(): Promise<string[]> {
    try {
      const { getCategories: fetchCategories } = await import('./categories-api');
      const list = await fetchCategories();
      return list.map((c) => c.name);
    } catch {
      const products = await getProducts();
      const set = new Set(products.map((p) => p.category).filter(Boolean) as string[]);
      return Array.from(set);
    }
  },

  /** Full category list for admin (id, name, description) — from AWS categories API */
  async getCategoriesList(): Promise<{ id: string; name: string; description: string }[]> {
    try {
      const { getCategories } = await import('./categories-api');
      const list = await getCategories();
      return list.map((c) => ({
        id: c.id,
        name: c.name,
        description: c.description ?? '',
      }));
    } catch {
      const products = await getProducts();
      const seen = new Set<string>();
      const list: { id: string; name: string; description: string }[] = [];
      for (const p of products) {
        const name = (p.category || '').trim();
        if (name && !seen.has(name)) {
          seen.add(name);
          list.push({ id: `cat-${list.length}`, name, description: name });
        }
      }
      return list;
    }
  },
};

/** Image upload (Cloudinary) — unchanged */
export const imageUploadService = {
  async uploadImage(file: File): Promise<string> {
    const { uploadImageToCloudinary } = await import('./cloudinary-client');
    return uploadImageToCloudinary(file);
  },

  validateImage(file: File): { valid: boolean; error?: string } {
    const maxSize = 10 * 1024 * 1024;
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
