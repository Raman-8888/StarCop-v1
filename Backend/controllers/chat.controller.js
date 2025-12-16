const User = require('../models/usermodel');
const Conversation = require('../models/conversation.model');
const Message = require('../models/chatmodel');

// Search users
exports.searchUsers = async (req, res) => {
    try {
        const { search } = req.query;
        const currentUserId = req.user.id;

        if (!search) return res.status(400).json({ message: "Search term required" });

        const users = await User.find({
            $or: [
                { username: { $regex: search, $options: "i" } },
                { name: { $regex: search, $options: "i" } }
            ],
            _id: { $ne: currentUserId }
        }).select("-password");

        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create or get conversation
exports.createOrGetConversation = async (req, res) => {
    try {
        const { userId } = req.body;
        const currentUserId = req.user.id;

        if (!userId) return res.status(400).json({ message: "User ID required" });

        // Check if conversation exists
        let conversation = await Conversation.findOne({
            participants: { $all: [currentUserId, userId] }
        }).populate("participants", "-password").populate("lastMessage.sender", "name username");

        if (!conversation) {
            conversation = await Conversation.create({
                participants: [currentUserId, userId],
                unreadCounts: {
                    [currentUserId]: 0,
                    [userId]: 0
                }
            });
            conversation = await conversation.populate("participants", "-password");
        }

        res.status(200).json(conversation);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get all conversations for current user
exports.getConversations = async (req, res) => {
    try {
        const currentUserId = req.user.id;

        const conversations = await Conversation.find({
            participants: { $in: [currentUserId] }
        })
            .populate("participants", "-password")
            .sort({ updatedAt: -1 });

        res.status(200).json(conversations);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get messages for a conversation
exports.getMessages = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const messages = await Message.find({ conversationId })
            .sort({ createdAt: 1 });

        res.status(200).json(messages);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Send message
exports.sendMessage = async (req, res) => {
    try {
        const { conversationId, text } = req.body;
        const senderId = req.user.id;

        const newMessage = await Message.create({
            conversationId,
            senderId,
            text,
            readBy: [senderId]
        });

        // Update conversation last message
        const updatedConversation = await Conversation.findByIdAndUpdate(conversationId, {
            lastMessage: {
                text,
                sender: senderId,
                createdAt: new Date()
            },
            $inc: { [`unreadCounts.${senderId === req.user.id ? 'other' : senderId}`]: 1 }
        }, { new: true }).populate("participants"); // Populate to get participant IDs

        // Populate sender details for the message payload
        const fullMessage = await newMessage.populate("senderId", "name username profilePicture");

        // Format message for socket (ensure sender field usage matches frontend expectation)
        const socketPayload = {
            ...fullMessage.toObject(),
            sender: fullMessage.senderId // Frontend likely expects 'sender' object, not just 'senderId'
        };

        // Real-time Emission
        if (req.io) {
            // 1. Emit to the conversation room (for active chat sync)
            req.io.to(conversationId).emit("message_received", socketPayload);

            // 2. Emit to each participant's personal room (for global notifications)
            updatedConversation.participants.forEach(participant => {
                const pId = participant._id.toString();
                if (pId !== senderId.toString()) {
                    console.log(`DEBUG: Emitting notification to user ${pId}`);
                    req.io.to(pId).emit("message_received", socketPayload);
                }
            });
        }

        res.status(201).json(fullMessage);
    } catch (error) {
        console.error("Send Message Error:", error);
        res.status(500).json({ message: error.message });
    }
};
