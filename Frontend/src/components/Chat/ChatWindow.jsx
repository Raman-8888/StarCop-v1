import React, { useEffect, useState, useRef } from "react";
import { socket } from "../../socket/socket.js";
import { useAuth } from "../../context/AuthContext";
import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";
import { MoreVertical, Phone, Video, ArrowLeft } from "lucide-react";

export default function ChatWindow({ conversation, fetchConversations, onBack }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [typingUser, setTypingUser] = useState(null);
  const messagesEndRef = useRef(null);

  const otherUser = conversation.participants.find(p => p._id !== user.id);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Fetch messages
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await fetch(`http://localhost:3002/api/chat/messages/${conversation._id}`, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        const data = await res.json();
        setMessages(data);
        scrollToBottom();
        socket.emit("join_chat", conversation._id);
      } catch (error) {
        console.error(error);
      }
    };

    if (conversation) fetchMessages();
  }, [conversation, user.token]);

  // Socket listeners
  useEffect(() => {
    socket.on("message_received", (newMessage) => {
      if (conversation._id === newMessage.conversationId) {
        setMessages((prev) => [...prev, newMessage]);
        scrollToBottom();
      }
    });

    socket.on("typing", () => setTypingUser(true));
    socket.on("stop_typing", () => setTypingUser(false));

    return () => {
      socket.off("message_received");
      socket.off("typing");
      socket.off("stop_typing");
    };
  }, [conversation]);

  const sendMessage = async (text) => {
    try {
      const res = await fetch(`http://localhost:3002/api/chat/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          conversationId: conversation._id,
          text,
        }),
      });
      const data = await res.json();
      socket.emit("new_message", data);
      setMessages([...messages, data]);
      scrollToBottom();
      fetchConversations(); // Update sidebar last message
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-black/20 w-full">
      {/* Header */}
      <div className="p-4 border-b border-white/20 flex justify-between items-center bg-white/5">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="md:hidden text-gray-400 hover:text-white">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
            {otherUser?.name[0]}
          </div>
          <div>
            <h3 className="text-white font-bold">{otherUser?.name}</h3>
            <p className="text-gray-400 text-xs">@{otherUser?.username}</p>
          </div>
        </div>
        <div className="flex gap-4 text-gray-400">
          <Phone className="w-5 h-5 cursor-pointer hover:text-white" />
          <Video className="w-5 h-5 cursor-pointer hover:text-white" />
          <MoreVertical className="w-5 h-5 cursor-pointer hover:text-white" />
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => (
          <MessageBubble
            key={index}
            msg={msg}
            isMine={msg.senderId === user.id}
          />
        ))}
        {typingUser && <div className="text-gray-400 text-sm italic ml-4">Typing...</div>}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-white/5 border-t border-white/20">
        <MessageInput onSendMessage={sendMessage} />
      </div>
    </div>
  );
}
