/**
 * Categories API — AWS API Gateway + Lambda (same base URL as products).
 * Write operations (POST, PUT, DELETE) require Cognito auth and send Bearer token.
 */
import { getApiBaseUrl, getAuthHeaders } from './api';

export interface Category {
  id: string;
  name: string;
  description?: string;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const base = getApiBaseUrl();
  const url = `${base}${path}`;
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  const res = await fetch(url, { ...options, headers });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText || `HTTP ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  const contentType = res.headers.get('content-type');
  if (contentType?.includes('application/json')) return res.json() as Promise<T>;
  return res.text() as Promise<T>;
}

async function requestWithAuth<T>(path: string, options: RequestInit = {}): Promise<T> {
  const auth = await getAuthHeaders();
  return request<T>(path, { ...options, headers: { ...options.headers, ...auth } });
}

/** GET /categories — fetch all categories */
export function getCategories(): Promise<Category[]> {
  return request<Category[]>('/categories');
}

/** GET /categories/{id} — fetch one category */
export function getCategoryById(id: string): Promise<Category> {
  return request<Category>(`/categories/${encodeURIComponent(id)}`);
}

/** POST /categories — create category (requires Cognito auth) */
export function createCategory(category: Omit<Category, 'id'> & { id?: string }): Promise<Category> {
  return requestWithAuth<Category>('/categories', {
    method: 'POST',
    body: JSON.stringify(category),
  });
}

/** PUT /categories/{id} — update category (requires Cognito auth) */
export function updateCategory(id: string, updates: Partial<Pick<Category, 'name' | 'description'>>): Promise<Category> {
  return requestWithAuth<Category>(`/categories/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
}

/** DELETE /categories/{id} — delete category (requires Cognito auth) */
export function deleteCategory(id: string): Promise<void> {
  return requestWithAuth<void>(`/categories/${encodeURIComponent(id)}`, { method: 'DELETE' });
}
