const Connection = require('../models/connection.model');
const User = require('../models/usermodel');

/**
 * Get all connections for the current user
 */
exports.getMyConnections = async (req, res) => {
    try {
        const userId = req.user._id || req.user.id;

        // Find connections where user is either startup or investor
        const connections = await Connection.find({
            $or: [
                { startupId: userId },
                { investorId: userId }
            ],
            status: 'active'
        })
            .populate('startupId', 'name username profilePicture accountType email')
            .populate('investorId', 'name username profilePicture accountType email')
            .populate('createdFromRequestId', 'message opportunity')
            .sort({ createdAt: -1 });

        // Format response to include the "other" user
        const formattedConnections = connections.map(conn => {
            const otherUser = conn.startupId._id.toString() === userId.toString()
                ? conn.investorId
                : conn.startupId;

            return {
                ...conn.toObject(),
                otherUser
            };
        });

        res.status(200).json(formattedConnections);
    } catch (error) {
        console.error('Get Connections Error:', error);
        res.status(500).json({ message: error.message });
    }
};

/**
 * Check if a connection exists between current user and another user
 */
exports.checkConnection = async (req, res) => {
    try {
        const userId = req.user._id || req.user.id;
        const { userId: otherUserId } = req.params;

        if (!otherUserId) {
            return res.status(400).json({ message: 'User ID is required' });
        }

        // Check if other user exists
        const otherUser = await User.findById(otherUserId);
        if (!otherUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Find connection between the two users
        const connection = await Connection.findOne({
            $or: [
                { startupId: userId, investorId: otherUserId },
                { startupId: otherUserId, investorId: userId }
            ]
        });

        if (!connection) {
            return res.status(200).json({
                connected: false,
                connection: null
            });
        }

        res.status(200).json({
            connected: true,
            connection,
            status: connection.status
        });
    } catch (error) {
        console.error('Check Connection Error:', error);
        res.status(500).json({ message: error.message });
    }
};

/**
 * Block or unblock a connection
 */
exports.toggleBlockConnection = async (req, res) => {
    try {
        const userId = req.user._id || req.user.id;
        const { id: connectionId } = req.params;

        const connection = await Connection.findById(connectionId);

        if (!connection) {
            return res.status(404).json({ message: 'Connection not found' });
        }

        // Verify user is part of this connection
        if (!connection.hasParticipant(userId)) {
            return res.status(403).json({
                message: 'Not authorized to modify this connection'
            });
        }

        // Toggle status
        connection.status = connection.status === 'active' ? 'blocked' : 'active';
        await connection.save();

        res.status(200).json({
            message: `Connection ${connection.status === 'blocked' ? 'blocked' : 'unblocked'}`,
            connection
        });
    } catch (error) {
        console.error('Toggle Block Connection Error:', error);
        res.status(500).json({ message: error.message });
    }
};

/**
 * Get connection by ID
 */
exports.getConnectionById = async (req, res) => {
    try {
        const userId = req.user._id || req.user.id;
        const { id: connectionId } = req.params;

        const connection = await Connection.findById(connectionId)
            .populate('startupId', 'name username profilePicture accountType')
            .populate('investorId', 'name username profilePicture accountType')
            .populate('createdFromRequestId');

        if (!connection) {
            return res.status(404).json({ message: 'Connection not found' });
        }

        // Verify user is part of this connection
        if (!connection.hasParticipant(userId)) {
            return res.status(403).json({
                message: 'Not authorized to view this connection'
            });
        }

        res.status(200).json(connection);
    } catch (error) {
        console.error('Get Connection Error:', error);
        res.status(500).json({ message: error.message });
    }
};
