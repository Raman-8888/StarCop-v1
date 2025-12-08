import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MapPin, Link as LinkIcon, Edit3, Grid, Users, Heart, MessageCircle, ArrowLeft } from 'lucide-react';
import { API_URL } from '../config';

export default function Profile() {
    const { username } = useParams();
    const { user: currentUser } = useAuth();
    const navigate = useNavigate();

    const [profile, setProfile] = useState(null);
    const [stats, setStats] = useState({ followers: 0, following: 0, posts: 0 });
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isFollowing, setIsFollowing] = useState(false);

    // Determine if we are viewing our own profile
    const isOwnProfile = !username || (currentUser && currentUser.username === username);
    const profileUsername = username || (currentUser && currentUser.username);

    useEffect(() => {
        if (profileUsername) {
            fetchProfile();
            fetchPosts();
        }
    }, [profileUsername]);

    const fetchProfile = async () => {
        try {
            const response = await fetch(`${API_URL}/api/users/${profileUsername}`);
            const data = await response.json();

            if (response.ok) {
                setProfile(data.user);
                setStats(data.stats);

                // Check if current user is following this profile
                if (currentUser && data.user.followers.includes(currentUser.id)) {
                    setIsFollowing(true);
                }
            } else {
                setError(data.message || 'Failed to load profile');
            }
        } catch (err) {
            setError('Error loading profile');
        } finally {
            setLoading(false);
        }
    };

    const fetchPosts = async () => {
        try {
            // first we need the user ID to fetch posts, which we might not have yet if we only have username
            // So we fetch profile first. But wait, fetchProfile sets state.
            // Better to chain them or let the user effect trigger.
            // However, the /api/users/:username endpoint returns the user object with _id.
            // We can fetch posts after we get the profile.
            // Let's rely on the profile state change? No, better do it in sequence inside fetchProfile or separate logic.
            // Let's do it separately but we need the ID.

            // Actually, let's fetch profile first, then inside that function, fetch posts if successful.
        } catch (err) {
            console.error(err);
        }
    };

    // Modified fetchProfile to also fetch posts
    const fetchProfileAndPosts = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/api/users/${profileUsername}`);
            const data = await response.json();

            if (response.ok) {
                setProfile(data.user);
                setStats(data.stats);
                if (currentUser && data.user.followers.includes(currentUser._id)) { // Note: ensure ID consistency (userId vs _id)
                    setIsFollowing(true);
                }

                // Fetch Posts
                const postsResponse = await fetch(`${API_URL}/api/posts/user/${data.user._id}`);
                const postsData = await postsResponse.json();
                if (postsResponse.ok) {
                    setPosts(postsData);
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

    useEffect(() => {
        if (profileUsername) {
            fetchProfileAndPosts();
        }
    }, [profileUsername]);

    const handleFollow = async () => {
        try {
            const endpoint = isFollowing ? 'unfollow' : 'follow';
            const response = await fetch(`${API_URL}/api/users/${endpoint}/${profile._id}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${currentUser.token}`
                }
            });

            if (response.ok) {
                setIsFollowing(!isFollowing);
                // Update local stats
                setStats(prev => ({
                    ...prev,
                    followers: isFollowing ? prev.followers - 1 : prev.followers + 1
                }));
            }
        } catch (err) {
            console.error('Follow action failed', err);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;
    if (!profile) return <div className="min-h-screen flex items-center justify-center">User not found</div>;

    return (
        <div className="min-h-screen pb-20">
            {/* Header Section */}
            <div className="relative pt-20 px-4 md:px-8 max-w-6xl mx-auto">
                {/* Back Button */}
                <button
                    onClick={() => navigate(-1)}
                    className="absolute top-4 left-4 md:left-8 p-2 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-colors"
                >
                    <ArrowLeft className="w-6 h-6" />
                </button>

                <div className="flex flex-col md:flex-row gap-8 items-start">
                    {/* Profile Picture */}
                    <div className="relative group">
                        <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-purple-500/30 overflow-hidden bg-gray-800">
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
                                <p className="text-gray-400 text-lg">@{profile.username}</p>
                            </div>

                            {isOwnProfile ? (
                                <button
                                    onClick={() => navigate('/edit-profile')}
                                    className="flex items-center gap-2 px-6 py-2 bg-white text-black rounded-full font-semibold hover:bg-gray-200 transition-colors"
                                >
                                    <Edit3 className="w-4 h-4" />
                                    Edit Profile
                                </button>
                            ) : (
                                <button
                                    onClick={handleFollow}
                                    className={`px-8 py-2 rounded-full font-semibold transition-colors ${isFollowing
                                        ? 'bg-transparent border border-gray-600 text-white hover:border-gray-400'
                                        : 'bg-blue-600 text-white hover:bg-blue-700'
                                        }`}
                                >
                                    {isFollowing ? 'Following' : 'Follow'}
                                </button>
                            )}
                        </div>

                        {/* Stats */}
                        <div className="flex items-center gap-8 py-4 border-y border-white/10">
                            <div className="text-center md:text-left">
                                <span className="block text-2xl font-bold">{stats.posts}</span>
                                <span className="text-gray-400 text-sm">Posts</span>
                            </div>
                            <div className="text-center md:text-left">
                                <span className="block text-2xl font-bold">{stats.followers}</span>
                                <span className="text-gray-400 text-sm">Followers</span>
                            </div>
                            <div className="text-center md:text-left">
                                <span className="block text-2xl font-bold">{stats.following}</span>
                                <span className="text-gray-400 text-sm">Following</span>
                            </div>
                        </div>

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
                <div className="flex items-center gap-2 mb-6 text-sm font-semibold text-gray-400 border-b border-white/10 pb-4">
                    <Grid className="w-4 h-4" />
                    <span>POSTS</span>
                </div>

                {posts.length === 0 ? (
                    <div className="text-center py-20 bg-white/5 rounded-2xl border border-white/10">
                        <Grid className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-400">No Posts Yet</h3>
                        <p className="text-gray-500">Capture your moments and share them with the world.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {posts.map(post => (
                            <div key={post._id} className="group relative bg-gray-900 aspect-square overflow-hidden rounded-xl border border-white/10 hover:border-purple-500/50 transition-all">
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
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
