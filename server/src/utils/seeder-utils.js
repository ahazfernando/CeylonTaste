import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SEEDER_FILE_PATH = path.join(__dirname, '../../scripts/seed-products.js');

/**
 * Appends a new product to the seeder file
 * @param {Object} product - The product object to add
 */
export function appendProductToSeeder(product) {
  try {
    // Read the current seeder file
    let seederContent = fs.readFileSync(SEEDER_FILE_PATH, 'utf8');
    
    // Extract the current seedProducts array
    const arrayStart = seederContent.indexOf('const seedProducts = [');
    const arrayEnd = seederContent.indexOf('];', arrayStart);
    
    if (arrayStart === -1 || arrayEnd === -1) {
      console.error('Could not find seedProducts array in seeder file');
      return false;
    }
    
    // Get the content before and after the array
    const beforeArray = seederContent.substring(0, arrayStart + 'const seedProducts = ['.length);
    const afterArray = seederContent.substring(arrayEnd);
    
    // Extract the current array content (without the brackets)
    const currentArrayContent = seederContent.substring(
      arrayStart + 'const seedProducts = ['.length,
      arrayEnd
    ).trim();
    
    // Create the new product object
    const newProduct = {
      name: product.name,
      description: product.description,
      price: product.price,
      originalPrice: product.originalPrice || undefined,
      category: product.category,
      image: product.image || "/placeholder.svg",
      availability: product.availability || "Available",
      status: product.status || "active",
      isNewProduct: product.isNewProduct || false,
      isFeatured: product.isFeatured || false
    };
    
    // Remove undefined properties
    Object.keys(newProduct).forEach(key => {
      if (newProduct[key] === undefined) {
        delete newProduct[key];
      }
    });
    
    // Format the new product as a string
    const newProductString = JSON.stringify(newProduct, null, 2)
      .replace(/"([^"]+)":/g, '$1:')  // Remove quotes from keys
      .replace(/"/g, '"')             // Keep quotes for string values
      .replace(/: true/g, ': true')   // Keep boolean true
      .replace(/: false/g, ': false') // Keep boolean false
      .replace(/: null/g, ': null')   // Keep null
      .replace(/: undefined/g, ': undefined'); // Keep undefined
    
    // Build the new array content
    let newArrayContent;
    if (currentArrayContent) {
      // Add comma and newline before the new product
      newArrayContent = currentArrayContent + ',\n  ' + newProductString;
    } else {
      // First product in the array
      newArrayContent = '\n  ' + newProductString;
    }
    
    // Reconstruct the file content
    const newContent = beforeArray + newArrayContent + afterArray;
    
    // Write back to the file
    fs.writeFileSync(SEEDER_FILE_PATH, newContent, 'utf8');
    
    console.log(`Product "${product.name}" added to seeder file`);
    return true;
  } catch (error) {
    console.error('Error appending product to seeder file:', error);
    return false;
  }
}

/**
 * Updates an existing product in the seeder file
 * @param {string} productName - The name of the product to update
 * @param {Object} updatedProduct - The updated product object
 */
export function updateProductInSeeder(productName, updatedProduct) {
  try {
    // Read the current seeder file
    let seederContent = fs.readFileSync(SEEDER_FILE_PATH, 'utf8');
    
    // Extract the current seedProducts array
    const arrayStart = seederContent.indexOf('const seedProducts = [');
    const arrayEnd = seederContent.indexOf('];', arrayStart);
    
    if (arrayStart === -1 || arrayEnd === -1) {
      console.error('Could not find seedProducts array in seeder file');
      return false;
    }
    
    // Get the content before and after the array
    const beforeArray = seederContent.substring(0, arrayStart + 'const seedProducts = ['.length);
    const afterArray = seederContent.substring(arrayEnd);
    
    // Extract the current array content
    const currentArrayContent = seederContent.substring(
      arrayStart + 'const seedProducts = ['.length,
      arrayEnd
    );
    
    // Find and replace the product
    const productRegex = new RegExp(
      `\\{\\s*name:\\s*"${productName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"[^}]+\\}`,
      's'
    );
    
    // Create the updated product object
    const updatedProductObj = {
      name: updatedProduct.name,
      description: updatedProduct.description,
      price: updatedProduct.price,
      originalPrice: updatedProduct.originalPrice || undefined,
      category: updatedProduct.category,
      image: updatedProduct.image || "/placeholder.svg",
      availability: updatedProduct.availability || "Available",
      status: updatedProduct.status || "active",
      isNewProduct: updatedProduct.isNewProduct || false,
      isFeatured: updatedProduct.isFeatured || false
    };
    
    // Remove undefined properties
    Object.keys(updatedProductObj).forEach(key => {
      if (updatedProductObj[key] === undefined) {
        delete updatedProductObj[key];
      }
    });
    
    // Format the updated product as a string
    const updatedProductString = JSON.stringify(updatedProductObj, null, 2)
      .replace(/"([^"]+)":/g, '$1:')
      .replace(/"/g, '"')
      .replace(/: true/g, ': true')
      .replace(/: false/g, ': false')
      .replace(/: null/g, ': null')
      .replace(/: undefined/g, ': undefined');
    
    // Replace the product in the array
    const newArrayContent = currentArrayContent.replace(productRegex, updatedProductString);
    
    // Reconstruct the file content
    const newContent = beforeArray + newArrayContent + afterArray;
    
    // Write back to the file
    fs.writeFileSync(SEEDER_FILE_PATH, newContent, 'utf8');
    
    console.log(`Product "${productName}" updated in seeder file`);
    return true;
  } catch (error) {
    console.error('Error updating product in seeder file:', error);
    return false;
  }
}

/**
 * Removes a product from the seeder file
 * @param {string} productName - The name of the product to remove
 */
export function removeProductFromSeeder(productName) {
  try {
    // Read the current seeder file
    let seederContent = fs.readFileSync(SEEDER_FILE_PATH, 'utf8');
    
    // Extract the current seedProducts array
    const arrayStart = seederContent.indexOf('const seedProducts = [');
    const arrayEnd = seederContent.indexOf('];', arrayStart);
    
    if (arrayStart === -1 || arrayEnd === -1) {
      console.error('Could not find seedProducts array in seeder file');
      return false;
    }
    
    // Get the content before and after the array
    const beforeArray = seederContent.substring(0, arrayStart + 'const seedProducts = ['.length);
    const afterArray = seederContent.substring(arrayEnd);
    
    // Extract the current array content
    const currentArrayContent = seederContent.substring(
      arrayStart + 'const seedProducts = ['.length,
      arrayEnd
    );
    
    // Find and remove the product (including the comma before it if it exists)
    const productRegex = new RegExp(
      `(,\\s*)?\\{\\s*name:\\s*"${productName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"[^}]+\\}`,
      's'
    );
    
    // Remove the product from the array
    const newArrayContent = currentArrayContent.replace(productRegex, '');
    
    // Clean up any double commas or leading/trailing commas
    const cleanedArrayContent = newArrayContent
      .replace(/,\s*,/g, ',')  // Remove double commas
      .replace(/^\s*,/, '')    // Remove leading comma
      .replace(/,\s*$/, '');   // Remove trailing comma
    
    // Reconstruct the file content
    const newContent = beforeArray + cleanedArrayContent + afterArray;
    
    // Write back to the file
    fs.writeFileSync(SEEDER_FILE_PATH, newContent, 'utf8');
    
    console.log(`Product "${productName}" removed from seeder file`);
    return true;
  } catch (error) {
    console.error('Error removing product from seeder file:', error);
    return false;
  }
}
