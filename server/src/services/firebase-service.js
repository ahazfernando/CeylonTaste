// Firebase service layer for server-side operations
import { adminDb } from '../../firebase-admin-config.js';

export class FirebaseService {
  // User operations
  static async createUser(userData) {
    const docRef = await adminDb.collection('users').add({
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return { id: docRef.id, ...userData };
  }

  static async getUserById(id) {
    const doc = await adminDb.collection('users').doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
  }

  static async getUserByEmail(email) {
    const snapshot = await adminDb.collection('users')
      .where('email', '==', email)
      .limit(1)
      .get();
    
    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() };
  }

  static async updateUser(id, updateData) {
    await adminDb.collection('users').doc(id).update({
      ...updateData,
      updatedAt: new Date()
    });
    return await this.getUserById(id);
  }

  static async getAllUsers() {
    const snapshot = await adminDb.collection('users').get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  // Product operations
  static async createProduct(productData) {
    const docRef = await adminDb.collection('products').add({
      ...productData,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return { id: docRef.id, ...productData };
  }

  static async getProductById(id) {
    const doc = await adminDb.collection('products').doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
  }

  static async getAllProducts() {
    const snapshot = await adminDb.collection('products').get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  static async getProducts(filters = {}) {
    let query = adminDb.collection('products');
    
    if (filters.category) {
      query = query.where('category', '==', filters.category);
    }
    if (filters.status) {
      query = query.where('status', '==', filters.status);
    }
    if (filters.isFeatured !== undefined) {
      query = query.where('isFeatured', '==', filters.isFeatured);
    }

    const snapshot = await query.get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  static async updateProduct(id, updateData) {
    await adminDb.collection('products').doc(id).update({
      ...updateData,
      updatedAt: new Date()
    });
    return await this.getProductById(id);
  }

  static async deleteProduct(id) {
    await adminDb.collection('products').doc(id).delete();
    return true;
  }

  // Order operations
  static async createOrder(orderData) {
    const docRef = await adminDb.collection('orders').add({
      ...orderData,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return { id: docRef.id, ...orderData };
  }

  static async getOrderById(id) {
    const doc = await adminDb.collection('orders').doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
  }

  static async getOrdersByUser(userId) {
    const snapshot = await adminDb.collection('orders')
      .where('user', '==', userId)
      .orderBy('createdAt', 'desc')
      .get();
    
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  static async getAllOrders(filters = {}) {
    let query = adminDb.collection('orders');
    
    if (filters.status) {
      query = query.where('status', '==', filters.status);
    }
    if (filters.paymentStatus) {
      query = query.where('paymentStatus', '==', filters.paymentStatus);
    }

    query = query.orderBy('createdAt', 'desc');
    
    const snapshot = await query.get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  static async updateOrder(id, updateData) {
    await adminDb.collection('orders').doc(id).update({
      ...updateData,
      updatedAt: new Date()
    });
    return await this.getOrderById(id);
  }

  // Category operations
  static async createCategory(categoryData) {
    const docRef = await adminDb.collection('categories').add({
      ...categoryData,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return { id: docRef.id, ...categoryData };
  }

  static async getAllCategories() {
    const snapshot = await adminDb.collection('categories').get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  static async getCategoryById(id) {
    const doc = await adminDb.collection('categories').doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
  }

  static async updateCategory(id, updateData) {
    await adminDb.collection('categories').doc(id).update({
      ...updateData,
      updatedAt: new Date()
    });
    return await this.getCategoryById(id);
  }

  static async deleteCategory(id) {
    await adminDb.collection('categories').doc(id).delete();
    return true;
  }

  // Analytics operations
  static async getOrderStats() {
    const ordersSnapshot = await adminDb.collection('orders').get();
    const orders = ordersSnapshot.docs.map(doc => doc.data());
    
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
    const pendingOrders = orders.filter(order => order.status === 'pending').length;
    const completedOrders = orders.filter(order => order.status === 'delivered').length;

    return {
      totalOrders,
      totalRevenue,
      pendingOrders,
      completedOrders
    };
  }

  static async getProductStats() {
    const productsSnapshot = await adminDb.collection('products').get();
    const products = productsSnapshot.docs.map(doc => doc.data());
    
    const totalProducts = products.length;
    const activeProducts = products.filter(product => product.status === 'active').length;
    const featuredProducts = products.filter(product => product.isFeatured).length;

    return {
      totalProducts,
      activeProducts,
      featuredProducts
    };
  }

  static async getUserStats() {
    const usersSnapshot = await adminDb.collection('users').get();
    const users = usersSnapshot.docs.map(doc => doc.data());
    
    const totalUsers = users.length;
    const adminUsers = users.filter(user => user.role === 'admin').length;
    const premiumUsers = users.filter(user => user.customerStatus === 'premium').length;

    return {
      totalUsers,
      adminUsers,
      premiumUsers
    };
  }
}
