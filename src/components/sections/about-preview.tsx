"use client";

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';

export const AboutPreview = () => {
    const containerRef = useRef<HTMLDivElement>(null);

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"]
    });

    const imageY = useTransform(scrollYProgress, [0, 1], [100, -100]);
    const textY = useTransform(scrollYProgress, [0, 1], [50, -50]);
    const rotateX = useTransform(scrollYProgress, [0, 0.5, 1], [5, 0, -5]);

    return (
        <section ref={containerRef} className="relative py-40 bg-card overflow-hidden">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-12 gap-4 lg:gap-8">
                    {/* Left Column - Main Image with Parallax */}
                    <motion.div style={{ y: imageY }} className="col-span-12 lg:col-span-5 lg:row-span-2">
                        <div className="relative">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.8 }}
                                className="relative aspect-[3/4] rounded-2xl overflow-hidden"
                            >
                                <Image
                                    src="/about/e3f284e996eda3102fb7169f41fb9c52.jpg"
                                    alt="Tech and innovation"
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 1024px) 100vw, 50vw"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
                            </motion.div>

                            {/* Floating Badge */}
                            <motion.div
                                initial={{ opacity: 0, x: -50, rotate: -12 }}
                                whileInView={{ opacity: 1, x: 0, rotate: -6 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.5, duration: 0.6 }}
                                className="absolute -bottom-6 -right-6 lg:right-auto lg:-left-8 bg-primary p-6 rounded-xl shadow-lg transform"
                            >
                                <div className="text-center">
                                    <span className="font-serif text-5xl font-bold text-primary-foreground">10+</span>
                                    <p className="text-sm text-primary-foreground/80 mt-1">Years in<br />Tech</p>
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>

                    {/* Center Column - Content */}
                    <motion.div style={{ y: textY }} className="col-span-12 lg:col-span-4 lg:col-start-7 flex flex-col justify-center py-12 lg:py-0">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                        >
                            <span className="text-primary tracking-[0.4em] uppercase text-xs font-medium">Our Story</span>

                            <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl text-foreground mt-6 mb-8 leading-tight">
                                Innovation That
                                <span className="block bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent italic">Drives Tomorrow</span>
                            </h2>

                            <div className="space-y-6 text-muted-foreground leading-relaxed">
                                <p>We started with a simple mission: make great tech accessible. From devices and gadgets to gaming and audio, we bring you the gear that fits your life.</p>
                                <p>Every product is chosen for quality, performance, and value—so you can shop with confidence and get the tech you need.</p>
                            </div>

                            {/* Stats Row */}
                            <div className="grid grid-cols-3 gap-4 my-12">
                                {[
                                    { value: '10K+', label: 'Products' },
                                    { value: '50+', label: 'Brands' },
                                    { value: '100K+', label: 'Customers' },
                                ].map((stat, i) => (
                                    <motion.div
                                        key={stat.label}
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: 0.4 + i * 0.1 }}
                                        className="text-left"
                                    >
                                        <div className="font-sans text-4xl text-primary font-bold">{stat.value}</div>
                                        <div className="text-muted-foreground text-sm mt-1 uppercase tracking-wide">{stat.label}</div>
                                    </motion.div>
                                ))}
                            </div>

                            <Link
                                href="/about"
                                className="inline-flex items-center justify-center px-8 py-3 border-2 border-primary bg-transparent text-primary hover:bg-primary/10 rounded-md font-medium transition-all"
                            >
                                Discover More
                            </Link>
                        </motion.div>
                    </motion.div>


                </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute top-20 right-20 w-64 h-64 border border-primary/10 rounded-full" />
            <div className="absolute bottom-40 left-10 w-32 h-32 border border-primary/10 rounded-full" />
        </section>
    );
};
