const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    conversationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Conversation'
    },
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    text: String,
    attachments: Array,
    readBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    createdAt: { type: Date, default: Date.now }
}, {
    timestamps: true
});

module.exports = mongoose.model('Message', messageSchema);