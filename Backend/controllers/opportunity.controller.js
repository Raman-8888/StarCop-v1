const Opportunity = require('../models/opportunity.model');
const InvestorInterest = require('../models/investorInterest.model');
const SavedOpportunity = require('../models/savedOpportunity.model');
const User = require('../models/usermodel');
const { uploadToCloudinary } = require('../utils/cloudinary');

// --- Startup Controllers ---

exports.createOpportunity = async (req, res) => {
    console.log("Create Opportunity Request Body:", req.body);
    console.log("Create Opportunity Request Files:", req.files);
    try {
        const userId = req.user._id;

        // Verify if user is a startup or investor
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Allow both roles
        if (!['startup', 'investor'].includes(user.accountType)) {
            return res.status(403).json({ message: "Not authorized to create opportunities" });
        }

        const {
            title,
            industry,
            problem,
            solution,
            description, // Added
            traction,
            fundingStage,
            investmentRange,
            tags,
            visibility
        } = req.body;

        // Handle File Uploads (Cloudinary)
        let pitchVideoUrl = '';
        let deckUrl = '';
        let galleryUrls = [];

        if (req.files) {
            try {
                if (req.files.pitchVideo && req.files.pitchVideo[0]) {
                    const result = await uploadToCloudinary(req.files.pitchVideo[0].buffer);
                    pitchVideoUrl = result.secure_url;
                }
                if (req.files.deck && req.files.deck[0]) {
                    const result = await uploadToCloudinary(req.files.deck[0].buffer);
                    deckUrl = result.secure_url;
                }
                if (req.files.gallery) {
                    for (const file of req.files.gallery) {
                        const result = await uploadToCloudinary(file.buffer);
                        galleryUrls.push(result.secure_url);
                    }
                }
            } catch (uploadError) {
                console.error("Cloudinary Upload Error:", uploadError);
                return res.status(500).json({ message: "File upload failed. Check server configuration." });
            }
        }

        // Parse Tags
        let parsedTags = [];
        if (tags) {
            if (Array.isArray(tags)) {
                parsedTags = tags;
            } else if (typeof tags === 'string') {
                parsedTags = tags.split(',').map(t => t.trim()).filter(t => t.length > 0);
            }
        }

        const newOpportunity = new Opportunity({
            creatorId: userId,
            creatorRole: user.accountType, // 'startup' or 'investor'
            title,
            industry,
            problem,
            solution,
            description, // Added
            traction,
            fundingStage,
            investmentRange,
            pitchVideoUrl,
            deckUrl,
            galleryUrls,
            tags: parsedTags,
            visibility: visibility === 'true' || visibility === true
        });

        await newOpportunity.save();
        res.status(201).json(newOpportunity);
    } catch (error) {
        console.error("Create Opportunity Error:", error);
        res.status(500).json({ message: error.message });
    }
};

exports.updateOpportunity = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        let opportunity = await Opportunity.findById(id);

        if (!opportunity) {
            return res.status(404).json({ message: "Opportunity not found" });
        }

        // Check ownership
        if (opportunity.creatorId.toString() !== userId.toString()) {
            return res.status(403).json({ message: "Not authorized to edit this opportunity" });
        }

        const {
            title,
            industry,
            problem,
            solution,
            description,
            traction,
            fundingStage,
            investmentRange,
            tags,
            visibility
        } = req.body;

        // Update fields if provided
        if (title) opportunity.title = title;
        if (industry) opportunity.industry = industry;
        if (problem) opportunity.problem = problem;
        if (solution) opportunity.solution = solution;
        if (description) opportunity.description = description;
        if (traction) opportunity.traction = traction;
        if (fundingStage) opportunity.fundingStage = fundingStage;
        if (investmentRange) opportunity.investmentRange = investmentRange;
        if (visibility !== undefined) opportunity.visibility = visibility === 'true' || visibility === true;

        // Tags Update
        if (tags) {
            if (Array.isArray(tags)) {
                opportunity.tags = tags;
            } else if (typeof tags === 'string') {
                opportunity.tags = tags.split(',').map(t => t.trim()).filter(t => t.length > 0);
            }
        }

        // File Updates - Only duplicate logic if files are uploaded
        if (req.files) {
            const { uploadToCloudinary } = require('../utils/cloudinary');
            if (req.files.pitchVideo && req.files.pitchVideo[0]) {
                const result = await uploadToCloudinary(req.files.pitchVideo[0].buffer);
                opportunity.pitchVideoUrl = result.secure_url;
            }
            if (req.files.deck && req.files.deck[0]) {
                const result = await uploadToCloudinary(req.files.deck[0].buffer);
                opportunity.deckUrl = result.secure_url;
            }
            if (req.files.gallery) {
                // For gallery, currently replacing all. Could be additive in future.
                let newGallery = [];
                for (const file of req.files.gallery) {
                    const result = await uploadToCloudinary(file.buffer);
                    newGallery.push(result.secure_url);
                }
                opportunity.galleryUrls = newGallery;
            }
        }

        await opportunity.save();
        res.status(200).json(opportunity);

    } catch (error) {
        console.error("Update Opportunity Error:", error);
        res.status(500).json({ message: error.message });
    }
};

exports.getMyOpportunities = async (req, res) => {
    try {
        const opportunities = await Opportunity.find({ creatorId: req.user._id })
            .sort({ createdAt: -1 });

        // Calculate analytics (simple counts for now, could be aggregations)
        const enriched = await Promise.all(opportunities.map(async (op) => {
            const interests = await InvestorInterest.countDocuments({ opportunity: op._id });
            const saves = await SavedOpportunity.countDocuments({ opportunity: op._id });
            return { ...op.toObject(), interestCount: interests, saveCount: saves };
        }));

        res.status(200).json(enriched);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteOpportunity = async (req, res) => {
    try {
        const opportunity = await Opportunity.findById(req.params.id);
        if (!opportunity) return res.status(404).json({ message: "Opportunity not found" });

        if (opportunity.creatorId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not authorized to delete this opportunity" });
        }

        await Opportunity.findByIdAndDelete(req.params.id);
        // Clean up interests/saves? (Optional for now)
        res.status(200).json({ message: "Opportunity deleted" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getIncomingInterests = async (req, res) => {
    // For Startup to see who is interested
    // For Creator (Startup/Investor) to see who is interested
    try {
        const interests = await InvestorInterest.find({ recipient: req.user._id })
            .populate('sender', 'name profilePicture accountType email')
            .populate('opportunity', 'title')
            .sort({ createdAt: -1 });
        res.status(200).json(interests);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateInterestStatus = async (req, res) => {
    // For Startup to Accept/Reject
    try {
        const { status } = req.body; // 'accepted' or 'rejected'
        const interestId = req.params.id;

        const interest = await InvestorInterest.findById(interestId).populate('opportunity', 'title');
        if (!interest) return res.status(404).json({ message: "Interest not found" });

        if (interest.recipient.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not authorized" });
        }

        interest.status = status;
        await interest.save();

        // Notify if Accepted
        if (status === 'accepted') {
            const Notification = require('../models/notification.model');
            const User = require('../models/usermodel');
            const sender = await User.findById(req.user._id); // The one accepting (Startup)

            const notifMessage = `Your interest in "${interest.opportunity.title || 'opportunity'}" has been accepted!`;

            await Notification.create({
                recipient: interest.sender,
                sender: req.user._id,
                type: 'match',
                message: notifMessage,
                relatedId: interest.opportunity._id // Or interest._id
            });

            if (req.io) {
                req.io.to(interest.sender.toString()).emit('notification', {
                    message: notifMessage,
                    type: 'match'
                });
            }
        }

        res.status(200).json(interest);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getSentInterests = async (req, res) => {
    // For Investor/Creator to see who they sent interest to
    try {
        const interests = await InvestorInterest.find({ sender: req.user._id })
            .populate('recipient', 'name profilePicture accountType email')
            .populate('opportunity', 'title industry')
            .sort({ createdAt: -1 });
        res.status(200).json(interests);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// --- Investor Controllers ---

exports.getAllOpportunities = async (req, res) => {
    try {
        const { industry, fundingStage, investmentRange, search } = req.query;
        // Filter out posts created by the requesting user
        let query = {
            visibility: true,
            // creatorId: { $ne: req.user._id } // Commented out to allow seeing own posts for demo/testing
        };

        if (industry) query.industry = industry;
        if (fundingStage) query.fundingStage = fundingStage;
        if (investmentRange) query.investmentRange = investmentRange;
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { problem: { $regex: search, $options: 'i' } },
                { solution: { $regex: search, $options: 'i' } }
            ];
        }

        const opportunities = await Opportunity.find(query)
            .populate('creatorId', 'name profilePicture accountType username startupDetails investorDetails') // Added username
            .sort({ createdAt: -1 });

        console.log("GetAllOpportunities Query:", query);
        console.log("Found:", opportunities.length);

        res.status(200).json(opportunities);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getOpportunityById = async (req, res) => {
    try {
        const opportunity = await Opportunity.findById(req.params.id)
            .populate('creatorId', 'name profilePicture accountType startupDetails investorDetails email website');

        if (!opportunity) {
            return res.status(404).json({ message: "Opportunity not found" });
        }

        // Increment views
        opportunity.views += 1;
        await opportunity.save();

        res.status(200).json(opportunity);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.sendInterest = async (req, res) => {
    try {
        const { message } = req.body;
        const senderId = req.user._id;
        const opportunityId = req.params.id;

        const opportunity = await Opportunity.findById(opportunityId);
        if (!opportunity) return res.status(404).json({ message: "Opportunity not found" });

        // Check duplicate
        const existing = await InvestorInterest.findOne({ sender: senderId, opportunity: opportunityId });
        if (existing) {
            return res.status(400).json({ message: "Interest already sent" });
        }

        // Handle Video Upload
        let requestVideoUrl = '';
        if (req.files && req.files.requestVideo && req.files.requestVideo[0]) {
            const { uploadToCloudinary } = require('../utils/cloudinary');
            const result = await uploadToCloudinary(req.files.requestVideo[0].buffer);
            requestVideoUrl = result.secure_url;
        }

        const newInterest = new InvestorInterest({
            sender: senderId,
            recipient: opportunity.creatorId,
            opportunity: opportunityId,
            message,
            requestVideoUrl
        });

        await newInterest.save();

        // Increment interest count
        opportunity.interestCount += 1;
        await opportunity.save();

        // --- Gemini Integration & Notification ---
        const { generateSummary } = require('../utils/gemini');
        const Notification = require('../models/notification.model');
        const User = require('../models/usermodel');

        const sender = await User.findById(senderId);

        // Prepare text for Gemini: Sender profile + Message
        const summaryContext = `Interest from ${sender.name} (${sender.accountType}). Message: ${message || 'No message'}. Opportunity: ${opportunity.title}`;

        const geminiSummary = await generateSummary(summaryContext);

        await Notification.create({
            recipient: opportunity.creatorId,
            sender: senderId,
            type: 'interest',
            message: message ? message.substring(0, 50) + '...' : 'New interest received',
            geminiSummary: geminiSummary,
            relatedId: newInterest._id
        });

        // Real-time notification
        if (req.io) {
            console.log(`DEBUG: Emitting notification to room ${opportunity.creatorId.toString()}`);
            req.io.to(opportunity.creatorId.toString()).emit('notification', {
                message: `New interest from ${sender.name}`,
                type: 'interest'
            });
        } else {
            console.log("DEBUG: req.io is undefined!");
        }
        // -----------------------------------------

        res.status(201).json(newInterest);
    } catch (error) {
        console.error("Send Interest Error:", error);
        res.status(500).json({ message: error.message });
    }
};

exports.toggleSaveOpportunity = async (req, res) => {
    try {
        const investorId = req.user._id;
        const opportunityId = req.params.id;

        const existing = await SavedOpportunity.findOne({ investor: investorId, opportunity: opportunityId });

        const opportunity = await Opportunity.findById(opportunityId);
        if (!opportunity) return res.status(404).json({ message: "Opportunity not found" });

        if (existing) {
            await SavedOpportunity.findByIdAndDelete(existing._id);
            opportunity.saves = Math.max(0, opportunity.saves - 1);
            await opportunity.save();
            return res.status(200).json({ message: "Unsaved", saved: false });
        } else {
            const newSave = new SavedOpportunity({
                investor: investorId,
                opportunity: opportunityId
            });
            await newSave.save();
            opportunity.saves += 1;
            await opportunity.save();
            return res.status(200).json({ message: "Saved", saved: true });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getSavedOpportunities = async (req, res) => {
    try {
        const saved = await SavedOpportunity.find({ investor: req.user._id })
            .populate({
                path: 'opportunity',
                populate: { path: 'startup', select: 'name profilePicture' }
            })
            .sort({ createdAt: -1 });
        res.status(200).json(saved);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
