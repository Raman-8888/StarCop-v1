import React, { useEffect, useState } from 'react';
import { useNotification } from '../context/NotificationContext';
import axios from 'axios';
import { API_URL } from '../config';
import { Bell, Trash2, CheckCircle, Clock, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useNavigate } from 'react-router-dom';
import ConfirmationModal from '../components/ConfirmationModal';

dayjs.extend(relativeTime);

const Notifications = () => {
    const navigate = useNavigate();
    const { fetchUnreadCount } = useNotification();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchNotifications = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/api/notifications`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(res.data);

            // Mark all as read locally or relies on user clicking?
            // Usually visiting the page shouldn't auto-read ALL unless expected.
            // Let's keep manual read or read on click. 
            // Better UX: Mark as read when "seen". For now, user clicks to dismiss/read.

        } catch (error) {
            console.error("Error fetching notifications", error);
            toast.error("Failed to load notifications");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const handleDelete = async (id, e) => {
        e.stopPropagation();
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_URL}/api/notifications/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(prev => prev.filter(n => n._id !== id));
            toast.success("Notification deleted");
            fetchUnreadCount();
        } catch (error) {
            toast.error("Failed to delete");
        }
    };

    const [isClearModalOpen, setIsClearModalOpen] = useState(false);

    const handleClearAll = () => {
        setIsClearModalOpen(true);
    };

    const confirmClearAll = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_URL}/api/notifications`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications([]);
            toast.success("All notifications cleared");
            fetchUnreadCount();
        } catch (error) {
            toast.error("Failed to clear notifications");
        }
    };

    const handleReply = async (senderId, senderUsername) => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(`${API_URL}/api/chat/conversations`,
                { userId: senderId },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            // Navigate to chat with the conversation data
            navigate('/chat', { state: { selectedConversation: res.data } });
        } catch (error) {
            console.error("Failed to start chat", error);
            // If 403 (Not connected) or other error, redirect to profile
            if (error.response && (error.response.status === 403 || error.response.status === 400 || error.response.status === 404)) {
                toast.error("Connect with user to start chatting");
                if (senderUsername) {
                    navigate(`/user/${senderUsername}`);
                }
            } else {
                toast.error("Failed to open chat");
            }
        }
    };

    const handleMarkAsRead = async (id, isRead) => {
        if (isRead) return;
        try {
            const token = localStorage.getItem('token');
            await axios.put(`${API_URL}/api/notifications/${id}/read`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
            fetchUnreadCount();
        } catch (error) {
            console.error("Failed to mark as read");
        }
    };

    if (loading) return <div className="text-white p-10 flex justify-center">Loading...</div>;

    return (
        <div className="min-h-screen bg-black text-white p-6 md:p-10 md:pt-24 pt-4">
            <div className="max-w-4xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-8">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-blue-600/20 rounded-xl border border-blue-500/30">
                            <Bell className="text-blue-400" size={24} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold">Notifications</h1>
                            <p className="text-gray-400 text-sm">Stay updated with your activities</p>
                        </div>
                    </div>

                    {notifications.length > 0 && (
                        <button
                            onClick={handleClearAll}
                            className="flex items-center justify-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg border border-red-500/20 transition-colors text-sm font-medium"
                        >
                            <Trash2 size={16} /> Clear History
                        </button>
                    )}
                </div>

                <div className="space-y-4">
                    {notifications.length === 0 ? (
                        <div className="text-center py-20 bg-[#111] rounded-2xl border border-white/5">
                            <Bell className="mx-auto h-12 w-12 text-gray-600 mb-4 opacity-50" />
                            <h3 className="text-xl font-bold text-gray-400">No notifications yet</h3>
                            <p className="text-gray-600">You're all caught up!</p>
                        </div>
                    ) : (
                        notifications.map((notification) => (
                            <div
                                key={notification._id}
                                onClick={() => handleMarkAsRead(notification._id, notification.isRead)}
                                className={`group relative p-5 rounded-xl border transition-all duration-300 cursor-pointer overflow-hidden ${notification.isRead
                                    ? 'bg-[#111] border-white/5 opacity-70 hover:opacity-100'
                                    : 'bg-blue-900/10 border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.1)]'
                                    }`}
                            >
                                <div className="flex items-start gap-4">
                                    {/* Sender Avatar */}
                                    <div
                                        className="flex-shrink-0 cursor-pointer"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (notification.sender && notification.sender.username) {
                                                navigate(`/user/${notification.sender.username}`);
                                            }
                                        }}
                                    >
                                        <div className="w-12 h-12 rounded-full bg-gray-800 border border-white/10 overflow-hidden hover:border-blue-500 transition-colors">
                                            {notification.sender?.profilePicture ? (
                                                <img src={notification.sender.profilePicture} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-white font-bold bg-gradient-to-br from-gray-700 to-gray-900">
                                                    {notification.sender?.name?.[0] || '?'}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start">
                                            <h4 className={`text-base font-semibold mb-1 ${notification.isRead ? 'text-gray-300' : 'text-white'}`}>
                                                {notification.message}
                                            </h4>
                                            <span className="text-xs text-gray-500 flex items-center gap-1 whitespace-nowrap ml-2">
                                                <Clock size={12} />
                                                {dayjs(notification.createdAt).fromNow()}
                                            </span>
                                        </div>

                                        {notification.geminiSummary && (
                                            <div className="mt-2 text-sm text-gray-400 bg-white/5 p-2 rounded-lg border border-white/5 inline-block">
                                                ✨ AI Summary: {notification.geminiSummary}
                                            </div>
                                        )}

                                        <div className="mt-4 flex gap-3">
                                            {notification.sender && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleReply(notification.sender._id, notification.sender.username);
                                                    }}
                                                    className="px-4 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-600/30 rounded-lg text-sm transition-colors flex items-center gap-2"
                                                >
                                                    <MessageSquare size={14} /> Reply
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <button
                                        onClick={(e) => handleDelete(notification._id, e)}
                                        className="p-2 text-gray-500 hover:text-red-400 hover:bg-white/5 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                                        title="Delete notification"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>

                                {!notification.isRead && (
                                    <div className="absolute top-1/2 -translate-y-1/2 left-0 w-1 h-12 bg-blue-500 rounded-r-full" />
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>


            <ConfirmationModal
                isOpen={isClearModalOpen}
                onClose={() => setIsClearModalOpen(false)}
                onConfirm={confirmClearAll}
                title="Clear All Notifications"
                message="Are you sure you want to clear all notifications? This action cannot be undone."
                confirmText="Clear All"
                isDestructive={true}
            />
        </div >
    );
};

export default Notifications;
