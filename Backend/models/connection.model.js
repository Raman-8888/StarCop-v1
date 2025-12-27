const mongoose = require('mongoose');

const connectionSchema = new mongoose.Schema({
    startupId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    investorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdFromRequestId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'InvestorInterest',
        required: false
    },
    status: {
        type: String,
        enum: ['active', 'blocked'],
        default: 'active'
    }
}, {
    timestamps: true
});

// Ensure unique connection between startup and investor
connectionSchema.index({ startupId: 1, investorId: 1 }, { unique: true });

// Helper method to check if a user is part of this connection
connectionSchema.methods.hasParticipant = function (userId) {
    return this.startupId.toString() === userId.toString() ||
        this.investorId.toString() === userId.toString();
};

// Helper method to get the other participant
connectionSchema.methods.getOtherParticipant = function (userId) {
    if (this.startupId.toString() === userId.toString()) {
        return this.investorId;
    }
    return this.startupId;
};

module.exports = mongoose.model('Connection', connectionSchema);
