const mongoose = require('mongoose');
const User = require('../models/usermodel');
const Conversation = require('../models/conversation.model');
const Message = require('../models/chatmodel');

// Search users
exports.searchUsers = async (req, res) => {
    try {
        const { search } = req.query;
        const currentUserId = req.user.id;

        if (!search) return res.status(400).json({ message: "Search term required" });

        // Fetch current user to get following and followers
        const currentUser = await User.findById(currentUserId);

        if (!currentUser) {
            return res.status(404).json({ message: "Current user not found" });
        }

        // Combine following and followers
        const allowedIds = [...currentUser.following, ...currentUser.followers];

        const users = await User.find({
            $and: [
                {
                    $or: [
                        { username: { $regex: search, $options: "i" } },
                        { name: { $regex: search, $options: "i" } }
                    ]
                },
                { _id: { $in: allowedIds } }, // Restrict to allowed IDs
                { _id: { $ne: currentUserId } }
            ]
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

        // Check if a valid connection exists between users
        const Connection = require('../models/connection.model');
        const User = require('../models/usermodel');

        const [currentUser, otherUser] = await Promise.all([
            User.findById(currentUserId),
            User.findById(userId)
        ]);

        if (!otherUser) {
            return res.status(404).json({ message: "User not found" });
        }

        // Find all active connections between users to handle potential duplicates (A-B vs B-A)
        const connections = await Connection.find({
            $or: [
                { startupId: currentUserId, investorId: userId },
                { startupId: userId, investorId: currentUserId }
            ],
            status: 'active'
        });

        let conversation = null;
        let activeConnection = null;

        // 1. Try to find a conversation linked to ANY strings active connection
        for (const conn of connections) {
            const conv = await Conversation.findOne({ connectionId: conn._id })
                .populate("participants", "-password")
                .populate("lastMessage.sender", "name username");

            if (conv) {
                conversation = conv;
                activeConnection = conn;
                break; // Found one!
            }
        }

        // 2. If no conversation found via connections, check for ORPHANED conversation (by participants)
        if (!conversation) {
            const existingByParticipants = await Conversation.findOne({
                participants: { $all: [currentUserId, userId] }
            })
                .populate("participants", "-password")
                .populate("lastMessage.sender", "name username")
                .sort({ updatedAt: -1 }); // Get most recently active one

            if (existingByParticipants) {
                conversation = existingByParticipants;

                // We need to link it to a connection.
                // Use the first available active connection, or create one if none exist.
                if (connections.length > 0) {
                    activeConnection = connections[0];
                } else {
                    // Create new connection if absolutely no connection exists
                    // Check mutual follow only if we are creating a BRAND NEW connection? 
                    // But if conversation exists, they likely have a relationship. 
                    // We'll trust the existence of conversation implies a relationship OR we should check follows.
                    // For safety, let's assume if conversation exists, we just restore the connection.
                    activeConnection = await Connection.create({
                        startupId: currentUserId,
                        investorId: userId,
                        status: 'active'
                    });
                }

                // Link conversation to the active connection
                conversation.connectionId = activeConnection._id;
                await conversation.save();
            }
        }

        // 3. Last Resort: Verify strictly that we have a connection and create new conversation
        if (!conversation) {
            // We need a connection to create a conversation
            if (connections.length > 0) {
                activeConnection = connections[0];
            } else {
                // Logic to create connection (Mutual Follow Check)
                // Check for mutual follow
                const isUserFollowingTarget = currentUser.following.some(id => id.toString() === userId.toString());
                const isTargetFollowingUser = otherUser.following.some(id => id.toString() === currentUserId.toString());

                if (isUserFollowingTarget && isTargetFollowingUser) {
                    activeConnection = await Connection.create({
                        startupId: currentUserId,
                        investorId: userId,
                        status: 'active'
                    });
                } else if (isUserFollowingTarget) {
                    // One-way follow: Allow sending a Message Request (Provisional Return)
                    // ... (Existing Provisional Logic)
                    const MessageRequest = require('../models/messageRequest.model');
                    const existingRequest = await MessageRequest.findOne({
                        senderId: currentUserId,
                        receiverId: userId
                    }).populate('firstMessageId');

                    const provisionalConversation = {
                        _id: 'provisional_' + userId, // Temp ID
                        participants: [currentUser, otherUser],
                        isProvisional: true, // Frontend flag
                        unreadCounts: { [currentUserId]: 0, [userId]: 0 },
                        existingRequest: existingRequest // Pass request details if any
                    };
                    return res.status(200).json(provisionalConversation);
                } else {
                    return res.status(403).json({
                        message: "You must follow this user to start a conversation."
                    });
                }
            }

            // Create new conversation linked to connection
            conversation = await Conversation.create({
                connectionId: activeConnection._id,
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
        console.error('Create/Get Conversation Error:', error);
        res.status(500).json({ message: error.message });
    }
};

// Get all conversations for current user (Primary + Requests)
exports.getConversations = async (req, res) => {
    try {
        const currentUserId = req.user.id;
        const MessageRequest = require('../models/messageRequest.model');

        // 1. Get Primary Conversations (Active Connections)
        const conversations = await Conversation.find({
            participants: { $in: [currentUserId] },
            deletedBy: { $ne: currentUserId }
        })
            .populate("participants", "-password")
            .sort({ updatedAt: -1 });

        // 2. Get Message Requests (Pending)
        const requests = await MessageRequest.getPendingRequests(currentUserId);

        res.status(200).json({
            primary: conversations,
            requests: requests
        });
    } catch (error) {
        console.error('Get Conversations Error:', error);
        res.status(500).json({ message: error.message });
    }
};

// Get messages for a conversation
exports.getMessages = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const currentUserId = req.user.id;

        // Find conversation to verify participation
        const conversation = await Conversation.findById(conversationId);

        if (!conversation) {
            return res.status(404).json({ message: "Conversation not found" });
        }

        // Check if user is a participant
        const isParticipant = conversation.participants.some(p => p.toString() === currentUserId);

        if (!isParticipant) {
            return res.status(403).json({ message: "Not authorized to view this conversation" });
        }

        // Check if user has cleared history
        const clearedAt = conversation.clearedHistoryAt?.get(currentUserId);
        const query = { conversationId };
        if (clearedAt) {
            query.createdAt = { $gt: clearedAt };
        }

        const messages = await Message.find(query)
            .populate("senderId", "name username profilePicture") // Populate sender info
            .sort({ createdAt: 1 });

        res.status(200).json(messages);
    } catch (error) {
        console.error("Get Messages Error:", error);
        res.status(500).json({ message: error.message });
    }
};

exports.sendMessage = async (req, res) => {
    try {
        console.log("DEBUG: sendMessage Body:", req.body);
        console.log("DEBUG: sendMessage Files:", req.files ? req.files.length : 0);
        const { conversationId, text, connectionId: providedConnectionId, receiverId } = req.body;
        const senderId = req.user.id;
        const files = req.files || [];

        // Dynamic import to avoid circular dependencies
        const Connection = require('../models/connection.model');
        const MessageRequest = require('../models/messageRequest.model');
        const messageRequestController = require('./messageRequest.controller');

        let connectionId = providedConnectionId;

        // Step 1: Attempt to resolve connectionId if not provided
        // Step 1: Attempt to resolve connectionId if not provided
        if (!connectionId) {
            // Case A: Have conversationId -> find connection from Conversation
            if (conversationId) {
                const conversation = await Conversation.findById(conversationId);
                if (conversation) {
                    connectionId = conversation.connectionId;

                    // Fallback: If conversation exists but has NO connectionId (legacy/bug), try to find/create one
                    if (!connectionId) {
                        const otherParticipant = conversation.participants.find(p => p.toString() !== senderId);
                        if (otherParticipant) {
                            // 1. Try finding existing active connection
                            let connection = await Connection.findOne({
                                $or: [
                                    { startupId: senderId, investorId: otherParticipant },
                                    { startupId: otherParticipant, investorId: senderId }
                                ],
                                status: 'active'
                            });

                            // 2. If no connection, check mutual follow
                            if (!connection) {
                                // Need to fetch users to check following
                                const User = require('../models/usermodel');
                                const currentUser = await User.findById(senderId);
                                const otherUser = await User.findById(otherParticipant);

                                if (currentUser && otherUser) {
                                    // Ensure string comparison
                                    const isUserFollowingTarget = currentUser.following.some(id => id.toString() === otherParticipant.toString());
                                    const isTargetFollowingUser = otherUser.following.some(id => id.toString() === senderId.toString());

                                    if (isUserFollowingTarget && isTargetFollowingUser) {
                                        // Auto-create connection
                                        connection = await Connection.create({
                                            startupId: senderId,
                                            investorId: otherParticipant,
                                            status: 'active'
                                        });
                                    }
                                }
                            }

                            if (connection) {
                                connectionId = connection._id;
                                // Fix the conversation for next time
                                conversation.connectionId = connection._id;
                                await conversation.save();
                            }
                        }
                    }
                }
            }
            // Case B: Have receiverId -> find active connection between users
            else if (receiverId) {
                const connection = await Connection.findOne({
                    $or: [
                        { startupId: senderId, investorId: receiverId },
                        { startupId: receiverId, investorId: senderId }
                    ],
                    status: 'active'
                });
                if (connection) connectionId = connection._id;
            }
        }

        // Step 2: If we still don't have a connectionId
        if (!connectionId) {
            // If we have a receiverId, this is likely a first message attempt (Message Request)
            if (receiverId) {
                // Delegate to message request controller
                return messageRequestController.sendMessageRequest(req, res);
            }

            // Otherwise, we can't proceed
            return res.status(400).json({ message: "Connection ID or valid Receiver ID required to send message" });
        }

        // Step 3: Validate the Connection
        const connection = await Connection.findById(connectionId);

        if (!connection) {
            return res.status(404).json({ message: "Connection not found" });
        }

        if (connection.status !== 'active') {
            // If blocked, return specific error
            if (connection.status === 'blocked') {
                return res.status(403).json({ message: "Connection is blocked" });
            }
            return res.status(403).json({ message: "Connection is not active" });
        }

        // Verify sender is part of the connection
        if (connection.startupId.toString() !== senderId.toString() && connection.investorId.toString() !== senderId.toString()) {
            return res.status(403).json({
                message: "You are not authorized to send messages in this connection"
            });
        }

        // If we got here, we have a valid active connection. Proceed to send message.


        // Validate: must have either text or files
        if (!text && files.length === 0) {
            return res.status(400).json({ message: "Message must contain text or files" });
        }

        // Process file uploads
        const attachments = [];
        if (files.length > 0) {
            const { uploadToSupabase } = require('../utils/supabaseUpload');

            for (const file of files) {
                try {
                    // Upload to Supabase
                    const fileUrl = await uploadToSupabase(
                        file.buffer,
                        file.originalname,
                        file.mimetype,
                        'chat-files'
                    );

                    // Determine file type
                    let fileType = 'other';
                    if (file.mimetype.startsWith('image/')) fileType = 'image';
                    else if (file.mimetype.startsWith('video/')) fileType = 'video';
                    else if (file.mimetype === 'application/pdf') fileType = 'pdf';
                    else if (file.mimetype.includes('document') || file.mimetype.includes('word')) fileType = 'document';

                    attachments.push({
                        type: fileType,
                        url: fileUrl,
                        filename: file.originalname,
                        size: file.size,
                        mimeType: file.mimetype
                    });
                } catch (uploadError) {
                    console.error('File upload error:', uploadError);
                    return res.status(500).json({ message: `Failed to upload ${file.originalname}` });
                }
            }
        }

        const newMessage = await Message.create({
            conversationId,
            connectionId,
            senderId,
            text: text || '',
            attachments,
            readBy: [senderId]
        });

        // Update conversation last message
        const lastMessageText = text || (attachments.length > 0 ? `📎 ${attachments.length} file(s)` : '');
        const updatedConversation = await Conversation.findByIdAndUpdate(conversationId, {
            lastMessage: {
                text: lastMessageText,
                sender: senderId,
                createdAt: new Date()
            },
            $inc: { [`unreadCounts.${senderId === req.user.id ? 'other' : senderId}`]: 1 },
            $pull: { deletedBy: { $in: [senderId, new mongoose.Types.ObjectId(connection.startupId), new mongoose.Types.ObjectId(connection.investorId)] } } // Ensure visible to all participants
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

        res.status(201).json(socketPayload);
    } catch (error) {
        console.error("Send Message Error:", error);
        res.status(500).json({ message: error.message });
    }
};

// Delete message
exports.deleteMessage = async (req, res) => {
    try {
        const { messageId } = req.params;
        const userId = req.user.id;

        // Find the message
        const message = await Message.findById(messageId);

        if (!message) {
            return res.status(404).json({ message: "Message not found" });
        }

        // Check if user is the sender
        if (message.senderId.toString() !== userId.toString()) {
            return res.status(403).json({ message: "You can only delete your own messages" });
        }

        // Delete the message
        await Message.findByIdAndDelete(messageId);

        // Real-time notification
        if (req.io) {
            // Emit to conversation room
            req.io.to(message.conversationId.toString()).emit("message_deleted", {
                messageId: messageId,
                conversationId: message.conversationId
            });
        }

        res.status(200).json({ message: "Message deleted successfully" });
    } catch (error) {
        console.error("Delete Message Error:", error);
        res.status(500).json({ message: error.message });
    }
};

// Delete conversation (Clear history for user)
exports.deleteConversation = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const currentUserId = req.user.id;

        const conversation = await Conversation.findById(conversationId);

        if (!conversation) {
            return res.status(404).json({ message: "Conversation not found" });
        }

        // Update conversation: add to deletedBy and set clearedHistoryAt
        await Conversation.findByIdAndUpdate(conversationId, {
            $addToSet: { deletedBy: currentUserId },
            $set: { [`clearedHistoryAt.${currentUserId}`]: new Date() }
        });

        res.status(200).json({ message: "Conversation deleted successfully" });
    } catch (error) {
        console.error("Delete Conversation Error:", error);
        res.status(500).json({ message: error.message });
    }
};
