"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const widgets = [
  {
    src: "/homewidget/phoneswidge.jpg",
    alt: "Phones & devices",
    title: "Smartphones & More",
    description: "Discover our range of devices and stay connected.",
    href: "/products?category=Beverages",
  },
  {
    src: "/homewidget/consolewidget.jpg",
    alt: "Console & gaming",
    title: "Console & Gaming",
    description: "Explore consoles and gaming gear for every player.",
    href: "/products",
  },
];

export function HomeWidgetsSection() {
  return (
    <section className="relative w-full py-12 md:py-16 bg-background border-b border-border">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {widgets.map((widget) => (
            <Link
              key={widget.src}
              href={widget.href}
              className="group relative block overflow-hidden rounded-[24px] bg-card border border-border shadow-lg hover:shadow-xl transition-all duration-300 hover:border-primary/50"
            >
              <div className="relative aspect-[4/3] md:aspect-[16/10] w-full overflow-hidden">
                <Image
                  src={widget.src}
                  alt={widget.alt}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-8">
                  <h3 className="text-xl md:text-2xl font-semibold text-white mb-1 drop-shadow-md">
                    {widget.title}
                  </h3>
                  <p className="text-white/90 text-sm md:text-base mb-4 max-w-md">
                    {widget.description}
                  </p>
                  <span className="inline-flex w-fit items-center gap-1 px-2.5 py-1 rounded-md bg-card border border-border text-foreground text-xs font-medium shadow-md group-hover:bg-accent transition-colors">
                    Shop Now
                    <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
