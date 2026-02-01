"use client";

import { useRef } from 'react';
import { motion, useScroll } from 'framer-motion';

const milestones = [
    {
        year: '2014',
        title: 'The Beginning',
        description: 'We started as a small tech retailer with a simple goal: make quality devices and gear accessible to everyone.'
    },
    {
        year: '2017',
        title: 'E-Commerce Launch',
        description: 'Launched our online store, bringing smartphones, gaming gear, and audio to customers nationwide.'
    },
    {
        year: '2020',
        title: 'Expanded Catalog',
        description: 'Grew our range to include consoles, smart devices, and accessories from leading brands.'
    },
    {
        year: '2022',
        title: 'Customer-First Focus',
        description: 'Introduced extended warranties, easy returns, and 24/7 support to put customers first.'
    },
    {
        year: '2024',
        title: 'Tech Hub Today',
        description: 'Recognized as a trusted destination for devices, gaming, and audio—one place for the tech you need.'
    }
];

export const TimelineSection = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"]
    });

    return (
        <section ref={containerRef} className="py-24 bg-card overflow-hidden">
            <div className="container mx-auto px-4">
                <div className="text-center mb-20">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-6"
                    >
                        Our Journey
                    </motion.h2>
                    <div className="h-1 w-20 bg-primary mx-auto rounded-full" />
                </div>

                <div className="relative max-w-4xl mx-auto">
                    {/* Central Line */}
                    <div className="absolute left-1/2 ml-[-1px] w-0.5 h-full bg-border" />

                    {milestones.map((milestone, index) => (
                        <motion.div
                            key={milestone.year}
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ delay: index * 0.1 }}
                            className={`relative flex items-center justify-between mb-12 last:mb-0 ${index % 2 === 0 ? 'flex-row-reverse' : ''
                                }`}
                        >
                            {/* Content Side */}
                            <div className="w-[calc(50%-2rem)]">
                                <div className={`bg-background p-6 rounded-xl border border-border  ${index % 2 === 0 ? 'text-left' : 'text-right'
                                    }`}>
                                    <span className="text-4xl font-serif font-bold text-primary/20 block mb-2">{milestone.year}</span>
                                    <h3 className="text-xl font-bold text-foreground mb-2">{milestone.title}</h3>
                                    <p className="text-muted-foreground">{milestone.description}</p>
                                </div>
                            </div>

                            {/* Center Dot */}
                            <div className="absolute left-1/2 ml-[-8px] w-4 h-4 rounded-full bg-primary border-4 border-background shadow-sm z-10" />

                            {/* Empty Side */}
                            <div className="w-[calc(50%-2rem)]" />
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};
