const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');

dotenv.config();

cloudinary.config({
    cloud_name: process.env.Cloudinary_Cloud_Name,
    api_key: process.env.Cloudinary_Api_Key,
    api_secret: process.env.Cloudinary_Api_Secret
});

const uploadToCloudinary = (buffer, options = {}) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { resource_type: "auto", ...options },
            (error, result) => {
                if (error) return reject(error);
                resolve(result);
            }
        );
        stream.end(buffer);
    });
};

const generateDownloadUrl = (url) => {
    if (!url) return null;
    try {
        // Extract public_id and format (e.g. .pdf)
        // URL format: https://res.cloudinary.com/<cloud>/upload/v<version>/<public_id>.<format>
        // Or signed: https://res.cloudinary.com/<cloud>/upload/s--<sig>--/v<version>/<public_id>.<format>

        // Simpler approach: Use the public_id if stored, but we only have the URL.
        // We can use cloudinary.utils.url(public_id, { flags: "attachment" }) if we knew the public_id.
        // Since we have the full URL, let's try to parse the public_id from it reliably.

        // REGEX to extract public_id:
        // Match everything after 'upload/' and before file extension
        // Be careful with versions (v12345/) and folders

        const splitUrl = url.split('/upload/');
        if (splitUrl.length < 2) return url; // Cannot process, return original

        // This part contains [s--sig--/][v<ver>/]public_id.format
        let afterUpload = splitUrl[1];

        // If there's a signature, remove it for re-signing
        if (afterUpload.startsWith('s--')) {
            afterUpload = afterUpload.replace(/s--.*?--\//, '');
        }

        // Remove version if present (cloudinary adds it back automatically)
        afterUpload = afterUpload.replace(/v\d+\//, '');

        // Remove extension
        const lastDot = afterUpload.lastIndexOf('.');
        const publicId = afterUpload.substring(0, lastDot);
        const format = afterUpload.substring(lastDot + 1);

        const isRaw = url.includes('/raw/');

        // Generate new signed URL with attachment flag
        return cloudinary.url(publicId, {
            resource_type: isRaw ? "raw" : "auto", // Preserve raw if present
            format: format,
            flags: "attachment",
            sign_url: true // IMPORTANT: Re-sign it
        });

    } catch (e) {
        console.error("Error generating download URL:", e);
        return url; // Fallback
    }
};

module.exports = { cloudinary, uploadToCloudinary, generateDownloadUrl };
