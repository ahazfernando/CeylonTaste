import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../src/models/User.js";
import Product from "../src/models/Product.js";
import Order from "../src/models/Order.js";

dotenv.config();

// Sri Lankan addresses
const sriLankanAddresses = [
  {
    street: "123 Galle Road",
    city: "Colombo",
    province: "Western Province",
    zipCode: "00300",
    country: "Sri Lanka",
    phone: "+94 11 234 5678"
  },
  {
    street: "45 Kandy Road",
    city: "Kandy",
    province: "Central Province", 
    zipCode: "20000",
    country: "Sri Lanka",
    phone: "+94 81 234 5678"
  },
  {
    street: "78 Negombo Road",
    city: "Negombo",
    province: "Western Province",
    zipCode: "11500",
    country: "Sri Lanka", 
    phone: "+94 31 234 5678"
  },
  {
    street: "12 Jaffna Road",
    city: "Jaffna",
    province: "Northern Province",
    zipCode: "40000",
    country: "Sri Lanka",
    phone: "+94 21 234 5678"
  },
  {
    street: "56 Trincomalee Road",
    city: "Trincomalee",
    province: "Eastern Province",
    zipCode: "31000",
    country: "Sri Lanka",
    phone: "+94 26 234 5678"
  },
  {
    street: "89 Galle Fort Road",
    city: "Galle",
    province: "Southern Province",
    zipCode: "80000",
    country: "Sri Lanka",
    phone: "+94 91 234 5678"
  },
  {
    street: "34 Anuradhapura Road",
    city: "Anuradhapura",
    province: "North Central Province",
    zipCode: "50000",
    country: "Sri Lanka",
    phone: "+94 25 234 5678"
  },
  {
    street: "67 Kurunegala Road",
    city: "Kurunegala",
    province: "North Western Province",
    zipCode: "60000",
    country: "Sri Lanka",
    phone: "+94 37 234 5678"
  },
  {
    street: "23 Ratnapura Road",
    city: "Ratnapura",
    province: "Sabaragamuwa Province",
    zipCode: "70000",
    country: "Sri Lanka",
    phone: "+94 45 234 5678"
  },
  {
    street: "91 Badulla Road",
    city: "Badulla",
    province: "Uva Province",
    zipCode: "90000",
    country: "Sri Lanka",
    phone: "+94 55 234 5678"
  }
];

// Sri Lankan names
const sriLankanNames = [
  "Priya Fernando", "Rajesh Perera", "Kumari Silva", "Nimal Jayawardena",
  "Sanduni Wickramasinghe", "Dinesh Karunaratne", "Chamari Ratnayake", "Saman Gunasekara",
  "Nishadi Mendis", "Kasun Rajapaksa", "Tharanga Bandara", "Dilani Weerasinghe",
  "Ruwan Dissanayake", "Shamali Abeysekara", "Chaminda Kulatunga", "Nirosha Pathirana",
  "Suresh Gamage", "Indira Herath", "Ajith Premasiri", "Kavitha Jayasuriya",
  "Ranjith Wijesinghe", "Manel Senanayake", "Dilshan Fonseka", "Nadeeka Gunathilaka",
  "Chathura Edirisinghe", "Samanthi Ranasinghe", "Nuwan Wickramaratne", "Dilrukshi Perera"
];

const paymentMethods = ['credit_card', 'debit_card', 'cash_on_delivery'];

async function generateOrders() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/Truetaste";
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB");

    // Get existing users and products
    const users = await User.find({ role: 'user' });
    const products = await Product.find({ status: 'active' });

    if (users.length === 0) {
      console.log("No users found. Please create some users first.");
      return;
    }

    if (products.length === 0) {
      console.log("No products found. Please create some products first.");
      return;
    }

    console.log(`Found ${users.length} users and ${products.length} products`);
    
    // Debug: Check first user
    if (users.length > 0) {
      console.log("Sample user:", users[0]);
    }

    // Filter valid users (those with _id)
    const validUsers = users.filter(user => user && user._id);
    console.log(`Using ${validUsers.length} valid users for order generation`);
    
    if (validUsers.length === 0) {
      console.log("No valid users found. Cannot create orders.");
      return;
    }
    
    // Generate orders from June to present
    const orders = [];
    const startDate = new Date('2024-06-01');
    const endDate = new Date();
    
    // Generate 25 orders
    for (let i = 0; i < 25; i++) {
      // Random date between June and now
      const randomTime = startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime());
      const orderDate = new Date(randomTime);
      
      // Random user from valid users
      const user = validUsers[Math.floor(Math.random() * validUsers.length)];
      
      // Random address
      const address = sriLankanAddresses[Math.floor(Math.random() * sriLankanAddresses.length)];
      
      // Random name (might be different from user name)
      const customerName = sriLankanNames[Math.floor(Math.random() * sriLankanNames.length)];
      
      // Random number of products (2-5)
      const numProducts = Math.floor(Math.random() * 4) + 2; // 2-5 products
      const selectedProducts = [];
      
      // Select random products
      for (let j = 0; j < numProducts; j++) {
        const product = products[Math.floor(Math.random() * products.length)];
        const quantity = Math.floor(Math.random() * 3) + 1; // 1-3 quantity
        
        // Check if product already selected
        const existingProduct = selectedProducts.find(p => p.product.toString() === product._id.toString());
        if (existingProduct) {
          existingProduct.quantity += quantity;
        } else {
          selectedProducts.push({
            product: product._id,
            quantity: quantity,
            price: product.price
          });
        }
      }
      
      // Calculate totals
      const subtotal = selectedProducts.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const shipping = 5.99;
      const tax = subtotal * 0.08; // 8% tax
      const total = subtotal + shipping + tax;
      
      // Generate unique order number using timestamp
      const orderNumber = `ORD-${Date.now()}-${i}`;
      
      const order = {
        user: user._id,
        orderNumber: orderNumber,
        items: selectedProducts,
        subtotal: Math.round(subtotal * 100) / 100,
        shipping: shipping,
        tax: Math.round(tax * 100) / 100,
        total: Math.round(total * 100) / 100,
        status: 'shipped', // All orders are shipped as requested
        shippingAddress: {
          ...address,
          fullName: customerName,
          email: user.email
        },
        paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
        paymentStatus: 'paid',
        notes: `Order placed on ${orderDate.toLocaleDateString()}`,
        createdAt: orderDate,
        updatedAt: orderDate
      };
      
      
      orders.push(order);
    }

    // Insert orders one by one
    console.log("Inserting orders...");
    const insertedOrders = [];
    
    for (const orderData of orders) {
      try {
        const order = new Order(orderData);
        const savedOrder = await order.save();
        insertedOrders.push(savedOrder);
        console.log(`Created order: ${savedOrder.orderNumber}`);
      } catch (error) {
        console.error(`Failed to create order:`, error.message);
      }
    }
    
    console.log(`Successfully created ${insertedOrders.length} orders`);

    // Calculate total revenue
    const totalRevenue = insertedOrders.reduce((sum, order) => sum + order.total, 0);
    console.log(`Total revenue generated: LKR ${totalRevenue.toLocaleString()}`);

    // Show some sample orders
    console.log("\nSample orders created:");
    insertedOrders.slice(0, 3).forEach(order => {
      console.log(`- ${order.orderNumber}: ${order.shippingAddress.fullName} - LKR ${order.total} (${order.items.length} items)`);
    });

  } catch (error) {
    console.error("Error generating orders:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

// Run the script
generateOrders();
