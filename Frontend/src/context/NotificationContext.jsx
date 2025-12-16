import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { socket } from '../socket/socket';
import toast from 'react-hot-toast';
import { API_URL } from '../config';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
    const { user } = useAuth();
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchUnreadCount = async () => {
        const token = localStorage.getItem('token');
        if (!user || !token) return;
        try {
            const res = await axios.get(`${API_URL}/api/notifications/unread-count`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUnreadCount(res.data.count);
        } catch (error) {
            console.error("Error fetching unread count", error);
        }
    };

    const markAsRead = async (id) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;
            await axios.put(`${API_URL}/api/notifications/${id}/read`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Decrement locally for instant feedback
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error("Error marking notification as read", error);
            // Revert or fetch on error?
        }
    };

    // Initial fetch and periodic poll (every 30s)
    // Initial fetch and periodic poll (every 30s)
    useEffect(() => {
        if (user) {
            fetchUnreadCount();

            // Use shared socket connection
            if (!socket.connected) {
                socket.connect();
            }

            // Join user room (aligned with Chat.jsx logic)
            // Join user room (aligned with Chat.jsx logic)
            const userId = user.id || user._id;
            console.log("DEBUG: Emitting setup for user", userId);
            if (userId) {
                socket.emit('setup', { userId });
            }

            // Request Native Notification Permission - Auto request often blocked, better to trigger UI
            console.log("DEBUG: Notification Permission Status:", Notification.permission);

            const handleNotification = (data) => {
                console.log("DEBUG: Notification received", data);

                // 1. Toast (In-App)
                toast.success(data.message, {
                    icon: '🔔',
                    duration: 5000
                });

                // 2. Native Notification (System)
                if ("Notification" in window && Notification.permission === "granted") {
                    // ... (rest is same)
                    const notification = new Notification("StarCop Notification", {
                        body: data.message,
                        icon: '/vite.svg', // Ensure this path is correct
                        silent: false
                    });

                    notification.onclick = function () {
                        window.focus();
                        notification.close();
                    };

                    // Auto close after 5 seconds
                    setTimeout(() => notification.close(), 5000);
                }

                setUnreadCount(prev => prev + 1);
            };

            socket.on('notification', handleNotification);

            // Listen for new messages
            const handleNewMessage = (newMessageRecieved) => {
                const senderId = newMessageRecieved.sender._id || newMessageRecieved.sender;
                const userId = user.id || user._id;

                // Don't notify if I sent it
                if (senderId === userId) return;

                console.log("DEBUG: Message received", newMessageRecieved);
                const senderName = newMessageRecieved.sender?.name || "Someone";
                const content = newMessageRecieved.content || "Sent an image";

                // Native Notification Logic
                if ("Notification" in window && Notification.permission === "granted") {
                    const notification = new Notification(`Message from ${senderName}`, {
                        body: content.substring(0, 50) + (content.length > 50 ? '...' : ''),
                        icon: '/vite.svg',
                        silent: false
                    });

                    notification.onclick = function () {
                        window.focus();
                        notification.close();
                    };
                    setTimeout(() => notification.close(), 5000);
                }

                // Toast Notification
                toast((t) => (
                    <span className="flex items-center gap-2">
                        <b>{senderName}:</b> {content.substring(0, 30)}...
                    </span>
                ), { icon: '💬' });
            };

            socket.on('message_received', handleNewMessage);

            const interval = setInterval(fetchUnreadCount, 30000);
            return () => {
                clearInterval(interval);
                socket.off('notification', handleNotification);
                socket.off('message_received', handleNewMessage);
                // We do NOT disconnect here as Chat might need it, 
                // OR we disconnect only if we are sure no one else is using it?
                // Ideally, we disconnect on logout. 
                // Since this provider is at App level, unmounting means App is closing or user logging out.
                // So disconnecting is fine.
                socket.disconnect();
            };
        } else {
            setUnreadCount(0);
        }
    }, [user]);

    const enableNotifications = async () => {
        if (!("Notification" in window)) {
            toast.error("This browser does not support desktop notifications.");
            return;
        }
        if (Notification.permission === 'granted') {
            toast.success("Notifications already enabled!");
            new Notification("Test Notification", { body: "This is how you'll be notified!" });
            return;
        }

        const result = await Notification.requestPermission();
        if (result === 'granted') {
            toast.success("Notifications enabled!");
            new Notification("You're all set!", { body: "You will now receive desktop notifications." });
        } else {
            toast.error("Permission denied. Check browser settings.");
        }
    };

    return (
        <NotificationContext.Provider value={{ unreadCount, fetchUnreadCount, markAsRead, setUnreadCount, enableNotifications }}>
            {children}
        </NotificationContext.Provider>
    );
};
