import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Coffee, ShoppingBag, Crown } from "lucide-react";
import coupleHeroImage from "@/assets/couple-hero.jpg";

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden -mt-20 pt-20">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <img
          src={coupleHeroImage.src}
          alt="Couple enjoying coffee at CeylonTaste"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-amber-900/40 via-amber-800/30 to-transparent" />
      </div>
      
      {/* Content */}
      <div className="container relative z-10 mx-auto px-4">
        <div className="max-w-2xl text-white">
          <Badge className="mb-4 bg-white/10 text-[#EFE2D1] border border-white/20 backdrop-blur-md p-3 shadow-lg">
            Royal Ceylon Heritage
          </Badge>
          
          <h1 className="text-4xl md:text-6xl font-semibold mb-2">
            Taste the Royal
            <span className="block text-[#EFE2D1] bg-clip-text">
              Ceylon Experience
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-white/90 mb-8 leading-relaxed">
            Indulge in our premium coffee blends and handcrafted cakes,
            inspired by Ceylon's rich heritage. Every sip and bite tells a story of excellence.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              size="lg"
              className="bg-transparent border border-[#EFE2D1] text-[#EFE2D1] shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:bg-transparent"
            >
              <Coffee className="w-5 h-5 mr-2" />
              Explore Coffee
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="bg-[#EDE0D4] text-amber-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:bg-[#E1CBB7] hover:text-amber-700"
            >
              <ShoppingBag className="w-5 h-5 mr-2" />
              Shop Cakes
            </Button>
          </div>
          
          {/* Stats */}
          <div className="flex flex-wrap gap-8 mt-12 pt-8 border-t border-white/20">
            <div className="text-center">
              <div className="text-2xl font-bold text-[#EFE2D1]">50+</div>
              <div className="text-sm text-white/80">Coffee Varieties</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[#EFE2D1]">100+</div>
              <div className="text-sm text-white/80">Fresh Cakes Daily</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[#EFE2D1]">5★</div>
              <div className="text-sm text-white/80">Customer Rating</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Decorative Elements */}
      <div className="absolute bottom-10 right-10 hidden lg:block">
        <div className="w-32 h-32 rounded-full bg-gradient-to-r from-amber-600/20 to-yellow-500/20 animate-pulse" />
      </div>
    </section>
  );
}