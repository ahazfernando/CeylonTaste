"use client";

import { motion } from 'framer-motion';
import { Instagram, Twitter, Linkedin } from 'lucide-react';
import Image from 'next/image';

// Placeholder images - using the couple hero as one of them for now
import chef from '@/assets/couple-hero.jpg';
import sousChef from '@/assets/hero-coffee-shop.jpg';

const team = [
    {
        name: 'Marcus Chen',
        role: 'CEO & Co-founder',
        image: chef,
        bio: 'With over 15 years in tech and retail, Marcus leads our mission to make great devices and gear accessible to everyone.',
        social: { instagram: '#', twitter: '#', linkedin: '#' }
    },
    {
        name: 'Elena Rodriguez',
        role: 'Head of Product',
        image: sousChef,
        bio: 'Elena curates our catalog of devices and accessories, ensuring quality, value, and the latest tech for our customers.',
        social: { instagram: '#', twitter: '#', linkedin: '#' }
    },
    {
        name: 'David Wright',
        role: 'Head of Customer Experience',
        image: chef,
        bio: 'David leads support, returns, and warranties so every customer gets a smooth experience from order to delivery.',
        social: { instagram: '#', twitter: '#', linkedin: '#' }
    }
];

export const TeamSection = () => {
    return (
        <section className="py-24 bg-background">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <motion.span
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-primary text-sm tracking-widest uppercase font-semibold"
                    >
                        The Team
                    </motion.span>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-5xl font-serif font-bold text-foreground mt-4 mb-6"
                    >
                        Meet the People Behind the Tech
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="text-muted-foreground max-w-2xl mx-auto"
                    >
                        Our team is passionate about bringing you the best devices, gaming gear, and accessories—with support you can count on.
                    </motion.p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {team.map((member, index) => (
                        <motion.div
                            key={member.name}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="group relative"
                        >
                            <div className="relative aspect-[3/4] overflow-hidden rounded-xl mb-6">
                                <Image
                                    src={member.image}
                                    alt={member.name}
                                    fill
                                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-8">
                                    <div className="flex gap-4">
                                        <SocialLink icon={<Instagram size={20} />} href={member.social.instagram} />
                                        <SocialLink icon={<Twitter size={20} />} href={member.social.twitter} />
                                        <SocialLink icon={<Linkedin size={20} />} href={member.social.linkedin} />
                                    </div>
                                </div>
                            </div>

                            <div className="text-center">
                                <h3 className="text-xl font-serif font-bold text-foreground">{member.name}</h3>
                                <p className="text-primary text-sm font-medium mb-3">{member.role}</p>
                                <p className="text-muted-foreground text-sm leading-relaxed">{member.bio}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

const SocialLink = ({ icon, href }: { icon: React.ReactNode, href: string }) => (
    <a
        href={href}
        className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-accent hover:text-accent-foreground transition-all"
    >
        {icon}
    </a>
);
