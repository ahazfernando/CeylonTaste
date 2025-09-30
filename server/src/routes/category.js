import { Router } from "express";
import { body, validationResult } from "express-validator";
import { requireAuth, requireAdmin } from "../middleware/auth.js";
import Category from "../models/Category.js";

const router = Router();

// List all categories (public for now)
router.get("/", async (_req, res) => {
  const categories = await Category.find().sort({ createdAt: -1 }).lean();
  res.json({ categories });
});

// Create category (admin only)
router.post(
  "/",
  requireAuth,
  requireAdmin,
  [body("name").isString().trim().isLength({ min: 2 }), body("description").optional().isString()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const { name, description } = req.body;
    const exists = await Category.findOne({ name });
    if (exists) return res.status(409).json({ error: "Category already exists" });
    const created = await Category.create({ name, description, createdBy: req.user.id });
    res.status(201).json({ category: { id: created._id, name: created.name, description: created.description } });
  }
);

// Update category (admin only)
router.patch(
  "/:id",
  requireAuth,
  requireAdmin,
  [body("name").optional().isString().trim().isLength({ min: 2 }), body("description").optional().isString()],
  async (req, res) => {
    const { id } = req.params;
    const updates = {};
    if (typeof req.body.name === 'string') updates.name = req.body.name;
    if (typeof req.body.description === 'string') updates.description = req.body.description;
    const updated = await Category.findByIdAndUpdate(id, updates, { new: true }).lean();
    if (!updated) return res.status(404).json({ error: "Category not found" });
    res.json({ category: { id: updated._id, name: updated.name, description: updated.description } });
  }
);

// Delete category (admin only)
router.delete(
  "/:id",
  requireAuth,
  requireAdmin,
  async (req, res) => {
    const { id } = req.params;
    const deleted = await Category.findByIdAndDelete(id).lean();
    if (!deleted) return res.status(404).json({ error: "Category not found" });
    res.json({ success: true });
  }
);

export default router;


