const mongoose = require('mongoose');

const blockedUserSchema = new mongoose.Schema({
    blockerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    blockedId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    reason: {
        type: String,
        required: false
    },
    // Soft delete flag - messages remain but are hidden
    messagesHidden: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Compound unique index to prevent duplicate blocks
blockedUserSchema.index({ blockerId: 1, blockedId: 1 }, { unique: true });

// Index for reverse lookups (who blocked me)
blockedUserSchema.index({ blockedId: 1 });

// Static method to check if either user blocked the other
blockedUserSchema.statics.isBlocked = async function (userId1, userId2) {
    const block = await this.findOne({
        $or: [
            { blockerId: userId1, blockedId: userId2 },
            { blockerId: userId2, blockedId: userId1 }
        ]
    });
    return !!block;
};

// Static method to check who blocked whom
blockedUserSchema.statics.getBlockStatus = async function (userId1, userId2) {
    const blocks = await this.find({
        $or: [
            { blockerId: userId1, blockedId: userId2 },
            { blockerId: userId2, blockedId: userId1 }
        ]
    });

    if (blocks.length === 0) return { isBlocked: false, blockedBy: null };
    if (blocks.length === 2) return { isBlocked: true, blockedBy: 'both' };

    const block = blocks[0];
    if (block.blockerId.toString() === userId1.toString()) {
        return { isBlocked: true, blockedBy: 'me' };
    } else {
        return { isBlocked: true, blockedBy: 'them' };
    }
};

// Static method to get all users blocked by a user
blockedUserSchema.statics.getBlockedUsers = async function (userId) {
    return await this.find({ blockerId: userId })
        .populate('blockedId', 'name username profilePicture accountType')
        .sort({ createdAt: -1 });
};

// Static method to get all users who blocked a user
blockedUserSchema.statics.getBlockedByUsers = async function (userId) {
    return await this.find({ blockedId: userId })
        .populate('blockerId', 'name username profilePicture accountType')
        .sort({ createdAt: -1 });
};

module.exports = mongoose.model('BlockedUser', blockedUserSchema);
