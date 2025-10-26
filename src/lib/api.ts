// API Base URL configuration
export const getApiBaseUrl = () => {
  if (typeof window !== 'undefined') {
    // Client-side: check for environment variable first
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    
    // If environment variable is set, use it
    if (apiUrl && apiUrl.trim() !== '') {
      return apiUrl;
    }
    
    // Detect if we're on localhost
    const isLocalhost = window.location.hostname === 'localhost' || 
                       window.location.hostname === '127.0.0.1' ||
                       window.location.hostname.includes('localhost');
    
    if (isLocalhost) {
      return 'http://localhost:4000/api';
    }
    
    // Production: return empty string to indicate API needs to be configured
    console.warn('NEXT_PUBLIC_API_URL not set for production');
    return '';
  }
  
  // Server-side
  return process.env.API_URL || 'http://localhost:4000/api';
};

export const API_BASE_URL = getApiBaseUrl();

