
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config();

// Validate config
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
    console.warn("Supabase credentials missing in .env");
}

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

const BUCKET_NAME = process.env.SUPABASE_BUCKET || 'uploads';

/**
 * Upload a file to Supabase Storage
 * @param {Buffer} buffer - File buffer
 * @param {string} filename - Original filename
 * @param {string} mimetype - MIME type
 * @param {string} folder - Optional folder path (e.g., 'interest-attachments', 'chat-files')
 * @returns {Promise<string>} - Public URL of the uploaded file
 */
const uploadToSupabase = async (buffer, filename, mimetype, folder = '') => {
    try {
        // Create a unique path: folder/timestamp_sanitizedFilename
        const timestamp = Date.now();
        const sanitized = filename.replace(/[^a-zA-Z0-9.]/g, '_');
        const filePath = folder ? `${folder}/${timestamp}_${sanitized}` : `${timestamp}_${sanitized}`;

        console.log(`[Supabase] Uploading ${filePath} to bucket '${BUCKET_NAME}'...`);

        const { data, error } = await supabase.storage
            .from(BUCKET_NAME)
            .upload(filePath, buffer, {
                contentType: mimetype,
                upsert: false
            });

        if (error) {
            throw error;
        }

        console.log(`[Supabase] Upload successful:`, data);

        // Get Public URL
        const { data: { publicUrl } } = supabase.storage
            .from(BUCKET_NAME)
            .getPublicUrl(filePath);

        return publicUrl;
    } catch (error) {
        console.error("Supabase Upload Error:", error);
        throw new Error(`Supabase Upload Failed: ${error.message}`);
    }
};

module.exports = { uploadToSupabase };
