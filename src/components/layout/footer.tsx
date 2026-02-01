import Link from "next/link";
import { Facebook, Instagram, Twitter, MapPin, Phone, Mail, Clock } from "lucide-react";
import Image from "next/image";
import primaryLogo from "@/assets/Home/CeylonTaste-Primary-2.png";
import { Separator } from "@/components/ui/separator";

export function Footer() {
    return (
        <footer className="bg-card border-t border-border">
            <div className="container mx-auto px-4 py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                    {/* Brand Column */}
                    <div className="space-y-6">
                        <Link href="/" className="inline-block mb-4">
                            <Image
                                src={primaryLogo.src}
                                alt="CeylonTaste Logo"
                                width={120}
                                height={120}
                                className="h-24 w-auto"
                            />
                        </Link>
                        <p className="text-muted-foreground leading-relaxed">
                            Experience culinary excellence in an atmosphere of refined elegance. Where every dish tells a story of passion and perfection.
                        </p>
                        <div className="flex space-x-4">
                            <SocialIcon href="#" icon={<Instagram size={20} />} />
                            <SocialIcon href="#" icon={<Facebook size={20} />} />
                            <SocialIcon href="#" icon={<Twitter size={20} />} />
                        </div>
                    </div>

                    {/* Explore Column */}
                    <div className="space-y-6">
                        <h4 className="text-lg font-semibold text-foreground">Explore</h4>
                        <ul className="space-y-3">
                            <FooterLink href="/" label="Home" />
                            <FooterLink href="/products" label="Menu" />
                            <FooterLink href="/about" label="About Us" />
                            <FooterLink href="/gallery" label="Gallery" />
                            <FooterLink href="/contact" label="Contact" />
                        </ul>
                    </div>

                    {/* Contact Column */}
                    <div className="space-y-6">
                        <h4 className="text-lg font-semibold text-foreground">Contact</h4>
                        <ul className="space-y-4">
                            <li className="flex items-start space-x-3 text-muted-foreground">
                                <MapPin className="w-5 h-5 text-primary shrink-0 mt-1" />
                                <span>123 Culinary Avenue, Food City, FC 10001</span>
                            </li>
                            <li className="flex items-center space-x-3 text-muted-foreground">
                                <Phone className="w-5 h-5 text-primary shrink-0" />
                                <span>+1 (555) 123-4567</span>
                            </li>
                            <li className="flex items-center space-x-3 text-muted-foreground">
                                <Mail className="w-5 h-5 text-primary shrink-0" />
                                <span>reservations@ceylontaste.com</span>
                            </li>
                        </ul>
                    </div>

                    {/* Hours Column */}
                    <div className="space-y-6">
                        <h4 className="text-lg font-semibold text-foreground">Hours</h4>
                        <div className="space-y-4">
                            <div className="space-y-1">
                                <div className="flex items-center space-x-2 text-foreground font-medium">
                                    <Clock className="w-4 h-4 text-primary" />
                                    <span>Lunch</span>
                                </div>
                                <p className="text-muted-foreground pl-6">Tue - Sun: 12:00 PM - 3:00 PM</p>
                            </div>
                            <div className="space-y-1">
                                <div className="flex items-center space-x-2 text-foreground font-medium">
                                    <Clock className="w-4 h-4 text-primary" />
                                    <span>Dinner</span>
                                </div>
                                <p className="text-muted-foreground pl-6">Tue - Sun: 6:00 PM - 11:00 PM</p>
                            </div>
                        </div>
                    </div>
                </div>

                <Separator className="my-8" />

                <div className="flex flex-col md:flex-row justify-between items-center text-sm text-muted-foreground">
                    <p>&copy; {new Date().getFullYear()} Ceylon Taste. All rights reserved.</p>
                    <div className="flex space-x-6 mt-4 md:mt-0">
                        <Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
                        <Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link>
                        <Link href="/cookies" className="hover:text-primary transition-colors">Cookie Policy</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}

function SocialIcon({ href, icon }: { href: string; icon: React.ReactNode }) {
    return (
        <Link
            href={href}
            className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:bg-accent hover:text-primary hover:border-border transition-all duration-300"
        >
            {icon}
        </Link>
    );
}

function FooterLink({ href, label }: { href: string; label: string }) {
    return (
        <li>
            <Link
                href={href}
                className="text-muted-foreground hover:text-primary hover:translate-x-1 transition-all duration-300 inline-block"
            >
                {label}
            </Link>
        </li>
    );
}
