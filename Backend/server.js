// server.js
require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const mongoose = require('mongoose');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://127.0.0.1:5173", process.env.CLIENT_URL],
    methods: ['GET', 'POST'],
    credentials: true
  }
});

const Message = require('./models/chatmodel');

// Optional: connect to MongoDB if MONGO_URL provided
const MONGO_URL = process.env.MONGO_URL || '';
if (MONGO_URL) {
  mongoose.connect(MONGO_URL)
    .then(() => console.log('MongoDB connected'))
    .catch((err) => console.error('Mongo error', err));
}

// Simple in-memory maps (for demo). Use Redis for scale.
const onlineUsers = new Map(); // userId => socket.id
const socketToUser = new Map(); // socket.id => userId

// Basic health route
app.get('/health', (req, res) => res.json({ ok: true }));

// Import and use auth routes
const authRoutes = require('./route/auth.route');
const chatRoutes = require('./route/chat.route');
const userRoutes = require('./route/user.routes');
const postRoutes = require('./route/post.routes');

// Make io accessible in routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);

const opportunityRoutes = require('./route/opportunity.routes');
const notificationRoutes = require('./route/notification.routes');
const connectionRoutes = require('./route/connection.routes');
const blockRoutes = require('./route/block.routes');
const messageRequestRoutes = require('./route/messageRequest.routes');

app.use('/api/opportunities', opportunityRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/connections', connectionRoutes);
app.use('/api/blocks', blockRoutes);
app.use('/api/message-requests', messageRequestRoutes);

io.on('connection', (socket) => {
  console.log('Socket connected', socket.id);

  socket.on('setup', (userData) => {
    socket.join(userData.userId);
    console.log(`DEBUG: User joined room ${userData.userId}`);
    socket.emit('connected');
  });

  socket.on('join_chat', (room) => {
    socket.join(room);
    console.log('User joined room: ' + room);
  });

  socket.on('typing', (room) => socket.in(room).emit('typing'));
  socket.on('stop_typing', (room) => socket.in(room).emit('stop_typing'));

  socket.on('new_message', (newMessageRecieved) => {
    var chat = newMessageRecieved.conversationId; // Assuming conversationId is passed or we fetch it

    if (!chat) return console.log('chat.participants not defined');

    // We need the list of participants to emit to them. 
    // Since we don't have the full conversation object here easily without fetching,
    // we can rely on the client to send the list of participants OR
    // we can just emit to the room (conversationId) which both users should have joined.

    // Strategy: Emit to the room.
    socket.in(newMessageRecieved.conversationId).emit('message_received', newMessageRecieved);
  });

  socket.on('disconnect', () => {
    console.log('USER DISCONNECTED');
    // Handle offline status if needed
  });
});

const PORT = process.env.PORT || 3002;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
