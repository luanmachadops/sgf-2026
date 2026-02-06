/**
 * Image utility functions for processing and optimizing images
 */

/**
 * Resizes an image and converts it to WebP format
 * @param file - The original image file
 * @param maxSize - Maximum dimension (width or height) in pixels
 * @returns A Blob containing the optimized WebP image
 */
export async function resizeAndConvertToWebP(
    file: File,
    maxSize: number = 1000
): Promise<Blob> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const reader = new FileReader();

        reader.onload = (e) => {
            img.src = e.target?.result as string;
        };

        reader.onerror = () => {
            reject(new Error('Failed to read image file'));
        };

        img.onload = () => {
            try {
                // Calculate new dimensions while maintaining aspect ratio
                let { width, height } = img;
                const aspectRatio = width / height;

                if (width > height) {
                    if (width > maxSize) {
                        width = maxSize;
                        height = Math.round(width / aspectRatio);
                    }
                } else {
                    if (height > maxSize) {
                        height = maxSize;
                        width = Math.round(height * aspectRatio);
                    }
                }

                // Create canvas and draw resized image
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    reject(new Error('Failed to get canvas context'));
                    return;
                }

                // Use better image smoothing
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'high';

                // Draw the image
                ctx.drawImage(img, 0, 0, width, height);

                // Convert to WebP blob
                canvas.toBlob(
                    (blob) => {
                        if (blob) {
                            resolve(blob);
                        } else {
                            reject(new Error('Failed to convert image to WebP'));
                        }
                    },
                    'image/webp',
                    0.85 // Quality: 85%
                );
            } catch (error) {
                reject(error);
            }
        };

        img.onerror = () => {
            reject(new Error('Failed to load image'));
        };

        reader.readAsDataURL(file);
    });
}

/**
 * Validates if a file is an image
 * @param file - The file to validate
 * @returns true if the file is an image
 */
export function isImageFile(file: File): boolean {
    return file.type.startsWith('image/');
}

/**
 * Formats file size for display
 * @param bytes - Size in bytes
 * @returns Formatted string (e.g., "1.5 MB")
 */
export function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}
