import jwt from "jsonwebtoken";
import User from "../models/User.js";

export function signAuthToken(payload, options = {}) {
	const secret = process.env.JWT_SECRET || "dev_secret_change_me";
	return jwt.sign(payload, secret, { expiresIn: "7d", ...options });
}

export function verifyAuthToken(token) {
	const secret = process.env.JWT_SECRET || "dev_secret_change_me";
	return jwt.verify(token, secret);
}

export function requireAuth(req, res, next) {
	try {
		const token = req.cookies["tt_auth"] || (req.headers.authorization || "").replace("Bearer ", "");
		if (!token) return res.status(401).json({ error: "Unauthorized" });
		const decoded = verifyAuthToken(token);
		req.user = decoded;
		next();
	} catch (err) {
		return res.status(401).json({ error: "Unauthorized" });
	}
}

export async function requireAdmin(req, res, next) {
	try {
		if (!req.user?.id) return res.status(403).json({ error: "Forbidden" });
		const user = await User.findById(req.user.id).lean();
		if (!user || user.role !== "admin") return res.status(403).json({ error: "Forbidden" });
		next();
	} catch {
		return res.status(403).json({ error: "Forbidden" });
	}
}


