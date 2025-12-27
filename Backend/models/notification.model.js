const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['interest', 'match', 'system', 'follow', 'info', 'opportunity', 'comment', 'like'],
        default: 'interest'
    },
    message: {
        type: String, // The actual message snippet
    },
    geminiSummary: {
        type: String, // The smart summary
    },
    relatedId: {
        type: mongoose.Schema.Types.ObjectId, // ID of the Opportunity or Interest
        required: true
    },
    onModel: {
        type: String,
        required: false,
        enum: ['Post', 'Opportunity', 'User']
    },
    isRead: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
