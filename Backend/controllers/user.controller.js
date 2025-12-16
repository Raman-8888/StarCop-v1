const User = require('../models/usermodel');
const Post = require('../models/postmodel');
const Notification = require('../models/notification.model');
const { uploadToCloudinary } = require('../utils/cloudinary');

// Update User Profile
exports.updateProfile = async (req, res) => {
    try {
        const { bio, location, website } = req.body;
        const userId = req.user._id;

        let profilePictureUrl;

        if (req.file) {
            const result = await uploadToCloudinary(req.file.buffer);
            profilePictureUrl = result.secure_url;
        }

        const updateData = {
            bio,
            location,
            website
        };

        if (profilePictureUrl) {
            updateData.profilePicture = profilePictureUrl;
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $set: updateData },
            { new: true, runValidators: true }
        ).select('-password');

        res.json(updatedUser);

    } catch (error) {
        console.error("Error updating profile:", error);
        res.status(500).json({ message: error.message });
    }
};

// Get User Profile
exports.getProfile = async (req, res) => {
    try {
        const { username } = req.params;
        const user = await User.findOne({ username }).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const postsCount = await Post.countDocuments({ user: user._id });

        res.json({
            user,
            stats: {
                followers: user.followers.length,
                following: user.following.length,
                posts: postsCount
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Follow User
exports.followUser = async (req, res) => {
    try {
        const { id } = req.params;
        const currentUser = req.user;

        if (id === currentUser._id.toString()) {
            return res.status(400).json({ message: 'You cannot follow yourself' });
        }

        const userToFollow = await User.findById(id);
        const userFollowing = await User.findById(currentUser._id);

        if (!userToFollow || !userFollowing) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (userToFollow.followers.includes(currentUser._id)) {
            return res.status(400).json({ message: 'You are already following this user' });
        }

        userToFollow.followers.push(currentUser._id);
        userFollowing.following.push(id);

        await userToFollow.save();
        await userFollowing.save();

        // Create Notification
        const notification = new Notification({
            recipient: userToFollow._id,
            sender: currentUser._id,
            type: 'follow',
            message: `${currentUser.name} started following you`,
            relatedId: currentUser._id,
            onModel: 'User'
        });
        await notification.save();

        // Emit Socket Event
        if (req.io) {
            req.io.to(userToFollow._id.toString()).emit('notification', notification);
        }

        // Send Push Notification
        const { sendPushNotification } = require('../utils/notification.util');
        await sendPushNotification(
            userToFollow._id,
            'New Follower',
            `${currentUser.name} started following you`
        );

        res.json({ message: 'User followed successfully' });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Unfollow User
exports.unfollowUser = async (req, res) => {
    try {
        const { id } = req.params;
        const currentUser = req.user;

        const userToUnfollow = await User.findById(id);
        const userUnfollowing = await User.findById(currentUser._id);

        if (!userToUnfollow || !userUnfollowing) {
            return res.status(404).json({ message: 'User not found' });
        }

        userToUnfollow.followers = userToUnfollow.followers.filter(
            followerId => followerId.toString() !== currentUser._id.toString()
        );
        userUnfollowing.following = userUnfollowing.following.filter(
            followingId => followingId.toString() !== id
        );

        await userToUnfollow.save();
        await userUnfollowing.save();

        res.json({ message: 'User unfollowed successfully' });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Save FCM Token
exports.saveFcmToken = async (req, res) => {
    try {
        const { token } = req.body;
        const userId = req.user._id;

        if (!token) return res.status(400).json({ message: "Token is required" });

        await User.findByIdAndUpdate(userId, {
            $addToSet: { fcmTokens: token } // prevent duplicates
        });

        res.json({ message: "Token saved successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
