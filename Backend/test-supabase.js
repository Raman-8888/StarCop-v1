
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config();

console.log("Checking Supabase Environment Variables...");
console.log("URL:", process.env.SUPABASE_URL || "MISSING");
console.log("KEY:", process.env.SUPABASE_SERVICE_KEY ? "Set (Hidden)" : "MISSING");
console.log("BUCKET:", process.env.SUPABASE_BUCKET || "Default: uploads");

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
    console.error("ERROR: Supabase credentials are missing in .env");
    process.exit(1);
}

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

const BUCKET_NAME = process.env.SUPABASE_BUCKET || 'uploads';

async function testSupabase() {
    console.log(`Connecting to Supabase... (Bucket: ${BUCKET_NAME})`);

    // List buckets to verify connection
    const { data, error } = await supabase.storage.listBuckets();

    if (error) {
        console.error("Connection Failed:", error.message);
        return;
    }

    console.log("Buckets found:", data.map(b => b.name));

    const bucketParams = data.find(b => b.name === BUCKET_NAME);
    if (!bucketParams) {
        console.warn(`WARNING: Bucket '${BUCKET_NAME}' not found! Trying to create it...`);
        const { data: bucket, error: createError } = await supabase.storage.createBucket(BUCKET_NAME, {
            public: true
        });
        if (createError) {
            console.error("Failed to create bucket:", createError.message);
        } else {
            console.log("Bucket created successfully!");
        }
    } else {
        console.log(`Bucket '${BUCKET_NAME}' exists.`);
        if (bucketParams.public) {
            console.log("Bucket is PUBLIC (Good).");
        } else {
            console.warn("WARNING: Bucket is NOT public. Files might not be downloadable.");
        }
    }
}

testSupabase();
