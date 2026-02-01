import { Navigation } from "@/components/ui/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Cpu, Shield, Headphones } from "lucide-react";
import Link from "next/link";
import { AboutPreview } from "@/components/sections/about-preview";
import { TeamSection } from "@/components/sections/team-section";
import { TimelineSection } from "@/components/sections/timeline-section";

export default function About() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main>
        <AboutPreview />

        {/* Values Section */}
        <section id="why-choose-us" className="py-16">
          <div className="container">
            <h2 className="text-3xl font-bold text-center mb-12 text-foreground">
              Why Choose Us
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="text-center shadow-warm border-border bg-card">
                <CardContent className="pt-6">
                  <Cpu className="w-12 h-12 mx-auto mb-4 text-primary" />
                  <h3 className="text-xl font-semibold mb-3">Curated Tech</h3>
                  <p className="text-muted-foreground">
                    We stock only trusted brands and rigorously tested devices—from
                    smartphones and consoles to audio and accessories.
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center shadow-warm border-border bg-card">
                <CardContent className="pt-6">
                  <Shield className="w-12 h-12 mx-auto mb-4 text-primary" />
                  <h3 className="text-xl font-semibold mb-3">Secure & Reliable</h3>
                  <p className="text-muted-foreground">
                    Secure checkout, warranty support, and hassle-free returns so you
                    can shop with confidence.
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center shadow-warm border-border bg-card">
                <CardContent className="pt-6">
                  <Headphones className="w-12 h-12 mx-auto mb-4 text-primary" />
                  <h3 className="text-xl font-semibold mb-3">Support When You Need It</h3>
                  <p className="text-muted-foreground">
                    Our team is here to help with product questions, orders, and
                    after-sales support.
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
            <h2 className="text-3xl font-bold mb-6 text-foreground">
              Get the Tech You Need
            </h2>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              Explore devices, gaming gear, and accessories—all in one place. Fast
              delivery and straightforward returns.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90" size="lg">
                <Link href="/products">Shop Now</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-primary text-foreground hover:bg-primary/10">
                <Link href="/products">Explore Products</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}