import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Utility function to get full image URL
export function getImageUrl(imagePath: string): string {
  // If it's already a full URL, return it
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  
  // If it's a Cloudinary URL, return it
  if (imagePath.startsWith('res.cloudinary.com') || imagePath.includes('cloudinary')) {
    return `https://${imagePath}`;
  }
  
  // If it starts with /, it's a local path
  if (imagePath.startsWith('/')) {
    return imagePath;
  }
  
  // Return as-is for Firebase Storage URLs or other full paths
  return imagePath;
}
