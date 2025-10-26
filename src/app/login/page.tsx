"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Eye, EyeOff, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import primaryLogo from "@/assets/Home/CeylonTaste-Primary-2.png";
import loginCouple from "@/assets/Login/login-couple.jpg";
import loginFamily from "@/assets/Login/login-family.jpg";
import { FirebaseAuthService } from "@/lib/auth-firebase";

const carouselImages = [
  {
    src: loginCouple,
    alt: "Couple enjoying Ceylon Taste",
    title: "Share the Taste",
    description: "Experience authentic Sri Lankan flavors with your loved ones"
  },
  {
    src: loginFamily,
    alt: "Family enjoying Ceylon Taste",
    title: "Family Traditions",
    description: "Bringing generations together through traditional recipes"
  }
];

export default function Login() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin() {
    try {
      setError(null);
      setLoading(true);
      
      // Use Firebase authentication
      const user = await FirebaseAuthService.signIn(email, password);
      
      // Store user data in localStorage
      if (user) {
        try { 
          localStorage.setItem('user', JSON.stringify(user));
        } catch {}
      }
      
      // Redirect based on role
      if (user.role === "admin") {
        router.push("/admin/dashboard");
      } else {
        router.push("/");
      }
    } catch (e: any) {
      setError(e?.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  }

  // Auto-advance carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + carouselImages.length) % carouselImages.length);
  };

  return (
    <div className="min-h-screen bg-orange-50">
      <main className="container flex items-center justify-center min-h-screen py-8 px-4">
        <div className="flex flex-col lg:flex-row w-full max-w-[980px] bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Left Side - Image Carousel */}
          <div className="lg:w-[486px] p-6 lg:p-0 lg:pl-6 lg:py-6">
            <div className="w-full h-full rounded-3xl overflow-hidden relative min-h-[400px] lg:min-h-[500px] group">
              {/* Image Container */}
              <div className="relative w-full h-full">
                {carouselImages.map((image, index) => (
                  <div
                    key={index}
                    className={`absolute inset-0 transition-opacity duration-500 ${
                      index === currentSlide ? 'opacity-100' : 'opacity-0'
                    }`}
                  >
                    <Image
                      src={image.src}
                      alt={image.alt}
                      fill
                      className="object-cover"
                      priority={index === 0}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-8 text-white">
                      <div className="space-y-6">
                        <div className="bg-black/15 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                          <p className="text-lg leading-relaxed mb-4">
                            "The espresso here is absolutely phenomenal! Rich, bold flavor with perfect crema. The baristas really know their craft - every cup is consistently excellent."
                          </p>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium">BG</span>
                            </div>
                            <div>
                              <p className="font-medium">Billy Grayson</p>
                              <p className="text-sm text-white/80">Creative Director</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Navigation Arrows */}
              <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all duration-200 opacity-0 group-hover:opacity-100"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all duration-200 opacity-0 group-hover:opacity-100"
                aria-label="Next image"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              {/* Dots Indicator */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                {carouselImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`w-2 h-2 rounded-full transition-all duration-200 ${
                      index === currentSlide ? 'bg-white w-6' : 'bg-white/50'
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="flex-1 p-6 lg:p-8 flex items-center justify-center">
            <Card className="w-full max-w-md border-0 shadow-none bg-transparent">
              <CardHeader className="text-center space-y-4">
                <div className="flex items-center justify-start mb-2">
                  <Image
                    src={primaryLogo}
                    alt="CeylonTaste Logo"
                    width={120}
                    height={120}
                    className="h-20 w-auto"
                  />
                </div>
                <CardTitle className="text-3xl lg:text-4xl font-bold text-[#1E130B] text-start">
                  Welcome, Back!
                </CardTitle>
                <CardDescription className="text-[#1E130B] text-start">
                  Login to your CeylonTaste account to continue your royal experience
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4 lg:space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-[#1E130B]">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="Enter your email"
                    className="px-4 py-3 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-[#1E130B]">Password</Label>
                  <div className="relative">
                    <Input 
                      id="password" 
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      className="px-4 py-3 pr-12 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-3 top-1/2 -translate-y-1/2 h-7 w-7 text-gray-500 hover:text-gray-700"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 bg-white/50 border-gray-200 rounded"
                    />
                    <span className="text-[#B37142]">Remember me</span>
                  </label>
                  <Link 
                    href="/forgot-password" 
                    className="text-[#B37142] hover:text-orange-700 font-medium"
                  >
                    Forgot password?
                  </Link>
                </div>
              </CardContent>

              <CardFooter className="flex flex-col space-y-4">
                {error ? (<p className="text-sm text-red-600">{error}</p>) : null}
                <Button onClick={handleLogin} disabled={loading} className="w-full py-3 bg-[#B37142] text-white font-medium rounded-xl hover:from-orange-600 hover:to-orange-700 focus:ring-1 focus:ring-offset-2 transform hover:scale-105 transition-all duration-200 shadow-lg">
                  {loading ? "Signing In..." : "Sign In"}
                </Button>

                <Separator className="bg-gray-300/50" />

                <p className="text-center text-sm text-gray-600">
                  Don't have an account?{" "}
                  <Link 
                    href="/signup" 
                    className="text-[#B37142] hover:text-orange-700 font-medium"
                  >
                    Sign up
                  </Link>
                </p>
              </CardFooter>
            </Card>
          </div>
        </div>

        {/* Promotional Notice */}
        <div className="fixed bottom-4 right-4 max-w-sm p-4 bg-white/20 backdrop-blur-lg border border-white/30 rounded-2xl shadow-xl">
          <h4 className="font-semibold mb-1 text-sm text-gray-800">Get 10% Off</h4>
          <p className="text-xs text-gray-600">
            Get 5% Off purchase made over LKR 1000 and 10% off on purchases made over LKR 1500 with Ceylon Taste.
          </p>
        </div>
      </main>
    </div>
  );
}