import React, { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

const BlockUserModal = ({ isOpen, onClose, user, onBlock }) => {
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(false);

    if (!isOpen || !user) return null;

    const handleBlock = async () => {
        setLoading(true);
        try {
            await onBlock(user._id, reason);
            toast.success(`${user.name} has been blocked`);
            onClose();
            setReason('');
        } catch (error) {
            console.error('Block error:', error);
            toast.error(error.response?.data?.message || 'Failed to block user');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-[#111] rounded-2xl w-full max-w-md border border-white/10 shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="p-5 border-b border-white/10 flex justify-between items-center bg-[#151515]">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center">
                            <AlertTriangle className="text-red-500" size={20} />
                        </div>
                        <h3 className="text-lg font-bold text-white">Block User</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-white/10"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                    {/* User Info */}
                    <div className="flex items-center gap-3 p-3 bg-black/40 rounded-lg border border-white/10">
                        <img
                            src={user.profilePicture || 'https://via.placeholder.com/50'}
                            alt={user.name}
                            className="w-12 h-12 rounded-full object-cover border-2 border-white/10"
                        />
                        <div>
                            <h4 className="text-white font-semibold">{user.name}</h4>
                            <p className="text-sm text-gray-400">@{user.username}</p>
                        </div>
                    </div>

                    {/* Warning Message */}
                    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                        <p className="text-sm text-red-400 font-medium mb-2">
                            ⚠️ Blocking this user will:
                        </p>
                        <ul className="text-xs text-red-300 space-y-1 ml-4 list-disc">
                            <li>Remove all pending interest requests between you</li>
                            <li>Prevent them from sending you messages</li>
                            <li>Prevent them from sending you interest requests</li>
                            <li>Hide your chat history (can be restored if unblocked)</li>
                            <li>Prevent any future interactions</li>
                        </ul>
                    </div>

                    {/* Reason Input (Optional) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">
                            Reason (Optional)
                        </label>
                        <textarea
                            rows="3"
                            placeholder="Why are you blocking this user?"
                            className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:border-red-500 focus:outline-none resize-none text-sm"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-2">
                        <button
                            onClick={onClose}
                            disabled={loading}
                            className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-semibold transition-all disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleBlock}
                            disabled={loading}
                            className="flex-1 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl font-semibold shadow-lg shadow-red-500/20 transition-all disabled:opacity-50"
                        >
                            {loading ? 'Blocking...' : 'Block User'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BlockUserModal;
