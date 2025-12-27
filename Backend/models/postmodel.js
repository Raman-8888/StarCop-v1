const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    caption: {
        type: String,
        trim: true
    },
    mediaUrl: {
        type: String,
        required: true
    },
    mediaType: {
        type: String,
        enum: ['image', 'video'],
        default: 'image'
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    comments: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        text: {
            type: String,
            required: true
        },
        name: {
            type: String,
            required: false // Changed to false to support legacy comments
        },
        profilePicture: {
            type: String,
            default: ""
        },
        username: {
            type: String,
            required: false // Optional for backward compatibility
        },
        createdAt: {
            type: Date,
            default: Date.now
        },
        likes: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }],
        isPinned: {
            type: Boolean,
            default: false
        }
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('Post', postSchema);
