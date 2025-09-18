"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AdminSettingsPlaceholder() {
  return (
    <main className="container p-6 space-y-6">
      <h1 className="text-3xl font-bold">Settings (Coming Soon)</h1>
      <Card className="max-w-lg"><CardHeader><CardTitle>Store Information</CardTitle></CardHeader><CardContent className="space-y-4"><div className="space-y-2"><Label htmlFor="storeName">Store Name</Label><Input id="storeName" placeholder="Ceylon Taste"/></div><div className="space-y-2"><Label htmlFor="contactEmail">Contact Email</Label><Input id="contactEmail" placeholder="contact@example.com"/></div><Button className="bg-gradient-primary">Save</Button></CardContent></Card>
    </main>
  );
}


