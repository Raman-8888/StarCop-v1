/**
 * Image Cropping Utility Functions
 * Handles canvas-based image cropping, compression, and optimization
 */

/**
 * Creates an image element from a URL
 * @param {string} url - Image URL or data URL
 * @returns {Promise<HTMLImageElement>}
 */
export const createImage = (url) =>
    new Promise((resolve, reject) => {
        const image = new Image();
        image.addEventListener('load', () => resolve(image));
        image.addEventListener('error', (error) => reject(error));
        image.setAttribute('crossOrigin', 'anonymous');
        image.src = url;
    });

/**
 * Converts degrees to radians
 */
function getRadianAngle(degreeValue) {
    return (degreeValue * Math.PI) / 180;
}

/**
 * Returns the new bounding area of a rotated rectangle
 */
function rotateSize(width, height, rotation) {
    const rotRad = getRadianAngle(rotation);
    return {
        width: Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
        height: Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height),
    };
}

/**
 * Crops an image using canvas and returns a blob
 * @param {string} imageSrc - Source image URL
 * @param {Object} pixelCrop - Crop area in pixels {x, y, width, height}
 * @param {number} rotation - Rotation in degrees (default 0)
 * @param {number} outputWidth - Desired output width (default 1280)
 * @param {number} outputHeight - Desired output height (default 720)
 * @returns {Promise<Blob>}
 */
export async function getCroppedImg(
    imageSrc,
    pixelCrop,
    rotation = 0,
    outputWidth = 1280,
    outputHeight = 720
) {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
        throw new Error('No 2d context');
    }

    const rotRad = getRadianAngle(rotation);

    // Calculate bounding box of the rotated image
    const { width: bBoxWidth, height: bBoxHeight } = rotateSize(
        image.width,
        image.height,
        rotation
    );

    // Set canvas size to match the bounding box
    canvas.width = bBoxWidth;
    canvas.height = bBoxHeight;

    // Translate canvas context to a central location to allow rotating and flipping around the center
    ctx.translate(bBoxWidth / 2, bBoxHeight / 2);
    ctx.rotate(rotRad);
    ctx.translate(-image.width / 2, -image.height / 2);

    // Draw rotated image
    ctx.drawImage(image, 0, 0);

    // Create a new canvas for the final cropped image
    const croppedCanvas = document.createElement('canvas');
    const croppedCtx = croppedCanvas.getContext('2d');

    if (!croppedCtx) {
        throw new Error('No 2d context');
    }

    // Set the size to the desired output size (1280x720 for HD 16:9)
    croppedCanvas.width = outputWidth;
    croppedCanvas.height = outputHeight;

    // Draw the cropped image scaled to output dimensions
    croppedCtx.drawImage(
        canvas,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        outputWidth,
        outputHeight
    );

    // Return as blob
    return new Promise((resolve, reject) => {
        croppedCanvas.toBlob((blob) => {
            if (!blob) {
                reject(new Error('Canvas is empty'));
                return;
            }
            resolve(blob);
        }, 'image/jpeg', 0.95);
    });
}

/**
 * Compresses an image blob
 * @param {Blob} blob - Image blob to compress
 * @param {number} quality - Compression quality (0-1)
 * @returns {Promise<Blob>}
 */
export async function compressImage(blob, quality = 0.9) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onload = async (event) => {
            const img = await createImage(event.target.result);
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);

            canvas.toBlob(
                (compressedBlob) => {
                    if (!compressedBlob) {
                        reject(new Error('Compression failed'));
                        return;
                    }
                    resolve(compressedBlob);
                },
                'image/jpeg',
                quality
            );
        };
        reader.onerror = reject;
    });
}

/**
 * Converts blob to base64 string
 * @param {Blob} blob - Blob to convert
 * @returns {Promise<string>}
 */
export function blobToBase64(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

/**
 * Validates image file
 * @param {File} file - File to validate
 * @param {number} maxSizeMB - Maximum file size in MB
 * @returns {Object} {valid: boolean, error: string}
 */
export function validateImageFile(file, maxSizeMB = 5) {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxSizeBytes = maxSizeMB * 1024 * 1024;

    if (!validTypes.includes(file.type)) {
        return {
            valid: false,
            error: 'Invalid file format. Please upload JPG, PNG, or WebP.',
        };
    }

    if (file.size > maxSizeBytes) {
        return {
            valid: false,
            error: `File size exceeds ${maxSizeMB}MB limit.`,
        };
    }

    return { valid: true, error: null };
}
