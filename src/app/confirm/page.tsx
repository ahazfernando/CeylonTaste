"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import primaryLogo from "@/assets/Home/CeylonTaste-Primary-2.png";
import { apiAuthService } from "@/lib/auth";

export default function ConfirmPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fromQuery = searchParams.get("email");
    if (fromQuery) setEmail(fromQuery);
  }, [searchParams]);

  async function handleConfirm() {
    if (!email.trim() || !code.trim()) {
      setError("Please enter your email and the 6-digit code.");
      return;
    }
    try {
      setError(null);
      setLoading(true);
      await apiAuthService.confirmSignUp(email.trim(), code.trim());
      setSuccess(true);
      setTimeout(() => router.push("/login"), 2000);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Confirmation failed.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    if (!email.trim()) {
      setError("Please enter your email first.");
      return;
    }
    try {
      setError(null);
      setResendLoading(true);
      await apiAuthService.resendConfirmationCode(email.trim());
      setError(null);
      setSuccess(false);
      alert("A new code has been sent to your email.");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to resend code.";
      setError(msg);
    } finally {
      setResendLoading(false);
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-orange-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-[#1E130B]">Email confirmed</CardTitle>
            <CardDescription className="text-[#1E130B]">
              Your account is active. Redirecting you to sign in...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-orange-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="border-0 shadow-2xl bg-white">
          <CardHeader className="space-y-2">
            <div className="flex justify-center mb-2">
              <Image
                src={primaryLogo}
                alt="CeylonTaste Logo"
                width={100}
                height={100}
                className="h-16 w-auto"
              />
            </div>
            <CardTitle className="text-2xl font-bold text-[#1E130B] text-center">
              Confirm your email
            </CardTitle>
            <CardDescription className="text-[#1E130B] text-center">
              Enter the 6-digit code we sent to your email.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-[#1E130B]">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                className="bg-white border-gray-200 text-gray-900 placeholder:text-gray-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="code" className="text-sm font-medium text-[#1E130B]">
                Verification code
              </Label>
              <Input
                id="code"
                type="text"
                placeholder="000000"
                maxLength={6}
                className="bg-white border-gray-200 text-gray-900 placeholder:text-gray-500 font-mono text-lg tracking-widest"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              />
            </div>
            {error ? (
              <p className="text-sm text-red-600">{error}</p>
            ) : null}
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Button
              onClick={handleConfirm}
              disabled={loading}
              className="w-full py-3 bg-[#B37142] text-white font-medium rounded-xl hover:bg-orange-600"
            >
              {loading ? "Confirming..." : "Confirm"}
            </Button>
            <Button
              variant="ghost"
              onClick={handleResend}
              disabled={resendLoading}
              className="w-full text-[#B37142] hover:text-orange-700 hover:bg-orange-50"
            >
              {resendLoading ? "Sending..." : "Resend code"}
            </Button>
            <p className="text-center text-sm text-gray-600">
              <Link href="/login" className="text-[#B37142] hover:text-orange-700 font-medium">
                Back to sign in
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
