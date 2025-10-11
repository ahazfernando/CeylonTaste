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
},
  {
  name: "Vanilla Ice Cream",
  description: "Classic creamy vanilla ice cream served in a waffle cone or bowl.",
  price: 500,
  category: "Desserts",
  image: "/uploads/image-1760198956176-989296080.jpg",
  availability: "In House Only",
  status: "active",
  isNewProduct: false,
  isFeatured: false
},
  {
  name: "Vanilla Latte",
  description: "Smooth espresso blended with steamed milk and vanilla syrup, topped with light foam.",
  price: 450,
  category: "Beverages",
  image: "/uploads/image-1760198995165-389356436.jpg",
  availability: "In House Only",
  status: "active",
  isNewProduct: false,
  isFeatured: false
},
  {
  name: "Vegetable Salad",
  description: "Crisp greens with broccoli, cucumber, chickpeas, and a tangy sesame dressing.",
  price: 549,
  category: "Salads",
  image: "/placeholder.svg",
  availability: "Available",
  status: "active",
  isNewProduct: false,
  isFeatured: false
},
  {
  name: "Vegetable Fried Rice",
  description: "Aromatic fried rice tossed with colorful vegetables, spring onions, and light soy seasoning.",
  price: 590,
  category: "Main Courses",
  image: "/uploads/image-1760199234154-331407521.jpg",
  availability: "Available",
  status: "active",
  isNewProduct: false,
  isFeatured: false
},
  {
  name: "Veggie Burger",
  description: "Crispy vegetable patty layered with cheese, lettuce, tomato, and creamy mayo in a soft oat bun.",
  price: 675,
  category: "Burgers",
  image: "/uploads/image-1760199225073-291902708.jpg",
  availability: "Available",
  status: "active",
  isNewProduct: false,
  isFeatured: false
},
  {
  name: "Watermelon Cooler",
  description: "Refreshing blend of fresh watermelon, mint, and cucumber the perfect summer thirst quencher.",
  price: 590,
  category: "Beverages",
  image: "/uploads/image-1760199277929-751175973.jpg",
  availability: "Available",
  status: "active",
  isNewProduct: false,
  isFeatured: false
},
  {
  name: "Veggie Pizza",
  description: "Loaded with fresh tomatoes, olives, mushrooms, and mozzarella on a crispy crust with rich tomato sauce.",
  price: 2250,
  category: "Pizza",
  image: "/uploads/image-1760199498692-890468586.jpg",
  availability: "Available",
  status: "active",
  isNewProduct: false,
  isFeatured: false
},
  {
  name: "Indian Curry Rice",
  description: "Steamed basmati rice served with spiced curry, paneer, and a flavorful lentil side.",
  price: 800,
  category: "Indian Food",
  image: "/uploads/image-1760199562048-945414910.jpg",
  availability: "Available",
  status: "active",
  isNewProduct: false,
  isFeatured: false
},
  {
  name: "Caramel Crunch Sundae",
  description: "Creamy vanilla ice cream layered with caramel drizzle, whipped cream, and crunchy toppings.",
  price: 1350,
  category: "Beverages",
  image: "/uploads/image-1760199635125-893346360.jpg",
  availability: "Available",
  status: "active",
  isNewProduct: false,
  isFeatured: false
},
  {
  name: "Pepperoni Pizza",
  description: "Classic pepperoni layered over mozzarella and tomato sauce, baked to cheesy perfection.",
  price: 2650,
  category: "Pizza",
  image: "/uploads/image-1760199680042-279629533.jpg",
  availability: "Available",
  status: "active",
  isNewProduct: false,
  isFeatured: false
},
  {
  name: "Chocolate Cherry Cheesecake",
  description: "Rich chocolate cheesecake topped with cherries and smooth chocolate ganache.",
  price: 1650,
  category: "Cakes",
  image: "/uploads/image-1760199749375-46032413.jpg",
  availability: "Available",
  status: "active",
  isNewProduct: false,
  isFeatured: false
},
  {
  name: "Oreo Milkshake",
  description: "Blended with Oreo cookies, vanilla ice cream, and topped with whipped cream and an Oreo biscuit.",
  price: 1250,
  category: "Beverages",
  image: "/uploads/image-1760199790140-59520290.jpg",
  availability: "Available",
  status: "active",
  isNewProduct: false,
  isFeatured: false
},
  {
  name: "Spaghetti Bolognese",
  description: "Classic Italian pasta tossed in a rich, slow-cooked meat sauce made with tomatoes, garlic, and herbs topped with Parmesan and fresh basil.",
  price: 2050,
  category: "Italian",
  image: "/uploads/image-1760200007848-228323478.jpg",
  availability: "Available",
  status: "active",
  isNewProduct: false,
  isFeatured: false
},
  {
  name: "Pineapple Juice",
  description: "Freshly pressed pineapple juice served chilled for a sweet and tangy refreshment.",
  price: 349,
  category: "Beverages",
  image: "/uploads/image-1760200051711-469785594.jpg",
  availability: "Breakfast",
  status: "active",
  isNewProduct: false,
  isFeatured: false
},
  {
  name: "Prawn Salad",
  description: "Juicy prawns tossed with glass noodles, cherry tomatoes, mint, and a tangy Thai dressing.",
  price: 1950,
  category: "Salads",
  image: "/uploads/image-1760200121021-73099568.jpg",
  availability: "Available",
  status: "active",
  isNewProduct: false,
  isFeatured: false
},
  {
  name: "Prawn Tempura",
  description: "Golden-fried prawns coated in crisp tempura batter, served with creamy mayo dip.",
  price: 2100,
  category: "Japanese",
  image: "/uploads/image-1760200169320-288337743.jpg",
  availability: "In House Only",
  status: "active",
  isNewProduct: false,
  isFeatured: true
},
  {
  name: "Seafood Fried Rice",
  description: "Classic fried rice with prawns, fish, and squid mixed with vegetables and egg.",
  price: 2250,
  category: "Main Courses",
  image: "/uploads/image-1760200215298-127112827.jpg",
  availability: "Available",
  status: "active",
  isNewProduct: false,
  isFeatured: false
},
  {
  name: "Cheese Balls",
  description: "Golden-fried crispy cheese bites served with tangy marinara dip.",
  price: 600,
  category: "Sides",
  image: "/uploads/image-1760200796107-736770610.jpg",
  availability: "Available",
  status: "active",
  isNewProduct: false,
  isFeatured: false
},
  {
  name: "Cheese Kottu",
  description: "Sri Lankan-style kottu mixed with cheese, vegetables, and spices, topped with creamy sauce and fries.",
  price: 890,
  category: "Main Courses",
  image: "/uploads/image-1760200824083-231002866.jpg",
  availability: "Available",
  status: "active",
  isNewProduct: false,
  isFeatured: false
},
  {
  name: "Chicken Burger",
  description: "Juicy grilled chicken patty with lettuce, tomato, and creamy mayo in a toasted bun.",
  price: 400,
  category: "Burgers",
  image: "/uploads/image-1760200852867-280376044.jpg",
  availability: "Available",
  status: "active",
  isNewProduct: false,
  isFeatured: false
},
  {
  name: "Coconut Lime Refresher",
  description: "Tropical coconut blended with lime and ice for a cool, creamy, and zesty finish.",
  price: 1050,
  category: "Beverages",
  image: "/uploads/image-1760200905109-908460641.jpg",
  availability: "Available",
  status: "active",
  isNewProduct: false,
  isFeatured: false
},
  {
  name: "Cold Brew Coffee",
  description: "Smooth and bold cold brew made from slow-steeped Arabica beans served over ice.",
  price: 490,
  category: "Beverages",
  image: "/uploads/image-1760200937906-801431090.jpg",
  availability: "In House Only",
  status: "active",
  isNewProduct: true,
  isFeatured: false
},
  {
  name: "Coleslaw",
  description: "Creamy and crunchy salad made with fresh cabbage, carrots, and a zesty mayo dressing.",
  price: 400,
  category: "Salads",
  image: "/uploads/image-1760201032632-523347360.jpg",
  availability: "Available",
  status: "active",
  isNewProduct: false,
  isFeatured: false
},
  {
  name: "Couscous Salad",
  description: "Light and colorful mix of couscous, olives, tomatoes, and herbs perfect as a side or light meal.",
  price: 600,
  category: "Salads",
  image: "/uploads/image-1760201128836-396505831.jpg",
  availability: "Available",
  status: "active",
  isNewProduct: false,
  isFeatured: false
},
  {
  name: "Beef Pizza",
  description: "Wood-fired pizza topped with juicy beef, caramelized onions, red peppers, and mozzarella cheese",
  price: 2190,
  category: "Pizza",
  image: "/uploads/image-1760202018508-208933969.jpg",
  availability: "In House Only",
  status: "active",
  isNewProduct: false,
  isFeatured: false
},
  {
  name: "Seafood Noodles",
  description: "Wok-tossed noodles with prawns, calamari, and a hint of chili and lime bursting with coastal flavor.",
  price: 1290,
  category: "Main Courses",
  image: "/uploads/image-1760202179774-187837643.jpg",
  availability: "Available",
  status: "active",
  isNewProduct: false,
  isFeatured: false
},
  {
  name: "Egg Fried Rice",
  description: "Classic fried rice with egg, spring onions, and vegetables simple, fragrant, and satisfying.",
  price: 590,
  category: "Main Courses",
  image: "/uploads/image-1760202219658-619221471.jpg",
  availability: "Available",
  status: "active",
  isNewProduct: false,
  isFeatured: false
},
  {
  name: "Crispy Chicken Strips",
  description: "Crisp golden-fried chicken tenders served with honey mustard or spicy mayo dip.",
  price: 900,
  category: "Sides",
  image: "/uploads/image-1760202289050-36431604.jpg",
  availability: "Available",
  status: "active",
  isNewProduct: false,
  isFeatured: false
},
  {
  name: "Beef Burger",
  description: "Grilled beef patty layered with cheese, caramelized onions, and special house sauce in a sesame bun.",
  price: 790,
  category: "Burgers",
  image: "/uploads/image-1760202329645-182223632.jpg",
  availability: "Available",
  status: "active",
  isNewProduct: false,
  isFeatured: false
},
  {
  name: "Chicken Biryani",
  description: "Fragrant basmati rice cooked with spiced chicken, cashews, and saffron served with raita and pickle.",
  price: 790,
  category: "Main Courses",
  image: "/uploads/image-1760202365730-769352290.jpg",
  availability: "Available",
  status: "active",
  isNewProduct: false,
  isFeatured: false
},
  {
  name: "Brownie Sundae",
  description: "Warm chocolate brownie topped with vanilla ice cream, fudge drizzle, and a cherry on top.",
  price: 1450,
  category: "Desserts",
  image: "/uploads/image-1760202419227-217062047.jpg",
  availability: "In House Only",
  status: "active",
  isNewProduct: false,
  isFeatured: false
},
  {
  name: "Butter Cake Slice",
  description: "Soft, moist, and buttery a timeless classic dusted with fine sugar.",
  price: 240,
  category: "Cakes",
  image: "/uploads/image-1760202455457-819837111.jpg",
  availability: "Available",
  status: "active",
  isNewProduct: false,
  isFeatured: false
},
  {
  name: "Crispy Onion Rings",
  description: "Golden-fried onion rings coated in crunchy breadcrumbs, served with creamy garlic mayo",
  price: 499,
  category: "Appetizers",
  image: "/uploads/image-1760202627962-596136386.jpg",
  availability: "Lunch",
  status: "active",
  isNewProduct: false,
  isFeatured: false
},
  {
  name: "Hot Butter Cuttlefish",
  description: "Crispy deep-fried cuttlefish tossed with onions, green chili, and chili flakes a Sri Lankan favorite.",
  price: 790,
  category: "Appetizers",
  image: "/uploads/image-1760202678348-587248216.jpg",
  availability: "In House Only",
  status: "active",
  isNewProduct: false,
  isFeatured: false
},
  {
  name: "Grilled Prawns Skewers",
  description: "Juicy prawns marinated with herbs and spices, grilled to smoky perfection, and served with lime wedges.",
  price: 1490,
  category: "Appetizers",
  image: "/uploads/image-1760202744452-269878647.jpg",
  availability: "In House Only",
  status: "active",
  isNewProduct: false,
  isFeatured: false
},
  {
  name: "Greek Salad",
  description: "A refreshing mix of feta cheese, olives, cherry tomatoes, and crisp greens drizzled with olive oil.",
  price: 1190,
  category: "Japanese",
  image: "/uploads/image-1760202791480-344394205.jpg",
  availability: "Unavailable",
  status: "active",
  isNewProduct: false,
  isFeatured: false
},
  {
  name: "Smoked Salmon Salad",
  description: "Flaky smoked salmon with fresh lettuce, cucumber, radish, and citrus dressing.",
  price: 890,
  category: "Salads",
  image: "/uploads/image-1760202834109-253362038.jpg",
  availability: "Available",
  status: "active",
  isNewProduct: false,
  isFeatured: false
},
  {
  name: "Grilled Chicken with Herbs",
  description: "Succulent grilled chicken seasoned with rosemary, thyme, and lemon butter glaze.",
  price: 900,
  category: "Sides",
  image: "/uploads/image-1760202872780-945105403.jpg",
  availability: "Available",
  status: "active",
  isNewProduct: false,
  isFeatured: false
},
  {
  name: "Espresso Shot",
  description: "Pure, bold, and aromatic a single shot of rich espresso for a quick caffeine hit.",
  price: 690,
  category: "Beverages",
  image: "/uploads/image-1760202909923-909368783.jpg",
  availability: "In House Only",
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
