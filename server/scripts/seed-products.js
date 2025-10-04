import mongoose from "mongoose";
import Product from "../src/models/Product.js";
import dotenv from "dotenv";

dotenv.config();

const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/Truetaste";

const seedProducts = [
  {
    name: "Ceylon Gold Premium Coffee",
    description: "Rich and aromatic premium Ceylon coffee with notes of chocolate and citrus",
    price: 24.99,
    originalPrice: 29.99,
    category: "Coffee",
    image: "/placeholder.svg",
    stock: 50,
    status: "active",
    isNewProduct: true,
    isFeatured: true,
  },
  {
    name: "Royal Chocolate Cake",
    description: "Decadent chocolate cake with Ceylon cinnamon and premium cocoa",
    price: 18.50,
    category: "Cakes",
    image: "/placeholder.svg",
    stock: 12,
    status: "active",
    isFeatured: true,
  },
  {
    name: "Ceylon Breakfast Blend",
    description: "Perfect morning blend with strong flavor and smooth finish",
    price: 19.99,
    originalPrice: 24.99,
    category: "Coffee",
    image: "/placeholder.svg",
    stock: 30,
    status: "active",
  },
  {
    name: "Chocolate Croissant",
    description: "Buttery croissant filled with rich dark chocolate",
    price: 4.25,
    category: "Pastries",
    image: "/placeholder.svg",
    stock: 24,
    status: "active",
  },
  {
    name: "Cappuccino",
    description: "Classic Italian coffee with steamed milk foam",
    price: 5.50,
    category: "Coffee",
    image: "/placeholder.svg",
    stock: 0,
    status: "active",
  },
  {
    name: "Red Velvet Cake",
    description: "Moist red velvet cake with cream cheese frosting",
    price: 28.00,
    category: "Cakes",
    image: "/placeholder.svg",
    stock: 8,
    status: "active",
  },
  {
    name: "Blueberry Muffin",
    description: "Fresh baked muffin loaded with juicy blueberries",
    price: 3.75,
    category: "Pastries",
    image: "/placeholder.svg",
    stock: 15,
    status: "active",
  },
];

async function seedDatabase() {
  try {
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB");

    // Clear existing products
    await Product.deleteMany({});
    console.log("Cleared existing products");

    // Insert seed products
    const products = await Product.insertMany(seedProducts);
    console.log(`Seeded ${products.length} products successfully`);

    // Display seeded products
    console.log("\nSeeded products:");
    products.forEach(product => {
      console.log(`- ${product.name} (${product.category}) - $${product.price}`);
    });

    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
}

seedDatabase();
