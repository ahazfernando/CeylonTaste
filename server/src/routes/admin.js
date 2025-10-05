import { Router } from "express";
import { requireAuth, requireAdmin } from "../middleware/auth.js";
import User from "../models/User.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";

const router = Router();

// List users (admin only)
router.get("/users", requireAuth, requireAdmin, async (_req, res) => {
  const users = await User.find({}, { passwordHash: 0 }).sort({ createdAt: -1 }).lean();
  res.json({ users });
});

// Update user role (admin only)
router.patch("/users/:id/role", requireAuth, requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { role } = req.body || {};
  if (!role || !["user", "admin"].includes(role)) {
    return res.status(400).json({ error: "role must be 'user' or 'admin'" });
  }
  const updated = await User.findByIdAndUpdate(id, { role }, { new: true, projection: { passwordHash: 0 } });
  if (!updated) return res.status(404).json({ error: "User not found" });
  res.json({ user: updated });
});

// Promote by email convenience (admin only)
router.post("/users/promote", requireAuth, requireAdmin, async (req, res) => {
  const { email } = req.body || {};
  if (!email) return res.status(400).json({ error: "email is required" });
  const updated = await User.findOneAndUpdate({ email }, { role: "admin" }, { new: true, projection: { passwordHash: 0 } });
  if (!updated) return res.status(404).json({ error: "User not found" });
  res.json({ user: updated });
});

// Get customers with order statistics (admin only)
router.get("/customers", requireAuth, requireAdmin, async (req, res) => {
  try {
    const customers = await User.find({ role: 'user' }, { passwordHash: 0 })
      .sort({ createdAt: -1 })
      .lean();

    // Get order statistics for each customer
    const customersWithStats = await Promise.all(
      customers.map(async (customer) => {
        const orders = await Order.find({ user: customer._id });
        const totalOrders = orders.length;
        const totalSpent = orders.reduce((sum, order) => sum + order.total, 0);
        const lastOrder = orders.length > 0 
          ? orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0].createdAt
          : null;

        return {
          ...customer,
          phone: customer.phone || null,
          customerStatus: customer.customerStatus || 'active',
          totalOrders,
          totalSpent,
          lastOrder
        };
      })
    );

    res.json({ customers: customersWithStats });
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
});

// Get individual customer details (admin only)
router.get("/customers/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const customer = await User.findById(id, { passwordHash: 0 }).lean();
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    // Get order statistics for the customer
    const orders = await Order.find({ user: id });
    const totalOrders = orders.length;
    const totalSpent = orders.reduce((sum, order) => sum + order.total, 0);
    const lastOrder = orders.length > 0 
      ? orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0].createdAt
      : null;

    const customerWithStats = {
      ...customer,
      totalOrders,
      totalSpent,
      lastOrder
    };

    res.json({ customer: customerWithStats });
  } catch (error) {
    console.error('Error fetching customer details:', error);
    res.status(500).json({ error: 'Failed to fetch customer details' });
  }
});

// Update customer status (admin only)
router.patch("/customers/:id/status", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { customerStatus } = req.body;
    
    const validStatuses = ['active', 'inactive', 'premium', 'gold', 'bronze'];
    if (!validStatuses.includes(customerStatus)) {
      return res.status(400).json({ error: 'Invalid customer status' });
    }

    const updated = await User.findByIdAndUpdate(
      id, 
      { customerStatus }, 
      { new: true, projection: { passwordHash: 0 } }
    );
    
    if (!updated) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    res.json({ customer: updated });
  } catch (error) {
    console.error('Error updating customer status:', error);
    res.status(500).json({ error: 'Failed to update customer status' });
  }
});

// Update customer phone (admin only)
router.patch("/customers/:id/phone", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { phone } = req.body;
    
    if (!phone || phone.trim().length === 0) {
      return res.status(400).json({ error: 'Phone number is required' });
    }

    const updated = await User.findByIdAndUpdate(
      id, 
      { phone: phone.trim() }, 
      { new: true, projection: { passwordHash: 0 } }
    );
    
    if (!updated) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    res.json({ customer: updated });
  } catch (error) {
    console.error('Error updating customer phone:', error);
    res.status(500).json({ error: 'Failed to update customer phone' });
  }
});

// Dashboard statistics (admin only)
router.get("/dashboard/stats", requireAuth, requireAdmin, async (req, res) => {
  try {
    // Get total counts
    const totalCustomers = await User.countDocuments({ role: 'user' });
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();
    
    // Calculate total revenue from completed orders
    const revenueResult = await Order.aggregate([
      { $match: { status: { $in: ['delivered', 'shipped'] } } },
      { $group: { _id: null, totalRevenue: { $sum: '$total' } } }
    ]);
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;
    
    // Get recent orders (last 5) - filter out orders with deleted users
    const recentOrders = await Order.find()
      .populate('user', 'name email')
      .populate('items.product', 'name image')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();
    
    // Filter out orders where user is null (deleted users)
    const validRecentOrders = recentOrders.filter(order => order.user !== null).slice(0, 5);
    
    // Get low stock products (stock <= 10)
    const lowStockProducts = await Product.find({ stock: { $lte: 10 } })
      .select('name stock price')
      .sort({ stock: 1 })
      .limit(5)
      .lean();
    
    // Calculate growth percentages (comparing last 30 days vs previous 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
    
    // Revenue growth
    const currentMonthRevenue = await Order.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo }, status: { $in: ['delivered', 'shipped'] } } },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);
    
    const previousMonthRevenue = await Order.aggregate([
      { $match: { createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo }, status: { $in: ['delivered', 'shipped'] } } },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);
    
    const currentRevenue = currentMonthRevenue.length > 0 ? currentMonthRevenue[0].total : 0;
    const previousRevenue = previousMonthRevenue.length > 0 ? previousMonthRevenue[0].total : 0;
    const revenueGrowth = previousRevenue > 0 ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 : 0;
    
    // Order growth
    const currentMonthOrders = await Order.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });
    const previousMonthOrders = await Order.countDocuments({ 
      createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo } 
    });
    const orderGrowth = previousMonthOrders > 0 ? ((currentMonthOrders - previousMonthOrders) / previousMonthOrders) * 100 : 0;
    
    res.json({
      stats: {
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        totalOrders,
        totalProducts,
        totalCustomers,
        revenueGrowth: Math.round(revenueGrowth * 10) / 10,
        orderGrowth: Math.round(orderGrowth * 10) / 10
      },
      recentOrders: validRecentOrders,
      lowStockProducts
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
  }
});

// Analytics endpoints for charts
router.get("/analytics/revenue", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { period = '6m' } = req.query;
    
    let monthsBack = 6;
    if (period === '12m') monthsBack = 12;
    else if (period === '3m') monthsBack = 3;
    
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - monthsBack);
    
    // Get monthly revenue data
    const revenueData = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          status: { $in: ['delivered', 'shipped'] }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          revenue: { $sum: '$total' }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);
    
    // Format data for charts
    const chartData = revenueData.map(item => ({
      month: new Date(item._id.year, item._id.month - 1).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
      revenue: Math.round(item.revenue * 100) / 100
    }));
    
    res.json({ data: chartData });
  } catch (error) {
    console.error('Error fetching revenue analytics:', error);
    res.status(500).json({ error: 'Failed to fetch revenue analytics' });
  }
});

router.get("/analytics/top-products", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { limit = 5 } = req.query;
    
    // Get top selling products
    const topProducts = await Order.aggregate([
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          totalSold: { $sum: '$items.quantity' },
          totalRevenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } }
        }
      },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' },
      {
        $project: {
          name: '$product.name',
          totalSold: 1,
          totalRevenue: 1
        }
      },
      { $sort: { totalSold: -1 } },
      { $limit: parseInt(limit) }
    ]);
    
    res.json({ data: topProducts });
  } catch (error) {
    console.error('Error fetching top products analytics:', error);
    res.status(500).json({ error: 'Failed to fetch top products analytics' });
  }
});

router.get("/analytics/customers", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { period = '6m' } = req.query;
    
    let monthsBack = 6;
    if (period === '12m') monthsBack = 12;
    else if (period === '3m') monthsBack = 3;
    
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - monthsBack);
    
    // Get monthly customer registrations
    const customerData = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          role: 'user'
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          customers: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);
    
    // Format data for charts
    const chartData = customerData.map(item => ({
      month: new Date(item._id.year, item._id.month - 1).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
      customers: item.customers
    }));
    
    res.json({ data: chartData });
  } catch (error) {
    console.error('Error fetching customer analytics:', error);
    res.status(500).json({ error: 'Failed to fetch customer analytics' });
  }
});

export default router;


