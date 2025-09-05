import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Crown, Coffee, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-cream">
      <main className="container flex items-center justify-center min-h-screen py-8">
        <Card className="w-full max-w-md shadow-coffee">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Crown className="h-8 w-8 text-accent" />
              <Coffee className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl bg-gradient-coffee bg-clip-text text-transparent">
              Welcome Back
            </CardTitle>
            <CardDescription>
              Sign in to your CeylonTaste account to continue your royal experience
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="Enter your email"
                className="bg-background"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input 
                  id="password" 
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  className="bg-background pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7"
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
                <input type="checkbox" className="rounded border-border" />
                Remember me
              </label>
              <Link 
                to="/forgot-password" 
                className="text-accent hover:text-accent/80 font-medium"
              >
                Forgot password?
              </Link>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <Button className="w-full bg-gradient-coffee text-white hover:opacity-90 shadow-warm">
              Sign In
            </Button>

            <Separator />

            <p className="text-center text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link 
                to="/signup" 
                className="text-accent hover:text-accent/80 font-medium"
              >
                Sign up
              </Link>
            </p>
          </CardFooter>
        </Card>

        {/* Supabase Integration Notice */}
        <div className="fixed bottom-4 right-4 max-w-sm p-4 bg-card border border-accent/20 rounded-lg shadow-warm">
          <h4 className="font-semibold mb-1 text-sm">Get 10% Off</h4>
          <p className="text-xs text-muted-foreground">
            Get 5% Off purchase made over LKR 1000 and 10% off on purchases made over LKR 1500 with Ceylon Taste. 
          </p>
        </div>
      </main>
    </div>
  );
}