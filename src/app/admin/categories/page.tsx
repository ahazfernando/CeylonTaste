"use client";

import { useEffect, useState } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Search, Edit, Trash2, Tags, Coffee, Cake, Sandwich, Cookie } from "lucide-react";
import { useRouter } from "next/navigation";

const mockCategories = [
  { id: 1, name: "Pastries", description: "Fresh baked pastries including croissants, danish, and more", productCount: 15, icon: Cookie },
  { id: 2, name: "Coffee", description: "Premium coffee drinks and espresso-based beverages", productCount: 12, icon: Coffee },
  { id: 3, name: "Cakes", description: "Custom and ready-made cakes for all occasions", productCount: 8, icon: Cake },
  { id: 4, name: "Sandwiches", description: "Fresh sandwiches and wraps made to order", productCount: 6, icon: Sandwich },
];

export default function AdminCategoriesPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const token = typeof window !== 'undefined' ? localStorage.getItem('tt_token') : null;
    const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
    fetch("http://localhost:4000/api/auth/me", { credentials: "include", headers })
      .then(async (r) => (r.ok ? r.json() : Promise.reject()))
      .then((data) => {
        const role = data?.user?.role;
        if (!cancelled && role === "admin") setAuthorized(true);
        else router.replace("/");
      })
      .catch(() => { if (!cancelled) router.replace("/"); });
    return () => { cancelled = true; };
  }, [router]);

  async function handleLogout() {
    try { await fetch("http://localhost:4000/api/auth/logout", { method: "POST", credentials: "include" }); } finally {
      try { localStorage.removeItem('tt_token'); } catch {}
      router.replace("/");
    }
  }

  const [categories] = useState(mockCategories);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!authorized) {
    return (
      <div className="min-h-screen bg-gradient-cream">
        <div className="w-full bg-white/70 backdrop-blur border-b"><div className="container py-3" /></div>
        <main className="container py-8"><p className="text-muted-foreground">Checking access…</p></main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-cream">
      <div className="flex">
        <AdminSidebar />
        <div className="flex-1">
          <div className="w-full bg-white/70 backdrop-blur border-b">
            <div className="container flex items-center justify-end py-3">
              <Button className="bg-amber-800 text-white hover:bg-amber-700" onClick={handleLogout}>Logout</Button>
            </div>
          </div>

          <main className="container p-6 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Categories</h1>
                <p className="text-muted-foreground">Organize your products into categories</p>
              </div>

              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-primary hover:opacity-90 shadow-warm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Category
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle className="text-foreground">Add New Category</DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                      Create a new category to organize your products.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="categoryName" className="text-foreground">Category Name</Label>
                      <Input id="categoryName" placeholder="Enter category name" className="border-border" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="categoryDescription" className="text-foreground">Description</Label>
                      <Textarea id="categoryDescription" placeholder="Enter category description" className="border-border" />
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                      <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="border-border">Cancel</Button>
                      <Button className="bg-gradient-primary hover:opacity-90" onClick={() => setIsDialogOpen(false)}>Create Category</Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input placeholder="Search categories..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 border-border" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCategories.map((category) => {
                const IconComponent = category.icon as any;
                return (
                  <Card key={category.id} className="border-border shadow-warm hover:shadow-elegant transition-smooth group">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-accent group-hover:bg-gradient-primary transition-smooth">
                            <IconComponent className="h-6 w-6 text-accent-foreground" />
                          </div>
                          <div>
                            <CardTitle className="text-lg text-foreground">{category.name}</CardTitle>
                            <CardDescription className="text-muted-foreground">{category.productCount} products</CardDescription>
                          </div>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-smooth">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-secondary"><Edit className="h-4 w-4 text-muted-foreground" /></Button>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-destructive/10"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground">{category.description}</p>
                      <div className="flex items-center justify-between pt-2">
                        <div className="text-sm text-muted-foreground">{category.productCount} {category.productCount === 1 ? 'product' : 'products'}</div>
                        <Button variant="outline" size="sm" className="border-border hover:bg-secondary">View Products</Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {filteredCategories.length === 0 && (
              <div className="text-center py-12">
                <Tags className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No categories found</h3>
                <p className="text-muted-foreground">Try adjusting your search terms.</p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}


