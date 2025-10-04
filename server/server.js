import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

import authRoutes from "./src/routes/auth.js";
import adminRoutes from "./src/routes/admin.js";
import categoryRoutes from "./src/routes/category.js";
import productRoutes from "./src/routes/products.js";
import uploadRoutes from "./src/routes/upload.js";
import orderRoutes from "./src/routes/orders.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;
const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/Truetaste";

const ALLOWED_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:3000";
app.use(cors({ origin: ALLOWED_ORIGIN, credentials: true, allowedHeaders: ["Content-Type", "Authorization"] }));
app.use(express.json());
app.use(cookieParser());

app.get("/health", (_req, res) => {
	res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/orders", orderRoutes);

// Serve static files from uploads directory
app.use('/uploads', express.static('uploads'));

mongoose
	.connect(mongoUri)
	.then(() => {
		console.log("MongoDB connected");
		app.listen(port, () => console.log(`Server listening on ${port}`));
	})
	.catch((err) => {
		console.error("MongoDB connection error:", err);
		process.exit(1);
	});


