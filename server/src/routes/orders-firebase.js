import express from "express";
import { FirebaseService } from "../services/firebase-service.js";
import { requireAuth } from "../middleware/auth.js";
import { body, validationResult } from "express-validator";

const router = express.Router();

// Validation middleware
const validateOrder = [
  body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
  body('items.*.product').notEmpty().withMessage('Valid product ID is required'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('items.*.price').isNumeric({ min: 0 }).withMessage('Price must be a positive number'),
  body('total').isNumeric({ min: 0 }).withMessage('Total must be a positive number'),
  body('paymentMethod').isIn(['credit_card', 'debit_card', 'paypal', 'cash_on_delivery']).withMessage('Invalid payment method')
];

// Helper function to generate order number
function generateOrderNumber() {
  const timestamp = Date.now().toString();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `TT${timestamp.slice(-8)}${random}`;
}

// GET /api/orders - Get user's orders
router.get('/', requireAuth, async (req, res) => {
  try {
    const orders = await FirebaseService.getOrdersByUser(req.user.id);
    
    // Populate product details for each order
    const populatedOrders = await Promise.all(
      orders.map(async (order) => {
        const populatedItems = await Promise.all(
          order.items.map(async (item) => {
            const product = await FirebaseService.getProductById(item.product);
            return {
              ...item,
              product: product ? {
                id: product.id,
                name: product.name,
                image: product.image
              } : null
            };
          })
        );
        
        return {
          ...order,
          items: populatedItems
        };
      })
    );
    
    res.json({ orders: populatedOrders });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// GET /api/orders/:id - Get single order
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const order = await FirebaseService.getOrderById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    // Check if user owns this order or is admin
    if (order.user !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    // Populate product details
    const populatedItems = await Promise.all(
      order.items.map(async (item) => {
        const product = await FirebaseService.getProductById(item.product);
        return {
          ...item,
          product: product ? {
            id: product.id,
            name: product.name,
            image: product.image,
            description: product.description,
            price: product.price
          } : null
        };
      })
    );
    
    res.json({ 
      order: {
        ...order,
        items: populatedItems
      }
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

// POST /api/orders - Create new order
router.post('/', requireAuth, validateOrder, async (req, res) => {
  try {
    console.log('Order creation request received:', {
      user: req.user?.id,
      body: req.body,
      headers: req.headers
    });

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    const { items, subtotal, shipping, tax, total, shippingAddress, paymentMethod, notes } = req.body;

    // Verify all products exist
    const productIds = items.map(item => item.product);
    const productPromises = productIds.map(id => FirebaseService.getProductById(id));
    const products = await Promise.all(productPromises);
    
    const missingProducts = products.filter((product, index) => !product);
    if (missingProducts.length > 0) {
      return res.status(400).json({ error: 'One or more products not found' });
    }

    // Create order
    const orderNumber = generateOrderNumber();
    const orderData = {
      orderNumber,
      user: req.user.id,
      items: items.map(item => ({
        product: item.product,
        quantity: item.quantity,
        price: item.price
      })),
      subtotal,
      shipping: shipping || 0,
      tax: tax || 0,
      total,
      shippingAddress,
      paymentMethod,
      notes,
      status: 'pending',
      paymentStatus: 'pending'
    };

    const order = await FirebaseService.createOrder(orderData);
    
    // Populate the order with product details
    const populatedItems = await Promise.all(
      order.items.map(async (item) => {
        const product = await FirebaseService.getProductById(item.product);
        return {
          ...item,
          product: product ? {
            id: product.id,
            name: product.name,
            image: product.image
          } : null
        };
      })
    );
    
    res.status(201).json({ 
      order: {
        ...order,
        items: populatedItems
      }
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// PUT /api/orders/:id/status - Update order status (admin only)
router.put('/:id/status', requireAuth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { status } = req.body;
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const order = await FirebaseService.updateOrder(req.params.id, { status });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Populate product details
    const populatedItems = await Promise.all(
      order.items.map(async (item) => {
        const product = await FirebaseService.getProductById(item.product);
        return {
          ...item,
          product: product ? {
            id: product.id,
            name: product.name,
            image: product.image
          } : null
        };
      })
    );

    res.json({ 
      order: {
        ...order,
        items: populatedItems
      }
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

// GET /api/orders/admin/all - Get all orders (admin only)
router.get('/admin/all', requireAuth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { status } = req.query;
    const filters = status && status !== 'all' ? { status } : {};
    
    const orders = await FirebaseService.getAllOrders(filters);

    // Populate user and product details
    const populatedOrders = await Promise.all(
      orders.map(async (order) => {
        const user = await FirebaseService.getUserById(order.user);
        const populatedItems = await Promise.all(
          order.items.map(async (item) => {
            const product = await FirebaseService.getProductById(item.product);
            return {
              ...item,
              product: product ? {
                id: product.id,
                name: product.name,
                image: product.image
              } : null
            };
          })
        );
        
        return {
          ...order,
          user: user ? {
            id: user.id,
            name: user.name,
            email: user.email
          } : null,
          items: populatedItems
        };
      })
    );

    res.json({ 
      orders: populatedOrders,
      total: populatedOrders.length
    });
  } catch (error) {
    console.error('Error fetching all orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

export default router;
