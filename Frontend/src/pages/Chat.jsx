import React, { useEffect, useState } from "react";
import { socket } from "../socket/socket";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/Chat/Sidebar";
import ChatWindow from "../components/Chat/ChatWindow";
import { Link } from 'react-router-dom';
import { MessageSquare, ArrowLeft } from "lucide-react";

import { API_URL } from "../config";

export default function Chat() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);

  const fetchConversations = async () => {
    try {
      const res = await fetch(`${API_URL}/api/chat/conversations`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      const data = await res.json();
      setConversations(data);
    } catch (error) {
      console.error("Failed to fetch conversations", error);
    }
  };

  useEffect(() => {
    if (!user) return;
    socket.connect();
    socket.emit("setup", { userId: user.id });
    socket.on("connected", () => console.log("Connected to socket"));
    fetchConversations();

    return () => {
      socket.disconnect();
    };
  }, [user]);

  if (!user) return <div className="p-4 text-white">Please log in to chat.</div>;

  return (
    <div className="flex h-screen bg-black text-white overflow-hidden relative">
      {/* Back Button */}
      <Link
        to="/"
        className="absolute top-4 left-4 z-50 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
      >
        <ArrowLeft className="w-6 h-6" />
      </Link>

      <div className={`w-full md:w-1/3 h-full ${selectedChat ? 'hidden md:flex' : 'flex'}`}>
        <Sidebar
          conversations={conversations}
          setConversations={setConversations}
          selectedChat={selectedChat}
          setSelectedChat={setSelectedChat}
          fetchConversations={fetchConversations}
        />
      </div>

      <div className={`w-full md:w-2/3 h-full ${!selectedChat ? 'hidden md:flex' : 'flex'}`}>
        {selectedChat ? (
          <ChatWindow
            conversation={selectedChat}
            fetchConversations={fetchConversations}
            onBack={() => setSelectedChat(null)}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center bg-white/5 text-center p-8 w-full">
            <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mb-6 animate-pulse">
              <MessageSquare className="w-10 h-10 text-purple-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Your Messages</h2>
            <p className="text-gray-400 max-w-md">
              Send private photos and messages to a friend or group.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
