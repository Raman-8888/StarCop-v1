const { google } = require('googleapis');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

console.log("Checking ENV variables...");
console.log("Email:", process.env.GOOGLE_CLIENT_EMAIL);
console.log("Folder:", process.env.GOOGLE_DRIVE_FOLDER_ID);
console.log("Key Length:", process.env.GOOGLE_PRIVATE_KEY ? process.env.GOOGLE_PRIVATE_KEY.length : "MISSING");

try {
    const rawKey = process.env.GOOGLE_PRIVATE_KEY;
    const formattedKey = rawKey ? rawKey.replace(/\\n/g, '\n') : undefined;

    console.log("Key contains newlines?", formattedKey.includes('\n'));

    const auth = new google.auth.GoogleAuth({
        credentials: {
            client_email: process.env.GOOGLE_CLIENT_EMAIL,
            private_key: formattedKey,
        },
        scopes: ['https://www.googleapis.com/auth/drive'],
    });

    const drive = google.drive({ version: 'v3', auth });

    async function test() {
        console.log("Checking authenticated user...");
        try {
            const about = await drive.about.get({ fields: 'user(emailAddress)' });
            console.log("User:", about.data.user.emailAddress);
        } catch (e) {
            console.error("Auth limit?", e.message);
        }

        console.log("Checking specific folder access...");
        const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
        console.log(`Folder ID: '${folderId}' (Length: ${folderId.length})`);
        // Check for hidden chars
        for (let i = 0; i < folderId.length; i++) {
            if (folderId.charCodeAt(i) < 33 || folderId.charCodeAt(i) > 126) {
                console.log(`WARNING: Weird char at index ${i}: code ${folderId.charCodeAt(i)}`);
            }
        }

        try {
            const res = await drive.files.get({
                fileId: folderId.trim(), // Try trimming just in case
                fields: 'id, name, capabilities',
                supportsAllDrives: true, // Just in case
            });
            console.log("SUCCESS! Connected to folder:", res.data.name);
            console.log("Can I upload?", res.data.capabilities.canAddChildren);
            fs.writeFileSync('drive_test_result.txt', `SUCCESS: Connected to ${res.data.name}`);
        } catch (e) {
            console.error("FAILURE: Cannot access folder.", e.message);
            fs.writeFileSync('drive_test_result.txt', `FAILURE: ${e.message}`);
        }
    }

    test();

} catch (e) {
    console.error("Setup Error:", e);
}
