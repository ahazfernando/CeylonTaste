// Firebase category routes
import express from "express";
import { FirebaseService } from "../services/firebase-service.js";
import { body, validationResult } from "express-validator";

const router = express.Router();

// Validation middleware
const validateCategory = [
  body('name').notEmpty().withMessage('Category name is required'),
  body('description').optional().isString(),
];

// GET /api/categories - Get all categories
router.get('/', async (req, res) => {
  try {
    const categories = await FirebaseService.getAllCategories();
    res.json({ categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// POST /api/categories - Create new category
router.post('/', validateCategory, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description } = req.body;
    
    // Check if category already exists
    const existingCategory = await FirebaseService.getCategoryByName(name);
    if (existingCategory) {
      return res.status(409).json({ error: 'Category already exists' });
    }

    const category = await FirebaseService.createCategory({
      name,
      description: description || null
    });

    res.status(201).json({ 
      category: { 
        id: category.id, 
        name: category.name, 
        description: category.description 
      } 
    });
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ error: 'Failed to create category' });
  }
});

// PATCH /api/categories/:id - Update category
router.patch('/:id', validateCategory, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { name, description } = req.body;

    const category = await FirebaseService.updateCategory(id, {
      name,
      description: description || null
    });

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json({ 
      category: { 
        id: category.id, 
        name: category.name, 
        description: category.description 
      } 
    });
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ error: 'Failed to update category' });
  }
});

// DELETE /api/categories/:id - Delete category
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const deleted = await FirebaseService.deleteCategory(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

export default router;
