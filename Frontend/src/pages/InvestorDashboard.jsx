import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config';
import { Bookmark, TrendingUp, Check, X, Clock, ChevronLeft, Eye, Send, ExternalLink, Plus, Trash2, MessageCircle } from 'lucide-react';
import CreateOpportunity from '../components/CreateOpportunity';
import ConfirmationModal from '../components/ConfirmationModal';

import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const InvestorDashboard = () => {
    const navigate = useNavigate();
    const [savedOps, setSavedOps] = useState([]);
    const [sentInterests, setSentInterests] = useState([]);
    const [myOpportunities, setMyOpportunities] = useState([]);
    const [incomingRequests, setIncomingRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('saved'); // 'saved', 'requests', 'my-posts', 'incoming'
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [opportunityToDelete, setOpportunityToDelete] = useState(null);
    const [opportunityToEdit, setOpportunityToEdit] = useState(null);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');
            const [savedRes, sentRes, myOpsRes, incRes] = await Promise.all([
                axios.get(`${API_URL}/api/opportunities/investor/saved`, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`${API_URL}/api/opportunities/investor/sent-interests`, { headers: { Authorization: `Bearer ${token}` } }),
                // Reuse startup endpoints as they are actually creator-agnostic
                axios.get(`${API_URL}/api/opportunities/startup/my`, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`${API_URL}/api/opportunities/startup/my-interests`, { headers: { Authorization: `Bearer ${token}` } })
            ]);
            setSavedOps(savedRes.data.filter(item => item.opportunity));
            setSentInterests(sentRes.data.filter(item => item.opportunity));
            setMyOpportunities(myOpsRes.data);
            setIncomingRequests(incRes.data);
        } catch (error) {
            console.error("Error fetching dashboard data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleInterestAction = async (interestId, status) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`${API_URL}/api/opportunities/interest/${interestId}/status`,
                { status },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            // Optimistic update
            setIncomingRequests(prev => prev.map(i => i._id === interestId ? { ...i, status } : i));
        } catch (error) {
            console.error("Action failed", error);
            toast.error("Failed to update status");
        }
    };

    const handleDeleteClick = (id) => {
        setOpportunityToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!opportunityToDelete) return;

        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_URL}/api/opportunities/${opportunityToDelete}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Update state to remove deleted item
            setMyOpportunities(prev => prev.filter(op => op._id !== opportunityToDelete));
            setOpportunityToDelete(null);
        } catch (error) {
            console.error("Delete failed", error);
            toast.error("Failed to delete opportunity");
        }
    };

    const handleUnsave = async (id) => {
        try {
            const token = localStorage.getItem('token');
            // Toggle save endpoint toggles it off if exists
            await axios.post(`${API_URL}/api/opportunities/${id}/save`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSavedOps(prev => prev.filter(item => item.opportunity._id !== id));
            toast.success("Opportunity unsaved");
        } catch (error) {
            console.error("Unsave failed", error);
            toast.error("Failed to unsave");
        }
    };

    const handleMessage = async (targetUserId) => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(`${API_URL}/api/chat/conversations`,
                { userId: targetUserId },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // Navigate to chat with the conversation object
            navigate('/chat', { state: { selectedConversation: res.data } });
        } catch (error) {
            console.error("Failed to start chat", error);
            toast.error("Failed to open chat");
        }
    };

    return (
        <div className="relative min-h-screen text-white font-sans overflow-hidden">


            <div className="relative z-10 container mx-auto px-6 py-8 md:px-8 md:py-12 max-w-7xl min-h-screen flex flex-col gap-8 md:pt-24 pt-4">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
                >
                    <div className="backdrop-blur-sm bg-black/20 p-5 rounded-2xl border border-white/5 shadow-xl flex items-center gap-4">

                        <div>
                            <h1 className="text-3xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white via-gray-200 to-gray-500 drop-shadow-sm">
                                Investor Dashboard.
                            </h1>
                            <p className="text-gray-400 mt-1 font-medium text-sm">Track your portfolio and deal flow.</p>
                        </div>
                    </div>
                    <div className="flex w-full md:w-auto gap-4">
                        <button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="flex-1 md:flex-none group relative px-6 py-3 bg-white text-black rounded-xl font-bold text-sm overflow-hidden transition-transform hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                        >
                            <span className="relative z-10 flex items-center justify-center gap-2">
                                <Plus size={18} /> New Post
                            </span>
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 opacity-0 group-hover:opacity-10 transition-opacity" />
                        </button>
                        <button
                            onClick={() => navigate('/opportunities')}
                            className="flex-1 md:flex-none group relative px-6 py-3 bg-white text-black rounded-xl font-bold text-sm overflow-hidden transition-transform hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                        >
                            <span className="relative z-10 flex items-center justify-center gap-2">
                                <Eye size={18} /> Browse Deals
                            </span>
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 opacity-0 group-hover:opacity-10 transition-opacity" />
                        </button>
                    </div>
                </motion.div>

                {/* Analytics Bento Grid */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4 h-auto"
                >
                    {/* Saved Stat */}
                    <div className="backdrop-blur-xl bg-white/5 border border-white/10 p-6 rounded-[1.5rem] hover:bg-white/10 transition-colors group flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-2 text-purple-300 mb-1">
                                <Bookmark size={18} /> <span className="text-xs font-bold uppercase tracking-widest">Saved Deals</span>
                            </div>
                            <p className="text-5xl font-black text-white">
                                {savedOps.length}
                            </p>
                        </div>
                        <div className="h-16 w-16 bg-purple-500/20 rounded-2xl flex items-center justify-center">
                            <Bookmark className="text-purple-400" size={32} />
                        </div>
                    </div>

                    {/* Sent Interests Stat */}
                    <div className="backdrop-blur-xl bg-white/5 border border-white/10 p-6 rounded-[1.5rem] hover:bg-white/10 transition-colors group flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-2 text-green-300 mb-1">
                                <Send size={18} /> <span className="text-xs font-bold uppercase tracking-widest">Requests Sent</span>
                            </div>
                            <p className="text-5xl font-black text-white">
                                {sentInterests.length}
                            </p>
                        </div>
                        <div className="h-16 w-16 bg-green-500/20 rounded-2xl flex items-center justify-center">
                            <Send className="text-green-400" size={32} />
                        </div>
                    </div>
                </motion.div>

                <div className="flex gap-6 border-b border-white/10 relative mt-2 overflow-x-auto">
                    <button
                        onClick={() => setActiveTab('saved')}
                        className={`pb-3 text-sm font-bold tracking-widest transition-all relative whitespace-nowrap ${activeTab === 'saved' ? 'text-white' : 'text-gray-600 hover:text-gray-400'}`}
                    >
                        SAVED ({savedOps.length})
                        {activeTab === 'saved' && (
                            <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500 rounded-t-full shadow-[0_0_15px_rgba(168,85,247,0.5)]" />
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('requests')}
                        className={`pb-3 text-sm font-bold tracking-widest transition-all relative whitespace-nowrap ${activeTab === 'requests' ? 'text-white' : 'text-gray-600 hover:text-gray-400'}`}
                    >
                        SENT ({sentInterests.length})
                        {activeTab === 'requests' && (
                            <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-500 rounded-t-full shadow-[0_0_15px_rgba(34,197,94,0.5)]" />
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('my-posts')}
                        className={`pb-3 text-sm font-bold tracking-widest transition-all relative whitespace-nowrap ${activeTab === 'my-posts' ? 'text-white' : 'text-gray-600 hover:text-gray-400'}`}
                    >
                        MY POSTS
                        {activeTab === 'my-posts' && (
                            <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-white rounded-t-full shadow-[0_0_15px_rgba(255,255,255,0.5)]" />
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('incoming')}
                        className={`pb-3 text-sm font-bold tracking-widest transition-all relative whitespace-nowrap ${activeTab === 'incoming' ? 'text-white' : 'text-gray-600 hover:text-gray-400'}`}
                    >
                        INCOMING
                        {incomingRequests.filter(i => i.status === 'pending').length > 0 && (
                            <span className="ml-2 bg-blue-600 text-white text-[10px] px-1.5 py-0.5 rounded-full shadow-lg shadow-blue-500/50">
                                {incomingRequests.filter(i => i.status === 'pending').length}
                            </span>
                        )}
                        {activeTab === 'incoming' && (
                            <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 rounded-t-full shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
                        )}
                    </button>
                </div>

                {/* Content Area */}
                <div className="pb-20">
                    {activeTab === 'saved' && (
                        <motion.div
                            key="saved"
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                        >
                            {savedOps.length > 0 ? (
                                savedOps.map(item => (
                                    <div key={item._id} className="group backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:bg-white/10 hover:border-white/20 transition-all duration-300 shadow-xl flex flex-col">
                                        <div className="h-40 bg-gray-900 relative">
                                            {item.opportunity.galleryUrls?.[0] ? (
                                                <img src={item.opportunity.galleryUrls[0]} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-black">
                                                    <span className="text-gray-600 font-bold text-xl">{item.opportunity.title[0]}</span>
                                                </div>
                                            )}
                                            <div className="absolute top-3 right-3">
                                                <button onClick={() => handleUnsave(item.opportunity._id)} className="p-2 bg-black/50 backdrop-blur-md rounded-full text-white hover:bg-red-500/80 transition-colors">
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="p-5 flex-1 flex flex-col">
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="font-bold text-lg text-white group-hover:text-purple-400 transition-colors line-clamp-1">{item.opportunity.title}</h3>
                                            </div>
                                            <div className="flex items-center gap-2 mb-4">
                                                <div className="w-6 h-6 rounded-full bg-gray-700 overflow-hidden">
                                                    {item.opportunity.startup?.profilePicture && <img src={item.opportunity.startup.profilePicture} className="w-full h-full object-cover" />}
                                                </div>
                                                <span className="text-sm text-gray-400">{item.opportunity.startup?.name}</span>
                                            </div>

                                            <div className="mt-auto pt-4 border-t border-white/5 flex gap-3">
                                                <button onClick={() => navigate(`/opportunities/${item.opportunity._id}`)} className="flex-1 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm font-bold text-center transition-colors">
                                                    View Details
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-full text-center py-20 backdrop-blur-md bg-white/5 rounded-2xl border border-white/5 border-dashed">
                                    <h3 className="text-xl font-bold text-gray-400">No saved opportunities.</h3>
                                    <p className="text-gray-600 mt-1 text-sm">Explore the feed and bookmark promising startups.</p>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {activeTab === 'requests' && (
                        <motion.div
                            key="requests"
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            className="grid grid-cols-1 gap-4"
                        >
                            {sentInterests.length > 0 ? (
                                sentInterests.map(req => (
                                    <div key={req._id} className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col md:flex-row justify-between gap-6 hover:bg-white/10 transition-colors shadow-xl">
                                        <div className="flex gap-4 items-start">
                                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-700 to-black border border-white/10 overflow-hidden shrink-0 shadow-lg">
                                                {(req.sender?.profilePicture || req.investor?.profilePicture) ? (
                                                    <img src={req.sender?.profilePicture || req.investor?.profilePicture} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-white font-bold text-lg">
                                                        {(req.sender?.name || req.investor?.name)?.[0]}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-baseline gap-2 mb-1">
                                                    <h4 className="font-bold text-white text-lg">{req.sender?.name || req.investor?.name}</h4>
                                                    <span className="text-[10px] text-gray-400 font-bold bg-white/5 px-2 py-0.5 rounded border border-white/5 uppercase tracking-wide">To: <span className="text-white">{req.opportunity?.title}</span></span>
                                                </div>
                                                {req.message && (
                                                    <p className="text-gray-400 text-sm italic">"{req.message}"</p>
                                                )}
                                                <div className="flex items-center gap-1.5 mt-2 text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                                                    <Clock size={10} /> {new Date(req.createdAt).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <div className="flex flex-col gap-2 items-end">
                                                <div className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest border shadow-md w-max ${req.status === 'accepted' ? 'border-green-500/20 text-green-400 bg-green-500/10' :
                                                    req.status === 'rejected' ? 'border-red-500/20 text-red-400 bg-red-500/10' :
                                                        'border-yellow-500/20 text-yellow-400 bg-yellow-500/10'
                                                    }`}>
                                                    {req.status}
                                                </div>
                                                {req.status === 'accepted' && (
                                                    <button
                                                        onClick={() => handleMessage(req.opportunity?.creatorId?._id || req.opportunity?.creatorId)}
                                                        className="flex items-center gap-1.5 px-4 py-2 bg-blue-500 text-white hover:bg-blue-600 rounded-lg transition-all font-bold text-xs shadow-md shadow-blue-500/20 active:scale-95"
                                                    >
                                                        <MessageCircle size={14} /> Message
                                                    </button>
                                                )}
                                            </div>
                                            <button onClick={() => navigate(`/opportunities/${req.opportunity._id}`)} className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors">
                                                <ExternalLink size={20} />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-20 backdrop-blur-md bg-white/5 rounded-2xl border border-white/5 border-dashed">
                                    <h3 className="text-xl font-bold text-gray-400">No requests sent yet.</h3>
                                    <p className="text-gray-600 mt-1 text-sm">Find a startup you like and click "Send Interest".</p>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {activeTab === 'my-posts' && (
                        <motion.div
                            key="my-posts"
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            className="grid grid-cols-1 gap-4"
                        >
                            {myOpportunities.length > 0 ? (
                                myOpportunities.map(op => (
                                    <div key={op._id} className="group backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-center hover:bg-white/10 hover:border-white/20 transition-all duration-300 shadow-xl hover:shadow-blue-900/10">
                                        <div className="flex-1">
                                            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">{op.title}</h3>
                                            <div className="flex items-center gap-3 text-xs text-gray-400 font-medium">
                                                <span className="bg-white/10 px-2 py-0.5 rounded-md">{new Date(op.createdAt).toLocaleDateString()}</span>
                                                <span className="w-1 h-1 rounded-full bg-gray-600"></span>
                                                <span className="text-white">{op.industry}</span>
                                                <span className="w-1 h-1 rounded-full bg-gray-600"></span>
                                                <span className={op.visibility ? "text-green-400 bg-green-400/10 px-2 py-0.5 rounded-md" : "text-gray-500 bg-gray-500/10 px-2 py-0.5 rounded-md"}>
                                                    {op.visibility ? "Public" : "Hidden"}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-6 mt-4 md:mt-0">
                                            <div className="flex flex-col items-center">
                                                <span className="text-lg font-black text-white">{op.views || 0}</span>
                                                <span className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Views</span>
                                            </div>
                                            <div className="w-px h-8 bg-white/10"></div>
                                            <div className="flex flex-col items-center">
                                                <span className="text-lg font-black text-white">{op.interestCount || 0}</span>
                                                <span className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Requests</span>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    setOpportunityToEdit(op);
                                                    setIsCreateModalOpen(true);
                                                }}
                                                className="px-4 py-2 bg-white text-black hover:bg-gray-200 rounded-lg font-bold text-xs transition-all shadow-lg active:scale-95"
                                            >
                                                Manage
                                            </button>
                                            <button
                                                onClick={() => handleDeleteClick(op._id)}
                                                className="px-4 py-2 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white border border-red-500/20 rounded-lg font-bold text-xs transition-all shadow-lg active:scale-95 flex items-center gap-2"
                                            >
                                                <Trash2 size={14} /> Delete
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-20 backdrop-blur-md bg-white/5 rounded-2xl border border-white/5 border-dashed">
                                    <h3 className="text-xl font-bold text-gray-400">Your portfolio is empty.</h3>
                                    <p className="text-gray-600 mt-1 text-sm">Start your journey by creating a new opportunity.</p>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {activeTab === 'incoming' && (
                        <motion.div
                            key="incoming"
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            className="grid grid-cols-1 gap-4"
                        >
                            {incomingRequests.length > 0 ? (
                                incomingRequests.map(req => (
                                    <div key={req._id} className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col md:flex-row justify-between gap-6 hover:bg-white/10 transition-colors shadow-xl">
                                        <div className="flex gap-4 items-start">
                                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-700 to-black border border-white/10 overflow-hidden shrink-0 shadow-lg">
                                                {(req.sender?.profilePicture || req.investor?.profilePicture) ? (
                                                    <img src={req.sender?.profilePicture || req.investor?.profilePicture} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-white font-bold text-lg">
                                                        {(req.sender?.name || req.investor?.name)?.[0]}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-baseline gap-2 mb-1">
                                                    <h4 className="font-bold text-white text-lg">{req.sender?.name || req.investor?.name}</h4>
                                                    <span className="text-[10px] text-gray-400 font-bold bg-white/5 px-2 py-0.5 rounded border border-white/5 uppercase tracking-wide">Interested in: <span className="text-white">{req.opportunity?.title}</span></span>
                                                </div>
                                                {req.message && (
                                                    <div className="relative">
                                                        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-blue-500/30 rounded-full"></div>
                                                        <p className="pl-3 py-1 text-gray-300 italic text-sm leading-relaxed">
                                                            "{req.message}"
                                                        </p>
                                                    </div>
                                                )}
                                                {req.requestVideoUrl && (
                                                    <a href={req.requestVideoUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 mt-2 text-blue-400 hover:text-white bg-blue-500/10 hover:bg-blue-500/20 px-3 py-1 rounded-lg border border-blue-500/20 text-[10px] font-black uppercase tracking-widest transition-all">
                                                        <Eye size={12} /> Watch Pitch
                                                    </a>
                                                )}
                                                <div className="flex items-center gap-1.5 mt-2 text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                                                    <Clock size={10} /> {new Date(req.createdAt).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex md:flex-col items-end gap-2 justify-center min-w-[120px]">
                                            {req.status === 'pending' ? (
                                                <>
                                                    <button
                                                        onClick={() => handleInterestAction(req._id, 'accepted')}
                                                        className="w-full flex items-center justify-center gap-1.5 px-4 py-2 bg-green-500/10 text-green-400 hover:bg-green-500 hover:text-white border border-green-500/20 rounded-lg transition-all font-bold text-xs shadow-md"
                                                    >
                                                        <Check size={14} /> Accept
                                                    </button>
                                                    <button
                                                        onClick={() => handleInterestAction(req._id, 'rejected')}
                                                        className="w-full flex items-center justify-center gap-1.5 px-4 py-2 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white border border-red-500/20 rounded-lg transition-all font-bold text-xs shadow-md"
                                                    >
                                                        <X size={14} /> Reject
                                                    </button>
                                                </>
                                            ) : (
                                                <div className="flex flex-col gap-2 w-full">
                                                    <div className={`w-full text-center px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest border shadow-md ${req.status === 'accepted'
                                                        ? 'border-green-500/20 text-green-400 bg-green-500/10 shadow-green-500/10'
                                                        : 'border-red-500/20 text-red-400 bg-red-500/10 shadow-red-500/10'
                                                        }`}>
                                                        {req.status}
                                                    </div>
                                                    {req.status === 'accepted' && (
                                                        <button
                                                            onClick={() => handleMessage(req.sender?._id || req.investor?._id)}
                                                            className="w-full flex items-center justify-center gap-1.5 px-4 py-2 bg-blue-500 text-white hover:bg-blue-600 rounded-lg transition-all font-bold text-xs shadow-md shadow-blue-500/20 active:scale-95"
                                                        >
                                                            <MessageCircle size={14} /> Message
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-20 backdrop-blur-md bg-white/5 rounded-2xl border border-white/5 border-dashed">
                                    <h3 className="text-xl font-bold text-gray-400">No requests yet.</h3>
                                    <p className="text-gray-600 mt-1 text-sm">Check back later or boost your post visibility.</p>
                                </div>
                            )}
                        </motion.div>
                    )}
                </div>

                <CreateOpportunity
                    isOpen={isCreateModalOpen}
                    onClose={() => {
                        setIsCreateModalOpen(false);
                        setOpportunityToEdit(null);
                    }}
                    onCreated={fetchData}
                    opportunityToEdit={opportunityToEdit}
                />

                <ConfirmationModal
                    isOpen={isDeleteModalOpen}
                    onClose={() => setIsDeleteModalOpen(false)}
                    onConfirm={confirmDelete}
                    title="Delete Opportunity?"
                    message="Are you sure you want to remove this opportunity? This will permanently delete all data, including received interests and analytics. This action cannot be undone."
                    confirmText="Yes, Delete It"
                />
            </div>
        </div>
    );
};

export default InvestorDashboard;
