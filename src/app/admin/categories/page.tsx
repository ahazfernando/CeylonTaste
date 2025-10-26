"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Plus, Search, Edit, Trash2, Tags } from "lucide-react";
import { useState, useEffect } from "react";
import { CategoryListSkeleton } from "@/components/skeletons/category-skeleton";

type Category = { id: string; name: string; description: string };

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editFormData, setEditFormData] = useState({ name: "", description: "" });
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

  const filteredCategories = categories.filter(category =>
    category?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (category?.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('tt_token') : null;
    const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
    fetch('http://localhost:4000/api/categories', { headers })
      .then((r) => r.json())
      .then((data) => {
        const rows: Category[] = (data?.categories || []).map((c: any) => ({ id: c._id || c.id, name: c.name || '', description: c.description || '' }));
        setCategories(rows);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleDelete(id: string) {
    const category = categories.find(c => c.id === id);
    if (category) {
      setCategoryToDelete(category);
      setIsDeleteDialogOpen(true);
    }
  }

  async function confirmDelete() {
    if (!categoryToDelete) return;
    
    const token = typeof window !== 'undefined' ? localStorage.getItem('tt_token') : null;
    const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
    const res = await fetch(`http://localhost:4000/api/categories/${categoryToDelete.id}`, { method: 'DELETE', headers, credentials: 'include' });
    if (res.ok) {
      setCategories((prev) => prev.filter((c) => c.id !== categoryToDelete.id));
    }
    setIsDeleteDialogOpen(false);
    setCategoryToDelete(null);
  }

  async function handleUpdate(id: string) {
    const category = categories.find(c => c.id === id);
    if (category) {
      setEditingCategory(category);
      setEditFormData({ name: category.name, description: category.description });
      setIsEditDialogOpen(true);
    }
  }

  async function handleEditSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingCategory || !editFormData.name.trim()) return;
    
    const token = typeof window !== 'undefined' ? localStorage.getItem('tt_token') : null;
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    
    const res = await fetch(`http://localhost:4000/api/categories/${editingCategory.id}`, { 
      method: 'PATCH', 
      headers, 
      credentials: 'include', 
      body: JSON.stringify({ name: editFormData.name.trim(), description: editFormData.description.trim() }) 
    });
    
    if (res.ok) {
      const data = await res.json();
      setCategories((prev) => prev.map((c) => (c.id === editingCategory.id ? { id: editingCategory.id, name: data.category.name, description: data.category.description } : c)));
      setIsEditDialogOpen(false);
      setEditingCategory(null);
      setEditFormData({ name: "", description: "" });
    }
  }

  return (
    <main className="container p-6 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Categories</h1>
                <p className="text-muted-foreground">Organize your products into categories</p>
              </div>

              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-amber-800 hover:bg-amber-700 text-white shadow-lg font-semibold">
                    <Plus className="h-4 w-4 mr-2 text-white" />
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
                    <form id="createCategoryForm" onSubmit={async (e) => {
                      e.preventDefault();
                      const form = e.currentTarget as HTMLFormElement;
                      const formData = new FormData(form);
                      const name = String(formData.get('categoryName') || '').trim();
                      const description = String(formData.get('categoryDescription') || '').trim();
                      if (!name) return;
                      const token = typeof window !== 'undefined' ? localStorage.getItem('tt_token') : null;
                      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
                      if (token) headers['Authorization'] = `Bearer ${token}`;
                      const res = await fetch('http://localhost:4000/api/categories', {
                        method: 'POST',
                        headers,
                        credentials: 'include',
                        body: JSON.stringify({ name, description })
                      });
                      if (res.ok) {
                        const data = await res.json();
                        setCategories((prev) => [{ id: String(data.category.id), name: data.category.name, description: data.category.description }, ...prev]);
                        setIsDialogOpen(false);
                        form.reset();
                      } else {
                        // Optionally show error
                      }
                    }}>
                    <div className="space-y-2">
                      <Label htmlFor="categoryName" className="text-foreground">Category Name</Label>
                      <Input name="categoryName" id="categoryName" placeholder="Enter category name" className="border-border" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="categoryDescription" className="text-foreground">Description</Label>
                      <Textarea name="categoryDescription" id="categoryDescription" placeholder="Enter category description" className="border-border" />
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                      <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="border-border">Cancel</Button>
                      <Button type="submit" form="createCategoryForm" className="bg-amber-800 hover:bg-amber-700 text-white shadow-lg font-semibold">Create Category</Button>
                    </div>
                    </form>
                  </div>
                </DialogContent>
              </Dialog>

              {/* Edit Category Modal */}
              <Dialog open={isEditDialogOpen} onOpenChange={(open) => {
                setIsEditDialogOpen(open);
                if (!open) {
                  setEditingCategory(null);
                  setEditFormData({ name: "", description: "" });
                }
              }}>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle className="text-foreground flex items-center gap-2">
                      <Edit className="h-5 w-5 text-amber-800" />
                      Edit Category
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                      Update category information and description.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <form onSubmit={handleEditSubmit}>
                      <div className="space-y-2">
                        <Label htmlFor="editCategoryName" className="text-foreground">Category Name</Label>
                        <Input 
                          id="editCategoryName" 
                          value={editFormData.name}
                          onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
                          placeholder="Enter category name" 
                          className="border-border" 
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="editCategoryDescription" className="text-foreground">Description</Label>
                        <Textarea 
                          id="editCategoryDescription" 
                          value={editFormData.description}
                          onChange={(e) => setEditFormData({...editFormData, description: e.target.value})}
                          placeholder="Enter category description" 
                          className="border-border" 
                        />
                      </div>
                      <div className="flex justify-end gap-3 pt-4">
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setIsEditDialogOpen(false)} 
                          className="border-border"
                        >
                          Cancel
                        </Button>
                        <Button 
                          type="submit" 
                          className="bg-amber-800 hover:bg-amber-700 text-white shadow-lg font-semibold"
                        >
                          Update Category
                        </Button>
                      </div>
                    </form>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input placeholder="Search categories..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 border-border" />
            </div>

            {loading ? (
              <CategoryListSkeleton count={6} />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCategories.map((category) => {
                  return (
                  <Card key={category.id} className="border-border shadow-warm hover:shadow-elegant transition-smooth group">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div>
                            <CardTitle className="text-lg text-foreground">{category.name}</CardTitle>
                            <CardDescription className="text-muted-foreground">{category.description}</CardDescription>
                          </div>
                        </div>
                        <div className="flex gap-1 opacity-100 transition-smooth">
                          <Button onClick={() => handleUpdate(category.id)} variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-amber-100"><Edit className="h-4 w-4 text-amber-800" /></Button>
                          <Button onClick={() => handleDelete(category.id)} variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-red-100"><Trash2 className="h-4 w-4 text-red-600" /></Button>
                        </div>
                      </div>
                    </CardHeader>
                    
                    </Card>
                  );
                })}
              </div>
            )}

            {!loading && filteredCategories.length === 0 && (
              <div className="text-center py-12">
                <Tags className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No categories found</h3>
                <p className="text-muted-foreground">Try adjusting your search terms.</p>
              </div>
            )}

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete the category <strong>"{categoryToDelete?.name}"</strong>? This action cannot be undone and will remove all products in this category.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={confirmDelete}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    Delete Category
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
    </main>
  );
}


