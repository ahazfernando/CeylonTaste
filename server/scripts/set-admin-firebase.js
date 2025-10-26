// Script to set a user as admin in Firebase
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import dotenv from 'dotenv';

dotenv.config();

const firebaseAdminConfig = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
  })
};

initializeApp(firebaseAdminConfig);
const db = getFirestore();

async function setAdmin(email) {
  try {
    console.log(`Setting admin role for: ${email}`);
    console.log(`Firebase Project: ${process.env.FIREBASE_PROJECT_ID}`);
    
    // Get all users and find the one with matching email
    const usersRef = db.collection('users');
    const snapshot = await usersRef.where('email', '==', email).get();
    
    console.log(`Found ${snapshot.size} user(s) with email: ${email}`);
    
    if (snapshot.empty) {
      console.log(`No user found with email: ${email}`);
      console.log('Creating user...');
      
      // Create a new admin user (they'll need to sign up in the app first, then we can update this)
      console.log('Please sign up first, then run this script again.');
      
      // Let's also try to list all users to see what's there
      const allUsers = await usersRef.get();
      console.log(`Total users in database: ${allUsers.size}`);
      allUsers.forEach(doc => {
        console.log(`  - User: ${doc.data().email || 'no email'} (ID: ${doc.id})`);
      });
      
      return;
    }
    
    for (const doc of snapshot.docs) {
      await doc.ref.update({ role: 'admin' });
      console.log(`✅ Successfully set ${email} as admin`);
      console.log(`User ID: ${doc.id}`);
    }
    
  } catch (error) {
    console.error('Error setting admin:', error);
  }
}

// Get email from command line argument
const email = process.argv[2];

if (!email) {
  console.log('Usage: node server/scripts/set-admin-firebase.js <email>');
  console.log('Example: node server/scripts/set-admin-firebase.js ahazfernando@gmail.com');
  process.exit(1);
}

setAdmin(email).then(() => process.exit(0));

