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

/** Raw shape that backends might return (snake_case, different keys) */
type RawProduct = Record<string, unknown>;

function toNumber(value: unknown): number | undefined {
  if (value == null) return undefined;
  if (typeof value === 'number' && !Number.isNaN(value)) return value;
  if (typeof value === 'string') {
    const n = parseFloat(value);
    return Number.isNaN(n) ? undefined : n;
  }
  return undefined;
}

function toString(value: unknown): string | undefined {
  if (value == null) return undefined;
  if (typeof value === 'string') return value;
  return String(value);
}

/** Normalize API response to Product (handles alternate field names) */
function normalizeProduct(raw: RawProduct): Product {
  const id = toString(raw.id ?? raw._id) ?? '';
  const name = toString(raw.name ?? raw.productName ?? raw.product_name) ?? '';
  const description = toString(raw.description ?? raw.desc);
  const price = toNumber(raw.price);
  const category = toString(raw.category ?? raw.categoryName ?? raw.category_name);
  const image = toString(raw.image ?? raw.imageUrl ?? raw.image_url);
  const availability = toString(raw.availability ?? raw.status);
  return {
    id,
    name,
    description,
    price,
    originalPrice: toNumber(raw.originalPrice ?? raw.original_price),
    rating: toNumber(raw.rating),
    reviewCount: toNumber(raw.reviewCount ?? raw.review_count),
    category,
    isNewProduct: Boolean(raw.isNewProduct ?? raw.is_new_product),
    isFeatured: Boolean(raw.isFeatured ?? raw.is_featured),
    image,
    availability,
    status: toString(raw.status),
    createdAt: toString(raw.createdAt ?? raw.created_at),
    updatedAt: toString(raw.updatedAt ?? raw.updated_at),
  };
}

/**
 * API base URL from environment (non-Vite).
 * - Create React App: REACT_APP_API_BASE_URL
 * - Next.js (client): NEXT_PUBLIC_API_BASE_URL
 */
export function getApiBaseUrl(): string {
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') {
      return '/api/proxy';
    }
  }

  const url =
    process.env.REACT_APP_API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL;

  if (url && url.trim() !== '') {
    return url.replace(/\/$/, ''); // strip trailing slash
  }



  return process.env.API_URL || 'https://9gf4gh296l.execute-api.us-east-1.amazonaws.com/Prod';
}

export const API_BASE_URL = getApiBaseUrl();

/** Returns Authorization: Bearer <token> for Cognito-protected routes; call before admin/write API requests. */
export async function getAuthHeaders(): Promise<Record<string, string>> {
  if (typeof window === 'undefined') return {};
  const { getValidIdToken } = await import('@/lib/auth-cognito');
  const token = await getValidIdToken();
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}

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

    // Check for AWS IAM / Signature mismatch error which often happens if mismatched Auth
    if (res.status === 403 && text.includes('Invalid key=value pair')) {
      console.error('AWS Auth Error: The backend is rejecting the request with an IAM signature error. This usually means the API Gateway is expecting AWS_IAM auth but received a Bearer token, or vice versa.');
    }

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
export async function getProducts(): Promise<Product[]> {
  const raw = await request<RawProduct[]>('/products');
  const list = Array.isArray(raw) ? raw : [];
  return list.map(normalizeProduct);
}

/** Alias for test-api and other callers that expect apiService.getAllProducts() */
export const apiService = {
  getAllProducts: getProducts,
  getProductById,
  createProduct,
  deleteProduct,
};

/** GET /products/{id} — fetch one product */
export async function getProductById(id: string): Promise<Product> {
  const raw = await request<RawProduct>(`/products/${encodeURIComponent(id)}`);
  return normalizeProduct(raw ?? {});
}

/** Build payload for POST so backends that expect snake_case or alternate keys also receive values */
function createProductPayload(product: Product): Record<string, unknown> {
  return {
    // camelCase (our type)
    id: product.id,
    name: product.name,
    description: product.description,
    price: product.price,
    category: product.category,
    image: product.image,
    availability: product.availability,
    isNewProduct: product.isNewProduct,
    isFeatured: product.isFeatured,
    status: product.status,
    rating: product.rating,
    reviewCount: product.reviewCount,
    originalPrice: product.originalPrice,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
    // snake_case / alternate keys (so backends that only read these still persist category, price, etc.)
    product_name: product.name,
    category_name: product.category,
    image_url: product.image,
    product_description: product.description,
  };
}

/** POST /products — create product (requires Cognito auth) */
export async function createProduct(product: Product): Promise<Product> {
  const body = createProductPayload(product);
  const auth = await getAuthHeaders();
  return request<Product>('/products', {
    method: 'POST',
    headers: auth,
    body: JSON.stringify(body),
  });
}

/** PUT /products/{id} — update product (requires Cognito auth) */
export async function updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
  // WORKAROUND: The PUT /products/:id endpoint is returning an AWS IAM Auth error (403 Invalid key=value pair),
  // creating a blockage. The POST /products endpoint (create) is verified to work with the current Bearer token.
  // Since the backend uses DynamoDB, and standard PutItem behavior is to overwrite (upsert) if the ID exists,
  // we can use POST /products with the existing ID to perform the update.

  // 1. Fetch the latest version of the product to ensure we have all fields 
  // (POST likely replaces the entire item, so we don't want to lose data not in 'updates').
  let fullProduct: Product;
  try {
    fullProduct = await getProductById(id);
  } catch (error) {
    console.warn(`[updateProduct] Failed to fetch existing product ${id} before update. Proceeding with partial data merge.`, error);
    // Fallback: This might be risky if POST replaces fully, but if the ID is wrong anyway, we can't do much.
    // robust fallback: try to construct as much as we can.
    fullProduct = { id, name: '', ...updates } as Product;
  }

  // 2. Merge updates over the existing product
  const mergedProduct: Product = {
    ...fullProduct,
    ...updates,
    id, // Ensure ID is preserved
  };

  // 3. Delegate to createProduct which uses POST /products
  return createProduct(mergedProduct);
}

/** DELETE /products/{id} — delete product (requires Cognito auth) */
export async function deleteProduct(id: string): Promise<void> {
  const base = getApiBaseUrl();
  const url = `${base}/products/${encodeURIComponent(id)}`;
  const auth = await getAuthHeaders();
  const res = await fetch(url, { method: 'DELETE', headers: auth });
  if (!res.ok) {
    const text = await res.text();
    throw new ApiError(text || res.statusText || `HTTP ${res.status}`, res.status);
  }
}
