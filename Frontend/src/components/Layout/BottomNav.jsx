import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, MessageCircle, Handshake, Bell, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { motion } from 'framer-motion';

const BottomNav = ({ onSearchOpen, onNotificationOpen }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    const { unreadCount } = useNotification();

    const isActive = (path) => location.pathname === path;

    const navItems = [
        {
            key: 'search',
            icon: Search,
            onClick: onSearchOpen,
            active: false
        },
        {
            key: 'chat',
            icon: MessageCircle,
            onClick: () => navigate('/chat'),
            active: isActive('/chat')
        },
        {
            key: 'opportunities',
            icon: Handshake,
            onClick: () => navigate('/opportunities'),
            active: isActive('/opportunities')
        },
        {
            key: 'notifications',
            icon: Bell,
            onClick: () => {
                navigate('/notifications');
                // Or open modal if we prefer, but page is fine for now
            },
            active: isActive('/notifications'),
            badge: unreadCount
        },
        {
            key: 'profile',
            icon: null, // Custom render for avatar
            onClick: () => navigate('/profile'),
            active: isActive('/profile')
        }
    ];

    if (!user) return null;

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-t border-white/10 pb-safe">
            <div className="flex justify-around items-center h-16 px-2">
                {navItems.map((item) => (
                    <button
                        key={item.key}
                        onClick={item.onClick}
                        className="relative p-3 transition-transform active:scale-95"
                    >
                        {item.key === 'profile' ? (
                            <div className={`w-7 h-7 rounded-full overflow-hidden border-2 ${item.active ? 'border-white' : 'border-transparent'}`}>
                                {user.profilePicture ? (
                                    <img src={user.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <User className={`w-full h-full p-1 bg-gray-800 ${item.active ? 'text-white' : 'text-gray-400'}`} />
                                )}
                            </div>
                        ) : (
                            <>
                                <item.icon
                                    size={28}
                                    className={`${item.active ? 'text-white fill-white' : 'text-gray-400'} transition-colors`}
                                    strokeWidth={item.active ? 2.5 : 2}
                                />
                                {item.badge > 0 && (
                                    <span className="absolute top-2 right-2 w-4 h-4 bg-red-500 rounded-full text-[10px] flex items-center justify-center text-white border border-black font-bold">
                                        {item.badge}
                                    </span>
                                )}
                            </>
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default BottomNav;
