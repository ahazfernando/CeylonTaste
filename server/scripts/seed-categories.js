import mongoose from "mongoose";
import Category from "../src/models/Category.js";
import dotenv from "dotenv";

dotenv.config();

const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/Truetaste";

const seedCategories = [
  {
    name: "Coffee",
    description: "Premium coffee blends and beverages made from the finest Ceylon beans"
  },
  {
    name: "Pastries",
    description: "Fresh baked pastries and baked goods made daily with authentic recipes"
  }
];

async function seedDatabase() {
  try {
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB");

    // Check if categories already exist
    for (const categoryData of seedCategories) {
      const existing = await Category.findOne({ name: categoryData.name });
      if (existing) {
        console.log(`Category "${categoryData.name}" already exists, skipping...`);
        continue;
      }

      const category = new Category(categoryData);
      await category.save();
      console.log(`Created category: ${categoryData.name}`);
    }

    // Update "Cake" to "Cakes" if it exists
    const cakeCategory = await Category.findOne({ name: "Cake" });
    if (cakeCategory) {
      cakeCategory.name = "Cakes";
      cakeCategory.description = "Handcrafted cakes made with the finest ingredients, perfect for celebrations and special occasions";
      await cakeCategory.save();
      console.log("Updated 'Cake' to 'Cakes'");
    }

    console.log("Category seeding completed successfully");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding categories:", error);
    process.exit(1);
  }
}

seedDatabase();
