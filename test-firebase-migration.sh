#!/bin/bash

# Firebase Migration Testing Script
echo "🔥 Firebase Migration Testing Script"
echo "=================================="

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI not found. Installing..."
    npm install -g firebase-tools
fi

# Check if user is logged in to Firebase
if ! firebase projects:list &> /dev/null; then
    echo "❌ Not logged in to Firebase. Please run: firebase login"
    exit 1
fi

echo "✅ Firebase CLI is ready"

# Test Firebase connection
echo "🔍 Testing Firebase connection..."
node -e "
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
require('dotenv').config();

try {
  const app = initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\\\n/g, '\\n'),
    }),
  });
  
  const db = getFirestore(app);
  console.log('✅ Firebase Admin SDK connected successfully');
  console.log('📊 Project ID:', process.env.FIREBASE_PROJECT_ID);
} catch (error) {
  console.error('❌ Firebase connection failed:', error.message);
  process.exit(1);
}
"

# Test data migration
echo "🔄 Testing data migration..."
if [ -f "server/scripts/migrate-to-firebase.js" ]; then
    echo "✅ Migration script found"
    echo "⚠️  To run migration: node server/scripts/migrate-to-firebase.js"
else
    echo "❌ Migration script not found"
fi

# Test server startup
echo "🚀 Testing Firebase server startup..."
if [ -f "server/server-firebase.js" ]; then
    echo "✅ Firebase server file found"
    echo "⚠️  To start Firebase server: node server/server-firebase.js"
else
    echo "❌ Firebase server file not found"
fi

# Check environment variables
echo "🔧 Checking environment variables..."
if [ -f ".env" ]; then
    echo "✅ .env file found"
    if grep -q "FIREBASE_PROJECT_ID" .env; then
        echo "✅ Firebase project ID configured"
    else
        echo "❌ Firebase project ID not configured"
    fi
    
    if grep -q "FIREBASE_CLIENT_EMAIL" .env; then
        echo "✅ Firebase client email configured"
    else
        echo "❌ Firebase client email not configured"
    fi
    
    if grep -q "FIREBASE_PRIVATE_KEY" .env; then
        echo "✅ Firebase private key configured"
    else
        echo "❌ Firebase private key not configured"
    fi
else
    echo "❌ .env file not found"
    echo "📝 Copy firebase-env-example.txt to .env and configure your Firebase credentials"
fi

echo ""
echo "🎯 Next Steps:"
echo "1. Configure your Firebase project credentials in .env"
echo "2. Run data migration: node server/scripts/migrate-to-firebase.js"
echo "3. Start Firebase server: node server/server-firebase.js"
echo "4. Test the application with Firebase backend"
echo ""
echo "📚 Documentation: https://firebase.google.com/docs"
