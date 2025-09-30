import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, ShoppingCart, Heart } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating: number;
  reviewCount: number;
  category: string;
  isNewProduct?: boolean;
  isFeatured?: boolean;
  className?: string;
}

export function ProductCard({
  id,
  name,
  description,
  price,
  originalPrice,
  image,
  rating,
  reviewCount,
  category,
  isNewProduct = false,
  isFeatured = false,
  className,
}: ProductCardProps) {
  const discountPercentage = originalPrice 
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0;

  return (
    <Card className={cn(
      "group hover:shadow-warm transition-all duration-300 hover:-translate-y-2", 
      isFeatured && "ring-2 ring-accent/20",
      className
    )}>
      <div className="relative overflow-hidden">
        <img 
          src={image} 
          alt={name}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {isNewProduct && (
            <Badge className="bg-accent text-accent-foreground">
              New
            </Badge>
          )}
          {discountPercentage > 0 && (
            <Badge variant="destructive">
              -{discountPercentage}%
            </Badge>
          )}
          {isFeatured && (
            <Badge className="bg-gradient-coffee text-white">
              Featured
            </Badge>
          )}
        </div>

        {/* Wishlist Button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-3 right-3 bg-white/90 hover:bg-white text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Heart className="h-4 w-4" />
        </Button>

        {/* Category */}
        <Badge 
          variant="outline" 
          className="absolute bottom-3 left-3 bg-white/90 text-foreground border-accent/20"
        >
          {category}
        </Badge>
      </div>

      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-2 line-clamp-1">{name}</h3>
        <p className="text-muted-foreground text-sm mb-3 line-clamp-2">{description}</p>
        
        {/* Rating */}
        <div className="flex items-center gap-1 mb-3">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                className={cn(
                  "h-4 w-4",
                  i < Math.floor(rating) 
                    ? "text-accent fill-accent" 
                    : "text-muted-foreground"
                )}
              />
            ))}
          </div>
          <span className="text-sm text-muted-foreground">
            {rating} ({reviewCount})
          </span>
        </div>

        {/* Price */}
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold text-primary">
            ${price.toFixed(2)}
          </span>
          {originalPrice && (
            <span className="text-sm text-muted-foreground line-through">
              ${originalPrice.toFixed(2)}
            </span>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button className="w-full bg-gradient-coffee text-white hover:opacity-90">
          <ShoppingCart className="w-4 h-4 mr-2" />
          Add to Cart
        </Button>
      </CardFooter>
    </Card>
  );
}