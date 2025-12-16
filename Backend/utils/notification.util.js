const admin = require('../config/firebaseAdmin');
const User = require('../models/usermodel');

exports.sendPushNotification = async (userId, title, body, data = {}) => {
    try {
        const user = await User.findById(userId);
        if (!user || !user.fcmTokens || user.fcmTokens.length === 0) {
            return; // No tokens to send to
        }

        // Send to all tokens (multicast)
        const message = {
            notification: {
                title,
                body
            },
            data: {
                ...data,
                click_action: '/notifications' // default action
            },
            tokens: user.fcmTokens
        };

        const response = await admin.messaging().sendMulticast(message);

        // Cleanup failed tokens
        if (response.failureCount > 0) {
            const failedTokens = [];
            response.responses.forEach((resp, idx) => {
                if (!resp.success) {
                    failedTokens.push(user.fcmTokens[idx]);
                }
            });

            if (failedTokens.length > 0) {
                await User.findByIdAndUpdate(userId, {
                    $pull: { fcmTokens: { $in: failedTokens } }
                });
            }
        }

        console.log(`Sent notification to ${user.name}: ${response.successCount} successful, ${response.failureCount} failed.`);
    } catch (error) {
        console.error("Error sending push notification:", error);
    }
};
