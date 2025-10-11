import mongoose from "mongoose";
import Product from "../src/models/Product.js";
import dotenv from "dotenv";

dotenv.config();

const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/Truetaste";

const seedProducts = [{
  name: "Red Velvet Cake",
  description: "Moist red velvet cake with cream cheese frosting",
  price: 549,
  category: "Cakes",
  image: "/uploads/image-1760198197109-98198948.jpg",
  availability: "Available",
  status: "active",
  isNewProduct: false,
  isFeatured: true
},
  {
  name: "Cappuccino",
  description: "Rich espresso blended with steamed milk and topped with creamy foam art for a perfect balance of strength and smoothness.",
  price: 590,
  category: "Beverages",
  image: "/uploads/image-1760198076033-696096066.jpg",
  availability: "In House Only",
  status: "active",
  isNewProduct: false,
  isFeatured: true
},
  {
  name: "Caramel Frappe",
  description: "Iced coffee blended with milk, whipped cream, and drizzled caramel for a refreshing sweet pick-me-up",
  price: 695,
  category: "Beverages",
  image: "/uploads/image-1760198125586-374604203.jpg",
  availability: "In House Only",
  status: "active",
  isNewProduct: false,
  isFeatured: true
},
  {
  name: "Caramel Pecan Layer Cake",
  description: "Soft caramel sponge layered with creamy frosting, topped with roasted pecans for a nutty delight.",
  price: 790,
  category: "Beverages",
  image: "/uploads/image-1760198245026-731108612.jpg",
  availability: "Available",
  status: "active",
  isNewProduct: false,
  isFeatured: false
},
  {
  name: "Chicken Sub Sandwich",
  description: "Toasted sub roll filled with spiced chicken, cheese, tomato, and onion for a satisfying bite.",
  price: 990,
  category: "Burgers",
  image: "/uploads/image-1760198386162-178140957.jpg",
  availability: "Available",
  status: "active",
  isNewProduct: false,
  isFeatured: false
},
  {
  name: "Mushroom Rice",
  description: "Fragrant rice stir-fried with tender mushrooms, garlic, and herbs, creating a rich, earthy flavor and perfectly balanced aroma.",
  price: 670,
  category: "Main Courses",
  image: "/uploads/image-1760198516539-673276367.jpg",
  availability: "Available",
  status: "active",
  isNewProduct: false,
  isFeatured: false
},
  {
  name: "Strawberry Milkshake",
  description: "Creamy vanilla ice cream blended with fresh strawberries and topped with whipped cream for a sweet, refreshing treat.",
  price: 1250,
  category: "Beverages",
  image: "/uploads/image-1760198662038-463748717.jpg",
  availability: "Available",
  status: "active",
  isNewProduct: false,
  isFeatured: false
},
  {
  name: "Strawberry Shortcake",
  description: "Soft sponge roll filled with whipped cream and fresh strawberries, lightly dusted with icing sugar.",
  price: 390,
  category: "Cakes",
  image: "/uploads/image-1760198692164-328634562.jpg",
  availability: "Available",
  status: "active",
  isNewProduct: false,
  isFeatured: false
},
  {
  name: "Creamy Mushroom Pasta",
  description: "Fettuccine tossed in a rich, creamy mushroom sauce with garlic, herbs, and parmesan.",
  price: 1250,
  category: "Italian",
  image: "/uploads/image-1760198723901-963336018.jpg",
  availability: "In House Only",
  status: "active",
  isNewProduct: false,
  isFeatured: false
},
  {
  name: "Classic Tiramisu",
  description: "Layers of espresso-soaked sponge and mascarpone cream dusted with cocoa powder.",
  price: 450,
  category: "Cakes",
  image: "/uploads/image-1760198759227-269662436.jpg",
  availability: "Available",
  status: "active",
  isNewProduct: false,
  isFeatured: false
},
  {
  name: "Tuna Salad",
  description: "Fresh greens mixed with tuna, feta, cherry tomatoes, olives, and a light lemon dressing.",
  price: 790,
  category: "Salads",
  image: "/uploads/image-1760198800174-779802351.jpg",
  availability: "Available",
  status: "active",
  isNewProduct: false,
  isFeatured: false
}];

async function seedDatabase() {
  try {
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB");

    // Clear existing products
    await Product.deleteMany({});
    console.log("Cleared existing products");

    // Insert seed products one by one
    const products = [];
    for (const productData of seedProducts) {
      console.log('Processing product:', productData?.name || 'Unknown');
      const product = new Product(productData);
      await product.save();
      products.push(product);
    }
    console.log(`Seeded ${products.length} products successfully`);

    // Display seeded products
    console.log("\nSeeded products:");
    products.forEach(product => {
      console.log(`- ${product.name} (${product.category}) - $${product.price} - ${product.availability}`);
    });

    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
}

seedDatabase();
