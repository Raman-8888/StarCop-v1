const Post = require('../models/postmodel');

// Create Post
exports.createPost = async (req, res) => {
    try {
        const { caption, mediaUrl, mediaType } = req.body;
        const userId = req.user._id;

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
        const posts = await Post.find({ user: userId }).sort({ createdAt: -1 });
        res.json(posts);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
