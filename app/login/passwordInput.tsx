"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";

export default function PasswordInput() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative">
      <Input 
        id="password" 
        type={showPassword ? "text" : "password"}
        placeholder="Enter your password"
        className="px-4 py-3 pr-12 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
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
  );
}