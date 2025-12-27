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
            // Map 'video' to 'video', everything else to 'image' (default)
            // Cloudinary returns 'image', 'video', or 'raw'
            if (result.resource_type === 'video') {
                mediaType = 'video';
            } else {
                mediaType = 'image';
            }
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
            name: req.user.name || "Unknown User",
            username: req.user.username,
            profilePicture: req.user.profilePicture || ""
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
        console.error("Add Comment Error:", error);
        res.status(500).json({ message: error.message });
    }
};

// Delete Post
exports.deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Check ownership
        if (post.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'User not authorized' });
        }

        // Future TODO: Remove media from Cloudinary

        await post.deleteOne();

        res.json({ message: 'Post removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// Toggle Comment Like
exports.toggleCommentLike = async (req, res) => {
    try {
        const { id, commentId } = req.params;
        const userId = req.user._id;

        const post = await Post.findById(id);
        if (!post) return res.status(404).json({ message: "Post not found" });

        const comment = post.comments.id(commentId);
        if (!comment) return res.status(404).json({ message: "Comment not found" });

        if (comment.likes.includes(userId)) {
            // Unlike
            comment.likes = comment.likes.filter(id => id.toString() !== userId.toString());
        } else {
            // Like
            comment.likes.push(userId);
        }

        await post.save();
        res.json(post);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Toggle Comment Pin
exports.toggleCommentPin = async (req, res) => {
    try {
        const { id, commentId } = req.params;
        const userId = req.user._id;

        const post = await Post.findById(id);
        if (!post) return res.status(404).json({ message: "Post not found" });

        // Check if user is the post owner
        if (post.user.toString() !== userId.toString()) {
            return res.status(401).json({ message: "Only post owner can pin comments" });
        }

        const comment = post.comments.id(commentId);
        if (!comment) return res.status(404).json({ message: "Comment not found" });

        // Toggle pin status
        comment.isPinned = !comment.isPinned;

        // Optional: If you only want ONE pinned comment, unpin others
        if (comment.isPinned) {
            post.comments.forEach(c => {
                if (c._id.toString() !== commentId) c.isPinned = false;
            });
        }

        await post.save();
        res.json(post);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
