/**
 * AWS Orders API Service
 * 
 * This module handles communication with the AWS backend for order operations.
 * Architecture: Next.js Frontend → API Gateway → Lambda → DynamoDB
 * 
 * For university assignment: Cloud-based and Distributed Web Applications
 */

import { OrderPayload, OrderResponse, ApiError, OrderItem } from './types';

/**
 * Get the orders API endpoint URL.
 * Prefer NEXT_PUBLIC_ORDERS_API_URL (full URL to place-order endpoint, e.g. http://localhost:4000/api/orders).
 * Fallback: NEXT_PUBLIC_API_BASE_URL + '/orders' for AWS or other backends.
 */
const getOrdersEndpoint = (): string => {
    const fullUrl = process.env.NEXT_PUBLIC_ORDERS_API_URL;
    if (fullUrl) return fullUrl;

    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!baseUrl) {
        throw new Error(
            'Neither NEXT_PUBLIC_ORDERS_API_URL nor NEXT_PUBLIC_API_BASE_URL is set. ' +
            'Add NEXT_PUBLIC_ORDERS_API_URL (e.g. http://localhost:4000/api/orders) or NEXT_PUBLIC_API_BASE_URL to .env'
        );
    }
    return `${baseUrl.replace(/\/$/, '')}/orders`;
};

/**
 * Places an order by sending data to AWS API Gateway
 * 
 * Flow:
 * 1. Frontend calls this function with order details
 * 2. Function sends POST request to API Gateway endpoint
 * 3. API Gateway triggers Lambda function
 * 4. Lambda validates and stores order in DynamoDB
 * 5. Lambda returns success response with order ID
 * 
 * @param userId - Firebase user ID (identifies the customer)
 * @param items - Array of cart items with product details
 * @param total - Total order amount
 * @param additionalData - Optional shipping address, payment method, etc.
 * @returns Promise with order confirmation details
 * @throws Error if the API request fails
 * 
 * @example
 * ```typescript
 * const result = await placeOrder(
 *   'firebase-user-id-123',
 *   [{ productId: 'prod-1', productName: 'Ceylon Tea', quantity: 2, price: 15.99 }],
 *   31.98,
 *   {
 *     shippingAddress: { fullName: 'John Doe', email: 'john@example.com', ... },
 *     paymentMethod: 'credit_card'
 *   }
 * );
 * console.log('Order placed successfully:', result.orderId);
 * ```
 */
export async function placeOrder(
    userId: string,
    items: OrderItem[],
    total: number,
    additionalData?: Partial<OrderPayload>
): Promise<OrderResponse> {
    try {
        // Validate inputs
        if (!userId) {
            throw new Error('User ID is required to place an order');
        }

        if (!items || items.length === 0) {
            throw new Error('Order must contain at least one item');
        }

        if (total <= 0) {
            throw new Error('Order total must be greater than zero');
        }

        // Construct the complete order payload
        const orderPayload: OrderPayload = {
            userId,
            items,
            total,
            timestamp: new Date().toISOString(),
            ...additionalData
        };

        const endpoint = getOrdersEndpoint();

        console.log('[Orders API] Sending order to:', endpoint);
        console.log('[Orders API] Order payload:', {
            userId: orderPayload.userId,
            itemCount: orderPayload.items.length,
            total: orderPayload.total
        });

        // Send POST request to AWS API Gateway
        const token = typeof window !== 'undefined' ? localStorage.getItem('tt_token') : null;
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        };
        const response = await fetch(endpoint, {
            method: 'POST',
            headers,
            body: JSON.stringify(orderPayload)
        });

        console.log('[Orders API] Response status:', response.status);

        const contentType = response.headers.get('content-type');
        const isJson = contentType?.includes('application/json');
        let data: OrderResponse | ApiError;

        if (isJson) {
            try {
                data = await response.json();
            } catch (parseErr) {
                throw new Error(
                    `Order service returned invalid JSON (status ${response.status}). Is the correct orders API URL configured? Check NEXT_PUBLIC_ORDERS_API_URL or NEXT_PUBLIC_API_BASE_URL.`
                );
            }
        } else {
            const text = await response.text();
            throw new Error(
                !response.ok
                    ? `Order service error: ${response.status} ${response.statusText}${text ? ` — ${text.slice(0, 100)}` : ''}. Check that the backend is running and NEXT_PUBLIC_ORDERS_API_URL points to it (e.g. http://localhost:4000/api/orders).`
                    : 'Order service did not return JSON. Check NEXT_PUBLIC_ORDERS_API_URL.'
            );
        }

        if (!response.ok) {
            const error = data as ApiError;
            console.error('[Orders API] Order placement failed:', error);
            throw new Error(
                error.error ||
                error.details ||
                `Failed to place order: ${response.status} ${response.statusText}`
            );
        }

        console.log('[Orders API] Order placed successfully:', {
            orderId: (data as OrderResponse).orderId,
            orderNumber: (data as OrderResponse).orderNumber
        });

        return data as OrderResponse;

    } catch (error) {
        console.error('[Orders API] Exception during order placement:', error);

        if (error instanceof Error) {
            const msg = error.message;
            if (msg.includes('Failed to fetch') || msg.includes('Load failed') || msg.includes('NetworkError')) {
                throw new Error(
                    'Unable to connect to the order service. Make sure the backend is running (e.g. on http://localhost:4000) and NEXT_PUBLIC_ORDERS_API_URL is set to its orders endpoint (e.g. http://localhost:4000/api/orders).'
                );
            }
            throw new Error(`Order placement failed: ${msg}`);
        }

        throw new Error('An unexpected error occurred while placing your order. Please try again.');
    }
}

/**
 * Helper function to format cart items for AWS API
 * Use this to transform your cart items into the OrderItem format
 * 
 * @param cartItems - Items from your cart context/state
 * @returns Formatted OrderItem array ready for API
 */
export function formatCartItemsForApi(cartItems: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
}>): OrderItem[] {
    return cartItems.map(item => ({
        productId: item.id,
        productName: item.name,
        quantity: item.quantity,
        price: item.price
    }));
}

/**
 * Documentation: How the Frontend Communicates with AWS
 * 
 * 1. ARCHITECTURE OVERVIEW:
 *    - Frontend (Next.js) runs in user's browser
 *    - API Gateway provides HTTPS endpoint for secure communication
 *    - Lambda function processes business logic
 *    - DynamoDB stores order data persistently
 * 
 * 2. DATA FLOW:
 *    a) User clicks "Place Order" button
 *    b) Frontend calls placeOrder() function
 *    c) Function sends HTTPS POST to API Gateway
 *    d) API Gateway validates request and invokes Lambda
 *    e) Lambda processes order and writes to DynamoDB
 *    f) Lambda returns success response to API Gateway
 *    g) API Gateway returns response to frontend
 *    h) Frontend displays confirmation to user
 * 
 * 3. AUTHENTICATION:
 *    - Frontend uses Firebase Authentication for user identity
 *    - User ID (uid) is sent with each order to track ownership
 *    - For enhanced security, you could add Firebase ID tokens to requests
 * 
 * 4. ERROR HANDLING:
 *    - Network errors: Connection failures, timeouts
 *    - Validation errors: Invalid data format
 *    - Server errors: Lambda or DynamoDB issues
 *    - All errors are caught and converted to user-friendly messages
 * 
 * 5. SCALABILITY:
 *    - API Gateway automatically scales with traffic
 *    - Lambda scales independently per request
 *    - DynamoDB scales based on read/write capacity
 *    - This serverless architecture handles variable load efficiently
 */
