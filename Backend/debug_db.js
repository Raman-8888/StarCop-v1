const mongoose = require('mongoose');
const User = require('./models/usermodel');
const Connection = require('./models/connection.model');
const Conversation = require('./models/conversation.model');
const dotenv = require('dotenv');

dotenv.config();

const debug = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        // Find users to reference
        const users = await User.find({}).select('username _id');
        console.log('Users:', users.map(u => `${u.username} (${u._id})`));

        // Dump Connections
        const connections = await Connection.find({});
        console.log('\n--- Connections ---');
        connections.forEach(c => {
            console.log(`ID: ${c._id}, Startup: ${c.startupId}, Investor: ${c.investorId}, Status: ${c.status}`);
        });

        // Dump Conversations
        const conversations = await Conversation.find({});
        console.log('\n--- Conversations ---');
        conversations.forEach(c => {
            console.log(`ID: ${c._id}, Connection: ${c.connectionId}, Participants: ${c.participants}, LastMsg: ${c.lastMessage?.text} (${c.lastMessage?.createdAt})`);
        });

    } catch (error) {
        console.error(error);
    } finally {
        await mongoose.disconnect();
    }
};

debug();
