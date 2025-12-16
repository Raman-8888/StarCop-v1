const Post = require('../models/postmodel');
const Notification = require('../models/notification.model');
const { uploadToCloudinary } = require('../utils/cloudinary');

// Create Post
exports.createPost = async (req, res) => {
    try {
        const { caption } = req.body;
        const userId = req.user._id;
        let mediaUrl = '';
        let mediaType = 'text';

        if (req.file) {
            const result = await uploadToCloudinary(req.file.buffer);
            mediaUrl = result.secure_url;
            mediaType = 'image'; // Assuming image for now, can be extended
        } else if (req.body.mediaUrl) {
            // Fallback if mediaUrl is sent directly (though we prefer file upload)
            mediaUrl = req.body.mediaUrl;
            if (req.body.mediaType) mediaType = req.body.mediaType;
        }

        const newPost = new Post({
            user: userId,
            caption,
            mediaUrl,
            mediaType
        });

        await newPost.save();
        res.status(201).json(newPost);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get User Posts
exports.getUserPosts = async (req, res) => {
    try {
        const { userId } = req.params;
        const posts = await Post.find({ user: userId }).populate('user', 'name username profilePicture').sort({ createdAt: -1 });
        res.json(posts);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Like Post
exports.likePost = async (req, res) => {
    try {
        const postId = req.params.id;
        const userId = req.user._id;

        const post = await Post.findById(postId);
        if (!post) return res.status(404).json({ message: "Post not found" });

        if (post.likes.includes(userId)) {
            // Unlike
            post.likes = post.likes.filter(id => id.toString() !== userId.toString());
            await post.save();
            return res.json({ message: "Post unliked", likes: post.likes });
        } else {
            // Like
            post.likes.push(userId);
            await post.save();

            // Notify owner if it's not their own post
            if (post.user.toString() !== userId.toString()) {
                const notification = new Notification({
                    recipient: post.user,
                    sender: userId,
                    type: 'like',
                    message: `${req.user.name} liked your post`,
                    relatedId: post._id,
                    onModel: 'Post'
                });
                await notification.save();
                if (req.io) {
                    req.io.to(post.user.toString()).emit('notification', notification);
                }

                // Send Push Notification
                const { sendPushNotification } = require('../utils/notification.util');
                await sendPushNotification(
                    post.user,
                    'New Like',
                    `${req.user.name} liked your post`
                );
            }

            return res.json(post);
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Add Comment
exports.addComment = async (req, res) => {
    try {
        const { text } = req.body;
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        const newComment = {
            user: req.user._id,
            text,
            name: req.user.name,
            profilePicture: req.user.profilePicture
        };

        post.comments.unshift(newComment);
        await post.save();

        // Create Notification (if not commenting on own post)
        if (post.user.toString() !== req.user._id.toString()) {
            const notification = new Notification({
                recipient: post.user,
                sender: req.user._id,
                type: 'comment',
                message: `${req.user.name} commented on your post`,
                relatedId: post._id,
                onModel: 'Post'
            });
            await notification.save();

            if (req.io) {
                req.io.to(post.user.toString()).emit('notification', notification);
            }

            // Send Push Notification
            const { sendPushNotification } = require('../utils/notification.util');
            await sendPushNotification(
                post.user,
                'New Comment',
                `${req.user.name} commented: ${text}`
            );
        }

        res.json(post);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
