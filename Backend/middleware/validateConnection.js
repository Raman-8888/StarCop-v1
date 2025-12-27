const Connection = require('../models/connection.model');

/**
 * Middleware to validate that a connection exists and is active
 * Attaches the connection object to req.connection if valid
 */
const validateConnection = async (req, res, next) => {
    try {
        const { connectionId } = req.body;
        const userId = req.user._id || req.user.id;

        if (!connectionId) {
            return res.status(400).json({ message: 'Connection ID is required' });
        }

        // Find the connection
        const connection = await Connection.findById(connectionId);

        if (!connection) {
            return res.status(404).json({ message: 'Connection not found' });
        }

        // Check if connection is active
        if (connection.status !== 'active') {
            return res.status(403).json({ message: 'Connection is not active' });
        }

        // Verify user is a participant in the connection
        if (!connection.hasParticipant(userId)) {
            return res.status(403).json({
                message: 'You are not authorized to access this connection'
            });
        }

        // Attach connection to request
        req.connection = connection;
        next();
    } catch (error) {
        console.error('Connection validation error:', error);
        res.status(500).json({ message: 'Error validating connection' });
    }
};

module.exports = { validateConnection };
