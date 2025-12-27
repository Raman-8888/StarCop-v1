const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    conversationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Conversation'
    },
    connectionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Connection',
        required: true
    },
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    text: { type: String, required: false },
    attachments: [{
        type: {
            type: String,
            enum: ['image', 'video', 'pdf', 'document', 'other'],
            required: true
        },
        url: { type: String, required: true },
        filename: { type: String, required: true },
        size: { type: Number, required: true },
        mimeType: { type: String, required: true }
    }],
    isFirstMessage: {
        type: Boolean,
        default: false
    },
    messageRequestId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MessageRequest',
        required: false
    },
    readBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    createdAt: { type: Date, default: Date.now }
}, {
    timestamps: true
});

module.exports = mongoose.model('Message', messageSchema);