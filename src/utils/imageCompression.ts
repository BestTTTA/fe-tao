/**
 * Image compression utility
 * Converts images to WebP format and resizes them
 */

const MAX_SIZE = 800; // Maximum width/height in pixels
const QUALITY = 0.85; // WebP quality (0-1)

/**
 * Compresses and converts an image file to WebP format
 * @param file - The original image file
 * @returns Promise<Blob> - The compressed WebP image as a Blob
 */
export async function compressImage(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      reject(new Error("Cannot get canvas context"));
      return;
    }

    img.onload = () => {
      // Calculate new dimensions while maintaining aspect ratio
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > MAX_SIZE) {
          height = Math.round((height * MAX_SIZE) / width);
          width = MAX_SIZE;
        }
      } else {
        if (height > MAX_SIZE) {
          width = Math.round((width * MAX_SIZE) / height);
          height = MAX_SIZE;
        }
      }

      canvas.width = width;
      canvas.height = height;

      // Draw image with smooth scaling
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, width, height);

      // Convert to WebP
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error("Failed to compress image"));
          }
        },
        "image/webp",
        QUALITY
      );
    };

    img.onerror = () => {
      reject(new Error("Failed to load image"));
    };

    // Create object URL from file and load it
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Validates if a file is an image
 * @param file - The file to validate
 * @returns boolean
 */
export function isValidImageType(file: File): boolean {
  const validTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/bmp",
    "image/svg+xml",
  ];
  return validTypes.includes(file.type);
}

/**
 * Validates if file size is within limit
 * @param file - The file to validate
 * @param maxSizeMB - Maximum size in megabytes
 * @returns boolean
 */
export function isValidFileSize(file: File, maxSizeMB: number): boolean {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxSizeBytes;
}
