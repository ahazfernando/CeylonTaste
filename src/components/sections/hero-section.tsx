import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Coffee, ShoppingBag, Crown } from "lucide-react";
import heroImage from "@/assets/hero-coffee-shop.jpg";

export function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <img 
          src={heroImage} 
          alt="CeylonTaste Coffee Shop"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/80 via-primary/60 to-transparent" />
      </div>

      {/* Content */}
      <div className="container relative z-10">
        <div className="max-w-2xl text-white">
          <Badge className="mb-4 bg-accent/20 text-accent-foreground border-accent/30">
            <Crown className="w-4 h-4 mr-1" />
            Royal Ceylon Heritage
          </Badge>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Taste the 
            <span className="block text-transparent bg-gradient-to-r from-accent to-secondary bg-clip-text">
              Royal Ceylon
            </span>
            Experience
          </h1>
          
          <p className="text-lg md:text-xl text-white/90 mb-8 leading-relaxed">
            Indulge in our premium coffee blends and handcrafted cakes, 
            inspired by Ceylon's rich heritage. Every sip and bite tells a story of excellence.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              size="lg" 
              className="bg-gradient-royal text-primary shadow-warm hover:shadow-coffee transition-all duration-300 transform hover:-translate-y-1"
            >
              <Coffee className="w-5 h-5 mr-2" />
              Explore Coffee
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-white/30 text-white hover:bg-white hover:text-primary"
            >
              <ShoppingBag className="w-5 h-5 mr-2" />
              Shop Cakes
            </Button>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap gap-8 mt-12 pt-8 border-t border-white/20">
            <div className="text-center">
              <div className="text-2xl font-bold text-accent">50+</div>
              <div className="text-sm text-white/80">Coffee Varieties</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-accent">100+</div>
              <div className="text-sm text-white/80">Fresh Cakes Daily</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-accent">5★</div>
              <div className="text-sm text-white/80">Customer Rating</div>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-10 right-10 hidden lg:block">
        <div className="w-32 h-32 rounded-full bg-gradient-coffee opacity-20 animate-pulse" />
      </div>
    </section>
  );
}