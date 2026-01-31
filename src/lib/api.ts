/**
 * Products API service — AWS API Gateway + Lambda.
 * Base URL: REACT_APP_API_BASE_URL (CRA) or NEXT_PUBLIC_API_BASE_URL (Next.js).
 */

/** Product type returned by /products endpoints */
export interface Product {
  id: string;
  name: string;
  description?: string;
  price?: number;
  originalPrice?: number;
  rating?: number;
  reviewCount?: number;
  category?: string;
  isNewProduct?: boolean;
  isFeatured?: boolean;
  image?: string;
  availability?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * API base URL from environment (non-Vite).
 * - Create React App: REACT_APP_API_BASE_URL
 * - Next.js (client): NEXT_PUBLIC_API_BASE_URL
 */
export function getApiBaseUrl(): string {
  const url =
    process.env.REACT_APP_API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL;

  if (url && url.trim() !== '') {
    return url.replace(/\/$/, ''); // strip trailing slash
  }

  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') {
      return 'http://127.0.0.1:3000';
    }
  }

  return process.env.API_URL || 'https://9gf4gh296l.execute-api.us-east-1.amazonaws.com/Prod';
}

export const API_BASE_URL = getApiBaseUrl();

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const base = getApiBaseUrl();
  const url = `${base}${path}`;
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const res = await fetch(url, { ...options, headers });

  if (!res.ok) {
    const text = await res.text();
    throw new ApiError(
      text || res.statusText || `HTTP ${res.status}`,
      res.status
    );
  }

  const contentType = res.headers.get('content-type');
  if (contentType?.includes('application/json')) {
    return res.json() as Promise<T>;
  }
  return res.text() as Promise<T>;
}

/** GET /products — fetch all products */
export function getProducts(): Promise<Product[]> {
  return request<Product[]>('/products');
}

/** GET /products/{id} — fetch one product */
export function getProductById(id: string): Promise<Product> {
  return request<Product>(`/products/${encodeURIComponent(id)}`);
}

/** POST /products — create product */
export function createProduct(product: Product): Promise<Product> {
  return request<Product>('/products', {
    method: 'POST',
    body: JSON.stringify(product),
  });
}
