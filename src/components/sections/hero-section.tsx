import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Crown } from "lucide-react";
import coupleHeroImage from "@/assets/couple-hero.jpg";

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden -mt-20 pt-20">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <img
          src={coupleHeroImage.src}
          alt="Couple enjoying coffee at CeylonTaste"
          className="w-full h-full object-cover brightness-90"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-black/25 to-black/10" />
      </div>
      
      {/* Content */}
      <div className="container relative z-10 mx-auto px-4">
        <div className="max-w-2xl text-white">
          <Badge className="mb-4 bg-white/20 text-white border border-white/30 backdrop-blur-md p-3 shadow-lg">
            Royal Ceylon Heritage
          </Badge>
          
          <h1 className="text-4xl md:text-6xl font-semibold mb-2 text-white">
            Taste the Royal
            <span className="block text-white">
              Ceylon Experience
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-white/95 mb-8 leading-relaxed">
            Indulge in our premium coffee blends and handcrafted cakes,
            inspired by Ceylon's rich heritage. Every sip and bite tells a story of excellence.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              size="lg"
              className="bg-transparent border border-white text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:bg-white/10"
            >
              Explore Coffee
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="bg-white text-gray-800 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:bg-gray-100"
            >
              Shop Cakes
            </Button>
          </div>
        </div>
      </div>
      
      {/* Decorative Elements */}
      <div className="absolute bottom-10 right-10 hidden lg:block">
        <div className="w-32 h-32 rounded-full bg-gradient-to-r from-white/10 to-white/5 animate-pulse" />
      </div>
    </section>
  );
}