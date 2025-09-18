import { Router } from "express";
import { requireAuth, requireAdmin } from "../middleware/auth.js";
import User from "../models/User.js";

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

export default router;


