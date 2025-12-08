const Opportunity = require('../models/opportunity.model');
const Application = require('../models/application.model');
const User = require('../models/usermodel');

exports.createOpportunity = async (req, res) => {
    try {
        const { title, description, industry, type, budget, deadline, attachments } = req.body;
        const userId = req.user.userId; // Middleware should attach this

        // Verify if user is an investor
        const user = await User.findById(userId);
        if (user.accountType !== 'investor') {
            return res.status(403).json({ message: "Only investors can create opportunities" });
        }

        const newOpportunity = new Opportunity({
            title,
            description,
            industry,
            type,
            budget,
            deadline,
            attachments,
            investor: userId
        });

        await newOpportunity.save();
        res.status(201).json(newOpportunity);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getAllOpportunities = async (req, res) => {
    try {
        const { industry, type, budget, search } = req.query;
        let query = { status: 'Open' };

        if (industry) query.industry = industry;
        if (type) query.type = type;
        if (budget) query.budget = budget;
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        const opportunities = await Opportunity.find(query)
            .populate('investor', 'name profilePicture investorDetails')
            .sort({ createdAt: -1 });

        res.status(200).json(opportunities);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getOpportunityById = async (req, res) => {
    try {
        const opportunity = await Opportunity.findById(req.params.id)
            .populate('investor', 'name profilePicture investorDetails email socialLinks');

        if (!opportunity) {
            return res.status(404).json({ message: "Opportunity not found" });
        }
        res.status(200).json(opportunity);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteOpportunity = async (req, res) => {
    try {
        const opportunity = await Opportunity.findById(req.params.id);
        if (!opportunity) return res.status(404).json({ message: "Opportunity not found" });

        if (opportunity.investor.toString() !== req.user.userId) {
            return res.status(403).json({ message: "Not authorized to delete this opportunity" });
        }

        await Opportunity.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Opportunity deleted" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.applyToOpportunity = async (req, res) => {
    try {
        const { proposal, pitchDeck, videoLink } = req.body;
        const startupId = req.user.userId;
        const opportunityId = req.params.id;

        const opportunity = await Opportunity.findById(opportunityId);
        if (!opportunity) return res.status(404).json({ message: "Opportunity not found" });

        // Check if already applied
        const existingApplication = await Application.findOne({ startup: startupId, opportunity: opportunityId });
        if (existingApplication) {
            return res.status(400).json({ message: "You have already applied to this opportunity" });
        }

        const newApplication = new Application({
            startup: startupId,
            opportunity: opportunityId,
            investor: opportunity.investor,
            proposal,
            pitchDeck,
            videoLink
        });

        await newApplication.save();

        // Increment application count
        opportunity.applicationsCount += 1;
        await opportunity.save();

        res.status(201).json(newApplication);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getMyApplications = async (req, res) => {
    try {
        const applications = await Application.find({ startup: req.user.userId })
            .populate('opportunity')
            .populate('investor', 'name profilePicture')
            .sort({ createdAt: -1 });
        res.status(200).json(applications);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getOpportunityApplications = async (req, res) => {
    try {
        const opportunityId = req.params.id;
        const opportunity = await Opportunity.findById(opportunityId);

        if (!opportunity) return res.status(404).json({ message: "Opportunity not found" });
        if (opportunity.investor.toString() !== req.user.userId) {
            return res.status(403).json({ message: "Not authorized to view applications for this opportunity" });
        }

        const applications = await Application.find({ opportunity: opportunityId })
            .populate('startup', 'name profilePicture startupDetails email');

        res.status(200).json(applications);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateApplicationStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const applicationId = req.params.id;

        const application = await Application.findById(applicationId);
        if (!application) return res.status(404).json({ message: "Application not found" });

        if (application.investor.toString() !== req.user.userId) {
            return res.status(403).json({ message: "Not authorized to update this application" });
        }

        application.status = status;
        await application.save();

        res.status(200).json(application);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
