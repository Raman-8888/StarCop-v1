const Notification = require('../models/notification.model');

exports.getMyNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ recipient: req.user._id })
            .populate('sender', 'name username profilePicture accountType')
            .sort({ createdAt: -1 });
        res.status(200).json(notifications);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.markAsRead = async (req, res) => {
    try {
        await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
        res.status(200).json({ message: "Marked as read" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getUnreadCount = async (req, res) => {
    try {
        const count = await Notification.countDocuments({ recipient: req.user._id, isRead: false });
        res.status(200).json({ count });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteNotification = async (req, res) => {
    try {
        await Notification.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Notification deleted" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.clearAllNotifications = async (req, res) => {
    try {
        await Notification.deleteMany({ recipient: req.user._id });
        res.status(200).json({ message: "All notifications cleared" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
