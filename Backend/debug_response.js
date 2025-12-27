require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/usermodel');

const testPopulate = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL);

        const startup = await User.findOne({ email: 'startup_1130@test.com' })
            .populate('following', 'name username profilePicture');

        console.log('--- Startup Following List ---');
        console.log(JSON.stringify(startup.following, null, 2));

    } catch (e) { console.error(e); }
    finally { mongoose.disconnect(); }
};
testPopulate();
