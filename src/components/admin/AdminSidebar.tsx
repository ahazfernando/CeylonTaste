"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  BarChart3, 
  Package, 
  Tags, 
  ShoppingCart, 
  Users, 
  Archive,
  Coffee,
  Settings,
} from "lucide-react";

const menuItems = [
  { title: "Analytics", url: "/admin/dashboard", icon: BarChart3 },
  { title: "Products", url: "/admin/products", icon: Package },
  { title: "Categories", url: "/admin/categories", icon: Tags },
  { title: "Orders", url: "/admin/orders", icon: ShoppingCart },
  { title: "Customers", url: "/admin/customers", icon: Users },
  { title: "Inventory", url: "/admin/inventory", icon: Archive },
  { title: "Settings", url: "/admin/settings", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const isActive = (path: string) => pathname === path;

  return (
    <aside className="hidden md:flex md:w-64 flex-col border-r bg-card">
      <div className="p-4 border-b">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-primary shadow-warm">
            <Coffee className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-bold">Sweet Admin</h1>
            <p className="text-xs text-muted-foreground">Bakery & Cafe</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => (
          <Link key={item.title} href={item.url} className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-lg transition",
            isActive(item.url)
              ? "bg-gradient-primary text-primary-foreground shadow-warm"
              : "hover:bg-secondary/60 text-muted-foreground hover:text-foreground"
          )}>
            <item.icon className="h-5 w-5" />
            <span>{item.title}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}


