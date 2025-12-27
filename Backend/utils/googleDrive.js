const { google } = require('googleapis');
const stream = require('stream');
const dotenv = require('dotenv');

dotenv.config();

// Initialize Google Auth
// Use process.env variables. Ensure PRIVATE_KEY handles newlines correctly.
const auth = new google.auth.GoogleAuth({
    credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY ? process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n') : undefined,
    },
    scopes: ['https://www.googleapis.com/auth/drive'],
});

const drive = google.drive({ version: 'v3', auth });

/**
 * Upload a file to Google Drive
 * @param {Buffer} buffer - File buffer
 * @param {string} filename - Name of the file
 * @param {string} mimeType - Mime type of the file
 * @returns {Promise<Object>} - Drive file object { id, webViewLink, webContentLink }
 */
const uploadToDrive = async (buffer, filename, mimeType) => {
    try {
        const bufferStream = new stream.PassThrough();
        bufferStream.end(buffer);

        console.log(`[GoogleDrive] Uploading ${filename}...`);

        const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID ? process.env.GOOGLE_DRIVE_FOLDER_ID.trim() : null;

        const response = await drive.files.create({
            requestBody: {
                name: filename,
                mimeType: mimeType,
                parents: [folderId], // Upload to specific folder
            },
            media: {
                mimeType: mimeType,
                body: bufferStream,
            },
            fields: 'id, webViewLink, webContentLink',
            supportsAllDrives: true,
        });

        const fileId = response.data.id;
        console.log(`[GoogleDrive] File uploaded. ID: ${fileId}`);

        // Make the file publicly readable (Anyone with the link)
        await drive.permissions.create({
            fileId: fileId,
            requestBody: {
                role: 'reader',
                type: 'anyone',
            },
        });

        console.log(`[GoogleDrive] File permissions updated to public.`);

        return response.data;
    } catch (error) {
        console.error('Google Drive Upload Error:', error);
        throw error;
    }
};

/**
 * Delete a file from Google Drive
 * @param {string} fileId 
 */
const deleteFromDrive = async (fileId) => {
    try {
        await drive.files.delete({ fileId });
        console.log(`[GoogleDrive] Deleted file ${fileId}`);
    } catch (error) {
        console.error('Google Drive Delete Error:', error);
        // Don't throw, just log
    }
};

module.exports = { uploadToDrive, deleteFromDrive };
