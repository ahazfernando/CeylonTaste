"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Search, Eye, Mail, Phone, Users, MoreHorizontal, Edit, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";

interface Customer {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  customerStatus?: string;
  totalOrders: number;
  totalSpent: number;
  lastOrder?: string;
  createdAt: string;
}

function StatusBadge({ status }: { status?: string }) {
  const statusValue = status || 'active';
  switch (statusValue) {
    case "premium":
      return <Badge className="bg-purple-100 text-purple-800 border-purple-200">Premium</Badge>;
    case "gold":
      return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Gold</Badge>;
    case "bronze":
      return <Badge className="bg-orange-100 text-orange-800 border-orange-200">Bronze</Badge>;
    case "active":
      return <Badge className="bg-green-100 text-green-800 border-green-200">Active</Badge>;
    case "inactive":
      return <Badge variant="outline" className="text-muted-foreground">Inactive</Badge>;
    default:
      return <Badge className="bg-green-100 text-green-800 border-green-200">Active</Badge>;
  }
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [phoneValue, setPhoneValue] = useState("");
  const [updatingPhone, setUpdatingPhone] = useState(false);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('tt_token') : null;
        const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
        
        const response = await fetch("http://localhost:4000/api/admin/customers", { 
          credentials: "include", 
          headers 
        });
        
        if (response.ok) {
          const data = await response.json();
          setCustomers(data.customers || []);
        } else {
          const errorText = await response.text();
          console.error('API Error:', errorText);
        }
      } catch (error) {
        console.error('Error fetching customers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (customer.phone && customer.phone.includes(searchTerm))
  );

  const handleStatusUpdate = async (customerId: string, newStatus: string) => {
    setUpdatingStatus(customerId);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('tt_token') : null;
      const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
      
      const response = await fetch(`http://localhost:4000/api/admin/customers/${customerId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...headers
        },
        credentials: 'include',
        body: JSON.stringify({ customerStatus: newStatus })
      });

      if (response.ok) {
        setCustomers(prevCustomers => 
          prevCustomers.map(customer => 
            customer._id === customerId 
              ? { ...customer, customerStatus: newStatus }
              : customer
          )
        );
      } else {
        console.error('Failed to update customer status');
      }
    } catch (error) {
      console.error('Error updating customer status:', error);
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handlePhoneUpdate = async () => {
    if (!editingCustomer) return;
    
    setUpdatingPhone(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('tt_token') : null;
      const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
      
      const response = await fetch(`http://localhost:4000/api/admin/customers/${editingCustomer._id}/phone`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...headers
        },
        credentials: 'include',
        body: JSON.stringify({ phone: phoneValue })
      });

      if (response.ok) {
        setCustomers(prevCustomers => 
          prevCustomers.map(customer => 
            customer._id === editingCustomer._id 
              ? { ...customer, phone: phoneValue }
              : customer
          )
        );
        setEditingCustomer(null);
        setPhoneValue("");
      } else {
        console.error('Failed to update customer phone');
      }
    } catch (error) {
      console.error('Error updating customer phone:', error);
    } finally {
      setUpdatingPhone(false);
    }
  };

  const openEditDialog = (customer: Customer) => {
    setEditingCustomer(customer);
    setPhoneValue(customer.phone || "");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <main className="container p-6 space-y-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-foreground">Customers</h1>
          <p className="text-muted-foreground">Manage your customer relationships</p>
        </div>
        <div className="text-center py-8">
          <p className="text-muted-foreground">Loading customers...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="container p-6 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-foreground">Customers</h1>
        <p className="text-muted-foreground">Manage your customer relationships</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-border shadow-warm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{customers.length}</div>
          </CardContent>
        </Card>
        <Card className="border-border shadow-warm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">VIP Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">
              {customers.filter(c => ["premium", "gold", "bronze"].includes(c.customerStatus || 'active')).length}
            </div>
          </CardContent>
        </Card>
        <Card className="border-border shadow-warm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {customers.filter(c => (c.customerStatus || 'active') === "active").length}
            </div>
          </CardContent>
        </Card>
        <Card className="border-border shadow-warm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              LKR {customers.reduce((sum, c) => sum + c.totalSpent, 0).toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input 
          placeholder="Search customers..." 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)} 
          className="pl-10 border-border" 
        />
      </div>

      <Card className="border-border shadow-warm">
        <CardHeader>
          <CardTitle className="text-foreground">Customer Management</CardTitle>
          <CardDescription className="text-muted-foreground">View and manage customer information</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-border">
                <TableHead className="text-foreground">Customer</TableHead>
                <TableHead className="text-foreground">Contact</TableHead>
                <TableHead className="text-foreground">Orders</TableHead>
                <TableHead className="text-foreground">Total Spent</TableHead>
                <TableHead className="text-foreground">Last Order</TableHead>
                <TableHead className="text-foreground">Status</TableHead>
                <TableHead className="text-foreground">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.map((customer) => (
                <TableRow key={customer._id} className="border-border">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-accent">
                        <Users className="h-5 w-5 text-accent-foreground" />
                      </div>
                      <div>
                        <div className="font-medium text-foreground">{customer.name}</div>
                        <div className="text-sm text-muted-foreground">ID: {customer._id.slice(-6)}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="h-3 w-3" />
                        {customer.email}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="h-3 w-3" />
                        {customer.phone || "No phone"}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium text-foreground">{customer.totalOrders}</TableCell>
                  <TableCell className="font-medium text-foreground">LKR {customer.totalSpent.toFixed(2)}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {customer.lastOrder ? formatDate(customer.lastOrder) : "No orders"}
                  </TableCell>
                  <TableCell>
                    <Select 
                      value={customer.customerStatus || 'active'} 
                      onValueChange={(newStatus) => handleStatusUpdate(customer._id, newStatus)}
                      disabled={updatingStatus === customer._id}
                    >
                      <SelectTrigger className="w-32 border-border">
                        <SelectValue />
                        {updatingStatus === customer._id && (
                          <Loader2 className="h-3 w-3 animate-spin ml-1" />
                        )}
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="premium">Premium</SelectItem>
                        <SelectItem value="gold">Gold</SelectItem>
                        <SelectItem value="bronze">Bronze</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEditDialog(customer)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Phone
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredCustomers.length === 0 && (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No customers found</h3>
              <p className="text-muted-foreground">Try adjusting your search criteria.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Phone Dialog */}
      <Dialog open={!!editingCustomer} onOpenChange={() => setEditingCustomer(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Customer Phone</DialogTitle>
            <DialogDescription>
              Update the phone number for {editingCustomer?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right">
                Phone
              </Label>
              <Input
                id="phone"
                value={phoneValue}
                onChange={(e) => setPhoneValue(e.target.value)}
                className="col-span-3"
                placeholder="Enter phone number"
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setEditingCustomer(null)}
              disabled={updatingPhone}
            >
              Cancel
            </Button>
            <Button 
              onClick={handlePhoneUpdate}
              disabled={updatingPhone}
            >
              {updatingPhone && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}