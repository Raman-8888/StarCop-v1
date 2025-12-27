import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, LogOut, User, ArrowRight, Bell, Search, Users } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { motion, AnimatePresence } from 'framer-motion';
import GlobalSearchModal from '../GlobalSearchModal';
import ConnectionsModal from '../ConnectionsModal';

import MobileTopBar from './MobileTopBar';
import BottomNav from './BottomNav';

const Navbar = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isConnectionsOpen, setIsConnectionsOpen] = useState(false);
  const { user, logout } = useAuth();
  const { unreadCount } = useNotification();
  const location = useLocation();
  const navigate = useNavigate();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Opportunities', path: '/opportunities' },
    { name: 'Dashboard', path: user?.accountType === 'startup' ? '/dashboard' : '/investor-dashboard' },
    { name: 'Chat', path: '/chat' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // If on login/signup/chat pages, you might want to hide navbar, but for now we follow global rules
  // The user requested specific mobile UI.

  return (
    <>
      {/* --- DESKTOP NAVBAR --- */}
      <nav className="absolute top-0 w-full z-50 transition-all duration-300 hidden md:flex">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link to="/" className="flex-shrink-0 group">
              <h1 className="text-2xl font-bold tracking-tighter text-white group-hover:text-purple-400 transition-colors">
                STARCOP<span className="text-purple-500">.</span>
              </h1>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-8">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.path}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 relative ${location.pathname === link.path
                      ? 'text-white'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                      }`}
                  >
                    {link.name}
                    {location.pathname === link.path && (
                      <motion.div
                        layoutId="navbar-indicator"
                        className="absolute bottom-0 left-0 w-full h-0.5 bg-purple-500"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                  </Link>
                ))}
              </div>
            </div>

            {/* Right Side Actions */}
            <div className="hidden md:flex items-center gap-6">
              {user ? (
                <>
                  <button
                    onClick={() => setIsSearchOpen(true)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <Search size={20} />
                  </button>

                  <button
                    onClick={() => setIsConnectionsOpen(true)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <Users size={20} />
                  </button>

                  <Link to="/notifications" className="text-gray-400 hover:text-white transition-colors relative">
                    <Bell size={20} />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
                    )}
                  </Link>

                  {/* User Profile Dropdown / Link */}
                  <Link to="/profile" className="flex items-center gap-3 pl-6 border-l border-white/10 group">
                    <div className="text-right hidden lg:block">
                      <p className="text-sm font-bold text-white group-hover:text-purple-400 transition-colors">{user.name}</p>
                      <p className="text-xs text-gray-500 uppercase tracking-wider">{user.accountType}</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-white/10 flex items-center justify-center overflow-hidden">
                      {user.profilePicture ? (
                        <img src={user.profilePicture} alt={user.name} className="w-full h-full object-cover" />
                      ) : (
                        <User className="text-purple-400" size={20} />
                      )}
                    </div>
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                    title="Logout"
                  >
                    <LogOut size={20} />
                  </button>
                </>
              ) : (
                <div className="flex items-center gap-4">
                  <Link to="/login" className="text-sm font-bold text-gray-400 hover:text-white transition-colors">
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="px-5 py-2.5 bg-white text-black text-sm font-bold rounded-full hover:bg-gray-200 transition-transform hover:scale-105 flex items-center gap-2 group"
                  >
                    Join Now <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* --- MOBILE LAYOUT --- */}
      {/* Mobile Top Bar */}
      <MobileTopBar onConnectionsOpen={() => setIsConnectionsOpen(true)} />

      {/* Mobile Bottom Nav */}
      <BottomNav onSearchOpen={() => setIsSearchOpen(true)} />


      {/* Search Modal (Shared) */}
      <GlobalSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {/* Connections Modal (Shared) */}
      <ConnectionsModal
        isOpen={isConnectionsOpen}
        onClose={() => setIsConnectionsOpen(false)}
        userId={user?.id}
      />
    </>
  );
};

export default Navbar;
