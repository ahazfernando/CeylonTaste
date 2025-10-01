import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Utility function to get full image URL
export function getImageUrl(imagePath: string): string {
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  return `http://localhost:4000${imagePath}`;
}
