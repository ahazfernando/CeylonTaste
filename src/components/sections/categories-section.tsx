"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/layout/product-card";
import { productService, Product } from "@/lib/products";
import { getImageUrl } from "@/lib/utils";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

interface CategoryWithProducts {
  name: string;
  products: Product[];
}

export function CategoriesSection() {
  const [categories, setCategories] = useState<CategoryWithProducts[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoading(true);
        
        // Get all products
        const allProducts = await productService.getAllProducts();
        
        // Get unique categories
        const uniqueCategories = Array.from(new Set(allProducts.map(p => p.category)));
        
        // Get top 4 categories (you can modify this logic)
        const topCategories = uniqueCategories.slice(0, 4);
        
        // For each category, get the 4 most recent products
        const categoriesWithProducts: CategoryWithProducts[] = topCategories.map(categoryName => {
          const categoryProducts = allProducts
            .filter(product => product.category === categoryName)
            .sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime())
            .slice(0, 4);
          
          return {
            name: categoryName,
            products: categoryProducts
          };
        });
        
        setCategories(categoriesWithProducts);
      } catch (error) {
        console.error('Error loading categories:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, []);

  if (loading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Categories</h2>
            <p className="text-gray-600">Loading our featured categories...</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 h-48 rounded-lg mb-4"></div>
                <div className="bg-gray-200 h-4 rounded mb-2"></div>
                <div className="bg-gray-200 h-3 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Categories</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover our diverse selection of premium products, carefully curated for every taste and occasion.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {categories.map((category) => (
            <Card key={category.name} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-semibold text-gray-900">
                    {category.name}
                  </CardTitle>
                  <Badge variant="outline" className="text-xs">
                    {category.products.length} items
                  </Badge>
                </div>
                <CardDescription className="text-sm text-gray-600">
                  Latest additions to our {category.name.toLowerCase()} collection
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Show 4 products */}
                <div className="grid grid-cols-2 gap-3">
                  {category.products.map((product) => (
                    <div key={product.id} className="group cursor-pointer">
                      <div className="relative overflow-hidden rounded-lg bg-gray-100 aspect-square">
                        <img
                          src={getImageUrl(product.image)}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {product.isFeatured && (
                          <Badge className="absolute top-2 left-2 bg-amber-500 text-white text-xs">
                            Featured
                          </Badge>
                        )}
                        {product.isNewProduct && (
                          <Badge className="absolute top-2 right-2 bg-green-500 text-white text-xs">
                            New
                          </Badge>
                        )}
                      </div>
                      <div className="mt-2">
                        <h4 className="text-sm font-medium text-gray-900 line-clamp-1">
                          {product.name}
                        </h4>
                        <p className="text-xs text-gray-600 font-semibold">
                          LKR {product.price}
                        </p>
                        <Badge 
                          variant="outline" 
                          className={`text-xs mt-1 ${
                            product.availability === 'Available' ? 'text-green-600 border-green-200' :
                            product.availability === 'Unavailable' ? 'text-red-600 border-red-200' :
                            product.availability === 'In House Only' ? 'text-orange-600 border-orange-200' :
                            'text-blue-600 border-blue-200'
                          }`}
                        >
                          {product.availability}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>

                {/* View All Button */}
                <Link href={`/products?category=${encodeURIComponent(category.name)}`}>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full group hover:bg-amber-50 hover:border-amber-300 hover:text-amber-700"
                  >
                    View All {category.name}
                    <ArrowRight className="ml-2 h-3 w-3 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* View All Products Button */}
        <div className="text-center mt-12">
          <Link href="/products">
            <Button 
              size="lg" 
              className="bg-amber-800 hover:bg-amber-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
            >
              View All Products
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
