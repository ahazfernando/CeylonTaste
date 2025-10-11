import express from "express";
import Product from "../models/Product.js";
import { body, validationResult } from "express-validator";
import { appendProductToSeeder, updateProductInSeeder, removeProductFromSeeder } from "../utils/seeder-utils.js";

const router = express.Router();

// Validation middleware
const validateProduct = [
  body('name').notEmpty().withMessage('Product name is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('price').isNumeric().withMessage('Price must be a number'),
  body('category').notEmpty().withMessage('Category is required'),
  // Remove image requirement - it can be optional
];

// GET /api/products - Get all products
router.get('/', async (req, res) => {
  try {
    const { category, status, featured, search } = req.query;
    
    let query = {};
    
    if (category && category !== 'All') {
      query.category = category;
    }
    
    if (status) {
      query.status = status;
    }
    
    if (featured === 'true') {
      query.isFeatured = true;
    }
    
    if (search) {
      query.$text = { $search: search };
    }
    
    const products = await Product.find(query).sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// GET /api/products/:id - Get single product
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// POST /api/products - Create new product
router.post('/', validateProduct, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const product = new Product(req.body);
    await product.save();
    
    // Add to seeder file
    try {
      appendProductToSeeder(req.body);
    } catch (seederError) {
      console.error('Error adding product to seeder file:', seederError);
      // Don't fail the request if seeder update fails
    }
    
    res.status(201).json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// PUT /api/products/:id - Update product
router.put('/:id', validateProduct, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    // Get the original product to get the name for seeder update
    const originalProduct = await Product.findById(req.params.id);
    if (!originalProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    // Update in seeder file
    try {
      updateProductInSeeder(originalProduct.name, req.body);
    } catch (seederError) {
      console.error('Error updating product in seeder file:', seederError);
      // Don't fail the request if seeder update fails
    }
    
    res.json(product);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// DELETE /api/products/:id - Delete product
router.delete('/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    // Remove from seeder file
    try {
      removeProductFromSeeder(product.name);
    } catch (seederError) {
      console.error('Error removing product from seeder file:', seederError);
      // Don't fail the request if seeder update fails
    }
    
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// GET /api/products/categories/list - Get all categories
router.get('/categories/list', async (req, res) => {
  try {
    const categories = await Product.distinct('category');
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

export default router;
