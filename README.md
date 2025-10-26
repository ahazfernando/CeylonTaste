# Ceylon Taste - E-commerce Platform

A modern e-commerce platform for authentic Sri Lankan food and beverages, built with Next.js and Firebase.

## Features

- 🍰 Product catalog with categories
- 🛒 Shopping cart with persistent storage
- 👤 User authentication
- 📱 Responsive design
- 🔒 Secure payment processing
- 📊 Admin dashboard
- 🎨 Modern UI with Tailwind CSS

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Firebase (Firestore, Authentication, Storage)
- **UI Components**: Shadcn/ui, Radix UI
- **State Management**: React Context API
- **Server**: Express.js (legacy backend)

## Prerequisites

- Node.js 18+ installed
- npm or yarn
- Firebase project set up
- Git

## Getting Started

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd TrueTaste
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env.local` file in the root directory:

```bash
cp firebase-env-example.txt .env.local
```

Edit `.env.local` and add your Firebase credentials:

```env
# Firebase Configuration (Client-side)
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Firebase Admin SDK (Server-side)
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your_project_id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"

# Server Configuration
PORT=4000
CLIENT_ORIGIN=http://localhost:3000,http://localhost:3001,http://localhost:3002

# JWT Secret (for compatibility during migration)
JWT_SECRET=your_jwt_secret_here
```

### 4. Set Up Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or use an existing one
3. Enable Authentication (Email/Password)
4. Create a Firestore database
5. Enable Storage
6. Get your Firebase config from Project Settings → General → Your apps
7. Get Admin SDK credentials from Project Settings → Service accounts → Generate new private key

### 5. Run the Development Server

#### Option A: Next.js Only (Recommended)

```bash
npm run dev
```

This runs the Next.js frontend on `http://localhost:3000`

#### Option B: Full Stack (Next.js + Express Server)

```bash
npm run dev:full
```

This runs:
- Next.js frontend on `http://localhost:3000`
- Express API server on `http://localhost:4000`

#### Option C: Firebase Backend Only

```bash
npm run dev:firebase
```

### 6. Seed the Database (Optional)

If using the legacy Express backend, you can seed sample data:

```bash
# Seed admin user
npm run seed:admin

# Seed categories
npm run seed:categories

# Seed products
npm run seed:products
```

## Available Scripts

```bash
# Development
npm run dev              # Run Next.js dev server
npm run dev:firebase     # Run Next.js with Firebase backend
npm run dev:full         # Run Next.js + Express server
npm run server           # Run Express server only

# Build
npm run build            # Build for production
npm run start            # Run production build

# Testing & Seeding
npm run seed:admin       # Create admin user
npm run seed:products    # Seed products
npm run seed:categories  # Seed categories
npm run migrate:firebase # Migrate data to Firebase

# Code Quality
npm run lint             # Run ESLint
```

## Project Structure

```
TrueTaste/
├── src/
│   ├── app/              # Next.js App Router pages
│   │   ├── admin/        # Admin dashboard
│   │   ├── auth/         # Authentication pages
│   │   ├── products/     # Product pages
│   │   ├── cart/         # Shopping cart
│   │   └── page.tsx      # Home page
│   ├── components/       # React components
│   │   ├── admin/        # Admin components
│   │   ├── charts/       # Chart components
│   │   ├── sections/     # Page sections
│   │   └── ui/           # UI components
│   ├── contexts/         # React contexts
│   ├── hooks/            # Custom React hooks
│   └── lib/              # Utility functions
├── server/               # Express backend (legacy)
│   ├── routes/           # API routes
│   └── server.js         # Server entry
├── public/               # Static assets
└── firebase-config.js    # Firebase configuration
```

## Key Features

### User Features
- Browse products by category
- Add items to cart
- User authentication (login/signup)
- Checkout process
- Order tracking
- User profile management

### Admin Features
- Dashboard with analytics
- Product management
- Category management
- Order management
- Customer management
- Inventory tracking

## Firebase Setup Details

### Required Firebase Services

1. **Authentication**
   - Enable Email/Password authentication
   - Configure authorized domains

2. **Firestore Database**
   - Create the following collections:
     - `products` - Store product information
     - `categories` - Store category information
     - `orders` - Store order information
     - `users` - Store user information

3. **Storage**
   - Set up storage buckets for product images
   - Configure storage rules for public read access

### Storage Rules Example

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

### Firestore Rules Example

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Products - public read
    match /products/{productId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Orders - authenticated users only
    match /orders/{orderId} {
      allow read: if request.auth != null && (request.auth.uid == resource.data.userId || request.auth.token.admin == true);
      allow create: if request.auth != null;
    }
    
    // Users - authenticated users only
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for deployment instructions to Vercel.

## Troubleshooting

### Common Issues

**Port already in use**
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Kill process on port 4000
lsof -ti:4000 | xargs kill -9
```

**Environment variables not loading**
- Make sure `.env.local` is in the root directory
- Restart the development server after adding variables
- Check that variables start with `NEXT_PUBLIC_` for client-side access

**Firebase connection errors**
- Verify your Firebase credentials are correct
- Check that Firebase services are enabled in the console
- Ensure Firestore database is created

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is private and proprietary.

## Support

For issues and questions, please open an issue on GitHub or contact the development team.

