'use client';

import { useEffect, useState } from 'react';
import { apiService, Product, getApiBaseUrl } from '@/lib/api';

export default function TestPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [error, setError] = useState<string>('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const data = await apiService.getAllProducts();
                setProducts(data);
            } catch (e: any) {
                console.error("Failed to fetch products:", e);
                setError(e.message || 'Failed to load products');
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 p-8 font-sans">
            <header className="mb-8 max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Product Catalog</h1>
                <div className="text-sm text-gray-500 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    Connected to: {getApiBaseUrl()}
                </div>
            </header>

            <main className="max-w-7xl mx-auto">
                {loading && (
                    <div className="flex items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                        <span className="ml-4 text-gray-600">Loading delicious items...</span>
                    </div>
                )}

                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center max-w-2xl mx-auto">
                        <div className="text-red-500 text-xl mb-2">⚠️ Connection Error</div>
                        <p className="text-gray-700">{error}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="mt-4 px-4 py-2 bg-white border border-gray-300 rounded hover:bg-gray-50 transition"
                        >
                            Retry Connection
                        </button>
                    </div>
                )}

                {!loading && !error && products.length === 0 && (
                    <div className="text-center py-20 text-gray-500">
                        No products found in the catalog.
                    </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {products.map((product) => (
                        <div
                            key={product.id}
                            className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-300 flex flex-col"
                        >
                            <div className="aspect-[4/3] relative bg-gray-200">
                                {product.image ? (
                                    // Using standard img for simplicity in this test page, 
                                    // in production replace with Next.js Image component
                                    <img
                                        src={product.image}
                                        alt={product.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                        No Image
                                    </div>
                                )}
                                {product.availability && (
                                    <span className="absolute top-2 right-2 px-2 py-1 bg-white/90 backdrop-blur text-xs font-semibold rounded-full shadow-sm text-gray-700">
                                        {product.availability}
                                    </span>
                                )}
                            </div>

                            <div className="p-4 flex flex-col flex-grow">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
                                        {product.category}
                                    </span>
                                    <span className="font-bold text-gray-900">
                                        ${product.price.toFixed(2)}
                                    </span>
                                </div>

                                <h3 className="font-bold text-lg text-gray-800 mb-1 line-clamp-1">
                                    {product.name}
                                </h3>

                                <p className="text-gray-500 text-sm line-clamp-2 mb-4 flex-grow">
                                    {product.description}
                                </p>

                                <div className="mt-auto pt-3 border-t border-gray-50 flex justify-between items-center text-sm">
                                    <div className="flex items-center text-yellow-500">
                                        {'★'.repeat(Math.round(product.rating || 0))}
                                        <span className="text-gray-400 ml-1 text-xs">
                                            ({product.reviewCount || 0})
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}
