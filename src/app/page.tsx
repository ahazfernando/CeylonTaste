import { Navigation } from "@/components/ui/navigation";
import { HeroSection } from "@/components/sections/hero-section";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navigation cartItemCount={3} />
      <main>
        <HeroSection />
        {/* Future sections will go here */}
        <div className="container py-16 text-center">
          <h2 className="text-3xl font-bold mb-4 bg-gradient-coffee bg-clip-text text-transparent">
            Coming Soon: Full E-commerce Experience
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Connect your project to Supabase to unlock customer authentication, 
            shopping cart functionality, order management, and admin dashboard features.
          </p>
        </div>
      </main>
    </div>
  );
};

export default Index;