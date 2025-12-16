import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config';
import { Plus, Eye, Bookmark, TrendingUp, Check, X, Clock, ChevronLeft, Trash2 } from 'lucide-react';
import CreateOpportunity from '../components/CreateOpportunity';
import ConfirmationModal from '../components/ConfirmationModal';
import LiquidChrome from '../components/3d/LiquidChrome';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const StartupDashboard = () => {
    const navigate = useNavigate();
    const [opportunities, setOpportunities] = useState([]);
    const [interests, setInterests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [opportunityToDelete, setOpportunityToDelete] = useState(null);
    const [opportunityToEdit, setOpportunityToEdit] = useState(null);
    const [activeTab, setActiveTab] = useState('pitches'); // 'pitches' or 'requests'

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');
            const [opsRes, intsRes] = await Promise.all([
                axios.get(`${API_URL}/api/opportunities/startup/my`, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`${API_URL}/api/opportunities/startup/my-interests`, { headers: { Authorization: `Bearer ${token}` } })
            ]);
            setOpportunities(opsRes.data);
            setInterests(intsRes.data);
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
            setInterests(prev => prev.map(i => i._id === interestId ? { ...i, status } : i));
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
            setOpportunities(prev => prev.filter(op => op._id !== opportunityToDelete));
            setOpportunityToDelete(null);
        } catch (error) {
            console.error("Delete failed", error);
            toast.error("Failed to delete opportunity");
        }
    };

    return (
        <div className="relative min-h-screen bg-black text-white font-sans overflow-hidden">
            {/* 3D Background */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <LiquidChrome baseColor={[0.1, 0.05, 0.1]} speed={0.15} amplitude={0.2} interactive={false} />
            </div>

            <div className="relative z-10 container mx-auto px-6 py-8 md:px-8 md:py-12 max-w-7xl min-h-screen flex flex-col gap-8">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
                >
                    <div className="backdrop-blur-sm bg-black/20 p-5 rounded-2xl border border-white/5 shadow-xl flex items-center gap-4">
                        <button
                            onClick={() => navigate('/opportunities')}
                            className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/50 hover:text-white"
                        >
                            <ChevronLeft size={28} />
                        </button>
                        <div>
                            <h1 className="text-3xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white via-gray-200 to-gray-500 drop-shadow-sm">
                                Dashboard.
                            </h1>
                            <p className="text-gray-400 mt-1 font-medium text-sm">Manage your impact and connections.</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="group relative px-6 py-3 bg-white text-black rounded-xl font-bold text-sm overflow-hidden transition-transform hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                    >
                        <span className="relative z-10 flex items-center gap-2">
                            <Plus size={18} /> New Post
                        </span>
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 opacity-0 group-hover:opacity-10 transition-opacity" />
                    </button>
                </motion.div>

                {/* Analytics Bento Grid */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="grid grid-cols-1 md:grid-cols-6 md:grid-rows-2 gap-4 h-auto md:h-80"
                >
                    {/* Main Stat - Spans 3 cols, 2 rows */}
                    <div className="md:col-span-3 md:row-span-2 backdrop-blur-xl bg-white/5 border border-white/10 p-6 rounded-[1.5rem] hover:bg-white/10 transition-all duration-500 group relative overflow-hidden flex flex-col justify-between">
                        <div className="absolute top-0 right-0 p-24 bg-blue-500/10 rounded-full blur-3xl -mr-12 -mt-12 transition-all group-hover:bg-blue-500/20" />
                        <div>
                            <div className="flex items-center gap-2 text-blue-300 mb-2">
                                <Eye size={20} /> <span className="text-xs font-bold uppercase tracking-widest">Total Views</span>
                            </div>
                            <p className="text-6xl font-black text-white tracking-tighter">
                                {opportunities.reduce((acc, curr) => acc + (curr.views || 0), 0)}
                            </p>
                        </div>
                        <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden mt-6">
                            <div className="bg-blue-500 h-full w-2/3" />
                        </div>
                    </div>

                    {/* Secondary Stat - Spans 3 cols, 1 row */}
                    <div className="md:col-span-3 md:row-span-1 backdrop-blur-xl bg-white/5 border border-white/10 p-6 rounded-[1.5rem] hover:bg-white/10 transition-colors group flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-2 text-purple-300 mb-1">
                                <Bookmark size={18} /> <span className="text-xs font-bold uppercase tracking-widest">Saves</span>
                            </div>
                            <p className="text-4xl font-black text-white">
                                {opportunities.reduce((acc, curr) => acc + (curr.saveCount || 0), 0)}
                            </p>
                        </div>
                        <div className="h-12 w-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                            <Bookmark className="text-purple-400" size={24} />
                        </div>
                    </div>

                    {/* Tertiary Stat - Spans 3 cols, 1 row */}
                    <div className="md:col-span-3 md:row-span-1 backdrop-blur-xl bg-white/5 border border-white/10 p-6 rounded-[1.5rem] hover:bg-white/10 transition-colors group flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-2 text-green-300 mb-1">
                                <TrendingUp size={18} /> <span className="text-xs font-bold uppercase tracking-widest">Interests</span>
                            </div>
                            <p className="text-4xl font-black text-white">
                                {interests.filter(i => i.status === 'pending').length}
                            </p>
                        </div>
                        <div className="h-12 w-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                            <TrendingUp className="text-green-400" size={24} />
                        </div>
                    </div>
                </motion.div>

                {/* Tabs */}
                <div className="flex gap-6 border-b border-white/10 relative mt-2">
                    <button
                        onClick={() => setActiveTab('pitches')}
                        className={`pb-3 text-sm font-bold tracking-widest transition-all relative ${activeTab === 'pitches' ? 'text-white' : 'text-gray-600 hover:text-gray-400'}`}
                    >
                        MY POSTS
                        {activeTab === 'pitches' && (
                            <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-white rounded-t-full shadow-[0_0_15px_rgba(255,255,255,0.5)]" />
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('requests')}
                        className={`pb-3 text-sm font-bold tracking-widest transition-all relative ${activeTab === 'requests' ? 'text-white' : 'text-gray-600 hover:text-gray-400'}`}
                    >
                        REQUESTS
                        {interests.filter(i => i.status === 'pending').length > 0 && (
                            <span className="ml-2 bg-blue-600 text-white text-[10px] px-1.5 py-0.5 rounded-full shadow-lg shadow-blue-500/50">
                                {interests.filter(i => i.status === 'pending').length}
                            </span>
                        )}
                        {activeTab === 'requests' && (
                            <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 rounded-t-full shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
                        )}
                    </button>
                </div>

                {/* Content Area */}
                <div className="pb-20">
                    {activeTab === 'pitches' ? (
                        <motion.div
                            key="pitches"
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            className="grid grid-cols-1 gap-4"
                        >
                            {opportunities.length > 0 ? (
                                opportunities.map(op => (
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
                    ) : (
                        <motion.div
                            key="requests"
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            className="grid grid-cols-1 gap-4"
                        >
                            {interests.length > 0 ? (
                                interests.map(req => (
                                    <div key={req._id} className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col md:flex-row justify-between gap-6 hover:bg-white/10 transition-colors shadow-xl">
                                        <div className="flex gap-4 items-start">
                                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-700 to-black border border-white/10 overflow-hidden shrink-0 shadow-lg">
                                                {req.investor?.profilePicture ? (
                                                    <img src={req.investor.profilePicture} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-white font-bold text-lg">
                                                        {req.investor?.name?.[0]}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-baseline gap-2 mb-1">
                                                    <h4 className="font-bold text-white text-lg">{req.investor?.name}</h4>
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
                                                <div className={`w-full text-center px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest border shadow-md ${req.status === 'accepted'
                                                    ? 'border-green-500/20 text-green-400 bg-green-500/10 shadow-green-500/10'
                                                    : 'border-red-500/20 text-red-400 bg-red-500/10 shadow-red-500/10'
                                                    }`}>
                                                    {req.status}
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
    );
};

export default StartupDashboard;
