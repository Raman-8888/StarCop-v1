import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Building2, TrendingUp, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { API_URL } from '../config';
import { useAuth } from '../context/AuthContext';

export default function GlobalSearchModal({ isOpen, onClose }) {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const inputRef = useRef(null);

    // Auto-focus input when modal opens
    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    // Debounced Search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (query.trim()) {
                performSearch();
            } else {
                setResults([]);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [query]);

    const performSearch = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${API_URL}/api/users/search?query=${encodeURIComponent(query)}`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            const data = await res.json();
            setResults(data);
        } catch (error) {
            console.error("Search failed", error);
        } finally {
            setLoading(false);
        }
    };

    const handleUserClick = (username) => {
        navigate(`/user/${username}`);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-black/60 backdrop-blur-md"
                onClick={onClose}
            >
                <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -20, opacity: 0 }}
                    className="w-full max-w-2xl bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
                    onClick={e => e.stopPropagation()}
                >
                    {/* Header / Input */}
                    <div className="p-4 border-b border-white/5 flex items-center gap-3">
                        <Search className="text-gray-400 w-5 h-5" />
                        <input
                            ref={inputRef}
                            type="text"
                            placeholder="Search people, startups, investors..."
                            className="flex-1 bg-transparent border-none outline-none text-white text-lg placeholder-gray-500"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                        <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-gray-400 hover:text-white transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Results Area */}
                    <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
                        {loading ? (
                            <div className="p-8 text-center text-gray-500">Searching...</div>
                        ) : results.length > 0 ? (
                            <div className="p-2">
                                {results.map((profile) => (
                                    <div
                                        key={profile._id}
                                        onClick={() => handleUserClick(profile.username)}
                                        className="flex items-center gap-4 p-3 hover:bg-white/5 rounded-xl cursor-pointer transition-colors group"
                                    >
                                        {/* Avatar */}
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                                            {profile.profilePicture ? (
                                                <img src={profile.profilePicture} alt={profile.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-white font-bold">{profile.name?.[0]}</span>
                                            )}
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-0.5">
                                                <h3 className="text-white font-medium truncate group-hover:text-purple-400 transition-colors">
                                                    {profile.name}
                                                </h3>
                                                {/* Badges */}
                                                {profile.accountType === 'startup' && (
                                                    <span className="px-1.5 py-0.5 bg-blue-500/10 text-blue-400 text-[10px] font-bold rounded flex items-center gap-1 border border-blue-500/20">
                                                        <TrendingUp size={10} /> STARTUP
                                                    </span>
                                                )}
                                                {profile.accountType === 'investor' && (
                                                    <span className="px-1.5 py-0.5 bg-red-500/10 text-red-400 text-[10px] font-bold rounded flex items-center gap-1 border border-red-500/20">
                                                        <Building2 size={10} /> INVESTOR
                                                    </span>
                                                )}
                                            </div>

                                            {/* Subtext: Company/Firm Name or Username */}
                                            <p className="text-gray-400 text-sm truncate">
                                                {profile.accountType === 'startup'
                                                    ? profile.startupDetails?.companyName
                                                    : profile.accountType === 'investor'
                                                        ? profile.investorDetails?.firmName
                                                        : `@${profile.username}`
                                                }
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : query ? (
                            <div className="p-12 text-center">
                                <div className="inline-flex w-16 h-16 rounded-full bg-white/5 items-center justify-center mb-4">
                                    <User className="text-gray-600 w-8 h-8" />
                                </div>
                                <p className="text-gray-400">No users found for "{query}"</p>
                            </div>
                        ) : (
                            <div className="p-12 text-center text-gray-600 text-sm">
                                Type to search for users...
                            </div>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
