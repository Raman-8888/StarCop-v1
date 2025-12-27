import React, { useState } from 'react';
import { Play, Bookmark, Send, Eye, Pencil, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { API_URL } from '../config';

const OpportunityCard = ({ opportunity, onSaveToggle, onEdit, onDelete, onClick }) => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [isSaved, setIsSaved] = useState(false);

    const currentUserId = user?.id || user?._id;
    const creatorUserId = opportunity.creatorId?._id || opportunity.creatorId;
    const isOwner = currentUserId && creatorUserId && currentUserId.toString() === creatorUserId.toString();

    const handleSave = async (e) => {
        e.stopPropagation();
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/api/opportunities/${opportunity._id}/save`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setIsSaved(!isSaved);
            if (onSaveToggle) onSaveToggle(opportunity._id, !isSaved);
        } catch (error) {
            console.error("Save failed", error);
        }
    };

    const handleInterest = (e) => {
        e.stopPropagation();
        navigate(`/opportunities/${opportunity._id}`); // Navigate to details to send interest
    };

    const handleCardClick = () => {
        if (onClick) {
            onClick(opportunity);
        } else {
            navigate(`/opportunities/${opportunity._id}`);
        }
    };

    return (
        <div
            onClick={handleCardClick}
            className={`group backdrop-blur-md bg-white/5 border rounded-2xl overflow-hidden hover:bg-white/10 hover:scale-[1.02] hover:shadow-2xl transition-all duration-300 cursor-pointer relative ${isOwner
                ? 'border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.1)]'
                : 'border-white/10 hover:border-white/20'
                }`}
        >
            {/* Thumbnail / Video Preview Area */}
            <div className="aspect-video bg-black/50 relative overflow-hidden">
                {opportunity.thumbnailUrl ? (
                    <img
                        src={opportunity.thumbnailUrl}
                        alt={opportunity.title}
                        className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-700"
                    />
                ) : opportunity.pitchVideoUrl ? (
                    <video
                        src={opportunity.pitchVideoUrl}
                        className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-700"
                        muted
                        loop
                        onMouseOver={event => event.target.play()}
                        onMouseOut={event => event.target.pause()}
                    />
                ) : opportunity.galleryUrls && opportunity.galleryUrls.length > 0 ? (
                    <img
                        src={opportunity.galleryUrls[0]}
                        alt={opportunity.title}
                        className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-700"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-900">
                        <Play className="w-12 h-12 text-white/20 group-hover:text-white/40 transition-colors" />
                    </div>
                )}

                {/* Overlay Badges */}
                <div className="absolute top-3 left-3 flex gap-2">
                    <span className="bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider text-white border border-white/10 shadow-lg">
                        {opportunity.industry}
                    </span>
                    {opportunity.fundingStage && (
                        <span className="bg-blue-600/60 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider text-white shadow-lg border border-white/5">
                            {opportunity.fundingStage}
                        </span>
                    )}
                </div>
            </div>

            {/* Content Body */}
            <div className="p-5">
                <div className="flex items-start justify-between mb-4">
                    <div
                        className="flex items-center gap-3 cursor-pointer group/profile"
                        onClick={(e) => {
                            e.stopPropagation();
                            if (opportunity.creatorId?.username) {
                                navigate(`/user/${opportunity.creatorId.username}`);
                            }
                        }}
                    >
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-800 to-black overflow-hidden border border-white/20 relative shadow-md group-hover/profile:border-blue-400 transition-colors">
                            {opportunity.creatorId?.profilePicture ? (
                                <img src={opportunity.creatorId.profilePicture} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-white font-bold text-sm">
                                    {opportunity.creatorId?.name?.[0] || 'U'}
                                </div>
                            )}
                            {/* Role Badge */}
                            <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#111] shadow-sm ${opportunity.creatorRole === 'investor' ? 'bg-blue-500' : 'bg-purple-500'}`} title={opportunity.creatorRole}></div>
                        </div>
                        <div>
                            <h3 className="font-bold text-white text-lg leading-tight group-hover:text-blue-400 transition-colors line-clamp-2">
                                {opportunity.title}
                            </h3>
                            <div className="flex items-center gap-2 text-xs text-gray-400 font-medium group-hover/profile:text-blue-300 transition-colors">
                                <span>{opportunity.creatorId?.name}</span>
                                <span className="w-0.5 h-0.5 bg-gray-500 rounded-full"></span>
                                <span>{new Date(opportunity.createdAt).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-3 mb-5">
                    {/* Only show relevant fields based on data presence */}
                    {opportunity.problem && (
                        <div>
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1">Problem</span>
                            <p className="text-sm text-gray-300 line-clamp-2 leading-relaxed">
                                {opportunity.problem}
                            </p>
                        </div>
                    )}
                    {opportunity.description && (
                        <div>
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1">Description</span>
                            <p className="text-sm text-gray-300 line-clamp-2 leading-relaxed">
                                {opportunity.description}
                            </p>
                        </div>
                    )}

                    {!opportunity.problem && !opportunity.description && opportunity.solution && (
                        <div>
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1">Solution</span>
                            <p className="text-sm text-gray-300 line-clamp-2 leading-relaxed">
                                {opportunity.solution}
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="flex items-center justify-between border-t border-white/5 pt-4">
                    <div className="flex items-center gap-4 text-xs font-medium">
                        {opportunity.investmentRange && (
                            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500/10 text-green-400 border border-green-500/20">
                                <span className="font-bold">{opportunity.investmentRange}</span>
                            </span>
                        )}
                        <span className="text-gray-500 flex items-center gap-1">
                            <Eye size={12} /> {opportunity.views}
                        </span>
                    </div>

                    {/* Allow Interest if NOT the creator */}
                    {user && !isOwner && (
                        <div className="flex gap-2">
                            <button
                                onClick={handleSave}
                                className={`p-2.5 rounded-full transition-all ${isSaved ? 'text-yellow-400 bg-yellow-400/10' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}
                            >
                                <Bookmark size={18} fill={isSaved ? "currentColor" : "none"} />
                            </button>
                            <button
                                onClick={handleInterest}
                                className="p-2.5 text-blue-400 hover:text-white hover:bg-blue-500 rounded-full transition-all bg-blue-500/10 border border-blue-500/20 shadow-lg shadow-blue-500/10 hover:shadow-blue-500/30"
                                title="Send Interest"
                            >
                                <Send size={18} />
                            </button>
                        </div>
                    )}

                    {/* Owner Actions */}
                    {isOwner && (
                        <div className="flex gap-2">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (onEdit) onEdit(opportunity);
                                }}
                                className="flex items-center gap-2 px-4 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/30 rounded-lg text-sm font-medium transition-colors"
                            >
                                <Pencil size={14} /> Edit
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (onDelete) onDelete(opportunity._id);
                                }}
                                className="flex items-center gap-2 px-4 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 rounded-lg text-sm font-medium transition-colors"
                            >
                                <Trash2 size={14} /> Delete
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OpportunityCard;
