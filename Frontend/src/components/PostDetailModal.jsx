import React, { useState } from 'react';
import { Heart, MessageCircle, Send, X, Share2, MoreHorizontal } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';
import axios from 'axios';
import toast from 'react-hot-toast';

const PostDetailModal = ({ post, isOpen, onClose, onUpdate }) => {
    const { user } = useAuth();
    const [comment, setComment] = useState('');
    const [isLiked, setIsLiked] = useState(post?.likes.includes(user?._id) || false);
    const [likesCount, setLikesCount] = useState(post?.likes.length || 0);
    const [comments, setComments] = useState(post?.comments || []);
    const [loadingComment, setLoadingComment] = useState(false);

    if (!isOpen || !post) return null;

    const handleLike = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(`${API_URL}/api/posts/${post._id}/like`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Toggle local state
            if (isLiked) {
                setLikesCount(prev => prev - 1);
            } else {
                setLikesCount(prev => prev + 1);
            }
            setIsLiked(!isLiked);

            // Notify parent to refresh list if needed, or just rely on local state
            if (onUpdate) onUpdate({ ...post, likes: res.data.likes });
        } catch (error) {
            console.error("Like failed", error);
            toast.error("Failed to like post");
        }
    };

    const handleComment = async (e) => {
        e.preventDefault();
        if (!comment.trim()) return;

        try {
            setLoadingComment(true);
            const token = localStorage.getItem('token');
            const res = await axios.post(`${API_URL}/api/posts/${post._id}/comment`, { text: comment }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setComments(res.data.comments);
            setComment('');
            if (onUpdate) onUpdate({ ...post, comments: res.data.comments });
            toast.success("Comment added");
        } catch (error) {
            console.error("Comment failed", error);
            toast.error("Failed to add comment");
        } finally {
            setLoadingComment(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={onClose}>
            <div
                className="bg-[#111] w-full max-w-5xl h-[80vh] rounded-3xl overflow-hidden border border-white/10 flex flex-col md:flex-row shadow-2xl"
                onClick={e => e.stopPropagation()}
            >
                {/* Media Section */}
                <div className="flex-1 bg-black flex items-center justify-center relative">
                    {post.mediaType === 'video' ? (
                        <video
                            src={post.mediaUrl}
                            controls
                            className="w-full h-full object-contain"
                            autoPlay
                        />
                    ) : (
                        <img
                            src={post.mediaUrl}
                            alt="Post"
                            className="w-full h-full object-contain"
                        />
                    )}
                    <button
                        onClick={onClose}
                        className="absolute top-4 left-4 p-2 bg-black/50 text-white rounded-full md:hidden"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Details Section */}
                <div className="w-full md:w-[400px] flex flex-col bg-[#111] border-l border-white/10">
                    {/* Header */}
                    <div className="p-4 border-b border-white/10 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 overflow-hidden">
                                {post.user?.profilePicture ? (
                                    <img src={post.user.profilePicture} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-white font-bold">
                                        {post.user?.name?.[0]}
                                    </div>
                                )}
                            </div>
                            <div>
                                <h3 className="font-bold text-white text-sm">{post.user?.name}</h3>
                                <p className="text-gray-500 text-xs text-right">{new Date(post.createdAt).toLocaleDateString()}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button className="text-gray-400 hover:text-white"><MoreHorizontal size={20} /></button>
                            <button onClick={onClose} className="text-gray-400 hover:text-white hidden md:block">
                                <X size={24} />
                            </button>
                        </div>
                    </div>

                    {/* Comments Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
                        {post.caption && (
                            <div className="flex gap-3">
                                <span className="font-bold text-sm text-white">{post.user?.name}</span>
                                <p className="text-sm text-gray-300">{post.caption}</p>
                            </div>
                        )}

                        {comments.length > 0 ? (
                            comments.map((c, i) => (
                                <div key={i} className="flex gap-3 items-start">
                                    {/* Add commenter avatar if available in schema, else generic */}
                                    <div className="w-8 h-8 rounded-full bg-gray-800 flex-shrink-0 flex items-center justify-center text-xs font-bold text-gray-400 border border-white/5">
                                        {/* Ideally we'd populate comments.user */}
                                        ?
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm">
                                            <span className="font-bold text-white mr-2">User</span> {/* Placeholder name until populated */}
                                            <span className="text-gray-300">{c.text}</span>
                                        </p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center text-gray-500 py-10">
                                No comments yet. Be the first!
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="p-4 border-t border-white/10 space-y-4">
                        <div className="flex items-center justify-between text-white">
                            <div className="flex items-center gap-4">
                                <button onClick={handleLike} className="group flex items-center gap-1 transition-colors">
                                    <Heart
                                        size={24}
                                        className={`transition-all ${isLiked ? 'fill-red-500 text-red-500 scale-110' : 'text-white group-hover:text-gray-300'}`}
                                    />
                                </button>
                                <button onClick={() => document.getElementById('commentInput').focus()}>
                                    <MessageCircle size={24} className="text-white hover:text-gray-300 transition-colors" />
                                </button>
                                <button>
                                    <Share2 size={24} className="text-white hover:text-gray-300 transition-colors" />
                                </button>
                            </div>
                            <span className="font-bold text-white">{likesCount} likes</span>
                        </div>

                        {/* Input */}
                        <form onSubmit={handleComment} className="relative">
                            <input
                                id="commentInput"
                                type="text"
                                placeholder="Add a comment..."
                                value={comment}
                                onChange={e => setComment(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-full py-3 pl-4 pr-12 text-sm text-white focus:outline-none focus:border-blue-500 focus:bg-white/10 transition-all placeholder-gray-500"
                            />
                            <button
                                type="submit"
                                disabled={!comment.trim() || loadingComment}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-blue-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <Send size={18} />
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PostDetailModal;
