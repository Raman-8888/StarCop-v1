import React, { useState } from 'react';
import { Check, X, FileText, Video, Image as ImageIcon, Download, Ban } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';
import { API_URL } from '../config';
import BlockUserModal from './BlockUserModal';
import { blockUser } from '../services/blockService';

const InterestRequestCard = ({ interest, onStatusUpdate }) => {
    const [loading, setLoading] = useState(false);
    const [showBlockModal, setShowBlockModal] = useState(false);

    const handleStatusUpdate = async (status) => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            await axios.put(
                `${API_URL}/api/opportunities/interest/${interest._id}/status`,
                { status },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            toast.success(status === 'accepted' ? 'Interest accepted! Chat unlocked.' : 'Interest rejected');
            onStatusUpdate();
        } catch (error) {
            console.error('Update status error:', error);
            toast.error(error.response?.data?.message || 'Failed to update status');
        } finally {
            setLoading(false);
        }
    };

    const handleBlock = async (userId, reason) => {
        try {
            await blockUser(userId, reason);
            setShowBlockModal(false);
            onStatusUpdate(); // Refresh the list
        } catch (error) {
            console.error('Block error:', error);
            throw error; // Let BlockUserModal handle the error
        }
    };

    const getFileIcon = (fileType) => {
        switch (fileType) {
            case 'video':
                return <Video size={16} className="text-purple-400" />;
            case 'pdf':
                return <FileText size={16} className="text-red-400" />;
            case 'image':
                return <ImageIcon size={16} className="text-blue-400" />;
            default:
                return <FileText size={16} className="text-gray-400" />;
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    };

    const getStatusBadge = () => {
        switch (interest.status) {
            case 'accepted':
                return (
                    <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs font-semibold rounded-full border border-green-500/30">
                        Accepted
                    </span>
                );
            case 'rejected':
                return (
                    <span className="px-3 py-1 bg-red-500/20 text-red-400 text-xs font-semibold rounded-full border border-red-500/30">
                        Rejected
                    </span>
                );
            default:
                return (
                    <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 text-xs font-semibold rounded-full border border-yellow-500/30">
                        Pending
                    </span>
                );
        }
    };

    return (
        <div className="bg-[#111] border border-white/10 rounded-xl p-5 hover:border-white/20 transition-all">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <img
                        src={interest.sender?.profilePicture || 'https://via.placeholder.com/50'}
                        alt={interest.sender?.name}
                        className="w-12 h-12 rounded-full object-cover border-2 border-white/10"
                    />
                    <div>
                        <h4 className="text-white font-semibold">{interest.sender?.name}</h4>
                        <p className="text-sm text-gray-400">{interest.sender?.accountType}</p>
                        <p className="text-xs text-gray-500">{formatDate(interest.createdAt)}</p>
                    </div>
                </div>
                {getStatusBadge()}
            </div>

            {/* Opportunity Reference */}
            {interest.opportunity && (
                <div className="mb-3 p-3 bg-black/40 rounded-lg border border-white/5">
                    <p className="text-xs text-gray-500 mb-1">Opportunity</p>
                    <p className="text-sm text-white font-medium">{interest.opportunity.title}</p>
                </div>
            )}

            {/* Message */}
            {interest.message && (
                <div className="mb-4">
                    <p className="text-sm text-gray-300 line-clamp-3">{interest.message}</p>
                </div>
            )}

            {/* Attachments */}
            {(interest.attachments?.length > 0 || interest.requestVideoUrl) && (
                <div className="mb-4 space-y-2">
                    <p className="text-xs text-gray-500 font-medium">Attachments</p>

                    {/* Legacy video URL */}
                    {interest.requestVideoUrl && (
                        <a
                            href={interest.requestVideoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 p-2 bg-black/40 rounded-lg border border-white/10 hover:border-purple-500/50 transition-colors"
                        >
                            <Video size={16} className="text-purple-400" />
                            <span className="text-sm text-white flex-1">Video Pitch</span>
                            <Download size={14} className="text-gray-400" />
                        </a>
                    )}

                    {/* New attachments array */}
                    {interest.attachments?.map((file, index) => (
                        <a
                            key={index}
                            href={file.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 p-2 bg-black/40 rounded-lg border border-white/10 hover:border-blue-500/50 transition-colors"
                        >
                            {getFileIcon(file.type)}
                            <span className="text-sm text-white flex-1 truncate">{file.filename}</span>
                            <span className="text-xs text-gray-500">
                                {file.size ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : ''}
                            </span>
                            <Download size={14} className="text-gray-400" />
                        </a>
                    ))}
                </div>
            )}

            {/* Action Buttons */}
            {interest.status === 'pending' && (
                <div className="space-y-2">
                    <div className="flex gap-3">
                        <button
                            onClick={() => handleStatusUpdate('accepted')}
                            disabled={loading}
                            className="flex-1 py-2.5 bg-green-600 hover:bg-green-500 text-white rounded-lg font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            <Check size={18} />
                            Accept
                        </button>
                        <button
                            onClick={() => handleStatusUpdate('rejected')}
                            disabled={loading}
                            className="flex-1 py-2.5 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            <X size={18} />
                            Reject
                        </button>
                    </div>
                    <button
                        onClick={() => setShowBlockModal(true)}
                        disabled={loading}
                        className="w-full py-2 bg-black/40 hover:bg-red-500/10 text-red-400 border border-red-500/20 hover:border-red-500/40 rounded-lg font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        <Ban size={16} />
                        Block User
                    </button>
                </div>
            )}

            <BlockUserModal
                isOpen={showBlockModal}
                onClose={() => setShowBlockModal(false)}
                user={interest.sender}
                onBlock={handleBlock}
            />
        </div>
    );
};

export default InterestRequestCard;
