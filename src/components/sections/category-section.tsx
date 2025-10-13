"use client";

import { useState, useEffect } from "react";
import { ProductCard } from "@/components/layout/product-card";
import { productService, Product } from "@/lib/products";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

interface CategorySectionProps {
  categoryName: string;
  title: string;
  description: string;
  backgroundColor?: string;
  textColor?: string;
}

export function CategorySection({ 
  categoryName, 
  title, 
  description, 
  backgroundColor = "bg-white",
  textColor = "text-gray-900"
}: CategorySectionProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        
        // Get all products
        const allProducts = await productService.getAllProducts();
        
        // Filter products by category and get the first 4
        const categoryProducts = allProducts
          .filter(product => product.category === categoryName)
          .slice(0, 4);
        
        setProducts(categoryProducts);
      } catch (error) {
        console.error('Error loading products:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [categoryName]);

  if (loading) {
    return (
      <section className={`py-16 ${backgroundColor}`}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className={`text-3xl font-bold ${textColor} mb-4`}>{title}</h2>
            <p className="text-gray-600">{description}</p>
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

  if (products.length === 0) {
    return null; // Don't render section if no products
  }

  return (
    <section className={`py-16 ${backgroundColor}`}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className={`text-3xl font-bold ${textColor} mb-4`}>{title}</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">{description}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              name={product.name}
              description={product.description}
              price={product.price}
              originalPrice={product.originalPrice}
              image={product.image}
              rating={product.rating}
              reviewCount={product.reviewCount}
              category={product.category}
              isNewProduct={product.isNewProduct}
              isFeatured={product.isFeatured}
            />
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center">
          <Link href={`/products?category=${encodeURIComponent(categoryName)}`}>
            <Button 
              size="lg" 
              variant="outline"
              className="border-amber-800 text-amber-800 hover:bg-amber-800 hover:text-white transition-all duration-300"
            >
              View All {categoryName}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
