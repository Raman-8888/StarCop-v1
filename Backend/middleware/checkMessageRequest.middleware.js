const MessageRequest = require('../models/messageRequest.model');
const Connection = require('../models/connection.model');

exports.checkMessageRequest = async (req, res, next) => {
    try {
        const senderId = req.user.id;
        const receiverId = req.body.receiverId || req.body.userId;

        // Skip if sending to self (shouldn't happen but good to check)
        if (senderId === receiverId) {
            return next();
        }

        // 1. Check if active connection exists
        const connection = await Connection.findOne({
            $or: [
                { startupId: senderId, investorId: receiverId },
                { startupId: receiverId, investorId: senderId }
            ],
            status: 'active'
        });

        if (connection) {
            req.connectionId = connection._id;
            return next();
        }

        // 2. Check for pending request
        const pendingRequest = await MessageRequest.findOne({
            senderId,
            receiverId,
            status: 'pending'
        });

        if (pendingRequest) {
            return res.status(403).json({
                message: "Message request pending. Wait for approval.",
                requestPending: true
            });
        }

        // 3. Check for rejected request
        const rejectedRequest = await MessageRequest.findOne({
            senderId,
            receiverId,
            status: 'rejected'
        });

        if (rejectedRequest) {
            return res.status(403).json({
                message: "Your message request was rejected.",
                requestRejected: true
            });
        }

        // If no connection and no request, this is a first message attempt
        // The controller will handle creating the request
        req.isFirstMessage = true;
        next();
    } catch (error) {
        console.error('Check Message Request Error:', error);
        res.status(500).json({ message: error.message });
    }
};
