"use client";

import { useState } from "react";
import { Navigation } from "@/components/ui/navigation";
import { ProductCard } from "@/components/layout/product-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, Grid, List } from "lucide-react";

// Mock product data - replace with Supabase data
const mockProducts = [
  {
    id: "1",
    name: "Ceylon Gold Premium Coffee",
    description: "Rich and aromatic premium Ceylon coffee with notes of chocolate and citrus",
    price: 24.99,
    originalPrice: 29.99,
    rating: 4.8,
    reviewCount: 124,
    category: "Coffee",
    isNew: true,
    isFeatured: true,
    image: "/placeholder.svg",
  },
  {
    id: "2",
    name: "Royal Chocolate Cake",
    description: "Decadent chocolate cake with Ceylon cinnamon and premium cocoa",
    price: 18.50,
    rating: 4.9,
    reviewCount: 89,
    category: "Cakes",
    isFeatured: true,
    image: "/placeholder.svg",
  },
  {
    id: "3",
    name: "Ceylon Breakfast Blend",
    description: "Perfect morning blend with strong flavor and smooth finish",
    price: 19.99,
    originalPrice: 24.99,
    rating: 4.6,
    reviewCount: 67,
    category: "Coffee",
    image: "/placeholder.svg",
  },
];

const categories = ["All", "Coffee", "Cakes", "Pastries", "Accessories"];

export default function Products() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("featured");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const filteredProducts = mockProducts.filter(product => {
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
          <h1 className="text-4xl font-bold mb-4 bg-gradient-coffee bg-clip-text text-transparent">
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
          <div className="flex gap-2 flex-wrap">
            {categories.map((category) => (
              <Badge
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                className="cursor-pointer hover:bg-accent hover:text-accent-foreground"
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Badge>
            ))}
          </div>

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