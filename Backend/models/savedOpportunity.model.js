const mongoose = require('mongoose');

const savedOpportunitySchema = new mongoose.Schema({
    investor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    opportunity: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Opportunity',
        required: true
    }
}, {
    timestamps: true
});

// Ensure unique save
savedOpportunitySchema.index({ investor: 1, opportunity: 1 }, { unique: true });

module.exports = mongoose.model('SavedOpportunity', savedOpportunitySchema);
