const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
const bucketName = process.env.SUPABASE_BUCKET || 'uploads';

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Upload file to Supabase Storage
 * @param {Buffer} fileBuffer - File buffer
 * @param {string} filename - Original filename
 * @param {string} mimeType - File MIME type
 * @param {string} folder - Folder path (e.g., 'chat-files')
 * @returns {Promise<string>} - Public URL of uploaded file
 */
async function uploadToSupabase(fileBuffer, filename, mimeType, folder = 'chat-files') {
    try {
        // Generate unique filename
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(7);
        const extension = filename.split('.').pop();
        const uniqueFilename = `${timestamp}-${randomString}.${extension}`;
        const filePath = `${folder}/${uniqueFilename}`;

        // Upload to Supabase
        const { data, error } = await supabase.storage
            .from(bucketName)
            .upload(filePath, fileBuffer, {
                contentType: mimeType,
                upsert: false
            });

        if (error) {
            console.error('Supabase upload error:', error);
            throw new Error(`Upload failed: ${error.message}`);
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from(bucketName)
            .getPublicUrl(filePath);

        return publicUrl;
    } catch (error) {
        console.error('Error uploading to Supabase:', error);
        throw error;
    }
}

/**
 * Delete file from Supabase Storage
 * @param {string} fileUrl - Public URL of file to delete
 * @returns {Promise<boolean>} - Success status
 */
async function deleteFromSupabase(fileUrl) {
    try {
        // Extract file path from URL
        const urlParts = fileUrl.split(`${bucketName}/`);
        if (urlParts.length < 2) {
            throw new Error('Invalid file URL');
        }
        const filePath = urlParts[1];

        const { error } = await supabase.storage
            .from(bucketName)
            .remove([filePath]);

        if (error) {
            console.error('Supabase delete error:', error);
            return false;
        }

        return true;
    } catch (error) {
        console.error('Error deleting from Supabase:', error);
        return false;
    }
}

module.exports = {
    uploadToSupabase,
    deleteFromSupabase
};
