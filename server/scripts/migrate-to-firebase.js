import mongoose from "mongoose";
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import dotenv from "dotenv";

// Import MongoDB models
import User from "../src/models/User.js";
import Product from "../src/models/Product.js";
import Order from "../src/models/Order.js";
import Category from "../src/models/Category.js";

dotenv.config();

// MongoDB connection
const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/Truetaste";

// Firebase Admin configuration
const firebaseAdminConfig = {
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  }),
};

// Initialize Firebase Admin
const app = initializeApp(firebaseAdminConfig);
const db = getFirestore(app);

async function migrateData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB");

    // Migrate Users
    console.log("Migrating users...");
    const users = await User.find({});
    const userMap = new Map(); // To map MongoDB _id to Firebase document ID

    for (const user of users) {
      try {
        const userObj = user.toObject(); // Convert Mongoose document to plain object
        const userData = {
          name: userObj.name,
          email: userObj.email,
          passwordHash: userObj.passwordHash || null,
          role: userObj.role,
          phone: userObj.phone || null,
          customerStatus: userObj.customerStatus,
          address: userObj.address || null,
          createdAt: userObj.createdAt,
          updatedAt: userObj.updatedAt
        };

        const docRef = await db.collection('users').add(userData);
        userMap.set(user._id.toString(), docRef.id);
        console.log(`Migrated user: ${user.name} -> ${docRef.id}`);
      } catch (error) {
        console.error(`Failed to migrate user ${user.name}:`, error.message);
        // Skip this user and continue
      }
    }

    // Migrate Categories
    console.log("Migrating categories...");
    const categories = await Category.find({});
    const categoryMap = new Map();

    for (const category of categories) {
      const categoryObj = category.toObject();
      const categoryData = {
        name: categoryObj.name,
        description: categoryObj.description || null,
        createdBy: categoryObj.createdBy ? userMap.get(categoryObj.createdBy.toString()) : null,
        createdAt: categoryObj.createdAt,
        updatedAt: categoryObj.updatedAt
      };

      const docRef = await db.collection('categories').add(categoryData);
      categoryMap.set(category._id.toString(), docRef.id);
      console.log(`Migrated category: ${category.name} -> ${docRef.id}`);
    }

    // Migrate Products
    console.log("Migrating products...");
    const products = await Product.find({});
    const productMap = new Map();

    for (const product of products) {
      const productObj = product.toObject();
      const productData = {
        name: productObj.name,
        description: productObj.description,
        price: productObj.price,
        originalPrice: productObj.originalPrice || null,
        reviewCount: productObj.reviewCount || 0,
        category: productObj.category,
        image: productObj.image,
        availability: productObj.availability,
        status: productObj.status,
        isNewProduct: productObj.isNewProduct || false,
        isFeatured: productObj.isFeatured || false,
        createdAt: productObj.createdAt,
        updatedAt: productObj.updatedAt
      };

      const docRef = await db.collection('products').add(productData);
      productMap.set(product._id.toString(), docRef.id);
      console.log(`Migrated product: ${product.name} -> ${docRef.id}`);
    }

    // Migrate Orders
    console.log("Migrating orders...");
    const orders = await Order.find({}).populate('user').populate('items.product');
    
    for (const order of orders) {
      try {
        const orderObj = order.toObject();
        
        // Skip orders with missing user or product references
        if (!orderObj.user || !orderObj.user._id) {
          console.log(`Skipping order ${orderObj.orderNumber}: missing user reference`);
          continue;
        }
        
        const userId = userMap.get(orderObj.user._id.toString());
        if (!userId) {
          console.log(`Skipping order ${orderObj.orderNumber}: user not found in migration map`);
          continue;
        }
        
        const orderData = {
          user: userId,
          orderNumber: orderObj.orderNumber,
          items: orderObj.items.filter(item => item.product && item.product._id).map(item => ({
            product: productMap.get(item.product._id.toString()),
            quantity: item.quantity,
            price: item.price
          })).filter(item => item.product), // Only include items with valid product references
          subtotal: orderObj.subtotal,
          shipping: orderObj.shipping || 0,
          tax: orderObj.tax || 0,
          total: orderObj.total,
          status: orderObj.status,
          shippingAddress: orderObj.shippingAddress || null,
          paymentMethod: orderObj.paymentMethod,
          paymentStatus: orderObj.paymentStatus,
          notes: orderObj.notes || null,
          createdAt: orderObj.createdAt,
          updatedAt: orderObj.updatedAt
        };

        // Only migrate orders that have at least one valid item
        if (orderData.items.length > 0) {
          await db.collection('orders').add(orderData);
          console.log(`Migrated order: ${order.orderNumber}`);
        } else {
          console.log(`Skipping order ${orderObj.orderNumber}: no valid items`);
        }
      } catch (error) {
        console.error(`Failed to migrate order ${order.orderNumber}:`, error.message);
        // Skip this order and continue
      }
    }

    console.log("Migration completed successfully!");
    console.log(`Migrated ${users.length} users, ${categories.length} categories, ${products.length} products, ${orders.length} orders`);

  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

migrateData();
