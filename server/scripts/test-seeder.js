import { appendProductToSeeder, updateProductInSeeder, removeProductFromSeeder } from "../src/utils/seeder-utils.js";

// Test adding a product
const testProduct = {
  name: "Test Product",
  description: "This is a test product",
  price: 15.99,
  category: "Test Category",
  image: "/test-image.jpg",
  stock: 10,
  status: "active",
  isNewProduct: true,
  isFeatured: false,
  availability: "Available"
};

console.log("Testing seeder utilities...");

// Test append
console.log("\n1. Testing appendProductToSeeder:");
const appendResult = appendProductToSeeder(testProduct);
console.log("Append result:", appendResult);

// Test update
console.log("\n2. Testing updateProductInSeeder:");
const updatedProduct = {
  ...testProduct,
  price: 19.99,
  description: "Updated test product description"
};
const updateResult = updateProductInSeeder("Test Product", updatedProduct);
console.log("Update result:", updateResult);

// Test remove
console.log("\n3. Testing removeProductFromSeeder:");
const removeResult = removeProductFromSeeder("Test Product");
console.log("Remove result:", removeResult);

console.log("\nSeeder utility tests completed!");
