import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, User, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { API_URL } from '../config';
import { useAuth } from '../context/AuthContext';

export default function ConnectionsModal({ isOpen, onClose, userId }) {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('followers'); // 'followers' or 'following'
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Reset tab when opening
    useEffect(() => {
        if (isOpen) {
            setActiveTab('followers');
            setSearchTerm('');
        }
    }, [isOpen]);

    // Fetch data when tab or open state changes
    useEffect(() => {
        if (isOpen && userId) {
            fetchConnections();
        }
    }, [isOpen, activeTab, userId]);

    const fetchConnections = async () => {
        try {
            setLoading(true);
            const endpoint = activeTab === 'followers'
                ? `/api/users/followers/${userId}`
                : `/api/users/following/${userId}`;

            const res = await fetch(`${API_URL}${endpoint}`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            const result = await res.json();
            setData(Array.isArray(result) ? result : []);
        } catch (error) {
            console.error(`Failed to fetch ${activeTab}`, error);
        } finally {
            setLoading(false);
        }
    };

    const handleUserClick = (username) => {
        navigate(`/user/${username}`);
        onClose();
    };

    const filteredData = data.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[70vh]"
                    onClick={e => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex justify-between items-center p-4 border-b border-white/10">
                        <h2 className="text-xl font-bold text-white text-center flex-1">
                            Connections
                        </h2>
                        <button onClick={onClose} className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-white/5 transition-colors absolute right-4">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Tabs */}
                    <div className="flex border-b border-white/10">
                        <button
                            onClick={() => setActiveTab('followers')}
                            className={`flex-1 py-3 text-sm font-bold transition-colors relative ${activeTab === 'followers' ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                            Followers
                            {activeTab === 'followers' && (
                                <motion.div layoutId="conn-tab" className="absolute bottom-0 left-0 w-full h-0.5 bg-white" />
                            )}
                        </button>
                        <button
                            onClick={() => setActiveTab('following')}
                            className={`flex-1 py-3 text-sm font-bold transition-colors relative ${activeTab === 'following' ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                            Following
                            {activeTab === 'following' && (
                                <motion.div layoutId="conn-tab" className="absolute bottom-0 left-0 w-full h-0.5 bg-white" />
                            )}
                        </button>
                    </div>

                    {/* Search Bar */}
                    <div className="p-4 pb-2">
                        <div className="relative bg-white/5 rounded-xl overflow-hidden flex items-center px-3 py-2 border border-white/5 focus-within:border-white/20 transition-colors">
                            <Search size={16} className="text-gray-500 mr-2" />
                            <input
                                type="text"
                                placeholder={`Search ${activeTab}...`}
                                className="bg-transparent border-none outline-none text-white text-sm w-full placeholder-gray-500"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* List */}
                    <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-2">
                        {loading ? (
                            <div className="flex justify-center py-8">
                                <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                            </div>
                        ) : filteredData.length > 0 ? (
                            filteredData.map(conn => (
                                <div
                                    key={conn._id}
                                    onClick={() => handleUserClick(conn.username)}
                                    className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-xl cursor-pointer transition-colors"
                                >
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 border border-white/10 overflow-hidden flex items-center justify-center shrink-0">
                                        {conn.profilePicture ? (
                                            <img src={conn.profilePicture} alt={conn.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-white font-bold text-xs">{conn.name?.[0]}</span>
                                        )}
                                    </div>
                                    <div>
                                        <h4 className="text-white font-medium text-sm leading-tight">{conn.name}</h4>
                                        <p className="text-gray-500 text-xs">@{conn.username}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-10 text-gray-500 text-sm">
                                <User className="w-8 h-8 mx-auto mb-2 opacity-30" />
                                No {activeTab} found.
                            </div>
                        )}
                    </div>

                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
