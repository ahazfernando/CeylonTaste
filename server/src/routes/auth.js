import { Router } from "express";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { body, validationResult } from "express-validator";
import { signAuthToken, requireAuth } from "../middleware/auth.js";

const router = Router();

router.post(
	"/signup",
	[
		body("name").isString().trim().isLength({ min: 2 }).withMessage("Name is required"),
		body("email").isEmail().withMessage("Valid email required"),
		body("password").isLength({ min: 8 }).withMessage("Password must be 8+ chars"),
	],
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
		const { name, email, password } = req.body;
		const existing = await User.findOne({ email });
		if (existing) return res.status(409).json({ error: "Email already in use" });
		const passwordHash = await bcrypt.hash(password, 10);
		const user = await User.create({ name, email, passwordHash });
		const token = signAuthToken({ id: user._id.toString(), role: user.role, email: user.email, name: user.name });
		res
			.cookie("tt_auth", token, {
				httpOnly: true,
				secure: process.env.NODE_ENV === "production",
				sameSite: "lax",
				maxAge: 7 * 24 * 60 * 60 * 1000,
			})
			.status(201)
			.json({ user: user.toSafeJSON(), token });
	}
);

router.post(
	"/login",
	[
		body("email").isEmail().withMessage("Valid email required"),
		body("password").isString().isLength({ min: 8 }).withMessage("Password must be 8+ chars"),
	],
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
		const { email, password } = req.body;
		const user = await User.findOne({ email });
		if (!user) return res.status(401).json({ error: "Invalid credentials" });
		const ok = await bcrypt.compare(password, user.passwordHash);
		if (!ok) return res.status(401).json({ error: "Invalid credentials" });
		const token = signAuthToken({ id: user._id.toString(), role: user.role, email: user.email, name: user.name });
		res
			.cookie("tt_auth", token, {
				httpOnly: true,
				secure: process.env.NODE_ENV === "production",
				sameSite: "lax",
				maxAge: 7 * 24 * 60 * 60 * 1000,
			})
			.json({ user: user.toSafeJSON(), token });
	}
);

router.post("/logout", async (_req, res) => {
	res.clearCookie("tt_auth").json({ success: true });
});

router.get("/me", requireAuth, async (req, res) => {
	res.json({ user: { id: req.user.id, email: req.user.email, name: req.user.name, role: req.user.role } });
});

export default router;


