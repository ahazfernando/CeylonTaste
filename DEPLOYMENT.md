# Deployment Instructions

## Issues Fixed

1. **Created `next.config.js`** - Next.js configuration was missing, causing Vercel to not recognize the project properly
2. **Fixed `src/app/layout.tsx`** - The root layout was incorrectly using "use client" directive (should be a server component)
3. **Created `src/app/providers.tsx`** - Separated client-side providers into their own file
4. **Created `vercel.json`** - Added explicit deployment configuration

## Next Steps - Configure Environment Variables

You need to add your Firebase environment variables in Vercel:

1. Go to your Vercel dashboard: https://vercel.com/dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add the following variables (from `firebase-env-example.txt`):

### Client-side (Public) Variables (NEXT_PUBLIC_*)
```
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
```

### Server-side Variables
```
FIREBASE_PROJECT_ID
FIREBASE_CLIENT_EMAIL
FIREBASE_PRIVATE_KEY
PORT (default: 4000)
CLIENT_ORIGIN (should include your Vercel domain)
JWT_SECRET
```

## Re-deploy

After adding environment variables:
1. Go to your project's Deployments tab
2. Click "Redeploy" on the latest deployment
3. Or push a new commit to trigger a new deployment

## Important Notes

- The app uses Firebase for backend services
- Make sure your Firebase project is properly configured
- The `dist/` folder in your repo appears to be from an old Vite build - it can be ignored for Next.js deployment
- Your app should now deploy successfully with the proper Next.js configuration

