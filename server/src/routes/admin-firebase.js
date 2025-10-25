// Admin routes for Firebase
import express from 'express';
import { FirebaseService } from '../services/firebase-service.js';

const router = express.Router();

// Dashboard stats endpoint
router.get('/dashboard/stats', async (req, res) => {
  try {
    // Get all collections data
    const [users, products, orders] = await Promise.all([
      FirebaseService.getAllUsers(),
      FirebaseService.getAllProducts(),
      FirebaseService.getAllOrders()
    ]);

    // Calculate stats
    const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
    const totalOrders = orders.length;
    const totalProducts = products.length;
    const totalCustomers = users.filter(user => user.role !== 'admin').length;

    // Calculate growth (mock data for now)
    const revenueGrowth = 12.5; // Mock growth percentage
    const orderGrowth = 8.3; // Mock growth percentage

    // Get recent orders (last 5)
    const recentOrders = orders
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5)
      .map(order => ({
        _id: order.id,
        orderNumber: order.orderNumber,
        customerName: users.find(u => u.id === order.user)?.name || 'Unknown',
        total: order.total,
        status: order.status,
        createdAt: order.createdAt?.toDate ? order.createdAt.toDate().toISOString() : order.createdAt
      }));

    // Get low stock products (mock for now)
    const lowStockProducts = products
      .filter(product => product.availability === 'Available')
      .slice(0, 3)
      .map(product => ({
        _id: product.id,
        name: product.name,
        stock: Math.floor(Math.random() * 10) + 1, // Mock stock
        price: product.price
      }));

    const dashboardData = {
      stats: {
        totalRevenue,
        totalOrders,
        totalProducts,
        totalCustomers,
        revenueGrowth,
        orderGrowth
      },
      recentOrders,
      lowStockProducts
    };

    res.json(dashboardData);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

export default router;
