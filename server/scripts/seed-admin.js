import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import User from "../src/models/User.js";

dotenv.config();

const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/truetaste";

async function run() {
	await mongoose.connect(mongoUri);
	const email = process.env.ADMIN_EMAIL || "admin@example.com";
	const password = process.env.ADMIN_PASSWORD || "StrongPassword123!";
	const name = process.env.ADMIN_NAME || "Administrator";

	let user = await User.findOne({ email });
	if (!user) {
		const passwordHash = await bcrypt.hash(password, 10);
		user = await User.create({ name, email, passwordHash, role: "admin" });
		console.log("Admin user created:", email);
	} else {
		if (user.role !== "admin") {
			user.role = "admin";
			await user.save();
			console.log("Existing user promoted to admin:", email);
		} else {
			console.log("Admin user already exists:", email);
		}
	}
	await mongoose.disconnect();
}

run().catch((e) => {
	console.error(e);
	process.exit(1);
});


