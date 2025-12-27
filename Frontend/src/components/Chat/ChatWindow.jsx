import React, { useEffect, useState, useRef } from "react";
import { socket } from "../../socket/socket.js";
import { useAuth } from "../../context/AuthContext";
import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";
import { MoreVertical, Phone, Video, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";

import { API_URL } from "../../config";
import { Ban, Check, X, ShieldAlert, Clock } from 'lucide-react';
import { checkMessageRequestStatus, acceptMessageRequest, rejectMessageRequest } from '../../services/messageRequestService';

import { useNavigate } from 'react-router-dom';

export default function ChatWindow({ conversation, fetchConversations, onBack }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [typingUser, setTypingUser] = useState(null);
  const messagesEndRef = useRef(null);
  const [requestStatus, setRequestStatus] = useState(null);

  const otherUser = conversation.participants?.find(p => p._id !== user.id) || conversation.participants?.[0]; // Fallback for safety

  const handleProfileClick = () => {
    if (otherUser?.username) {
      navigate(`/user/${otherUser.username}`);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
  };

  // Auto-scroll on messages update
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await fetch(`${API_URL}/api/chat/messages/${conversation._id}`, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        const data = await res.json();
        setMessages(data);
        // scrollToBottom(); // Removed here, satisfied by the new useEffect

        // Initial Join
        console.log("DEBUG: Initial Join Chat Room", conversation._id);
        socket.emit("join_chat", conversation._id);

      } catch (error) {
        console.error(error);
      }
    };

    const fetchStatus = async () => {
      if (otherUser) {
        try {
          const status = await checkMessageRequestStatus(otherUser._id);
          setRequestStatus(status);
        } catch (error) {
          console.error("Error checking request status:", error);
        }
      }
    };

    if (conversation) {
      fetchMessages();
      fetchStatus();
    }

    // Re-join on Reconnect
    const onConnect = () => {
      console.log("DEBUG: Socket Reconnected -> Re-joining Chat Room", conversation._id);
      socket.emit("join_chat", conversation._id);
    };

    socket.on("connect", onConnect);

    return () => {
      socket.off("connect", onConnect);
    };
  }, [conversation, user.token, otherUser?._id]);

  // Determine effective status from props or fetched state
  const effectiveRequest = conversation.existingRequest || (requestStatus?.hasRequest ? requestStatus : null);
  const isPending = effectiveRequest?.status === 'pending';
  const isRejected = effectiveRequest?.status === 'rejected';

  // Determine if I am the sender of the request
  const isSender = effectiveRequest?.senderId === user.id || effectiveRequest?.isSender;

  // Handle Accept
  const handleAcceptRequest = async () => {
    try {
      const reqId = effectiveRequest?._id || effectiveRequest?.requestId;
      if (reqId) {
        await acceptMessageRequest(reqId);
        toast.success("Request accepted");
        // Update local state to unlock UI immediately
        setRequestStatus({ hasRequest: true, status: 'accepted' });
        fetchConversations();
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to accept request");
    }
  };

  // Handle Reject
  const handleRejectRequest = async () => {
    try {
      const reqId = effectiveRequest?._id || effectiveRequest?.requestId;
      if (reqId) {
        await rejectMessageRequest(reqId);
        toast.success("Request rejected");
        setRequestStatus({ hasRequest: true, status: 'rejected' });
        fetchConversations();
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to reject request");
    }
  };

  const sendMessage = async (text, files = []) => {
    try {
      const formData = new FormData();
      formData.append('conversationId', conversation._id);

      // Add connectionId if available
      if (conversation.connectionId) {
        formData.append('connectionId', conversation.connectionId);
      }

      if (text) formData.append('text', text);

      // Append files
      files.forEach(file => {
        formData.append('files', file);
      });

      const res = await fetch(`${API_URL}/api/chat/messages`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${user.token}`,
          // Don't set Content-Type, browser will set it with boundary for FormData
        },
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        toast.error(errorData.message || 'Failed to send message');
        return;
      }

      const data = await res.json();

      // Optimistic/Immediate Update: Ensure send is visible, but check if socket beat us to it
      setMessages((prev) => {
        if (prev.some(msg => msg._id === data._id)) {
          console.log("DEBUG: Message already added via socket, skipping manual add.");
          return prev;
        }
        return [...prev, data];
      });
      scrollToBottom();
      fetchConversations(); // Update sidebar

      // We still rely on socket for *other* participants, 
      // and checking for duplicates in the listener protects this optimistic add.
    } catch (error) {
      console.error(error);
    }
  };

  // Socket listeners
  useEffect(() => {
    socket.on("message_received", (newMessage) => {
      console.log("DEBUG: ChatWindow RAW socket event:", newMessage);
      console.log(`DEBUG: ID CHECK -> Current Conv: ${conversation._id} (Type: ${typeof conversation._id}) | New Msg Conv: ${newMessage.conversationId} (Type: ${typeof newMessage.conversationId})`);

      const currentConvId = conversation._id.toString();
      const msgConvId = newMessage.conversationId.toString(); // Handle if it's an objectId or string

      if (currentConvId === msgConvId) {
        console.log("DEBUG: Conversation ID MATCH. Processing message...");
        setMessages((prev) => {
          // Deduplication: Don't add if we already have this message ID
          if (prev.some(msg => msg._id === newMessage._id)) {
            console.log("DEBUG: Duplicate message ignored", newMessage._id);
            return prev;
          }
          console.log("DEBUG: Adding new message to state");
          return [...prev, newMessage];
        });
        scrollToBottom();
      } else {
        console.log("DEBUG: Conversation ID MISMATCH. Ignored.");
      }
    });

    socket.on("typing", () => setTypingUser(true));
    socket.on("stop_typing", () => setTypingUser(false));

    socket.on("message_deleted", (data) => {
      console.log("DEBUG: Message deleted event:", data);
      if (data.conversationId === conversation._id) {
        setMessages((prev) => prev.filter(msg => msg._id !== data.messageId));
      }
    });

    return () => {
      socket.off("message_received");
      socket.off("typing");
      socket.off("stop_typing");
      socket.off("message_deleted");
    };
  }, [conversation]);

  const handleDeleteMessage = async (messageId) => {
    try {
      const res = await fetch(`${API_URL}/api/chat/messages/${messageId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      if (res.ok) {
        // Optimistically remove from UI
        setMessages((prev) => prev.filter(msg => msg._id !== messageId));
        toast.success("Message deleted");
      } else {
        toast.error("Failed to delete message");
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete message");
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full w-full">
      {/* Header */}
      <div className="p-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="md:hidden text-gray-400 hover:text-white">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div
            onClick={handleProfileClick}
            className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold cursor-pointer hover:opacity-80 transition-opacity overflow-hidden"
          >
            {otherUser?.profilePicture ? (
              <img src={otherUser.profilePicture} alt={otherUser.name} className="w-full h-full object-cover" />
            ) : (
              otherUser?.name?.[0]
            )}
          </div>
          <div onClick={handleProfileClick} className="cursor-pointer hover:opacity-80 transition-opacity">
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
        {/* Connection Status Banner */}
        {isPending && (
          <div className="mx-auto max-w-md my-4 p-4 bg-white/5 border border-purple-500/30 rounded-xl text-center">
            {isSender ? (
              <div className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
                  <Clock className="text-gray-400" size={20} />
                </div>
                <p className="text-white font-medium">Request Pending</p>
                <p className="text-sm text-gray-400">
                  You sent a message request. You can send more messages once they accept.
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center">
                  <ShieldAlert className="text-purple-400" size={20} />
                </div>
                <div>
                  <p className="text-white font-medium mb-1">Message Request</p>
                  <p className="text-sm text-gray-400">
                    {otherUser?.name} wants to connect with you.
                  </p>
                </div>
                <div className="flex gap-3 w-full">
                  <button
                    onClick={handleAcceptRequest}
                    className="flex-1 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-medium transition-colors text-sm flex items-center justify-center gap-2"
                  >
                    <Check size={16} /> Accept
                  </button>
                  <button
                    onClick={handleRejectRequest}
                    className="flex-1 py-2 bg-white/5 hover:bg-red-500/20 text-gray-300 hover:text-red-400 border border-white/10 hover:border-red-500/30 rounded-lg font-medium transition-colors text-sm flex items-center justify-center gap-2"
                  >
                    <X size={16} /> Reject
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {isRejected && (
          <div className="mx-auto max-w-md my-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-center">
            <p className="text-red-400 font-medium flex items-center justify-center gap-2">
              <Ban size={16} />
              Message Request Rejected
            </p>
          </div>
        )}

        {messages.map((msg, index) => {
          // Handle both populated sender object (from backend emit/populate) and flat senderId string
          const msgSenderId = msg.senderId?._id || msg.senderId || msg.sender?._id || msg.sender;
          const currentUserId = user.id || user._id; // Robustly get user ID
          const isMine = msgSenderId?.toString() === currentUserId?.toString();

          // Debug only if it mismatches what we expect
          // if (index === messages.length - 1) console.log("DEBUG: Alignment Check", { msgSenderId, currentUserId, isMine });

          return (
            <MessageBubble
              key={index}
              message={msg}
              isMine={isMine}
              onDelete={() => handleDeleteMessage(msg._id)}
            />
          );
        })}
        {typingUser && <div className="text-gray-400 text-sm italic ml-4">Typing...</div>}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4">
        <MessageInput
          onSendMessage={sendMessage}
          disabled={
            (isPending && isSender) || isRejected
          }
        />
      </div>
    </div>
  );
}
