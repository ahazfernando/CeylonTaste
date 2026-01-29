import { Navigation } from "@/components/ui/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Crown, Coffee, Award, Heart, Users, Leaf } from "lucide-react";
import { AboutPreview } from "@/components/sections/about-preview";
import { TeamSection } from "@/components/sections/team-section";
import { TimelineSection } from "@/components/sections/timeline-section";

export default function About() {
  return (
    <div className="min-h-screen">
      <Navigation />
      <main>
        <AboutPreview />

        {/* Values Section */}
        <section className="py-16">
          <div className="container">
            <h2 className="text-3xl font-bold text-center mb-12 bg-gradient-coffee bg-clip-text text-transparent">
              Our Values
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="text-center shadow-warm">
                <CardContent className="pt-6">
                  <Coffee className="w-12 h-12 mx-auto mb-4 text-accent" />
                  <h3 className="text-xl font-semibold mb-3">Premium Quality</h3>
                  <p className="text-muted-foreground">
                    We source only the finest Ceylon coffee beans and use premium ingredients
                    for all our handcrafted cakes.
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center shadow-warm">
                <CardContent className="pt-6">
                  <Heart className="w-12 h-12 mx-auto mb-4 text-accent" />
                  <h3 className="text-xl font-semibold mb-3">Made with Love</h3>
                  <p className="text-muted-foreground">
                    Every product is crafted with passion and attention to detail,
                    ensuring an exceptional experience with every bite and sip.
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center shadow-warm">
                <CardContent className="pt-6">
                  <Leaf className="w-12 h-12 mx-auto mb-4 text-accent" />
                  <h3 className="text-xl font-semibold mb-3">Sustainable</h3>
                  <p className="text-muted-foreground">
                    We're committed to sustainable practices and supporting local
                    farmers while preserving Ceylon's natural heritage.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <TimelineSection />
        <TeamSection />

        {/* CTA Section */}
        <section className="py-16">
          <div className="container text-center">
            <h2 className="text-3xl font-bold mb-6 bg-gradient-coffee bg-clip-text text-transparent">
              Experience Royal Ceylon Today
            </h2>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              Ready to taste the heritage? Explore our premium collection of coffees and cakes,
              each crafted to deliver an unforgettable royal experience.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90" size="lg">
                <Coffee className="w-5 h-5 mr-2" />
                Shop Coffee
              </Button>
              <Button className="bg-amber-100 text-amber-900 hover:bg-amber-200" size="lg">
                <Crown className="w-5 h-5 mr-2" />
                Browse Cakes
              </Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}