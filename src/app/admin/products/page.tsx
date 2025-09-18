"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Search, Edit, Trash2, Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

const mockProducts = [
  { id: 1, name: "Chocolate Croissant", category: "Pastries", price: 4.25, stock: 24, status: "active", description: "Buttery croissant filled with rich dark chocolate" },
  { id: 2, name: "Cappuccino", category: "Coffee", price: 5.50, stock: 0, status: "active", description: "Classic Italian coffee with steamed milk foam" },
  { id: 3, name: "Red Velvet Cake", category: "Cakes", price: 28.00, stock: 8, status: "active", description: "Moist red velvet cake with cream cheese frosting" },
  { id: 4, name: "Blueberry Muffin", category: "Pastries", price: 3.75, stock: 15, status: "active", description: "Fresh baked muffin loaded with juicy blueberries" },
];

function StockBadge({ stock }: { stock: number }) {
  if (stock === 0) return <Badge variant="destructive">Out of Stock</Badge>;
  if (stock < 10) return <Badge className="bg-warning text-warning-foreground">Low Stock</Badge>;
  return <Badge className="bg-success text-success-foreground">In Stock</Badge>;
}

export default function AdminProductsPage() {
  const [products] = useState(mockProducts);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <main className="container p-6 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Products</h1>
                <p className="text-muted-foreground">Manage your bakery and cafe products</p>
              </div>

              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-primary hover:opacity-90 shadow-warm"><Plus className="h-4 w-4 mr-2" />Add Product</Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle className="text-foreground">Add New Product</DialogTitle>
                    <DialogDescription className="text-muted-foreground">Create a new product for your bakery or cafe.</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-foreground">Product Name</Label>
                      <Input id="name" placeholder="Enter product name" className="border-border" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category" className="text-foreground">Category</Label>
                      <Select>
                        <SelectTrigger className="border-border"><SelectValue placeholder="Select category" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Pastries">Pastries</SelectItem>
                          <SelectItem value="Coffee">Coffee</SelectItem>
                          <SelectItem value="Cakes">Cakes</SelectItem>
                          <SelectItem value="Sandwiches">Sandwiches</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2"><Label htmlFor="price" className="text-foreground">Price</Label><Input id="price" type="number" placeholder="0.00" className="border-border" /></div>
                      <div className="space-y-2"><Label htmlFor="stock" className="text-foreground">Stock</Label><Input id="stock" type="number" placeholder="0" className="border-border" /></div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description" className="text-foreground">Description</Label>
                      <Textarea id="description" placeholder="Enter product description" className="border-border" />
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                      <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="border-border">Cancel</Button>
                      <Button className="bg-gradient-primary hover:opacity-90" onClick={() => setIsDialogOpen(false)}>Create Product</Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input placeholder="Search products..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 border-border" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <Card key={product.id} className="border-border shadow-warm hover:shadow-elegant transition-smooth">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-accent">
                          <Package className="h-6 w-6 text-accent-foreground" />
                        </div>
                        <div>
                          <CardTitle className="text-lg text-foreground">{product.name}</CardTitle>
                          <CardDescription className="text-muted-foreground">{product.category}</CardDescription>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-secondary"><Edit className="h-4 w-4 text-muted-foreground" /></Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-destructive/10"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">{product.description}</p>
                    <div className="flex items-center justify-between"><span className="text-2xl font-bold text-foreground">${product.price}</span><StockBadge stock={product.stock} /></div>
                    <div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">Stock: {product.stock} units</span><Button variant="outline" size="sm" className="border-border hover:bg-secondary">View Details</Button></div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-12"><Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" /><h3 className="text-lg font-medium text-foreground mb-2">No products found</h3><p className="text-muted-foreground">Try adjusting your search terms.</p></div>
            )}
    </main>
  );
}


