"use client";

import { useState, useRef, useEffect } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { productService, Product } from '@/lib/products';

function FeaturedDishesContent({ dishes }: { dishes: Product[] }) {
    const [activeIndex, setActiveIndex] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"]
    });

    const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);

    return (
        <section ref={containerRef} className="relative py-32 bg-white overflow-hidden">
            {/* Animated Background Pattern */}
            <motion.div
                style={{ y: backgroundY }}
                className="absolute inset-0 opacity-5 pointer-events-none"
            >
                <div className="absolute inset-0" style={{
                    backgroundImage: `radial-gradient(circle at 2px 2px, #d97706 1px, transparent 0)`,
                    backgroundSize: '40px 40px'
                }} />
            </motion.div>

            <div className="container mx-auto px-4 relative z-10">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="text-center mb-20"
                >
                    <motion.div
                        initial={{ scaleX: 0 }}
                        whileInView={{ scaleX: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="h-px w-32 bg-amber-600 mx-auto mb-8"
                    />
                    <motion.span
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="text-amber-600 tracking-[0.4em] uppercase text-xs font-bold"
                    >
                        Signature Creations
                    </motion.span>
                    <motion.h2
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 }}
                        className="font-serif text-5xl md:text-6xl lg:text-7xl text-gray-900 mt-6"
                    >
                        Featured <span className="italic text-amber-600">Dishes</span>
                    </motion.h2>
                </motion.div>

                {/* 3D Stacked Cards Layout */}
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    {/* Left: Card Stack */}
                    <div className="relative h-[500px] perspective-1000 group-perspective">
                        <AnimatePresence mode="popLayout">
                            {dishes.map((dish, index) => {
                                const isActive = index === activeIndex;
                                const offset = index - activeIndex;

                                return (
                                    <motion.div
                                        key={dish.id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.8, rotateY: -15 }}
                                        animate={{
                                            opacity: isActive ? 1 : 0.3,
                                            scale: isActive ? 1 : 0.9 - Math.abs(offset) * 0.05,
                                            x: offset * 30,
                                            y: offset * 20,
                                            z: isActive ? 0 : -100,
                                            rotateY: isActive ? 0 : offset * 5,
                                        }}
                                        exit={{ opacity: 0, scale: 0.8 }}
                                        transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
                                        className={`absolute inset-0 cursor-pointer ${isActive ? 'z-30' : 'z-10'}`}
                                        onClick={() => setActiveIndex(index)}
                                        style={{
                                            transformStyle: 'preserve-3d',
                                            perspective: '1000px'
                                        }}
                                    >
                                        <div className="relative h-full rounded-2xl overflow-hidden shadow-2xl bg-white border border-gray-100">
                                            <img
                                                src={dish.image}
                                                alt={dish.name}
                                                className="w-full h-full object-cover"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />

                                            {/* Shine Effect */}
                                            <motion.div
                                                className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent"
                                                initial={{ x: '-100%', opacity: 0 }}
                                                whileHover={{ x: '100%', opacity: 1 }}
                                                transition={{ duration: 0.8 }}
                                            />

                                            {/* Price Badge */}
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: isActive ? 1 : 0 }}
                                                className="absolute top-6 right-6 bg-white/90 backdrop-blur-md text-amber-800 px-4 py-2 rounded-full font-serif text-lg font-bold shadow-lg border border-amber-100"
                                            >
                                                ${dish.price}
                                            </motion.div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>

                    {/* Right: Info Panel */}
                    <div className="relative">
                        <AnimatePresence mode="wait">
                            {dishes[activeIndex] && (
                                <motion.div
                                    key={activeIndex}
                                    initial={{ opacity: 0, x: 50 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -50 }}
                                    transition={{ duration: 0.5 }}
                                    className="space-y-8"
                                >
                                    {/* Dish Number */}
                                    <div className="flex items-center gap-4">
                                        <span className="text-8xl font-serif text-amber-100 font-bold">
                                            0{activeIndex + 1}
                                        </span>
                                        <div className="h-px flex-1 bg-gradient-to-r from-amber-200 to-transparent" />
                                    </div>

                                    {/* Dish Name */}
                                    <h3 className="font-serif text-4xl md:text-5xl text-gray-900">
                                        {dishes[activeIndex].name}
                                    </h3>

                                    {/* Description */}
                                    <p className="text-gray-600 text-lg leading-relaxed">
                                        {dishes[activeIndex].description}
                                    </p>

                                    {/* Meta Info */}
                                    <div className="grid grid-cols-2 gap-6 pt-4 border-t border-gray-100">
                                        <div>
                                            <span className="text-xs text-amber-600 tracking-widest uppercase font-semibold">Category</span>
                                            <p className="text-gray-900 mt-1">{dishes[activeIndex].category}</p>
                                        </div>
                                        <div>
                                            <span className="text-xs text-amber-600 tracking-widest uppercase font-semibold">Status</span>
                                            <p className="text-gray-900 mt-1">{dishes[activeIndex].status || 'Available'}</p>
                                        </div>
                                    </div>

                                    {/* Navigation Dots */}
                                    <div className="flex gap-3 pt-8">
                                        {dishes.map((_, index) => (
                                            <button
                                                key={index}
                                                onClick={() => setActiveIndex(index)}
                                                className={`relative h-1 transition-all duration-500 rounded-full overflow-hidden ${index === activeIndex ? 'w-12 bg-amber-600' : 'w-6 bg-gray-200 hover:bg-amber-300'
                                                    }`}
                                            >
                                                {index === activeIndex && (
                                                    <motion.div
                                                        layoutId="activeDot"
                                                        className="absolute inset-0 bg-amber-600"
                                                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                                    />
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </section>
    );
}

export function FeaturedDishes() {
    const [featuredDishes, setFeaturedDishes] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const allProducts = await productService.getAllProducts();
                const featured = allProducts.filter(p => p.isFeatured);
                const productsToshow = featured.length >= 3 ? featured.slice(0, 3) : allProducts.slice(0, 3);
                setFeaturedDishes(productsToshow);
            } catch (error) {
                console.error("Failed to fetch featured dishes:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    if (loading) {
        return <div className="py-32 bg-white text-center">Loading featured dishes...</div>;
    }

    if (featuredDishes.length === 0) {
        return null;
    }

    return <FeaturedDishesContent dishes={featuredDishes} />;
}
