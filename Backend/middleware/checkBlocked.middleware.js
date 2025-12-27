const BlockedUser = require('../models/blockedUser.model');

/**
 * Middleware to check if users are blocked before allowing actions
 * Usage: Add this middleware before routes that require block checking
 */
const checkBlocked = async (req, res, next) => {
    try {
        const currentUserId = req.user.id;

        const mongoose = require('mongoose');

        const Conversation = require('../models/conversation.model'); // Import Conversation model

        // Try to get target user ID from various possible locations
        let targetUserId =
            req.body.userId ||
            req.body.recipient ||
            req.body.receiverId ||
            req.params.userId ||
            req.params.id;

        // If no direct targetUserId, check if conversationId is provided
        if (!targetUserId && req.body.conversationId) {
            const conversation = await Conversation.findById(req.body.conversationId);
            if (conversation) {
                // Find the other participant
                const otherParticipant = conversation.participants.find(
                    p => p.toString() !== currentUserId.toString()
                );
                if (otherParticipant) {
                    targetUserId = otherParticipant;
                }
            }
        }

        // If no target user found after all checks, skip
        if (!targetUserId) {
            return next();
        }

        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(targetUserId)) {
            // If it's not a valid ID, we can't check block status, so we skip or error.
            // For safety, let's skip but log warning, or just proceed if it's not an ID (unlikely for this route).
            // Actually, if it's invalid, the controller will likely fail anyway.
            return next();
        }

        // Check if either user blocked the other
        const isBlocked = await BlockedUser.isBlocked(currentUserId, targetUserId);

        if (isBlocked) {
            return res.status(403).json({
                message: "This action is not allowed. One of you has blocked the other.",
                blocked: true
            });
        }

        next();
    } catch (error) {
        console.error('Check blocked middleware error:', error);
        res.status(500).json({ message: 'Error checking block status' });
    }
};

module.exports = { checkBlocked };
