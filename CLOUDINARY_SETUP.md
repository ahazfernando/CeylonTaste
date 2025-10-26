# Cloudinary Setup Instructions

## What is Cloudinary?

Cloudinary is a cloud-based image and video management platform that provides:
- Image upload and storage
- Automatic image optimization
- Automatic image transformation (resize, crop, etc.)
- Free tier available (25GB storage, 25GB bandwidth/month)

## Step 1: Create a Cloudinary Account

1. Go to https://cloudinary.com/users/register/free
2. Sign up with your email (ahazfernando04@gmail.com)
3. Verify your email address

## Step 2: Get Your Credentials

After signing up, you'll be taken to the dashboard. You'll find your credentials in the **Account Details** section:

1. **Cloud Name**: Displayed at the top (e.g., `dxyzabc123`)
2. **API Key**: Found in Account Details
3. **API Secret**: Click "Show" to reveal it (keep this secret!)

## Step 3: Create an Upload Preset

1. Go to **Settings** → **Upload** → **Add upload preset**
2. Choose settings:
   - **Preset name**: `ceylon-taste-uploads`
   - **Signing mode**: Unsigned (for client-side uploads)
   - **Upload folder**: `ceylon-taste/products`
3. Click **Save**

## Step 4: Add Environment Variables

### For Local Development:

Edit your `.env` file and add:

```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=ceylon-taste-uploads
```

Replace `your_cloud_name`, `your_api_key`, and `your_api_secret` with your actual Cloudinary credentials.

### For Vercel Deployment:

1. Go to https://vercel.com/dashboard
2. Select your CeylonTaste project
3. Go to **Settings** → **Environment Variables**
4. Add the same variables:
   - `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
   - `NEXT_PUBLIC_CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
   - `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`
5. Make sure to enable for **Production**, **Preview**, and **Development**
6. Redeploy your application

## Step 5: Test the Integration

1. Restart your dev server: `npm run dev`
2. Go to http://localhost:3000/admin/products
3. Try uploading an image
4. Check Cloudinary Media Library to verify the upload

## Features You Get:

- ✅ Automatic image optimization
- ✅ Multiple format support (automatically serves WebP on supported browsers)
- ✅ On-the-fly image transformations (resize, crop, etc.)
- ✅ Cloud delivery (faster loading times)
- ✅ Image URLs are permanent (won't break)

## Troubleshooting

**Issue**: "Invalid upload preset"
- Make sure you created the upload preset in Cloudinary dashboard
- Verify the preset name matches in your .env file

**Issue**: "Cloud name is invalid"
- Double-check your cloud name in Cloudinary dashboard
- Make sure there are no extra spaces in the .env file

**Issue**: Upload fails silently
- Check browser console for errors
- Verify all environment variables are set correctly
- Make sure you're using "Unsigned" preset for client-side uploads

