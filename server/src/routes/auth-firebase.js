import { Router } from "express";
import bcrypt from "bcryptjs";
import { FirebaseService } from "../services/firebase-service.js";
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
		
		try {
			// Check if user already exists
			const existing = await FirebaseService.getUserByEmail(email);
			if (existing) return res.status(409).json({ error: "Email already in use" });
			
			// Hash password and create user
			const passwordHash = await bcrypt.hash(password, 10);
			const userData = { name, email, passwordHash, role: "user" };
			const user = await FirebaseService.createUser(userData);
			
			// Generate JWT token
			const token = signAuthToken({ 
				id: user.id, 
				role: user.role, 
				email: user.email, 
				name: user.name 
			});
			
			res
				.cookie("tt_auth", token, {
					httpOnly: true,
					secure: process.env.NODE_ENV === "production",
					sameSite: "lax",
					maxAge: 7 * 24 * 60 * 60 * 1000,
				})
				.status(201)
				.json({ 
					user: {
						id: user.id,
						name: user.name,
						email: user.email,
						role: user.role,
						phone: user.phone,
						customerStatus: user.customerStatus,
						address: user.address,
						createdAt: user.createdAt,
						updatedAt: user.updatedAt
					}, 
					token 
				});
		} catch (error) {
			console.error('Signup error:', error);
			res.status(500).json({ error: 'Failed to create user' });
		}
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
		
		try {
			// Find user by email
			const user = await FirebaseService.getUserByEmail(email);
			if (!user) return res.status(401).json({ error: "Invalid credentials" });
			
			// Verify password
			const ok = await bcrypt.compare(password, user.passwordHash);
			if (!ok) return res.status(401).json({ error: "Invalid credentials" });
			
			// Generate JWT token
			const token = signAuthToken({ 
				id: user.id, 
				role: user.role, 
				email: user.email, 
				name: user.name 
			});
			
			res
				.cookie("tt_auth", token, {
					httpOnly: true,
					secure: process.env.NODE_ENV === "production",
					sameSite: "lax",
					maxAge: 7 * 24 * 60 * 60 * 1000,
				})
				.json({ 
					user: {
						id: user.id,
						name: user.name,
						email: user.email,
						role: user.role,
						phone: user.phone,
						customerStatus: user.customerStatus,
						address: user.address,
						createdAt: user.createdAt,
						updatedAt: user.updatedAt
					}, 
					token 
				});
		} catch (error) {
			console.error('Login error:', error);
			res.status(500).json({ error: 'Failed to login' });
		}
	}
);

router.post("/logout", async (_req, res) => {
	res.clearCookie("tt_auth").json({ success: true });
});

router.get("/me", requireAuth, async (req, res) => {
	try {
		const user = await FirebaseService.getUserById(req.user.id);
		if (!user) return res.status(401).json({ error: "Unauthorized" });
		
		res.json({ 
			user: { 
				id: user.id, 
				email: user.email, 
				name: user.name, 
				role: user.role,
				phone: user.phone,
				customerStatus: user.customerStatus,
				address: user.address,
				createdAt: user.createdAt,
				updatedAt: user.updatedAt
			} 
		});
	} catch (error) {
		console.error('Get user error:', error);
		res.status(500).json({ error: 'Failed to get user data' });
	}
});

// PUT /api/auth/profile - Update user profile
router.put("/profile", requireAuth, async (req, res) => {
	try {
		const { address } = req.body;
		
		const updateData = {};
		if (address) {
			updateData.address = address;
		}
		
		const user = await FirebaseService.updateUser(req.user.id, updateData);
		
		if (!user) {
			return res.status(404).json({ error: "User not found" });
		}
		
		res.json({ 
			user: { 
				id: user.id, 
				email: user.email, 
				name: user.name, 
				role: user.role,
				phone: user.phone,
				customerStatus: user.customerStatus,
				address: user.address,
				createdAt: user.createdAt,
				updatedAt: user.updatedAt
			} 
		});
	} catch (error) {
		console.error('Error updating profile:', error);
		res.status(500).json({ error: 'Failed to update profile' });
	}
});

export default router;
