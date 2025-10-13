import { Navigation } from "@/components/ui/navigation";
import { HeroSection } from "@/components/sections/hero-section";
import { CategoriesSection } from "@/components/sections/categories-section";
import { CategorySection } from "@/components/sections/category-section";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navigation cartItemCount={3} />
      <main>
        <HeroSection />
        <CategoriesSection />
        
        {/* Individual Category Sections */}
        <CategorySection
          categoryName="Cakes"
          title="Delicious Cakes"
          description="Handcrafted cakes made with the finest ingredients, perfect for celebrations and special occasions"
        />
        
        <CategorySection
          categoryName="Beverages"
          title="Refreshing Beverages"
          description="From premium coffee blends to refreshing drinks, quench your thirst with our carefully crafted beverages"
        />
        
        <CategorySection
          categoryName="Main Courses"
          title="Hearty Main Courses"
          description="Satisfying main dishes prepared with authentic recipes and fresh ingredients"
        />
        
        <CategorySection
          categoryName="Burgers"
          title="Gourmet Burgers"
          description="Juicy burgers made with premium ingredients and served with fresh accompaniments"
        />
      </main>
    </div>
  );
};

export default Index;