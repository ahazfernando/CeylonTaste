import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Heart } from "lucide-react";
import { cn, getImageUrl } from "@/lib/utils";
import { useCart } from "@/contexts/CartContext";
import { toast } from "@/hooks/use-toast";

interface ProductCardProps {
  id: string;
  name: string;
  description?: string;
  price?: number;
  originalPrice?: number;
  image?: string;
  rating?: number;
  reviewCount?: number;
  category?: string;
  isNewProduct?: boolean;
  isFeatured?: boolean;
  className?: string;
}

export function ProductCard({
  id,
  name,
  description = '',
  price = 0,
  originalPrice,
  image = '',
  rating = 0,
  reviewCount = 0,
  category = '',
  isNewProduct = false,
  isFeatured = false,
  className,
}: ProductCardProps) {
  const router = useRouter();
  const { addToCart } = useCart();
  const [currentUser, setCurrentUser] = useState<null | { id: string; role: string; name?: string; email?: string }>(null);
  const [loading, setLoading] = useState(true);

  const discountPercentage = originalPrice 
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0;

  // Check authentication status using Cognito/localStorage
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if token exists in localStorage (set by Cognito auth)
        const token = typeof window !== 'undefined' ? localStorage.getItem('tt_token') : null;
        const userStr = typeof window !== 'undefined' ? localStorage.getItem('tt_user') : null;
        
        if (token && userStr) {
          const userData = JSON.parse(userStr);
          setCurrentUser(userData);
        } else {
          setCurrentUser(null);
        }
      } catch (error) {
        console.error('Error checking auth:', error);
        setCurrentUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleAddToCart = () => {
    if (!currentUser) {
      // Redirect to login page if user is not authenticated
      router.push('/login');
      return;
    }
    
    // Add item to cart
    addToCart({
      id,
      name,
      price,
      category,
      image
    });
    
    // Show success toast
    toast({
      title: "Added to Cart",
      description: `${name} has been added to your cart`,
    });
  };

  return (
    <Card className={cn(
      "group hover:shadow-warm transition-all duration-300 hover:-translate-y-2", 
      isFeatured && "ring-2 ring-accent/20",
      className
    )}>
      <Link href={`/products/${id}`} className="relative block overflow-hidden">
        <img 
          src={getImageUrl(image)} 
          alt={name}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {isNewProduct && (
            <Badge className="bg-card border border-border text-foreground shadow-lg">
              New
            </Badge>
          )}
          {discountPercentage > 0 && (
            <Badge variant="destructive">
              -{discountPercentage}%
            </Badge>
          )}
          {isFeatured && (
            <Badge className="bg-accent text-accent-foreground">
              Featured
            </Badge>
          )}
        </div>

        {/* Wishlist Button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-3 right-3 bg-card/90 hover:bg-card border border-border text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Heart className="h-4 w-4" />
        </Button>

        {/* Category */}
        <Badge 
          variant="outline" 
          className="absolute bottom-3 left-3 bg-card/90 text-foreground border border-border"
        >
          {category}
        </Badge>
      </Link>

      <CardContent className="p-4">
        <Link href={`/products/${id}`}>
          <h3 className="font-semibold text-lg mb-2 line-clamp-1 hover:text-primary hover:underline underline-offset-2">{name}</h3>
        </Link>
        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{description}</p>

        {/* Price */}
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold text-primary">
            LKR {price.toFixed(2)}
          </span>
          {originalPrice && (
            <span className="text-sm text-muted-foreground line-through">
              LKR {originalPrice.toFixed(2)}
            </span>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button 
          className="w-full cart-button-bg"
          onClick={handleAddToCart}
          disabled={loading}
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          {loading ? "Loading..." : currentUser ? "Add to Cart" : "Login to Add"}
        </Button>
      </CardFooter>
    </Card>
  );
}