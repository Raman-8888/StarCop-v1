require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/usermodel');

const verify = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL);

        // Find the test users
        const startup = await User.findOne({ email: 'startup_1130@test.com' });
        const investor = await User.findOne({ email: 'investor_1130@test.com' });

        if (!startup || !investor) {
            console.log('Users not found');
            return;
        }

        console.log(`Startup (${startup.username}) Following Count: ${startup.following.length}`);
        console.log(`Investor (${investor.username}) Followers Count: ${investor.followers.length}`);

        const isFollowing = startup.following.includes(investor._id);
        const isFollowed = investor.followers.includes(startup._id);

        console.log(`Startup following Investor? ${isFollowing}`);
        console.log(`Investor followed by Startup? ${isFollowed}`);

    } catch (e) { console.error(e); }
    finally { mongoose.disconnect(); }
};
verify();
