const mongoose = require('mongoose');

const opportunitySchema = new mongoose.Schema({
    creatorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    creatorRole: {
        type: String,
        enum: ['startup', 'investor'],
        required: true
    },
    title: {
        type: String,
        required: [true, 'Opportunity Title is required'],
        trim: true
    },
    industry: {
        type: String,
        required: [true, 'Industry is required']
    },
    problem: {
        type: String,
        required: false
    },
    solution: {
        type: String,
        required: false
    },
    description: { // New field for generic description
        type: String,
        required: false
    },
    traction: {
        type: String,
        required: false // Optional but recommended
    },
    fundingStage: {
        type: String, // e.g., Pre-Seed, Seed, Series A
        required: false
    },
    investmentRange: {
        type: String, // e.g., "$100k - $500k"
        required: false
    },
    pitchVideoUrl: {
        type: String, // Cloudinary URL
        required: false
    },
    galleryUrls: [{
        type: String // Cloudinary URLs
    }],
    deckUrl: {
        type: String, // Cloudinary URL (PDF)
        required: false
    },
    tags: [{
        type: String
    }],
    visibility: {
        type: Boolean,
        default: true
    },
    // Analytics Counters
    views: {
        type: Number,
        default: 0
    },
    saves: {
        type: Number,
        default: 0
    },
    interestCount: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Opportunity', opportunitySchema);
