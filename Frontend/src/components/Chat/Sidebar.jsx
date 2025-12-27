import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, User, MessageCircle, Clock, Trash2, AlertTriangle, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import MessageRequestCard from './MessageRequestCard';
import { getMessageRequests } from '../../services/messageRequestService';

import { API_URL } from '../../config';

export default function Sidebar({
    conversations,
    setConversations,
    selectedChat,
    setSelectedChat,
    fetchConversations
}) {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('primary'); // 'primary' | 'requests'
    const [messageRequests, setMessageRequests] = useState([]);
    const [deleteConfirmation, setDeleteConfirmation] = useState({
        isOpen: false,
        chatId: null,
        chatName: ''
    });

    // Fetch message requests when tab changes to requests
    useEffect(() => {
        if (activeTab === 'requests') {
            fetchMessageRequests();
        }
    }, [activeTab]);

    const fetchMessageRequests = async () => {
        try {
            const requests = await getMessageRequests();
            setMessageRequests(requests);
        } catch (error) {
            console.error('Failed to fetch requests', error);
        }
    };

    const handleSearch = async (e) => {
        setSearch(e.target.value);
        if (!e.target.value) {
            setSearchResults([]);
            return;
        }

        try {
            setLoading(true);
            setLoading(true);
            const res = await fetch(`${API_URL}/api/chat/users/search?search=${e.target.value}`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            const data = await res.json();
            setSearchResults(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const accessChat = async (userId) => {
        try {
            setLoading(true);
            setLoading(true);
            const res = await fetch(`${API_URL}/api/chat/conversations`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${user.token}`,
                },
                body: JSON.stringify({ userId }),
            });
            const fullChat = await res.json();

            if (!conversations.find((c) => c._id === fullChat._id)) {
                setConversations([fullChat, ...conversations]);
            }
            setSelectedChat(fullChat);
            setSearch('');
            setSearchResults([]);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const getSender = (loggedUser, participants) => {
        return participants[0]._id === loggedUser.id ? participants[1] : participants[0];
    };

    const handleDeleteClick = (e, chat) => {
        e.stopPropagation();
        setDeleteConfirmation({
            isOpen: true,
            chatId: chat._id,
            chatName: getSender(user, chat.participants)?.name || 'this conversation'
        });
    };

    const handleAvatarClick = (e, username) => {
        e.stopPropagation();
        if (username) {
            navigate(`/user/${username}`);
        }
    };

    const confirmDelete = async () => {
        if (!deleteConfirmation.chatId) return;

        const conversationId = deleteConfirmation.chatId;
        try {
            const res = await fetch(`${API_URL}/api/chat/conversations/${conversationId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${user.token}` }
            });

            if (res.ok) {
                setConversations(conversations.filter(c => c._id !== conversationId));
                if (selectedChat?._id === conversationId) {
                    setSelectedChat(null);
                }
            }
        } catch (error) {
            console.error("Failed to delete conversation", error);
        } finally {
            setDeleteConfirmation({ isOpen: false, chatId: null, chatName: '' });
        }
    };

    const cancelDelete = () => {
        setDeleteConfirmation({ isOpen: false, chatId: null, chatName: '' });
    };

    const handleDeleteConversation = async (conversationId) => {
        if (!window.confirm("Are you sure you want to delete this conversation?")) return;
        try {
            const res = await fetch(`${API_URL}/api/chat/conversations/${conversationId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${user.token}` }
            });

            if (res.ok) {
                setConversations(conversations.filter(c => c._id !== conversationId));
                if (selectedChat?._id === conversationId) {
                    setSelectedChat(null);
                }
            }
        } catch (error) {
            console.error("Failed to delete conversation", error);
        }
    };

    return (
        <div className="w-full flex flex-col h-full">
            <div className="p-4 space-y-4">
                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={search}
                        onChange={handleSearch}
                        className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500/50 transition-all text-sm"
                    />
                </div>

                {/* Tabs */}
                <div className="flex p-1 bg-white/5 rounded-xl border border-white/5">
                    <button
                        onClick={() => setActiveTab('primary')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'primary'
                            ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/20'
                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                            }`}
                    >
                        <MessageCircle size={16} />
                        Primary
                    </button>
                    <button
                        onClick={() => setActiveTab('requests')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'requests'
                            ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/20'
                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                            }`}
                    >
                        <Clock size={16} />
                        Requests
                        {messageRequests.length > 0 && (
                            <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                                {messageRequests.length}
                            </span>
                        )}
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto">
                {search ? (
                    // Search Results
                    <div className="p-2">
                        {loading ? <div className="text-white text-center p-4">Loading...</div> : (
                            searchResults.map((u) => (
                                <div
                                    key={u._id}
                                    onClick={() => accessChat(u._id)}
                                    className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-lg cursor-pointer transition-colors"
                                >
                                    <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                                        {u.name[0]}
                                    </div>
                                    <div>
                                        <h3 className="text-white font-medium">{u.name}</h3>
                                        <p className="text-gray-400 text-sm">@{u.username}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                ) : activeTab === 'primary' ? (
                    // Primary Conversation List
                    <div className="p-2 space-y-1">
                        {conversations.length === 0 ? (
                            <div className="text-center py-8 text-gray-500 text-sm">
                                <p>No discussions yet</p>
                                <p className="text-xs mt-1">Start chatting with connections!</p>
                            </div>
                        ) : (
                            conversations.map((chat) => {
                                const otherUser = getSender(user, chat.participants);
                                const isSelected = selectedChat?._id === chat._id;

                                return (
                                    <div
                                        key={chat._id}
                                        onClick={() => setSelectedChat(chat)}
                                        className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all group relative ${isSelected ? 'bg-purple-600/20 border border-purple-500/30' : 'hover:bg-white/5 border border-transparent'
                                            }`}
                                    >
                                        <div
                                            className="relative cursor-pointer hover:scale-105 transition-transform"
                                            onClick={(e) => handleAvatarClick(e, otherUser?.username)}
                                        >
                                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg overflow-hidden">
                                                {otherUser?.profilePicture ? (
                                                    <img src={otherUser.profilePicture} alt={otherUser.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    otherUser?.name[0]
                                                )}
                                            </div>
                                            {chat.unreadCounts?.[user.id] > 0 && (
                                                <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center border-2 border-[#1a1a1a]">
                                                    <span className="text-[10px] text-black font-bold">{chat.unreadCounts[user.id]}</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-baseline mb-1">
                                                <h3 className={`font-medium truncate ${isSelected ? 'text-purple-300' : 'text-white'}`}>
                                                    {otherUser?.name}
                                                </h3>
                                                {chat.lastMessage && (
                                                    <span className="text-[10px] text-gray-500">
                                                        {new Date(chat.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                )}
                                            </div>
                                            {chat.lastMessage && (
                                                <p className={`text-xs truncate ${chat.unreadCounts?.[user.id] > 0 ? 'text-white font-medium' : 'text-gray-400'
                                                    }`}>
                                                    {chat.lastMessage.sender === user.id ? 'You: ' : ''}{chat.lastMessage.text}
                                                </p>
                                            )}

                                        </div>

                                        {/* Delete Button */}
                                        <button
                                            onClick={(e) => handleDeleteClick(e, chat)}
                                            className="absolute right-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-500/10 transition-all bg-[#0a0a0a] rounded-full shadow-lg border border-white/10 z-10"
                                            title="Delete conversation"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                );
                            })
                        )}
                    </div>
                ) : (
                    // Requests List
                    <div className="p-2 space-y-2">
                        {messageRequests.length === 0 ? (
                            <div className="text-center py-8 text-gray-500 text-sm">
                                <p>No pending requests</p>
                            </div>
                        ) : (
                            messageRequests.map((request) => (
                                <MessageRequestCard
                                    key={request._id}
                                    request={request}
                                    onStatusUpdate={() => {
                                        fetchMessageRequests();
                                        fetchConversations(); // Refresh primary list if accepted
                                    }}
                                    onSelect={(req) => {
                                        // Optional: Preview request in main window
                                        // For now just expanding/contracting in place or doing nothing
                                        console.log('Selected request:', req);
                                    }}
                                />
                            ))
                        )}
                    </div>
                )}
            </div>

            {/* Custom Delete Confirmation Modal */}
            {deleteConfirmation.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl w-full max-w-sm p-6 shadow-2xl transform scale-100 animate-in zoom-in-95 duration-200">
                        <div className="flex flex-col items-center text-center space-y-4">
                            <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 mb-2">
                                <AlertTriangle size={24} />
                            </div>

                            <h3 className="text-xl font-bold text-white">Delete Conversation?</h3>

                            <p className="text-gray-400 text-sm">
                                Are you sure you want to delete your conversation with <span className="text-white font-medium">{deleteConfirmation.chatName}</span>?
                                <br />This action cannot be undone.
                            </p>

                            <div className="flex gap-3 w-full mt-6">
                                <button
                                    onClick={cancelDelete}
                                    className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 text-white hover:bg-white/10 border border-white/5 transition-all text-sm font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-900/20 transition-all text-sm font-medium"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
