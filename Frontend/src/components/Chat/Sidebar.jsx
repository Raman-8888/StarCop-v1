import React, { useState, useEffect } from 'react';
import { Search, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar({
    conversations,
    setConversations,
    selectedChat,
    setSelectedChat,
    fetchConversations
}) {
    const { user } = useAuth();
    const [search, setSearch] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleSearch = async (e) => {
        setSearch(e.target.value);
        if (!e.target.value) {
            setSearchResults([]);
            return;
        }

        try {
            setLoading(true);
            const res = await fetch(`http://localhost:3002/api/chat/users/search?search=${e.target.value}`, {
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
            const res = await fetch(`http://localhost:3002/api/chat/conversations`, {
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

    return (
        <div className="w-full bg-white/10 border-r border-white/20 flex flex-col h-full">
            <div className="p-4 border-b border-white/20">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={search}
                        onChange={handleSearch}
                        className="w-full pl-10 pr-4 py-2 bg-black/20 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                    />
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
                ) : (
                    // Conversation List
                    <div className="p-2 space-y-1">
                        {conversations.map((chat) => {
                            const otherUser = getSender(user, chat.participants);
                            return (
                                <div
                                    key={chat._id}
                                    onClick={() => setSelectedChat(chat)}
                                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${selectedChat?._id === chat._id ? 'bg-purple-600/20 border border-purple-500/30' : 'hover:bg-white/5'
                                        }`}
                                >
                                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                                        {otherUser?.name[0]}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-baseline mb-1">
                                            <h3 className="text-white font-medium truncate">{otherUser?.name}</h3>
                                            {chat.lastMessage && (
                                                <span className="text-xs text-gray-400">
                                                    {new Date(chat.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            )}
                                        </div>
                                        {chat.lastMessage && (
                                            <p className={`text-sm truncate ${chat.unreadCounts?.[user.id] > 0 ? 'text-white font-semibold' : 'text-gray-400'
                                                }`}>
                                                {chat.lastMessage.sender === user.id ? 'You: ' : ''}{chat.lastMessage.text}
                                            </p>
                                        )}
                                    </div>
                                    {chat.unreadCounts?.[user.id] > 0 && (
                                        <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                                            <span className="text-xs text-black font-bold">{chat.unreadCounts[user.id]}</span>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
