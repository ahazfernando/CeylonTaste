"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="relative min-h-[90vh] overflow-hidden bg-black text-white -mt-20 pt-20">
      {/* Background image with bottom fade to black */}
      <div className="absolute inset-0">
        <Image
          src="/techheader/TechHeader.png"
          alt="Tech header background"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        {/* Fade from transparent at top to solid black at bottom */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/80 to-black" />
      </div>

      <div className="relative max-w-5xl mx-auto px-6 pt-40 pb-24 text-center">
        <div className="flex flex-col items-center gap-3 mb-4">
          <Image
            src="/logo/playstationshapeslogo.png"
            alt="Logo"
            width={120}
            height={120}
            className="object-contain h-14 w-auto md:h-16"
          />
        </div>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold leading-tight mb-4 text-white">
          <span className="block">
            <span className="italic">Tech</span> That <span className="italic">Fits</span>
          </span>
          <span className="block">
            Your <span className="italic">Life.</span> Shop <span className="italic">Smarter.</span>
          </span>
        </h1>
        <p className="mt-4 text-sm sm:text-base text-white/80 max-w-2xl mx-auto">
          A tech e‑commerce hub for devices, gadgets, and gear—from smartphones and
          consoles to audio and accessories. One place to discover, compare, and get
          the tech you need.
        </p>

        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Button
            asChild
            className="rounded-full px-8 py-3 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg transition-colors"
          >
            <Link href="/products">Shop Now</Link>
          </Button>
          <Button
            variant="outline"
            asChild
            className="rounded-full px-6 py-3 text-sm font-medium border-white/60 text-white hover:bg-white/15 hover:border-white/80"
          >
            <Link href="/about#why-choose-us">Why Choose Us</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
