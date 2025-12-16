import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, LogOut, User, ArrowRight, Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const { unreadCount, enableNotifications } = useNotification();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Opportunities', path: '/opportunities' },
    { name: 'Chat', path: '/chat' },
  ];

  return (
    <nav className="absolute top-0 w-full z-50  border-b border-white/5 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">

          {/* Logo */}
          <Link to="/" className="text-2xl font-bold tracking-tighter text-white flex items-center gap-2 group">
            <div className="w-8 h-8 bg-gradient-to-tr from-purple-600 to-blue-600 rounded-lg flex items-center justify-center transform group-hover:rotate-12 transition-transform">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <span>Star<span className="text-gray-400">Cop</span></span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`text-sm font-medium transition-colors hover:text-white relative group block px-2 py-1 ${location.pathname === link.path ? 'text-white' : 'text-gray-400'}`}
              >
                {link.name}
                {location.pathname === link.path && (
                  <motion.div
                    layoutId="underline"
                    className="absolute -bottom-1 left-0 w-full h-0.5 bg-purple-500"
                  />
                )}
              </Link>
            ))}

            {/* Dynamic Dashboard Link */}
            {user && (
              <Link
                to={user.accountType === 'investor' ? '/investor-dashboard' : '/dashboard'}
                className={`text-sm font-medium transition-colors hover:text-white relative group block px-2 py-1 ${location.pathname.includes('dashboard') ? 'text-white' : 'text-gray-400'}`}
              >
                Dashboard
                {location.pathname.includes('dashboard') && (
                  <motion.div
                    layoutId="underline"
                    className="absolute -bottom-1 left-0 w-full h-0.5 bg-purple-500"
                  />
                )}
              </Link>
            )}
          </div>

          {/* Desktop Buttons */}
          <div className="hidden md:flex items-center gap-6">
            {user ? (
              <div className="flex items-center gap-4">
                {/* Notifications */}
                <div className="relative group/notif">
                  <Link to="/notifications" className="relative p-2 text-gray-400 hover:text-white transition-colors block">
                    <Bell className="w-6 h-6" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border border-black animate-pulse"></span>
                    )}
                  </Link>
                  {/* Tooltip for enabling notifications */}
                  {("Notification" in window && Notification.permission !== 'granted') && (
                    <button
                      onClick={(e) => { e.preventDefault(); enableNotifications(); }}
                      className="absolute -bottom-8 right-0 w-max px-2 py-1 bg-blue-600 text-white text-[10px] font-bold rounded shadow-lg opacity-0 group-hover/notif:opacity-100 transition-opacity"
                    >
                      Enable Push
                    </button>
                  )}
                </div>

                <Link to="/profile" className="flex items-center gap-3 group cursor-pointer">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-800 to-black border border-white/10 flex items-center justify-center overflow-hidden group-hover:border-purple-500/50 transition-colors">
                    <User className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-400">Welcome back</span>
                    <span className="text-sm font-bold text-white group-hover:text-purple-400 transition-colors">{user.name}</span>
                  </div>
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-500 hover:text-red-500 transition-colors"
                  title="Logout"
                >
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link to="/login" className="text-sm font-bold text-gray-300 hover:text-white transition-colors">
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="px-5 py-2.5 bg-white text-black text-sm font-bold rounded-full hover:bg-purple-500 hover:text-white transition-all flex items-center gap-2 group"
                >
                  Join Now <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="text-white p-2">
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-black/95 border-b border-white/10 overflow-hidden"
          >
            <div className="px-4 py-6 space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className="block text-2xl font-bold text-gray-400 hover:text-white"
                >
                  {link.name}
                </Link>
              ))}
              {user && (
                <Link
                  to="/profile"
                  onClick={() => setIsOpen(false)}
                  className="block text-2xl font-bold text-gray-400 hover:text-white"
                >
                  My Profile
                </Link>
              )}

              <div className="pt-8 border-t border-white/10 flex flex-col gap-4">
                {user ? (
                  <button
                    onClick={() => { handleLogout(); setIsOpen(false); }}
                    className="flex items-center gap-2 text-red-500 font-bold"
                  >
                    <LogOut size={20} /> Logout
                  </button>
                ) : (
                  <>
                    <Link to="/login" onClick={() => setIsOpen(false)} className="block text-center w-full py-4 text-gray-400 font-bold border border-white/20 rounded-xl">Login</Link>
                    <Link to="/signup" onClick={() => setIsOpen(false)} className="block text-center w-full py-4 bg-white text-black font-bold rounded-xl">Sign Up</Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
