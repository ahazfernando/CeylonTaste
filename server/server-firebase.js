import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

// Import Firebase Admin configuration
import './firebase-admin-config.js';

// Import Firebase routes
import authRoutes from "./src/routes/auth-firebase.js";
import adminRoutes from "./src/routes/admin-firebase.js";
import categoryRoutes from "./src/routes/categories-firebase.js";
import productRoutes from "./src/routes/products-firebase.js";
import uploadRoutes from "./src/routes/upload.js";
import orderRoutes from "./src/routes/orders-firebase.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

const ALLOWED_ORIGINS = process.env.CLIENT_ORIGIN ? process.env.CLIENT_ORIGIN.split(',') : ["http://localhost:3000", "http://localhost:3001", "http://localhost:3002"];
app.use(cors({ origin: ALLOWED_ORIGINS, credentials: true, allowedHeaders: ["Content-Type", "Authorization"] }));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/orders", orderRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "OK", 
    database: "Firebase Firestore",
    timestamp: new Date().toISOString()
  });
});

// Serve static files from uploads directory
app.use('/uploads', express.static('uploads'));

// Start server
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
  console.log(`Database: Firebase Firestore`);
  console.log(`Health check: http://localhost:${port}/api/health`);
});
