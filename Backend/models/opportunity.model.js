const mongoose = require('mongoose');

const opportunitySchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Description is required']
    },
    industry: {
        type: String,
        required: [true, 'Industry is required']
    },
    type: {
        type: String,
        enum: ['Funding', 'Partnership', 'Challenge', 'Accelerator', 'Hiring'],
        required: [true, 'Type of opportunity is required']
    },
    budget: {
        type: String, // String to allow ranges like "$10k - $50k"
        required: false
    },
    deadline: {
        type: Date,
        required: false
    },
    attachments: [{
        type: String // URLs to files
    }],
    investor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['Open', 'Closed'],
        default: 'Open'
    },
    applicationsCount: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Opportunity', opportunitySchema);
