import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, LogOut, Home } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const MobileTopBar = ({ onConnectionsOpen }) => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const handleLogout = () => {
        if (window.confirm('Are you sure you want to log out?')) {
            logout();
            navigate('/login');
        }
    };

    if (!user) return null;

    return (
        <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/10 pt-safe">
            <div className="flex justify-between items-center h-16 px-4">
                {/* Home */}
                <button
                    onClick={() => navigate('/')}
                    className="p-2 text-white hover:bg-white/10 rounded-full transition-colors"
                >
                    <Home size={24} />
                </button>

                {/* Left: Dashboard */}
                <button
                    onClick={() => navigate(user.accountType === 'startup' ? '/dashboard' : '/investor-dashboard')}
                    className="p-2 text-white hover:bg-white/10 rounded-full transition-colors"
                >
                    <LayoutDashboard size={24} />
                </button>

                {/* Center: Connections */}
                <button
                    onClick={onConnectionsOpen}
                    className="p-2 text-white hover:bg-white/10 rounded-full transition-colors"
                >
                    <div className="relative">
                        <Users size={24} />
                        {/* Optional: Add badge if we track new connections */}
                    </div>
                </button>

                {/* Right: Logout */}
                <button
                    onClick={handleLogout}
                    className="p-2 text-red-500 hover:bg-red-500/10 rounded-full transition-colors"
                >
                    <LogOut size={24} />
                </button>
            </div>
        </div>
    );
};

export default MobileTopBar;
