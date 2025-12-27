const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
    startup: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    opportunity: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Opportunity',
        required: true
    },
    investor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    proposal: {
        type: String,
        required: [true, 'Proposal is required']
    },
    pitchDeck: {
        type: String, // URL
        required: false
    },
    videoLink: {
        type: String, // URL
        required: false
    },
    status: {
        type: String,
        enum: ['Submitted', 'Viewed', 'Shortlisted', 'Accepted', 'Rejected'],
        default: 'Submitted'
    }
}, {
    timestamps: true
});

// Ensure a startup can only apply once to an opportunity
applicationSchema.index({ startup: 1, opportunity: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);
