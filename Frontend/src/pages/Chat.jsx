import React, { useEffect, useState } from "react";
import { socket } from "../socket/socket";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/Chat/Sidebar";
import ChatWindow from "../components/Chat/ChatWindow";
import UnauthorizedModal from "../components/UnauthorizedModal";
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { MessageSquare, ArrowLeft } from "lucide-react";

import { API_URL } from "../config";

export default function Chat() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);

  const fetchConversations = async () => {
    try {
      const res = await fetch(`${API_URL}/api/chat/conversations`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      const data = await res.json();


      // Handle new response structure { primary: [], requests: [] }
      const conversationList = data.primary || (Array.isArray(data) ? data : []);
      setConversations(conversationList);

      // Check for auto-select from navigation state
      if (location.state?.selectedConversation) {
        const targetConfig = location.state.selectedConversation;
        // Verify it exists in the list or use the passed object directly
        const found = conversationList.find(c => c._id === targetConfig._id);
        setSelectedChat(found || targetConfig);
        // Optional: Clear state so refresh doesn't re-trigger? 
        // Browser history state persists, so it might re-trigger on reload, which is fine.
        window.history.replaceState({}, document.title);
      }
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
      // Don't disconnect, just cleanup listeners if needed (socket.off)
      // socket.disconnect(); 
    };
  }, [user]);

  if (!user) return <UnauthorizedModal isOpen={true} onClose={() => navigate('/')} message="Please log in to access the chat." title="Chat Access Required" />;

  return (
    <div className="flex md:h-screen h-[calc(100dvh-8rem)] text-white overflow-hidden relative md:pt-20">
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
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 w-full">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6 animate-pulse">
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
