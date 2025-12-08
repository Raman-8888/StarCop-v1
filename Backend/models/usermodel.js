const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true
    },
    username: {
        type: String,
        required: [true, 'Username is required'],
        unique: true,
        trim: true,
        lowercase: true,
        minlength: [3, 'Username must be at least 3 characters long']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters long']
    },
    accountType: {
        type: String,
        enum: ['startup', 'investor'],
        required: [true, 'Account type is required']
    },
    phoneNumber: {
        type: String,
        trim: true
    },
    profilePicture: {
        type: String,
        default: ''
    },
    bio: {
        type: String,
        trim: true
    },
    followers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    following: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    isProfileComplete: {
        type: Boolean,
        default: false
    },
    // Startup Specific Details
    startupDetails: {
        startupName: String,
        industry: String,
        stage: {
            type: String,
            enum: ['Idea', 'MVP', 'Early Revenue', 'Growth']
        },
        problemStatement: String,
        description: String,
        teamSize: Number,
        website: String,
        location: String,
        pitchVideo: String,
        fundingNeeded: Boolean,
        amountSeeking: String
    },
    // Investor Specific Details
    investorDetails: {
        companyName: String,
        role: String,
        investmentFocus: [String],
        preferredStage: [String],
        typicalAmount: String,
        portfolio: String,
        website: String,
        location: String
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('User', userSchema);