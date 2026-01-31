"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Plus, Search, Edit, Trash2, Package, Upload, X, Image as ImageIcon, Filter } from "lucide-react";
import { productService, imageUploadService, Product } from "@/lib/products";
import { getImageUrl } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { ProductListSkeleton } from "@/components/skeletons/product-skeleton";

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<{id: string; name: string; description: string}[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isViewDetailsOpen, setIsViewDetailsOpen] = useState(false);
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    availability: "Available",
    category: "",
    image: "",
    isNewProduct: false,
    isFeatured: false,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load products and categories from AWS API on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const [productsData, categoriesList] = await Promise.all([
          productService.getAllProducts(),
          productService.getCategoriesList(),
        ]);
        setProducts(productsData);
        setCategories(categoriesList);
      } catch (error) {
        console.error('Failed to load data:', error);
        toast({
          title: "Error",
          description: "Failed to load products and categories",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      availability: "Available",
      category: "",
      image: "",
      isNewProduct: false,
      isFeatured: false,
    });
    setImageFile(null);
    setImagePreview("");
    setIsEditing(false);
    setEditingProduct(null);
    setViewingProduct(null);
    // Reset the file input
    const fileInput = document.getElementById('image-upload') as HTMLInputElement;
    const viewFileInput = document.getElementById('view-image-upload') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
    if (viewFileInput) {
      viewFileInput.value = '';
    }
  };

  // Get unique categories from products
  const productCategories = ["All", ...Array.from(new Set(products.map(p => p.category)))];

  // Filter and sort products
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  }).sort((a, b) => {
    switch (sortBy) {
      case "newest":
        // Sort by isNewProduct flag first, then by ID (assuming newer products have higher IDs)
        if (a.isNewProduct !== b.isNewProduct) {
          return (b.isNewProduct ? 1 : 0) - (a.isNewProduct ? 1 : 0);
        }
        return (b.id || '').localeCompare(a.id || '');
      case "oldest":
        // Sort by isNewProduct flag first, then by ID (assuming older products have lower IDs)
        if (a.isNewProduct !== b.isNewProduct) {
          return (a.isNewProduct ? 1 : 0) - (b.isNewProduct ? 1 : 0);
        }
        return (a.id || '').localeCompare(b.id || '');
      case "price-low":
        return a.price - b.price;
      case "price-high":
        return b.price - a.price;
      case "name-asc":
        return a.name.localeCompare(b.name);
      case "name-desc":
        return b.name.localeCompare(a.name);
      default:
        return 0;
    }
  });

  // Pagination logic
  const productsPerPage = 10;
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const startIndex = (currentPage - 1) * productsPerPage;
  const endIndex = startIndex + productsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, sortBy]);

  const getAvailabilityBadge = (availability: string) => {
    switch (availability) {
      case 'Available':
        return <Badge className="bg-green-500 text-white">Available</Badge>;
      case 'Unavailable':
        return <Badge variant="destructive">Unavailable</Badge>;
      case 'In House Only':
        return <Badge className="bg-orange-500 text-white">In House Only</Badge>;
      case 'Breakfast':
        return <Badge className="bg-blue-500 text-white">Breakfast</Badge>;
      case 'Lunch':
        return <Badge className="bg-purple-500 text-white">Lunch</Badge>;
      case 'Dinner':
        return <Badge className="bg-indigo-500 text-white">Dinner</Badge>;
      default:
        return <Badge className="bg-gray-500 text-white">Unknown</Badge>;
    }
  };

  // Image upload handlers
  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('handleImageSelect called', event.target.files);
    const file = event.target.files?.[0];
    if (!file) {
      console.log('No file selected');
      return;
    }

    console.log('File selected:', file.name, file.type, file.size);
    const validation = imageUploadService.validateImage(file);
    if (!validation.valid) {
      console.log('Validation failed:', validation.error);
      toast({
        title: "Invalid Image",
        description: validation.error,
        variant: "destructive",
      });
      return;
    }

    console.log('File validation passed, setting image file and preview');
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result as string);
      console.log('Image preview set');
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview("");
    // Reset the file input
    const fileInput = document.getElementById('image-upload') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.description || !formData.price || !formData.category) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      let imageUrl = formData.image;
      
      // Upload image if a new one was selected
      if (imageFile) {
        imageUrl = await imageUploadService.uploadImage(imageFile);
      }

      const productData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        availability: formData.availability as 'Available' | 'Unavailable' | 'In House Only' | 'Breakfast' | 'Lunch' | 'Dinner',
        category: formData.category,
        image: imageUrl,
        isNewProduct: formData.isNewProduct,
        isFeatured: formData.isFeatured,
        status: 'active' as const,
        rating: 0,
        reviewCount: 0,
      };

      if (isEditing && editingProduct) {
        // Update existing product
        const updatedProduct = await productService.updateProduct(editingProduct.id, productData);
        if (updatedProduct) {
          const productsData = await productService.getAllProducts();
          setProducts(productsData);
          toast({
            title: "Product Updated",
            description: `${updatedProduct.name} has been updated successfully`,
          });
        }
      } else {
        // Add new product
        const newProduct = await productService.addProduct(productData);
        if (newProduct) {
          const productsData = await productService.getAllProducts();
          setProducts(productsData);
          toast({
            title: "Product Added",
            description: `${newProduct.name} has been added successfully`,
          });
        }
      }

      setIsDialogOpen(false);
      setIsViewDetailsOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error saving product:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save product. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Edit product
  const handleEdit = (product: Product) => {
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      availability: product.availability || "Available",
      category: product.category,
      image: product.image,
      isNewProduct: product.isNewProduct || false,
      isFeatured: product.isFeatured || false,
    });
    setImagePreview(getImageUrl(product.image));
    setImageFile(null); // Reset image file when editing
    setIsEditing(true);
    setEditingProduct(product);
    setIsDialogOpen(true);
  };

  // View Details handler
  const handleViewDetails = (product: Product) => {
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      availability: product.availability || "Available",
      category: product.category,
      image: product.image,
      isNewProduct: product.isNewProduct || false,
      isFeatured: product.isFeatured || false,
    });
    setImagePreview(getImageUrl(product.image));
    setImageFile(null); // Reset image file when viewing
    setIsEditing(true); // Make it editable
    setEditingProduct(product);
    setViewingProduct(product);
    setIsViewDetailsOpen(true);
  };

  // Delete product
  const handleDelete = async (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      setProductToDelete(product);
      setIsDeleteDialogOpen(true);
    }
  };

  // Confirm delete
  const confirmDelete = async () => {
    if (!productToDelete) return;
    
    try {
      await productService.deleteProduct(productToDelete.id);
      const productsData = await productService.getAllProducts();
      setProducts(productsData);
      toast({
        title: "Product Deleted",
        description: `${productToDelete.name} has been deleted`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive",
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setProductToDelete(null);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Products</h1>
          <p className="text-muted-foreground">Manage your bakery and cafe products</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="bg-amber-800 hover:bg-amber-700 text-white shadow-lg font-semibold" onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2 text-white" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-foreground">
                {isEditing ? "Edit Product" : "Add New Product"}
              </DialogTitle>
              <DialogDescription className="text-muted-foreground">
                {isEditing ? "Update product information" : "Create a new product for your bakery or cafe."}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 py-4">
              {/* Image Upload */}
              <div className="space-y-2">
                <Label className="text-foreground">Product Image</Label>
                <div className="space-y-3">
                  {imagePreview ? (
                    <div className="relative">
                      <img 
                        src={imagePreview} 
                        alt="Product preview" 
                        className="w-full h-32 object-cover rounded-lg border"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2 h-6 w-6 p-0"
                        onClick={removeImage}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <div 
                      className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors"
                      onClick={() => {
                        console.log('Div clicked, triggering file input');
                        const fileInput = document.getElementById('image-upload');
                        console.log('File input element from div:', fileInput);
                        fileInput?.click();
                      }}
                    >
                      <ImageIcon className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground mb-2">Upload product image</p>
                      <p className="text-xs text-muted-foreground mb-3">Click here or use the button below</p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageSelect}
                        className="hidden"
                        id="image-upload"
                      />
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          console.log('Button clicked, triggering file input');
                          const fileInput = document.getElementById('image-upload');
                          console.log('File input element:', fileInput);
                          fileInput?.click();
                        }}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Choose Image
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name" className="text-foreground">Product Name *</Label>
                <Input 
                  id="name" 
                  placeholder="Enter product name" 
                  className="border-border"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="category" className="text-foreground">Category *</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                  <SelectTrigger className="border-border">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.length > 0 ? (
                      categories.map((category) => (
                        <SelectItem key={category.id} value={category.name}>
                          {category.name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-categories" disabled>
                        No categories available
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price" className="text-foreground">Price *</Label>
                  <Input 
                    id="price" 
                    type="number" 
                    step="0.01"
                    placeholder="0.00" 
                    className="border-border"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="availability" className="text-foreground">Availability</Label>
                  <Select value={formData.availability} onValueChange={(value) => setFormData({...formData, availability: value})}>
                    <SelectTrigger className="border-border">
                      <SelectValue placeholder="Select availability" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Available">Available</SelectItem>
                      <SelectItem value="Unavailable">Unavailable</SelectItem>
                      <SelectItem value="In House Only">In House Only</SelectItem>
                      <SelectItem value="Breakfast">Breakfast</SelectItem>
                      <SelectItem value="Lunch">Lunch</SelectItem>
                      <SelectItem value="Dinner">Dinner</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description" className="text-foreground">Description *</Label>
                <Textarea 
                  id="description" 
                  placeholder="Enter product description" 
                  className="border-border"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  required
                />
              </div>

              <div className="flex gap-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isNew"
                    checked={formData.isNewProduct}
                    onChange={(e) => setFormData({...formData, isNewProduct: e.target.checked})}
                    className="rounded border-border"
                  />
                  <Label htmlFor="isNew" className="text-sm text-foreground">New Product</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isFeatured"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({...formData, isFeatured: e.target.checked})}
                    className="rounded border-border"
                  />
                  <Label htmlFor="isFeatured" className="text-sm text-foreground">Featured</Label>
                </div>
              </div>
              
              <div className="flex justify-end gap-3 pt-4">
                <Button 
                  type="button"
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                  className="border-border"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  className="bg-amber-800 hover:bg-amber-700 text-white shadow-lg font-semibold"
                  disabled={isUploading}
                >
                  {isUploading ? "Saving..." : (isEditing ? "Update Product" : "Create Product")}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* View Details Modal */}
        <Dialog open={isViewDetailsOpen} onOpenChange={(open) => {
          setIsViewDetailsOpen(open);
          if (!open) resetForm();
        }}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <div>
                  <DialogTitle className="text-foreground flex items-center gap-2">
                    <Edit className="h-5 w-5 text-primary" />
                    Product Details
                  </DialogTitle>
                  <DialogDescription className="text-muted-foreground">
                    View and edit product information
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 py-4">
              {/* Image Upload */}
              <div className="space-y-2">
                <Label className="text-foreground">Product Image</Label>
                <div className="space-y-3">
                  {imagePreview ? (
                    <div className="relative">
                      <img 
                        src={imagePreview} 
                        alt="Product preview" 
                        className="w-full h-32 object-cover rounded-lg border"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2 h-6 w-6 p-0"
                        onClick={removeImage}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <div 
                      className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors"
                      onClick={() => {
                        console.log('Div clicked, triggering file input');
                        const fileInput = document.getElementById('view-image-upload');
                        console.log('File input element from div:', fileInput);
                        fileInput?.click();
                      }}
                    >
                      <ImageIcon className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground mb-2">Upload product image</p>
                      <p className="text-xs text-muted-foreground mb-3">Click here or use the button below</p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageSelect}
                        className="hidden"
                        id="view-image-upload"
                      />
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          console.log('Button clicked, triggering file input');
                          const fileInput = document.getElementById('view-image-upload');
                          console.log('File input element:', fileInput);
                          fileInput?.click();
                        }}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Choose Image
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="view-name" className="text-foreground">Product Name *</Label>
                <Input 
                  id="view-name" 
                  placeholder="Enter product name" 
                  className="border-border"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="view-category" className="text-foreground">Category *</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                  <SelectTrigger className="border-border">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.length > 0 ? (
                      categories.map((category) => (
                        <SelectItem key={category.id} value={category.name}>
                          {category.name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-categories" disabled>
                        No categories available
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="view-price" className="text-foreground">Price *</Label>
                  <Input 
                    id="view-price" 
                    type="number" 
                    step="0.01"
                    placeholder="0.00" 
                    className="border-border"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="view-availability" className="text-foreground">Availability</Label>
                  <Select value={formData.availability} onValueChange={(value) => setFormData({...formData, availability: value})}>
                    <SelectTrigger className="border-border">
                      <SelectValue placeholder="Select availability" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Available">Available</SelectItem>
                      <SelectItem value="Unavailable">Unavailable</SelectItem>
                      <SelectItem value="In House Only">In House Only</SelectItem>
                      <SelectItem value="Breakfast">Breakfast</SelectItem>
                      <SelectItem value="Lunch">Lunch</SelectItem>
                      <SelectItem value="Dinner">Dinner</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="view-description" className="text-foreground">Description *</Label>
                <Textarea 
                  id="view-description" 
                  placeholder="Enter product description" 
                  className="border-border"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  required
                />
              </div>

              <div className="flex gap-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="view-isNew"
                    checked={formData.isNewProduct}
                    onChange={(e) => setFormData({...formData, isNewProduct: e.target.checked})}
                    className="rounded border-border"
                  />
                  <Label htmlFor="view-isNew" className="text-sm text-foreground">New Product</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="view-isFeatured"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({...formData, isFeatured: e.target.checked})}
                    className="rounded border-border"
                  />
                  <Label htmlFor="view-isFeatured" className="text-sm text-foreground">Featured</Label>
                </div>
              </div>
              
              <div className="flex justify-end gap-3 pt-4">
                <Button 
                  type="button"
                  variant="outline" 
                  onClick={() => setIsViewDetailsOpen(false)}
                  className="border-border"
                >
                  Close
                </Button>
                <Button 
                  type="submit"
                  className="bg-amber-800 hover:bg-amber-700 text-white shadow-lg font-semibold"
                  disabled={isUploading}
                >
                  {isUploading ? "Saving..." : "Update Product"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 border-border"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">Filters:</span>
          </div>
          
          {/* Category Filter */}
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-48 border-border">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              {productCategories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Sort Filter */}
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-48 border-border">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Recently Added</SelectItem>
              <SelectItem value="oldest">Earliest</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
              <SelectItem value="name-asc">Name: A to Z</SelectItem>
              <SelectItem value="name-desc">Name: Z to A</SelectItem>
            </SelectContent>
          </Select>

          {/* Results count */}
          <div className="text-sm text-muted-foreground">
            Showing {startIndex + 1}-{Math.min(endIndex, filteredProducts.length)} of {filteredProducts.length} products
          </div>
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <ProductListSkeleton count={9} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedProducts.map((product) => (
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
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0 hover:bg-amber-100"
                    onClick={() => handleEdit(product)}
                  >
                    <Edit className="h-4 w-4 text-amber-800" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0 hover:bg-red-100"
                    onClick={() => handleDelete(product.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">{product.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-foreground">LKR {product.price}</span>
                {getAvailabilityBadge(product.availability || "Available")}
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Availability: {product.availability || "Available"}</span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="border-amber-300 hover:bg-amber-50 text-amber-800 hover:text-amber-900"
                  onClick={() => handleViewDetails(product)}
                >
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <PaginationItem key={page}>
                  <PaginationLink
                    onClick={() => setCurrentPage(page)}
                    isActive={currentPage === page}
                    className="cursor-pointer"
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ))}
              
              <PaginationItem>
                <PaginationNext 
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No products found</h3>
          <p className="text-muted-foreground">Try adjusting your search terms or filters.</p>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>"{productToDelete?.name}"</strong>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete Product
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Products;