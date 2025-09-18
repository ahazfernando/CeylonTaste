import jwt from "jsonwebtoken";

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

export function requireAdmin(req, res, next) {
	if (!req.user || req.user.role !== "admin") {
		return res.status(403).json({ error: "Forbidden" });
	}
	next();
}


