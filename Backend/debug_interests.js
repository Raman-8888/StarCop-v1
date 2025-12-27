const mongoose = require('mongoose');
require('dotenv').config();

const InvestorInterest = require('./models/investorInterest.model');
const User = require('./models/usermodel');
const Opportunity = require('./models/opportunity.model');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/startup_connect');
        console.log('MongoDB Connected');
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
};

const debugInterests = async () => {
    await connectDB();

    try {
        const interests = await InvestorInterest.find()
            .populate('sender', 'name accountType')
            .populate('recipient', 'name accountType')
            .populate('opportunity', 'title creatorId');

        console.log(`Found ${interests.length} InvestorInterests:`);

        interests.forEach(i => {
            console.log('--------------------------------------------------');
            console.log(`ID: ${i._id}`);
            console.log(`Opportunity: ${i.opportunity?.title} (Creator: ${i.opportunity?.creatorId})`);
            console.log(`Sender: ${i.sender?.name} (${i.sender?.accountType}) [ID: ${i.sender?._id}]`);
            console.log(`Recipient: ${i.recipient?.name} (${i.recipient?.accountType}) [ID: ${i.recipient?._id}]`);
            console.log(`Status: ${i.status}`);
            console.log('--------------------------------------------------');
        });

    } catch (err) {
        console.error(err);
    } finally {
        mongoose.disconnect();
    }
};

debugInterests();
