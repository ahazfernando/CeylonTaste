import { Navigation } from "@/components/ui/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Crown, Coffee, Award, Heart, Users, Leaf } from "lucide-react";

export default function About() {
  return (
    <div className="min-h-screen">
      <Navigation />
      <main>
        {/* Hero Section */}
        <section className="py-16 bg-gradient-cream">
          <div className="container">
            <div className="max-w-3xl mx-auto text-center">
              <Badge className="mb-4 bg-accent/20 text-accent-foreground">
                <Crown className="w-4 h-4 mr-1" />
                Our Story
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-coffee bg-clip-text text-transparent">
                Royal Ceylon Heritage
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Since our founding, CeylonTaste has been dedicated to bringing you the finest coffee and 
                handcrafted cakes, inspired by the rich heritage of Ceylon. Every cup tells a story of 
                tradition, quality, and royal excellence.
              </p>
            </div>
          </div>
        </section>

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

        {/* Statistics */}
        <section className="py-16 bg-gradient-royal">
          <div className="container">
            <div className="grid md:grid-cols-4 gap-8 text-center text-white">
              <div>
                <Award className="w-8 h-8 mx-auto mb-2" />
                <div className="text-3xl font-bold mb-1">25+</div>
                <div className="text-sm opacity-90">Years of Excellence</div>
              </div>
              <div>
                <Users className="w-8 h-8 mx-auto mb-2" />
                <div className="text-3xl font-bold mb-1">10k+</div>
                <div className="text-sm opacity-90">Happy Customers</div>
              </div>
              <div>
                <Coffee className="w-8 h-8 mx-auto mb-2" />
                <div className="text-3xl font-bold mb-1">50+</div>
                <div className="text-sm opacity-90">Coffee Varieties</div>
              </div>
              <div>
                <Crown className="w-8 h-8 mx-auto mb-2" />
                <div className="text-3xl font-bold mb-1">100+</div>
                <div className="text-sm opacity-90">Awards Won</div>
              </div>
            </div>
          </div>
        </section>

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
              <Button variant="coffee" size="lg">
                <Coffee className="w-5 h-5 mr-2" />
                Shop Coffee
              </Button>
              <Button variant="royal" size="lg">
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