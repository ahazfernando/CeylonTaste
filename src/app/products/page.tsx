"use client";

import { useState, useEffect } from "react";
import { Navigation } from "@/components/ui/navigation";
import { ProductCard } from "@/components/layout/product-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Grid, List, AlertCircle } from "lucide-react";
import { productService, Product } from "@/lib/products";
import { ProductListSkeleton } from "@/components/skeletons/product-skeleton";

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("featured");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [productsData, categoriesData] = await Promise.all([
          productService.getAllProducts(),
          productService.getCategories(),
        ]);
        setProducts(productsData);
        setCategories(["All", ...categoriesData]);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to load products";
        setError(message);
        setProducts([]);
        setCategories(["All"]);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const filteredProducts = products.filter((product) => {
    const name = (product.name || "").toLowerCase();
    const desc = (product.description || "").toLowerCase();
    const matchesSearch =
      name.includes(searchTerm.toLowerCase()) || desc.includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || (product.category || "") === selectedCategory;
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

        {/* Error state */}
        {error && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
              <div>
                <p className="font-medium text-destructive">Could not load products</p>
                <p className="text-sm text-muted-foreground">{error}</p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => {
                setError(null);
                setLoading(true);
                productService.getAllProducts().then((data) => {
                  setProducts(data);
                  setCategories(["All", ...Array.from(new Set(data.map((p) => p.category).filter(Boolean) as string[]))]);
                }).catch((err) => setError(err instanceof Error ? err.message : "Failed to load")).finally(() => setLoading(false));
              }}
            >
              Try again
            </Button>
          </div>
        )}

        {/* Products Grid */}
        {loading ? (
          <ProductListSkeleton count={8} />
        ) : !error ? (
          <>
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

            {/* Empty state (no error, not loading, zero results) */}
            {filteredProducts.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">
                  No products found matching your criteria.
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedCategory("All");
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </>
        ) : null}
      </main>
    </div>
  );
}