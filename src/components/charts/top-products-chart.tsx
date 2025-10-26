"use client";

import { Pie, PieChart } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import * as React from "react";

const chartConfig = {
  totalSold: {
    label: "Units Sold",
  },
  product1: {
    label: "Product 1",
    color: "hsl(15 45% 23%)", // Primary coffee brown
  },
  product2: {
    label: "Product 2", 
    color: "hsl(32 45% 65%)", // Accent emerald
  },
  product3: {
    label: "Product 3",
    color: "hsl(32 45% 75%)", // Secondary cream
  },
  product4: {
    label: "Product 4",
    color: "hsl(44 20% 88%)", // Muted light coffee
  },
  product5: {
    label: "Product 5",
    color: "hsl(44 45% 75%)", // Royal gradient end
  },
} satisfies ChartConfig;

interface TopProduct {
  name: string;
  totalSold: number;
  totalRevenue: number;
}

export function TopProductsChart() {
  const [data, setData] = React.useState<TopProduct[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchTopProducts = async () => {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('tt_token') : null;
        const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
        
        const response = await fetch("http://localhost:4000/api/admin/analytics/top-products?limit=5", {
          credentials: "include",
          headers
        });
        
        if (response.ok) {
          const result = await response.json();
          setData(result.data);
        } else {
          // If no data or unauthorized, show sample data
          console.log('No product data available, showing sample data');
          setData([
            { name: "Ceylon Tea", totalSold: 45, totalRevenue: 2250 },
            { name: "Coffee Blend", totalSold: 38, totalRevenue: 1900 },
            { name: "Chocolate Cake", totalSold: 32, totalRevenue: 1600 },
            { name: "Croissant", totalSold: 28, totalRevenue: 1400 },
            { name: "Muffin", totalSold: 25, totalRevenue: 1250 },
          ]);
        }
      } catch (error) {
        console.error('Error fetching top products:', error);
        // Show sample data on error
        setData([
          { name: "Ceylon Tea", totalSold: 45, totalRevenue: 2250 },
          { name: "Coffee Blend", totalSold: 38, totalRevenue: 1900 },
          { name: "Chocolate Cake", totalSold: 32, totalRevenue: 1600 },
          { name: "Croissant", totalSold: 28, totalRevenue: 1400 },
          { name: "Muffin", totalSold: 25, totalRevenue: 1250 },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchTopProducts();
  }, []);

  if (loading) {
    return (
      <Card className="flex flex-col">
        <CardHeader className="items-center pb-0">
          <CardTitle>Top Selling Products</CardTitle>
          <CardDescription>Loading product data...</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 pb-0">
          <div className="flex items-center justify-center h-[300px]">
            <div className="text-muted-foreground">Loading...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Transform data for pie chart
  const chartData = data.map((product, index) => ({
    name: product.name,
    totalSold: product.totalSold,
    fill: `var(--color-product${index + 1})`,
  }));

  // Update chart config with actual product names
  const dynamicChartConfig = {
    totalSold: {
      label: "Units Sold",
    },
    ...chartData.reduce((acc, item, index) => {
      const productKey = `product${index + 1}` as keyof typeof chartConfig;
      const baseConfig = chartConfig[productKey];
      acc[productKey] = {
        label: item.name,
        color: (baseConfig && 'color' in baseConfig) ? baseConfig.color : `hsl(${index * 60} 45% 65%)`,
      };
      return acc;
    }, {} as any),
  } satisfies ChartConfig;

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Top Selling Products</CardTitle>
        <CardDescription>Most popular products by units sold</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <div className="space-y-4">
          {/* Product List */}
          <div className="space-y-2">
            {data.map((product, index) => {
              const productKey = `product${index + 1}` as keyof typeof chartConfig;
              const productConfig = chartConfig[productKey];
              const color = productConfig && 'color' in productConfig ? productConfig.color : `hsl(${index * 60} 45% 65%)`;
              
              return (
                <div key={product.name} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: color }}
                    />
                    <span className="font-medium">{product.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-primary">{product.totalSold} units</div>
                    <div className="text-xs text-muted-foreground">LKR {product.totalRevenue.toLocaleString()}</div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Pie Chart */}
          <ChartContainer
            config={dynamicChartConfig}
            className="mx-auto aspect-square max-h-[200px]"
          >
            <PieChart>
              <Pie 
                data={chartData} 
                dataKey="totalSold" 
                nameKey="name"
                cx="50%" 
                cy="50%" 
                outerRadius={60}
                label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              />
            </PieChart>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
}
