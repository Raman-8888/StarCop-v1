import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MapPin, Link as LinkIcon, Edit3, Grid, Users, Heart, MessageCircle, ArrowLeft, Scan, Trash2, Briefcase, Ban, ShieldOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { API_URL } from '../config';
import CreatePost from '../components/CreatePost';
import ProfileCard from '../components/ProfileCard';
import PostDetailModal from '../components/PostDetailModal';
import ConfirmationModal from '../components/ConfirmationModal';
import UnauthorizedModal from '../components/UnauthorizedModal';
import BlockUserModal from '../components/BlockUserModal';
import FirstMessageModal from '../components/FirstMessageModal';
import { blockUser, unblockUser, checkBlockStatus } from '../services/blockService';
import { checkConnection } from '../services/connectionService';
import { checkMessageRequestStatus } from '../services/messageRequestService';
import axios from 'axios';

export default function Profile() {
    const { username } = useParams();
    const { user: currentUser, logout } = useAuth(); // Destructure logout
    const navigate = useNavigate();

    const [profile, setProfile] = useState(null);
    const [stats, setStats] = useState({ followers: 0, following: 0, posts: 0 });
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isFollowing, setIsFollowing] = useState(false);
    const [selectedPost, setSelectedPost] = useState(null);
    const [isPostModalOpen, setIsPostModalOpen] = useState(false);
    const [showUnfollowConfirm, setShowUnfollowConfirm] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [postToDelete, setPostToDelete] = useState(null);
    const [opportunities, setOpportunities] = useState([]);
    const [activeTab, setActiveTab] = useState('posts'); // 'posts' or 'opportunities'
    const [showBlockModal, setShowBlockModal] = useState(false);
    const [blockStatus, setBlockStatus] = useState({ isBlocked: false, blockedBy: null });
    const [showFirstMessageModal, setShowFirstMessageModal] = useState(false);

    // Determine if we are viewing our own profile
    const isOwnProfile = !username || (currentUser && currentUser.username === username);
    const profileUsername = username || (currentUser?.username);

    useEffect(() => {
        if (profileUsername) {
            fetchProfileAndPosts();
        } else {
            setLoading(false);
        }
    }, [profileUsername]);

    const fetchProfileAndPosts = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/api/users/${profileUsername}`);
            const data = await response.json();

            if (response.ok) {
                console.log('Profile Data:', data.user);
                console.log('Current User:', currentUser);

                setProfile(data.user);
                setStats(data.stats);

                const currentUserId = currentUser?._id || currentUser?.id;
                console.log('Checking following status for:', currentUserId);
                console.log('Followers list:', data.user.followers);

                if (currentUserId && data.user.followers.some(follower =>
                    (follower._id || follower).toString() === currentUserId.toString()
                )) {
                    console.log('User is following this profile');
                    setIsFollowing(true);
                } else {
                    console.log('User is NOT following this profile');
                }

                // Fetch Posts
                const postsResponse = await fetch(`${API_URL}/api/posts/user/${data.user._id}`);
                const postsData = await postsResponse.json();
                if (postsResponse.ok) {
                    setPosts(postsData);
                }

                // Fetch Opportunities
                const oppResponse = await fetch(`${API_URL}/api/opportunities?creatorId=${data.user._id}`);
                const oppData = await oppResponse.json();
                if (oppResponse.ok) {
                    setOpportunities(oppData.filter(opp => opp.creatorId._id === data.user._id || opp.creatorId === data.user._id));
                }

                // Check block status if viewing another user's profile
                if (!isOwnProfile) {
                    try {
                        const blockData = await checkBlockStatus(data.user._id);
                        setBlockStatus(blockData);
                    } catch (error) {
                        console.error('Error checking block status:', error);
                    }
                }
            } else {
                setError(data.message || 'Failed to load profile');
            }
        } catch (err) {
            console.error(err);
            setError('Error loading profile');
        } finally {
            setLoading(false);
        }
    };

    const handleFollowClick = () => {
        if (isFollowing) {
            setShowUnfollowConfirm(true);
        } else {
            toggleFollow();
        }
    };

    const toggleFollow = async () => {
        // Optimistic UI Update
        const previousState = isFollowing;
        setIsFollowing(!previousState);
        setStats(prev => ({
            ...prev,
            followers: !previousState ? prev.followers + 1 : prev.followers - 1
        }));
        if (showUnfollowConfirm) setShowUnfollowConfirm(false);

        try {
            const endpoint = previousState ? 'unfollow' : 'follow';
            const response = await fetch(`${API_URL}/api/users/${endpoint}/${profile._id}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${currentUser.token}`
                }
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));

                // Fix for Desync: If backend says "Already following" and we are trying to follow, 
                // treat it as success (keep the optimistic update).
                if (response.status === 400 &&
                    errorData.message === 'You are already following this user' &&
                    !previousState) {
                    console.log('Synced follow state with backend.');
                    toast.success('You are now following this user!');
                    return;
                }

                // Revert on failure
                throw new Error(errorData.message || 'Failed to toggle follow');
            } else {
                toast.success(previousState ? 'Unfollowed user' : 'Following user');
            }
        } catch (err) {
            console.error('Follow action failed', err);
            // Revert UI
            setIsFollowing(previousState);
            setStats(prev => ({
                ...prev,
                followers: previousState ? prev.followers + 1 : prev.followers - 1
            }));
            setError('Failed to update follow status');
        }
    };

    const confirmDeletePost = (e, post) => {
        e.stopPropagation();
        setPostToDelete(post);
        setShowDeleteConfirm(true);
    };

    const handleDeletePost = async () => {
        if (!postToDelete) return;

        try {
            const response = await fetch(`${API_URL}/api/posts/${postToDelete._id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${currentUser.token}`
                }
            });

            if (response.ok) {
                setPosts(posts.filter(p => p._id !== postToDelete._id));
                toast.success('Post deleted successfully');
            } else {
                toast.error('Failed to delete post');
            }
        } catch (error) {
            console.error('Error deleting post:', error);
            toast.error('Error deleting post');
        } finally {
            setShowDeleteConfirm(false);
            setPostToDelete(null);
        }
    };

    const handleMessage = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(`${API_URL}/api/chat/conversations`,
                { userId: profile._id },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            navigate('/chat', { state: { selectedConversation: res.data } });
        } catch (error) {
            console.error("Failed to start chat", error);
            if (error.response?.data?.blocked) {
                toast.error('Cannot message this user. One of you has blocked the other.');
            } else {
                toast.error('Failed to start chat');
            }
        }
    };

    const handleBlock = async (userId, reason) => {
        await blockUser(userId, reason);
        setBlockStatus({ isBlocked: true, blockedBy: 'me' });
        setShowBlockModal(false);
    };

    const handleUnblock = async () => {
        try {
            await unblockUser(profile._id);
            setBlockStatus({ isBlocked: false, blockedBy: null });
            toast.success('User unblocked successfully');
        } catch (error) {
            console.error('Unblock error:', error);
            toast.error('Failed to unblock user');
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

    // Handle case where profileUsername is missing (e.g. stale local storage)
    if (!profileUsername && !username && currentUser) {
        return (
            <UnauthorizedModal
                isOpen={true}
                onClose={() => navigate('/')}
                message="Your session data is incomplete. Please log in again to continue."
                title="Session Expired"
            />
        );
    }

    if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;
    if (!profile) return <div className="min-h-screen flex items-center justify-center">User not found</div>;

    return (
        <div className="min-h-screen pb-20 md:pt-24 pt-4">
            {/* Header Section */}
            <div className="relative px-4 md:px-8 max-w-6xl mx-auto">
                <div className="flex flex-row gap-6 md:gap-8 items-start">
                    {/* Profile Picture */}
                    <div className="relative group">
                        <div className="w-20 h-20 md:w-32 md:h-32 rounded-full border-4 border-purple-500/30 overflow-hidden bg-gray-800 shrink-0">
                            {profile.profilePicture ? (
                                <img src={profile.profilePicture} alt={profile.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-gray-500">
                                    {profile.name.charAt(0).toUpperCase()}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Info Section */}
                    <div className="flex-1 space-y-4">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h1 className="text-3xl font-bold flex items-center gap-2">
                                    {profile.name}
                                    <span className="text-sm font-normal px-2 py-1 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30">
                                        {profile.accountType === 'startup' ? 'Startup' : 'Investor'}
                                    </span>
                                </h1>
                                <p className="text-gray-400 text-sm md:text-lg">@{profile.username.replace(/^@/, '')}</p>
                            </div>

                            <div className="flex gap-4 justify-between md:justify-start w-full md:w-auto">
                                <button
                                    onClick={() => navigate(`/digital-pass/${profile.username}`)}
                                    className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-full font-semibold transition-all group hover:border-purple-500/50"
                                >
                                    <Scan className="w-4 h-4 text-purple-400 group-hover:text-purple-300" />
                                    <span className="hidden md:inline">Pass</span>
                                </button>

                                {isOwnProfile ? (
                                    <button
                                        onClick={() => navigate('/edit-profile')}
                                        className="flex items-center gap-2 px-6 py-2 bg-white text-black rounded-full font-semibold hover:bg-gray-200 transition-colors"
                                    >
                                        <Edit3 className="w-4 h-4" />
                                        Edit Profile
                                    </button>
                                ) : (
                                    <div className="flex gap-4 justify-between md:justify-start w-full md:w-auto">
                                        {!blockStatus.isBlocked && (
                                            <>
                                                <button
                                                    onClick={handleMessage}
                                                    className="px-6 py-2 rounded-full font-semibold bg-white/10 hover:bg-white/20 border border-white/10 hover:border-white/30 transition-all text-white"
                                                >
                                                    Message
                                                </button>
                                                <button
                                                    onClick={handleFollowClick}
                                                    className={`px-8 py-2 rounded-full font-semibold transition-colors ${isFollowing
                                                        ? 'bg-red-500/10 border border-red-500/50 text-red-500 hover:bg-red-500/20'
                                                        : 'bg-blue-600 text-white hover:bg-blue-700'
                                                        }`}
                                                >
                                                    {isFollowing ? 'Unfollow' : 'Follow'}
                                                </button>
                                            </>
                                        )}
                                        {blockStatus.blockedBy === 'me' ? (
                                            <button
                                                onClick={handleUnblock}
                                                className="flex items-center gap-2 px-6 py-2 bg-green-600/20 hover:bg-green-600/30 border border-green-500/50 text-green-400 rounded-full font-semibold transition-all"
                                            >
                                                <ShieldOff size={18} />
                                                Unblock
                                            </button>
                                        ) : blockStatus.blockedBy === 'them' ? (
                                            <div className="px-6 py-2 bg-red-500/10 border border-red-500/30 text-red-400 rounded-full font-semibold">
                                                <Ban size={18} className="inline mr-2" />
                                                Blocked You
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => setShowBlockModal(true)}
                                                className="flex items-center gap-2 px-6 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 rounded-full font-semibold transition-all"
                                            >
                                                <Ban size={18} />
                                                Block
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="flex items-center gap-8 py-4 border-y border-white/10">

                            {/* Bio & Details */}
                            <div className="space-y-2 max-w-2xl">
                                {profile.bio && <p className="text-gray-300 leading-relaxed">{profile.bio}</p>}

                                <div className="flex flex-wrap gap-4 text-sm text-gray-400 pt-2">
                                    {(profile.startupDetails?.location || profile.investorDetails?.location) && (
                                        <div className="flex items-center gap-1">
                                            <MapPin className="w-4 h-4" />
                                            <span>{profile.startupDetails?.location || profile.investorDetails?.location}</span>
                                        </div>
                                    )}
                                    {(profile.startupDetails?.website || profile.investorDetails?.website) && (
                                        <div className="flex items-center gap-1">
                                            <LinkIcon className="w-4 h-4" />
                                            <a
                                                href={profile.startupDetails?.website || profile.investorDetails?.website}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-purple-400 hover:text-purple-300"
                                            >
                                                Website
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Feed Section */}
                <div className="max-w-6xl mx-auto px-4 mt-12">
                    {isOwnProfile && (
                        <CreatePost onPostCreated={(newPost) => setPosts([newPost, ...posts])} />
                    )}

                    {/* Tab Navigation */}
                    <div className="flex items-center gap-6 mb-6 border-b border-white/10">
                        <button
                            onClick={() => setActiveTab('posts')}
                            className={`flex items-center gap-2 pb-4 text-sm font-semibold transition-colors relative ${activeTab === 'posts' ? 'text-white' : 'text-gray-400 hover:text-gray-300'
                                }`}
                        >
                            <Grid className="w-4 h-4" />
                            <span>POSTS</span>
                            {activeTab === 'posts' && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white" />
                            )}
                        </button>
                        <button
                            onClick={() => setActiveTab('opportunities')}
                            className={`flex items-center gap-2 pb-4 text-sm font-semibold transition-colors relative ${activeTab === 'opportunities' ? 'text-white' : 'text-gray-400 hover:text-gray-300'
                                }`}
                        >
                            <Briefcase className="w-4 h-4" />
                            <span>{profile?.accountType === 'investor' ? 'REQUESTS' : 'OPPORTUNITIES'}</span>
                            {activeTab === 'opportunities' && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white" />
                            )}
                        </button>
                    </div>

                    {/* Posts Tab */}
                    {activeTab === 'posts' && (
                        posts.length === 0 ? (
                            <div className="text-center py-20 bg-white/5 rounded-2xl border border-white/10">
                                <Grid className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-gray-400">No Posts Yet</h3>
                                <p className="text-gray-500">Capture your moments and share them with the world.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                {posts.map(post => (
                                    <div
                                        key={post._id}
                                        onClick={() => {
                                            setSelectedPost(post);
                                            setIsPostModalOpen(true);
                                        }}
                                        className="group relative bg-gray-900 aspect-square overflow-hidden rounded-xl border border-white/10 hover:border-purple-500/50 transition-all cursor-pointer"
                                    >
                                        {post.mediaType === 'video' ? (
                                            <video src={post.mediaUrl} className="w-full h-full object-cover" />
                                        ) : (
                                            <img src={post.mediaUrl} alt={post.caption} className="w-full h-full object-cover" />
                                        )}

                                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <div className="flex items-center gap-6 text-white font-bold">
                                                <div className="flex items-center gap-2">
                                                    <Heart className="w-6 h-6 fill-current" />
                                                    <span>{post.likes.length}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <MessageCircle className="w-6 h-6 fill-current" />
                                                    <span>{post.comments.length}</span>
                                                </div>

                                                {isOwnProfile && (
                                                    <button
                                                        onClick={(e) => confirmDeletePost(e, post)}
                                                        className="p-2 bg-red-500/80 rounded-full hover:bg-red-500 transition-colors ml-4"
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )
                    )}

                    {/* Opportunities Tab */}
                    {activeTab === 'opportunities' && (
                        opportunities.length === 0 ? (
                            <div className="text-center py-20 bg-white/5 rounded-2xl border border-white/10">
                                <Briefcase className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-gray-400">
                                    {profile?.accountType === 'investor' ? 'No Requests Yet' : 'No Opportunities Yet'}
                                </h3>
                                <p className="text-gray-500">
                                    {profile?.accountType === 'investor'
                                        ? 'Create investment requests to connect with startups.'
                                        : 'Post opportunities to attract investors.'}
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {opportunities.map(opp => (
                                    <div
                                        key={opp._id}
                                        onClick={() => navigate(`/opportunities/${opp._id}`)}
                                        className="group relative bg-white/5 border border-white/10 rounded-xl overflow-hidden hover:border-purple-500/50 transition-all cursor-pointer"
                                    >
                                        {/* Thumbnail */}
                                        {opp.thumbnailUrl && (
                                            <div className="aspect-video bg-black/50 overflow-hidden">
                                                <img
                                                    src={opp.thumbnailUrl}
                                                    alt={opp.title}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                />
                                            </div>
                                        )}

                                        {/* Content */}
                                        <div className="p-4">
                                            <h3 className="text-lg font-bold text-white mb-2 line-clamp-1">{opp.title}</h3>
                                            <p className="text-sm text-gray-400 line-clamp-2 mb-3">{opp.description}</p>
                                            <div className="flex items-center gap-2">
                                                <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full border border-blue-500/30">
                                                    {opp.industry}
                                                </span>
                                                {opp.fundingStage && (
                                                    <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded-full border border-purple-500/30">
                                                        {opp.fundingStage}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )
                    )}
                </div>

                <PostDetailModal
                    isOpen={isPostModalOpen}
                    onClose={() => setIsPostModalOpen(false)}
                    post={selectedPost}
                    onUpdate={(updatedPost) => {
                        setPosts(posts.map(p => p._id === updatedPost._id ? updatedPost : p));
                        setSelectedPost(updatedPost);
                    }}
                />

                <ConfirmationModal
                    isOpen={showUnfollowConfirm}
                    onClose={() => setShowUnfollowConfirm(false)}
                    onConfirm={toggleFollow}
                    title="Unfollow User"
                    message="Do you wanna unfollow this person?"
                    confirmText="Unfollow"
                    cancelText="Cancel"
                    isDestructive={true}
                />

                <ConfirmationModal
                    isOpen={showDeleteConfirm}
                    onClose={() => setShowDeleteConfirm(false)}
                    onConfirm={handleDeletePost}
                    title="Delete Post"
                    message="Do you want to delete the post?"
                    confirmText="Delete"
                    cancelText="Cancel"
                    isDestructive={true}
                />

                <BlockUserModal
                    isOpen={showBlockModal}
                    onClose={() => setShowBlockModal(false)}
                    user={profile}
                    onBlock={handleBlock}
                />
            </div>
            {/* First Message Modal */}
            <FirstMessageModal
                isOpen={showFirstMessageModal}
                onClose={() => setShowFirstMessageModal(false)}
                user={profile}
                onSuccess={(isConnected) => {
                    if (isConnected) {
                        navigate('/chat');
                    }
                    // Otherwise stay on profile, toast already shown
                }}
            />
        </div>
    );
}
