const mongoose = require('mongoose');

const investorInterestSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    opportunity: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Opportunity',
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected'],
        default: 'pending'
    },
    message: {
        type: String, // Optional init message
        required: false
    },
    requestVideoUrl: {
        type: String,
        required: false
    }
}, {
    timestamps: true
});

// Ensure an investor sends interest only once per opportunity
investorInterestSchema.index({ sender: 1, opportunity: 1 }, { unique: true });

module.exports = mongoose.model('InvestorInterest', investorInterestSchema);
