const mongoose = require('mongoose');

const messageRequestSchema = new mongoose.Schema({
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    receiverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    origin: {
        type: String,
        enum: ['profile', 'opportunity'],
        required: true
    },
    opportunityId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Opportunity',
        required: false
    },
    firstMessageId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message',
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected'],
        default: 'pending'
    }
}, {
    timestamps: true
});

// Compound index to prevent duplicate requests
messageRequestSchema.index({ senderId: 1, receiverId: 1 });

// Index for receiver's inbox queries
messageRequestSchema.index({ receiverId: 1, status: 1 });

// Static method to check if pending request exists
messageRequestSchema.statics.hasPendingRequest = async function (senderId, receiverId) {
    const request = await this.findOne({
        senderId,
        receiverId,
        status: 'pending'
    });
    return !!request;
};

// Static method to get pending requests for a user
messageRequestSchema.statics.getPendingRequests = async function (userId) {
    return await this.find({
        receiverId: userId,
        status: 'pending'
    })
        .populate('senderId', 'name username profilePicture accountType')
        .populate('firstMessageId')
        .populate('opportunityId', 'title')
        .sort({ createdAt: -1 });
};

// Static method to check request status between two users
messageRequestSchema.statics.getRequestStatus = async function (senderId, receiverId) {
    const request = await this.findOne({
        $or: [
            { senderId, receiverId },
            { senderId: receiverId, receiverId: senderId }
        ]
    });

    if (!request) {
        return { hasRequest: false, status: null };
    }

    return {
        hasRequest: true,
        status: request.status,
        requestId: request._id,
        isSender: request.senderId.toString() === senderId.toString()
    };
};

module.exports = mongoose.model('MessageRequest', messageRequestSchema);
