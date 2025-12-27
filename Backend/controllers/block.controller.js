const BlockedUser = require('../models/blockedUser.model');
const Connection = require('../models/connection.model');
const InvestorInterest = require('../models/investorInterest.model');
const Conversation = require('../models/conversation.model');

/**
 * Block a user
 */
exports.blockUser = async (req, res) => {
    try {
        const blockerId = req.user.id;
        const blockedId = req.params.userId;
        const { reason } = req.body;

        // Prevent self-blocking
        if (blockerId === blockedId) {
            return res.status(400).json({ message: "You cannot block yourself" });
        }

        // Check if already blocked
        const existingBlock = await BlockedUser.findOne({ blockerId, blockedId });
        if (existingBlock) {
            return res.status(400).json({ message: "User is already blocked" });
        }

        // Create block record
        const block = await BlockedUser.create({
            blockerId,
            blockedId,
            reason: reason || undefined
        });

        // Remove any pending interest requests between users
        await InvestorInterest.deleteMany({
            $or: [
                { sender: blockerId, recipient: blockedId, status: 'pending' },
                { sender: blockedId, recipient: blockerId, status: 'pending' }
            ]
        });

        // Update connection status to 'blocked' if exists
        await Connection.updateMany(
            {
                $or: [
                    { startupId: blockerId, investorId: blockedId },
                    { startupId: blockedId, investorId: blockerId }
                ]
            },
            { status: 'blocked' }
        );

        // Note: Messages are kept but will be filtered out in queries (soft delete)
        // Conversations remain but will be inaccessible

        res.status(200).json({
            message: "User blocked successfully",
            block
        });
    } catch (error) {
        console.error('Block user error:', error);
        res.status(500).json({ message: error.message });
    }
};

/**
 * Unblock a user
 */
exports.unblockUser = async (req, res) => {
    try {
        const blockerId = req.user.id;
        const blockedId = req.params.userId;

        // Find and delete block record
        const block = await BlockedUser.findOneAndDelete({ blockerId, blockedId });

        if (!block) {
            return res.status(404).json({ message: "Block record not found" });
        }

        // Restore connection status to 'active' if it exists
        await Connection.updateMany(
            {
                $or: [
                    { startupId: blockerId, investorId: blockedId },
                    { startupId: blockedId, investorId: blockerId }
                ],
                status: 'blocked'
            },
            { status: 'active' }
        );

        // Messages become accessible again automatically

        res.status(200).json({
            message: "User unblocked successfully"
        });
    } catch (error) {
        console.error('Unblock user error:', error);
        res.status(500).json({ message: error.message });
    }
};

/**
 * Get list of users you've blocked
 */
exports.getBlockedUsers = async (req, res) => {
    try {
        const userId = req.user.id;

        const blockedUsers = await BlockedUser.getBlockedUsers(userId);

        res.status(200).json(blockedUsers);
    } catch (error) {
        console.error('Get blocked users error:', error);
        res.status(500).json({ message: error.message });
    }
};

/**
 * Check block status with a specific user
 */
exports.checkBlockStatus = async (req, res) => {
    try {
        const userId = req.user.id;
        const otherUserId = req.params.userId;

        const blockStatus = await BlockedUser.getBlockStatus(userId, otherUserId);

        res.status(200).json(blockStatus);
    } catch (error) {
        console.error('Check block status error:', error);
        res.status(500).json({ message: error.message });
    }
};
