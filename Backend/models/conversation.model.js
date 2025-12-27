const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
    connectionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Connection',
        required: true
    },
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    lastMessage: {
        text: String,
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        seen: {
            type: Boolean,
            default: false
        },
        createdAt: Date
    },
    unreadCounts: {
        type: Map,
        of: Number,
        default: {}
    },
    deletedBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    clearedHistoryAt: {
        type: Map,
        of: Date,
        default: {}
    }
}, {
    timestamps: true
});

// Ensure one conversation per connection
conversationSchema.index({ connectionId: 1 }, { unique: true });

module.exports = mongoose.model('Conversation', conversationSchema);
