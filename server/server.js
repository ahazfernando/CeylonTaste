import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

import authRoutes from "./src/routes/auth.js";
import adminRoutes from "./src/routes/admin.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;
const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/truetaste";

app.use(cors({ origin: process.env.CLIENT_ORIGIN || "http://localhost:3000", credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.get("/health", (_req, res) => {
	res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);

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


