"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Navigation } from "@/components/ui/navigation";
import { ProductCard } from "@/components/layout/product-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, Grid, List } from "lucide-react";
import { productService, Product } from "@/lib/products";

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("featured");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Load products and categories on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        console.log('Loading products and categories...');
        
        // Load products and categories in parallel
        const [productsData, categoriesData] = await Promise.all([
          productService.getAllProducts(),
          productService.getCategories()
        ]);
        
        console.log('Products loaded:', productsData);
        console.log('Categories loaded:', categoriesData);
        console.log('Categories length:', categoriesData.length);
        
        setProducts(productsData);
        setCategories(["All", ...categoriesData]);
        
        console.log('Categories state set to:', ["All", ...categoriesData]);
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="container py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 text-primary">
            Our Products
          </h1>
          <p className="text-muted-foreground max-w-2xl">
            Discover our premium collection of Ceylon coffee and handcrafted cakes. 
            Each product is made with the finest ingredients and traditional methods.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col lg:flex-row gap-4 mb-8 p-4 bg-card rounded-lg border">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Category Filter */}
          <Select value={selectedCategory} onValueChange={setSelectedCategory} disabled={loading}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder={loading ? "Loading..." : "Select Category"} />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Sort */}
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="featured">Featured</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
              <SelectItem value="rating">Highest Rated</SelectItem>
              <SelectItem value="newest">Newest</SelectItem>
            </SelectContent>
          </Select>

          {/* View Toggle */}
          <div className="flex rounded-md border">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="rounded-r-none"
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="rounded-l-none"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Products Grid */}
        <div className={
          viewMode === "grid" 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            : "space-y-4"
        }>
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              {...product}
              className={viewMode === "list" ? "flex-row" : ""}
            />
          ))}
        </div>

        {/* Empty State */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <div className="text-muted-foreground mb-4">
              No products found matching your criteria.
            </div>
            <Button variant="outline" onClick={() => {
              setSearchTerm("");
              setSelectedCategory("All");
            }}>
              Clear Filters
            </Button>
          </div>
        )}

        {/* Note about Supabase */}
        <div className="mt-12 p-6 bg-gradient-cream rounded-lg border border-accent/20">
          <h3 className="font-semibold mb-2 text-primary">Ready for Real Product Data?</h3>
          <p className="text-muted-foreground text-sm">
          </p>
        </div>
      </main>
    </div>
  );
}