const MessageRequest = require('../models/messageRequest.model');
const Message = require('../models/chatmodel');
const Connection = require('../models/connection.model');
const Conversation = require('../models/conversation.model');
const User = require('../models/usermodel');
const { uploadToSupabase } = require('../utils/supabase');

/**
 * Send a message request from profile
 */
exports.sendMessageRequest = async (req, res) => {
    try {
        const senderId = req.user.id;
        const { receiverId, text } = req.body;
        const file = req.file;

        // Validate receiver exists
        const receiver = await User.findById(receiverId);
        if (!receiver) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if connection already exists
        const existingConnection = await Connection.findOne({
            $or: [
                { startupId: senderId, investorId: receiverId },
                { startupId: receiverId, investorId: senderId }
            ],
            status: 'active'
        });

        if (existingConnection) {
            return res.status(400).json({
                message: 'Connection already exists. Use normal chat.',
                hasConnection: true
            });
        }

        // Check if request already exists
        const existingRequest = await MessageRequest.findOne({
            senderId,
            receiverId
        });

        if (existingRequest) {
            if (existingRequest.status === 'pending') {
                return res.status(400).json({
                    message: 'Message request already sent. Waiting for approval.',
                    requestPending: true
                });
            } else if (existingRequest.status === 'rejected') {
                return res.status(403).json({
                    message: 'Your previous message request was rejected.',
                    requestRejected: true
                });
            }
        }

        // Handle file upload if present
        let attachments = [];
        if (file) {
            const uploadedFile = await uploadToSupabase(file, 'message-requests');
            attachments.push({
                type: file.mimetype.startsWith('image') ? 'image' :
                    file.mimetype.startsWith('video') ? 'video' :
                        file.mimetype === 'application/pdf' ? 'pdf' : 'document',
                url: uploadedFile.url,
                filename: file.originalname,
                size: file.size,
                mimeType: file.mimetype
            });
        }

        // Create first message
        const firstMessage = await Message.create({
            senderId,
            text,
            attachments,
            isFirstMessage: true,
            conversationId: null, // No conversation yet
            connectionId: null // No connection yet
        });

        // Create message request
        const messageRequest = await MessageRequest.create({
            senderId,
            receiverId,
            origin: 'profile',
            firstMessageId: firstMessage._id,
            status: 'pending'
        });

        // Update message with request ID
        firstMessage.messageRequestId = messageRequest._id;
        await firstMessage.save();

        // Populate sender info for response
        await messageRequest.populate('senderId', 'name username profilePicture accountType');
        await messageRequest.populate('firstMessageId');

        // Emit socket event to receiver
        if (req.io) {
            const receiverSocketId = global.userSockets?.[receiverId];
            if (receiverSocketId) {
                req.io.to(receiverSocketId).emit('message_request_sent', {
                    request: messageRequest
                });
            }
        }

        res.status(201).json({
            message: 'Message request sent successfully',
            request: messageRequest
        });
    } catch (error) {
        console.error('Send message request error:', error);
        res.status(500).json({ message: error.message });
    }
};

/**
 * Get all pending message requests for current user
 */
exports.getMessageRequests = async (req, res) => {
    try {
        const userId = req.user.id;

        const requests = await MessageRequest.getPendingRequests(userId);

        res.status(200).json(requests);
    } catch (error) {
        console.error('Get message requests error:', error);
        res.status(500).json({ message: error.message });
    }
};

/**
 * Accept a message request
 */
exports.acceptMessageRequest = async (req, res) => {
    try {
        const requestId = req.params.id;
        const userId = req.user.id;

        const request = await MessageRequest.findById(requestId)
            .populate('senderId', 'name username profilePicture accountType')
            .populate('firstMessageId');

        if (!request) {
            return res.status(404).json({ message: 'Request not found' });
        }

        // Verify user is the receiver
        if (request.receiverId.toString() !== userId) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        // Check if already accepted
        if (request.status === 'accepted') {
            return res.status(400).json({ message: 'Request already accepted' });
        }

        // Create connection
        const connection = await Connection.create({
            startupId: request.senderId._id,
            investorId: request.receiverId,
            createdFromRequestId: requestId,
            status: 'active'
        });

        // Create conversation
        const conversation = await Conversation.create({
            connectionId: connection._id,
            participants: [request.senderId._id, request.receiverId],
            lastMessage: {
                text: request.firstMessageId.text || 'Attachment',
                senderId: request.senderId._id,
                timestamp: request.firstMessageId.createdAt
            }
        });

        // Update first message with conversation and connection IDs
        await Message.findByIdAndUpdate(request.firstMessageId._id, {
            conversationId: conversation._id,
            connectionId: connection._id
        });

        // Update request status
        request.status = 'accepted';
        await request.save();

        // Emit socket event to sender
        if (req.io) {
            const senderSocketId = global.userSockets?.[request.senderId._id.toString()];
            if (senderSocketId) {
                req.io.to(senderSocketId).emit('message_request_accepted', {
                    receiver: await User.findById(userId).select('name username profilePicture'),
                    connectionId: connection._id,
                    conversationId: conversation._id
                });
            }
        }

        res.status(200).json({
            message: 'Request accepted',
            connection,
            conversation
        });
    } catch (error) {
        console.error('Accept request error:', error);
        res.status(500).json({ message: error.message });
    }
};

/**
 * Reject a message request
 */
exports.rejectMessageRequest = async (req, res) => {
    try {
        const requestId = req.params.id;
        const userId = req.user.id;

        const request = await MessageRequest.findById(requestId)
            .populate('senderId', 'name username profilePicture');

        if (!request) {
            return res.status(404).json({ message: 'Request not found' });
        }

        // Verify user is the receiver
        if (request.receiverId.toString() !== userId) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        // Update request status
        request.status = 'rejected';
        await request.save();

        // Optionally delete the first message
        // await Message.findByIdAndDelete(request.firstMessageId);

        // Emit socket event to sender
        if (req.io) {
            const senderSocketId = global.userSockets?.[request.senderId._id.toString()];
            if (senderSocketId) {
                req.io.to(senderSocketId).emit('message_request_rejected', {
                    receiver: await User.findById(userId).select('name username profilePicture')
                });
            }
        }

        res.status(200).json({
            message: 'Request rejected'
        });
    } catch (error) {
        console.error('Reject request error:', error);
        res.status(500).json({ message: error.message });
    }
};

/**
 * Check message request status with a specific user
 */
exports.checkMessageRequestStatus = async (req, res) => {
    try {
        const userId = req.user.id;
        const otherUserId = req.params.userId;

        const status = await MessageRequest.getRequestStatus(userId, otherUserId);

        res.status(200).json(status);
    } catch (error) {
        console.error('Check request status error:', error);
        res.status(500).json({ message: error.message });
    }
};
