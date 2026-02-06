"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Navigation } from "@/components/ui/navigation";
import { ProductCard } from "@/components/layout/product-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ShoppingCart,
  Heart,
  ArrowLeft,
  Star,
  Package,
  CheckCircle2,
} from "lucide-react";
import { getImageUrl } from "@/lib/utils";
import { productService, Product } from "@/lib/products";
import { useCart } from "@/contexts/CartContext";
import { toast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

const RECOMMENDED_COUNT = 4;

export default function ProductDetailPage() {
  const params = useParams();
  const id = typeof params?.id === "string" ? params.id : "";
  const [product, setProduct] = useState<Product | null>(null);
  const [recommended, setRecommended] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<null | {
    id: string;
    role: string;
    name?: string;
    email?: string;
  }>(null);

  useEffect(() => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("tt_token") : null;
    const userStr =
      typeof window !== "undefined" ? localStorage.getItem("tt_user") : null;
    if (token && userStr) {
      try {
        setCurrentUser(JSON.parse(userStr));
      } catch {
        setCurrentUser(null);
      }
    } else {
      setCurrentUser(null);
    }
  }, []);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      setError("Product not found");
      return;
    }
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const [detail, allProducts] = await Promise.all([
          productService.getProductById(id),
          productService.getAllProducts(),
        ]);
        if (!detail) {
          setError("Product not found");
          setProduct(null);
          setRecommended([]);
          return;
        }
        setProduct(detail);
        // Recommended: same category first, then featured/new, exclude current
        const others = allProducts.filter((p) => p.id !== id);
        const sameCategory = others.filter(
          (p) =>
            (p.category || "").toLowerCase() ===
            (detail.category || "").toLowerCase()
        );
        const featuredOrNew = others.filter(
          (p) => p.isFeatured || p.isNewProduct
        );
        const rest = others.filter(
          (p) =>
            !sameCategory.includes(p) && !featuredOrNew.includes(p)
        );
        const merged = [
          ...sameCategory,
          ...featuredOrNew.filter((p) => !sameCategory.includes(p)),
          ...rest,
        ];
        setRecommended(merged.slice(0, RECOMMENDED_COUNT));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load product");
        setProduct(null);
        setRecommended([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <main className="container py-8">
          <div className="grid gap-8 lg:grid-cols-2">
            <Skeleton className="aspect-square w-full rounded-2xl" />
            <div className="space-y-4">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-12 w-32" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <main className="container py-16 text-center">
          <h1 className="text-2xl font-semibold text-foreground mb-2">
            Product not found
          </h1>
          <p className="text-muted-foreground mb-6">{error || "This product may have been removed."}</p>
          <Button asChild variant="outline">
            <Link href="/products">Back to Products</Link>
          </Button>
        </main>
      </div>
    );
  }

  const discountPercentage = product.originalPrice
    ? Math.round(
      ((product.originalPrice - (product.price ?? 0)) / product.originalPrice) *
      100
    )
    : 0;
  const inStock =
    !product.availability ||
    product.availability.toLowerCase() === "in stock" ||
    product.availability.toLowerCase() === "available";

  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="container py-8">
        {/* Breadcrumb / Back */}
        <div className="mb-6">
          <Button variant="ghost" size="sm" asChild>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Products
            </Link>
          </Button>
        </div>

        {/* Product Mastercard */}
        <section className="mb-16">
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Image */}
            <div className="relative aspect-square overflow-hidden rounded-2xl border bg-card shadow-warm">
              <img
                src={getImageUrl(product.image)}
                alt={product.name}
                className="h-full w-full object-cover"
              />
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {product.isNewProduct && (
                  <Badge className="bg-card border border-border text-foreground shadow-lg">New</Badge>
                )}
                {product.isFeatured && (
                  <Badge className="bg-accent text-accent-foreground">Featured</Badge>
                )}
                {discountPercentage > 0 && (
                  <Badge variant="destructive">-{discountPercentage}%</Badge>
                )}
              </div>
              {product.category && (
                <Badge
                  variant="outline"
                  className="absolute bottom-4 left-4 bg-card/90 border border-border"
                >
                  {product.category}
                </Badge>
              )}
            </div>

            {/* Details */}
            <div className="flex flex-col">
              <h1 className="text-3xl font-bold text-foreground mb-2">
                {product.name}
              </h1>
              {product.rating != null && product.rating > 0 && (
                <div className="flex items-center gap-2 text-muted-foreground mb-4">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    <span className="font-medium text-foreground">
                      {product.rating.toFixed(1)}
                    </span>
                  </div>
                  {product.reviewCount != null && product.reviewCount > 0 && (
                    <span className="text-sm">
                      ({product.reviewCount} review
                      {product.reviewCount !== 1 ? "s" : ""})
                    </span>
                  )}
                </div>
              )}
              <p className="text-muted-foreground mb-6 leading-relaxed">
                {product.description || "No description available."}
              </p>

              {/* Price */}
              <div className="flex items-center gap-3 mb-6">
                <span className="text-3xl font-bold text-primary">
                  LKR {(product.price ?? 0).toFixed(2)}
                </span>
                {product.originalPrice != null &&
                  product.originalPrice > (product.price ?? 0) && (
                    <span className="text-lg text-muted-foreground line-through">
                      LKR {product.originalPrice.toFixed(2)}
                    </span>
                  )}
              </div>

              {/* Availability */}
              <div className="flex items-center gap-2 mb-6">
                {inStock ? (
                  <>
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <span className="text-foreground font-medium">
                      In stock
                    </span>
                  </>
                ) : (
                  <>
                    <Package className="h-5 w-5 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      {product.availability || "Out of stock"}
                    </span>
                  </>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-3 mt-auto">
                <ProductDetailAddToCart
                  product={product}
                  currentUser={currentUser}
                  inStock={inStock}
                />
                <Button variant="outline" size="lg" className="rounded-lg">
                  <Heart className="h-4 w-4 mr-2" />
                  Add to Wishlist
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Recommended Products */}
        {recommended.length > 0 && (
          <section className="border-t pt-12">
            <h2 className="text-2xl font-bold text-foreground mb-6">
              You might also like
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {recommended.map((p) => (
                <ProductCard key={p.id} {...p} />
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

function ProductDetailAddToCart({
  product,
  currentUser,
  inStock,
}: {
  product: Product;
  currentUser: { id: string; role: string; name?: string; email?: string } | null;
  inStock: boolean;
}) {
  const router = useRouter();
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    if (!currentUser) {
      router.push("/login");
      return;
    }
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price ?? 0,
      category: product.category ?? "",
      image: product.image ?? "",
    });
    toast({
      title: "Added to Cart",
      description: `${product.name} has been added to your cart`,
    });
  };

  return (
    <Button
      size="lg"
      className="cart-button-bg rounded-lg min-w-[180px]"
      onClick={handleAddToCart}
      disabled={!inStock}
    >
      <ShoppingCart className="h-4 w-4 mr-2" />
      {currentUser ? (inStock ? "Add to Cart" : "Out of stock") : "Login to add"}
    </Button>
  );
}
