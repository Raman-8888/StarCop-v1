import React, { useState } from 'react';
import { X, Send, Paperclip, AlertCircle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { sendMessageRequest } from '../services/messageRequestService';

const FirstMessageModal = ({ isOpen, onClose, user, onSuccess }) => {
    const [message, setMessage] = useState('');
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);

    if (!isOpen || !user) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!message.trim() && !file) {
            toast.error('Please enter a message or attach a file');
            return;
        }

        setLoading(true);
        try {
            await sendMessageRequest(user._id, message, file);
            toast.success('Message request sent successfully');
            setMessage('');
            setFile(null);
            if (onSuccess) onSuccess();
            onClose();
        } catch (error) {
            console.error('Send request error:', error);
            if (error.response?.data?.hasConnection) {
                toast.error('You are already connected. Redirecting to chat...');
                if (onSuccess) onSuccess(true); // true indicates connection exists
                onClose();
            } else if (error.response?.data?.requestPending) {
                toast.error('Message request already waiting for approval');
                onClose();
            } else {
                toast.error(error.response?.data?.message || 'Failed to send message request');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            if (selectedFile.size > 50 * 1024 * 1024) {
                toast.error('File size must be less than 50MB');
                return;
            }
            setFile(selectedFile);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <div className="bg-[#1a1a1a] rounded-2xl border border-white/10 w-full max-w-md shadow-2xl relative animate-in fade-in zoom-in duration-200">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                >
                    <X size={20} />
                </button>

                {/* Header */}
                <div className="p-6 border-b border-white/5">
                    <h3 className="text-xl font-bold text-white mb-1">Send Message Request</h3>
                    <p className="text-sm text-gray-400">
                        Start a conversation with {user.name}
                    </p>
                </div>

                {/* User Info */}
                <div className="px-6 py-4 flex items-center gap-3 bg-white/5">
                    <img
                        src={user.profilePicture || 'https://via.placeholder.com/40'}
                        alt={user.name}
                        className="w-10 h-10 rounded-full object-cover border border-white/10"
                    />
                    <div>
                        <p className="text-white font-medium text-sm">{user.name}</p>
                        <p className="text-xs text-gray-400">@{user.username}</p>
                    </div>
                </div>

                {/* Warning */}
                <div className="px-6 py-3 bg-blue-500/10 border-y border-blue-500/20 flex items-start gap-3">
                    <AlertCircle size={16} className="text-blue-400 mt-0.5 shrink-0" />
                    <p className="text-xs text-blue-200/80">
                        You can send only <strong>one message</strong> initially. If they accept, you'll be able to chat freely.
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6">
                    <div className="mb-4">
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder={`Hi ${user.name}, I'd like to connect...`}
                            className="w-full h-32 bg-black/40 border border-white/10 rounded-xl p-4 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 resize-none text-sm"
                        />
                    </div>

                    {/* File Attachment Preview */}
                    {file && (
                        <div className="mb-4 p-3 bg-white/5 rounded-lg border border-white/10 flex items-center justify-between">
                            <div className="flex items-center gap-2 truncate">
                                <Paperclip size={14} className="text-purple-400 shrink-0" />
                                <span className="text-sm text-gray-300 truncate">{file.name}</span>
                            </div>
                            <button
                                type="button"
                                onClick={() => setFile(null)}
                                className="text-gray-500 hover:text-red-400"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    )}

                    <div className="flex items-center justify-between">
                        <label className="cursor-pointer text-gray-400 hover:text-purple-400 transition-colors flex items-center gap-2 text-sm p-2 hover:bg-white/5 rounded-lg">
                            <Paperclip size={18} />
                            <span className="hidden sm:inline">Attach file</span>
                            <input
                                type="file"
                                className="hidden"
                                onChange={handleFileChange}
                            />
                        </label>

                        <button
                            type="submit"
                            disabled={loading || (!message.trim() && !file)}
                            className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white rounded-xl font-medium transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm shadow-lg shadow-purple-500/20"
                        >
                            {loading ? (
                                <>
                                    <Loader2 size={16} className="animate-spin" />
                                    Sending...
                                </>
                            ) : (
                                <>
                                    <Send size={16} />
                                    Send Request
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default FirstMessageModal;
