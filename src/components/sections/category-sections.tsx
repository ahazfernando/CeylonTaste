"use client";

import { useState, useEffect } from "react";
import { ProductCard } from "@/components/layout/product-card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { productService, Product } from "@/lib/products";
import { useRouter } from "next/navigation";

interface CategorySectionProps {
  category: string;
  title: string;
  description: string;
}

const CategorySection = ({ category, title, description }: CategorySectionProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const allProducts = await productService.getAllProducts();
        
        // Filter by category and get the 4 most recent products
        const categoryProducts = allProducts
          .filter(product => product.category === category)
          .sort((a, b) => {
            // Sort by creation date (assuming newer products have higher IDs or use a date field)
            // For now, we'll sort by featured status and then by name
            if (a.isFeatured !== b.isFeatured) {
              return b.isFeatured ? 1 : -1;
            }
            return a.name.localeCompare(b.name);
          })
          .slice(0, 4);
        
        setProducts(categoryProducts);
      } catch (error) {
        console.error(`Failed to load ${category} products:`, error);
        // Set empty array on error to prevent infinite loading
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [category]);

  const handleViewAll = () => {
    router.push(`/products?category=${encodeURIComponent(category)}`);
  };

  if (loading) {
    return (
      <section className="py-16">
        <div className="container">
          <div className="text-center">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto mb-8"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-64 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="py-16">
      <div className="container">
        {/* Category Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-amber-800 mb-4">
            {title}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            {description}
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              {...product}
            />
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center">
          <Button 
            variant="outline" 
            size="lg"
            onClick={handleViewAll}
            className="group hover:bg-primary hover:text-primary-foreground transition-colors"
          >
            View All {title}
            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export const CategorySections = () => {
  const categories = [
    {
      category: "Coffee",
      title: "Premium Coffee",
      description: "Rich and aromatic Ceylon coffee blends crafted with traditional methods and premium beans."
    },
    {
      category: "Cakes",
      title: "Artisan Cakes",
      description: "Handcrafted cakes made with the finest ingredients, perfect for celebrations and special occasions."
    },
    {
      category: "Pastries",
      title: "Fresh Pastries",
      description: "Delicious baked goods and pastries made fresh daily with authentic recipes and quality ingredients."
    },
    {
      category: "Beverages",
      title: "Refreshing Beverages",
      description: "Quench your thirst with our selection of fresh drinks, juices, and specialty beverages."
    },
    {
      category: "Main Courses",
      title: "Main Courses",
      description: "Hearty and satisfying main dishes prepared with authentic ingredients and traditional cooking methods."
    },
    {
      category: "Desserts",
      title: "Sweet Desserts",
      description: "Indulge in our delightful desserts and sweet treats, perfect for ending your meal on a high note."
    },
    {
      category: "Sides",
      title: "Appetizers & Sides",
      description: "Perfect starters and accompaniments to complement your main meal with fresh, flavorful options."
    }
  ];

  return (
    <div className="space-y-16">
      {categories.map((cat) => (
        <CategorySection
          key={cat.category}
          category={cat.category}
          title={cat.title}
          description={cat.description}
        />
      ))}
    </div>
  );
};
