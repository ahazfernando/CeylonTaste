/**
 * AWS Cognito authentication (client-only).
 *
 * Structure (Next.js best practice):
 * - This file runs only in the browser: all entry points (signIn, signUp, signOut, getCurrentUser,
 *   updateProfile) are used from client components or after dynamic import. No server-side calls.
 * - Session is stored in localStorage (tt_user, tt_token). Use apiAuthService or the central
 *   re-export from @/lib/auth so the rest of the app does not depend on auth-cognito directly.
 * - Token refresh: getValidIdToken() returns a valid IdToken, refreshing the Cognito session if
 *   needed. Use getAuthHeaders() from @/lib/api before calling protected backend routes.
 * - Profile data lives in the backend (DynamoDB via /users/me); this module only handles
 *   Cognito auth and fetches/updates profile via that API.
 */

import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
  CognitoUserAttribute,
} from 'amazon-cognito-identity-js';
import { getApiBaseUrl } from './api';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  phone?: string;
  customerStatus?: string;
  address?: {
    street?: string;
    city?: string;
    province?: string;
    zipCode?: string;
    country?: string;
    phone?: string;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

const USER_POOL_ID = process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID ?? '';
const CLIENT_ID = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID ?? '';
// Admin emails: from env (comma-separated) or fallback list. Add emails here or set NEXT_PUBLIC_ADMIN_EMAILS in .env
const ADMIN_EMAILS = (
  typeof process.env.NEXT_PUBLIC_ADMIN_EMAILS === 'string' && process.env.NEXT_PUBLIC_ADMIN_EMAILS.trim()
    ? process.env.NEXT_PUBLIC_ADMIN_EMAILS.split(',').map((e) => e.trim().toLowerCase()).filter(Boolean)
    : ['jordan@gmail.com', 'jordan04@gmail.com', 'ahazfernando@gmail.com']
);

function getPool(): CognitoUserPool {
  if (!USER_POOL_ID || !CLIENT_ID) {
    throw new Error(
      'Missing Cognito config. Set NEXT_PUBLIC_COGNITO_USER_POOL_ID and NEXT_PUBLIC_COGNITO_CLIENT_ID in .env'
    );
  }
  return new CognitoUserPool({
    UserPoolId: USER_POOL_ID,
    ClientId: CLIENT_ID,
  });
}

function getCognitoUser(email: string): CognitoUser {
  return new CognitoUser({
    Username: email,
    Pool: getPool(),
  });
}

function getUsersApiUrl(): string {
  return `${getApiBaseUrl().replace(/\/$/, '')}/users/me`;
}

/** Build a minimal User from the Cognito Id token (used when profile API returns 401/403/404). */
function userFromToken(idToken: string, name?: string): User {
  try {
    const parts = idToken.split('.');
    if (parts.length !== 3) throw new Error('Invalid token');
    const payload = JSON.parse(
      atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'))
    ) as { sub?: string; email?: string; name?: string; preferred_username?: string; 'cognito:username'?: string };
    const email = payload.email ?? payload['cognito:username'] ?? '';
    const displayName = name ?? payload.name ?? payload.preferred_username ?? '';
    const role = email && ADMIN_EMAILS.includes(email) ? 'admin' : 'user';
    return {
      id: payload.sub ?? '',
      name: displayName,
      email,
      role,
      phone: undefined,
      customerStatus: undefined,
      address: undefined,
      createdAt: undefined,
      updatedAt: undefined,
    };
  } catch {
    return {
      id: '',
      name: name ?? '',
      email: '',
      role: 'user',
      phone: undefined,
      customerStatus: undefined,
      address: undefined,
      createdAt: undefined,
      updatedAt: undefined,
    };
  }
}

async function fetchOrCreateProfile(idToken: string, name?: string): Promise<User> {
  const url = getUsersApiUrl();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${idToken}`,
  };
  let res = await fetch(url, { method: 'GET', headers });
  if (res.status === 404 && name !== undefined) {
    res = await fetch(url, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ name }),
    });
  }
  if (!res.ok) {
    if (res.status === 401 || res.status === 403 || res.status === 404) {
      return userFromToken(idToken, name);
    }
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || `Profile API error: ${res.status}`);
  }
  let data = await res.json();
  if (name !== undefined && (!data.name || data.name === '') && data.id) {
    const putRes = await fetch(url, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ name }),
    });
    if (putRes.ok) data = await putRes.json();
  }
  return {
    id: data.id ?? data.sub,
    name: data.name ?? '',
    email: data.email ?? '',
    role: data.role === 'admin' ? 'admin' : 'user',
    phone: data.phone,
    customerStatus: data.customerStatus,
    address: data.address,
    createdAt: data.createdAt ? new Date(data.createdAt) : undefined,
    updatedAt: data.updatedAt ? new Date(data.updatedAt) : undefined,
  } as User;
}

function persistSession(user: User, token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('tt_user', JSON.stringify(user));
  localStorage.setItem('tt_token', token);
}

function clearSession(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('tt_user');
  localStorage.removeItem('tt_token');
}

/** Get current IdToken; refresh session if possible and return new token. */
export function getValidIdToken(): Promise<string | null> {
  return new Promise((resolve) => {
    const pool = getPool();
    const cognitoUser = pool.getCurrentUser();
    if (!cognitoUser) {
      resolve(null);
      return;
    }
    cognitoUser.getSession((err: Error | null, session: { getIdToken: () => { getJwtToken: () => string } } | null) => {
      if (err || !session) {
        resolve(null);
        return;
      }
      const idToken = session.getIdToken().getJwtToken();
      const exp = (session.getIdToken() as unknown as { payload?: { exp?: number } }).payload?.exp;
      const now = Math.floor(Date.now() / 1000);
      // Refresh if expires in less than 60 seconds
      if (exp && exp - now < 60) {
        cognitoUser.getSession((err2: Error | null, newSession: typeof session | null) => {
          if (err2 || !newSession) {
            resolve(idToken);
            return;
          }
          const newToken = newSession.getIdToken().getJwtToken();
          resolve(newToken);
        });
      } else {
        resolve(idToken);
      }
    });
  });
}

/** Ensure tt_token is fresh (call before API calls if desired). */
export async function refreshSessionIfNeeded(): Promise<void> {
  const token = await getValidIdToken();
  if (!token) return;
  const userStr = typeof window !== 'undefined' ? localStorage.getItem('tt_user') : null;
  if (!userStr) return;
  try {
    const user = JSON.parse(userStr) as User;
    const updated = await fetchOrCreateProfile(token);
    if (typeof window !== 'undefined') {
      localStorage.setItem('tt_user', JSON.stringify(updated));
      localStorage.setItem('tt_token', token);
    }
  } catch {
    // Keep existing session on refresh failure
  }
}

export const apiAuthService = {
  signUp: async (
    email: string,
    password: string,
    name: string
  ): Promise<{ user: User; token: string }> => {
    return new Promise((resolve, reject) => {
      const pool = getPool();
      const attributeList = [
        new CognitoUserAttribute({ Name: 'email', Value: email }),
        new CognitoUserAttribute({ Name: 'name', Value: name }),
      ];
      pool.signUp(email, password, attributeList, [], (err, result) => {
        if (err) {
          reject(new Error(err.message || 'Signup failed'));
          return;
        }
        if (!result?.user) {
          reject(new Error('Signup failed'));
          return;
        }
        // If pool has auto-confirm, sign in and return user + token; otherwise user must confirm then login
        const cognitoUser = getCognitoUser(email);
        const authDetails = new AuthenticationDetails({
          Username: email,
          Password: password,
        });
        cognitoUser.authenticateUser(authDetails, {
          onSuccess: async (session) => {
            try {
              const idToken = session.getIdToken().getJwtToken();
              const user = await fetchOrCreateProfile(idToken, name);
              persistSession(user, idToken);
              resolve({ user, token: idToken });
            } catch (e) {
              reject(e);
            }
          },
          onFailure: (err) => {
            const msg = err?.message ?? 'Signup failed';
            if (/confirm|verification|not confirmed/i.test(msg)) {
              reject(new Error('Please confirm your email, then log in.'));
            } else {
              reject(new Error(msg));
            }
          },
        });
      });
    });
  },

  signIn: async (email: string, password: string): Promise<{ user: User; token: string }> => {
    return new Promise((resolve, reject) => {
      const cognitoUser = getCognitoUser(email);
      const authDetails = new AuthenticationDetails({
        Username: email,
        Password: password,
      });
      cognitoUser.authenticateUser(authDetails, {
        onSuccess: async (session) => {
          try {
            const idToken = session.getIdToken().getJwtToken();
            const user = await fetchOrCreateProfile(idToken);
            persistSession(user, idToken);
            resolve({ user, token: idToken });
          } catch (e) {
            reject(e);
          }
        },
        onFailure: (err) => reject(new Error(err.message || 'Login failed')),
      });
    });
  },

  /** Confirm sign-up with the 6-digit code sent to the user's email. */
  confirmSignUp: async (email: string, code: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const cognitoUser = getCognitoUser(email);
      cognitoUser.confirmRegistration(code, true, (err) => {
        if (err) {
          reject(new Error(err.message || 'Confirmation failed'));
          return;
        }
        resolve();
      });
    });
  },

  /** Resend the 6-digit confirmation code to the user's email. */
  resendConfirmationCode: async (email: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const cognitoUser = getCognitoUser(email);
      cognitoUser.resendConfirmationCode((err) => {
        if (err) {
          reject(new Error(err.message || 'Failed to resend code'));
          return;
        }
        resolve();
      });
    });
  },

  signOut: async (): Promise<void> => {
    const pool = getPool();
    const cognitoUser = pool.getCurrentUser();
    if (cognitoUser) {
      cognitoUser.signOut();
    }
    clearSession();
  },

  getCurrentUser: async (): Promise<User | null> => {
    if (typeof window === 'undefined') return null;
    const userStr = localStorage.getItem('tt_user');
    if (userStr) {
      try {
        return JSON.parse(userStr) as User;
      } catch {
        // ignore
      }
    }
    const token = await getValidIdToken();
    if (!token) return null;
    try {
      const user = await fetchOrCreateProfile(token);
      persistSession(user, token);
      return user;
    } catch {
      return null;
    }
  },

  updateProfile: async (updateData: Partial<User>): Promise<User> => {
    const token = await getValidIdToken();
    if (!token) throw new Error('User not authenticated');
    const url = getUsersApiUrl();
    const res = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updateData),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: res.statusText }));
      throw new Error(err.message || `Update failed: ${res.status}`);
    }
    const data = await res.json();
    const user = {
      id: data.id ?? data.sub,
      name: data.name ?? '',
      email: data.email ?? '',
      role: data.role === 'admin' ? 'admin' : 'user',
      phone: data.phone,
      customerStatus: data.customerStatus,
      address: data.address,
      createdAt: data.createdAt ? new Date(data.createdAt) : undefined,
      updatedAt: data.updatedAt ? new Date(data.updatedAt) : undefined,
    } as User;
    if (typeof window !== 'undefined') {
      localStorage.setItem('tt_user', JSON.stringify(user));
    }
    return user;
  },
};
