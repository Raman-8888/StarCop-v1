import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config';
import { Bookmark, TrendingUp, Check, X, Clock, ChevronLeft, Eye, Send, ExternalLink } from 'lucide-react';
import LiquidChrome from '../components/3d/LiquidChrome';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const InvestorDashboard = () => {
    const navigate = useNavigate();
    const [savedOps, setSavedOps] = useState([]);
    const [sentInterests, setSentInterests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('saved'); // 'saved' or 'requests'

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                const [savedRes, sentRes] = await Promise.all([
                    axios.get(`${API_URL}/api/opportunities/investor/saved`, { headers: { Authorization: `Bearer ${token}` } }),
                    axios.get(`${API_URL}/api/opportunities/investor/sent-interests`, { headers: { Authorization: `Bearer ${token}` } })
                ]);
                setSavedOps(savedRes.data.filter(item => item.opportunity));
                setSentInterests(sentRes.data.filter(item => item.opportunity));
            } catch (error) {
                console.error("Error fetching dashboard data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

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

    return (
        <div className="relative min-h-screen bg-black text-white font-sans overflow-hidden">
            {/* 3D Background */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <LiquidChrome baseColor={[0.05, 0.1, 0.1]} speed={0.15} amplitude={0.2} interactive={false} />
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
                                Investor Dashboard.
                            </h1>
                            <p className="text-gray-400 mt-1 font-medium text-sm">Track your portfolio and deal flow.</p>
                        </div>
                    </div>
                    <button
                        onClick={() => navigate('/opportunities')}
                        className="group relative px-6 py-3 bg-white text-black rounded-xl font-bold text-sm overflow-hidden transition-transform hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                    >
                        <span className="relative z-10 flex items-center gap-2">
                            <Eye size={18} /> Browse Deals
                        </span>
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 opacity-0 group-hover:opacity-10 transition-opacity" />
                    </button>
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

                {/* Tabs */}
                <div className="flex gap-6 border-b border-white/10 relative mt-2">
                    <button
                        onClick={() => setActiveTab('saved')}
                        className={`pb-3 text-sm font-bold tracking-widest transition-all relative ${activeTab === 'saved' ? 'text-white' : 'text-gray-600 hover:text-gray-400'}`}
                    >
                        SAVED ({savedOps.length})
                        {activeTab === 'saved' && (
                            <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500 rounded-t-full shadow-[0_0_15px_rgba(168,85,247,0.5)]" />
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('requests')}
                        className={`pb-3 text-sm font-bold tracking-widest transition-all relative ${activeTab === 'requests' ? 'text-white' : 'text-gray-600 hover:text-gray-400'}`}
                    >
                        REQUESTS ({sentInterests.length})
                        {activeTab === 'requests' && (
                            <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-500 rounded-t-full shadow-[0_0_15px_rgba(34,197,94,0.5)]" />
                        )}
                    </button>
                </div>

                {/* Content Area */}
                <div className="pb-20">
                    {activeTab === 'saved' ? (
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
                    ) : (
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
                                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-900 to-black border border-white/10 overflow-hidden shrink-0 shadow-lg flex items-center justify-center">
                                                <TrendingUp className="text-blue-400" size={20} />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-baseline gap-2 mb-1">
                                                    <h4 className="font-bold text-white text-lg">Interest Sent</h4>
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
                                            <div className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest border shadow-md ${req.status === 'accepted' ? 'border-green-500/20 text-green-400 bg-green-500/10' :
                                                req.status === 'rejected' ? 'border-red-500/20 text-red-400 bg-red-500/10' :
                                                    'border-yellow-500/20 text-yellow-400 bg-yellow-500/10'
                                                }`}>
                                                {req.status}
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
                </div>
            </div>
        </div>
    );
};

export default InvestorDashboard;
