require('dotenv').config();
const express = require('express');
const app = express();
const http = require('http').Server(app);
const cors = require('cors');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const user = require('./models/usermodel');

app.use(cors());
app.use(express.json());

const MONGO_URL = process.env.MONGO_URL;

async function run() {
    try {
        await mongoose.connect(MONGO_URL);
        console.log("Connected to MongoDB");

    } catch (error) {
        console.error("Error:", error);
    }
}

run();

// Import routes
const authRoutes = require('./route/auth.route');

// Use routes
app.use('/api/auth', authRoutes);
const userRoutes = require('./route/user.routes');
const postRoutes = require('./route/post.routes');

app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);

const opportunityRoutes = require('./route/opportunity.routes');
app.use('/api/opportunities', opportunityRoutes);

const server = http.listen(3002, () => {
    console.log("server is running on port 3002");
});

server.on('error', (e) => {
    console.error("Server error:", e);
});