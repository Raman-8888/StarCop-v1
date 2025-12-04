import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="w-full bg-white shadow z-50">
      <div className="w-full flex items-center justify-between px-4 sm:px-6 py-4">
        <Link to="/" className="text-xl font-bold text-blue-600">StartupConnect</Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-gray-700 hover:text-blue-600">Home</Link>
          <Link to="/opportunities" className="text-gray-700 hover:text-blue-600">Opportunities</Link>
          <Link to="/chat" className="text-gray-700 hover:text-blue-600">Chat</Link>
          <Link to="/profile" className="text-gray-700 hover:text-blue-600">Profile</Link>
        </div>

        {/* Desktop Buttons */}
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-md">
                  <User className="w-4 h-4 text-blue-600" />
                  <span className="text-gray-700 font-medium">Welcome, {user.name}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 rounded-md border border-red-600 text-red-600 hover:bg-red-50"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="px-4 py-2 rounded-md border border-blue-600 text-blue-600 hover:bg-blue-50">
                Login
              </Link>
              <Link to="/Signup" className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700">
                Signup
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <div className={`md:hidden ${isOpen ? 'block' : 'hidden'}`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <Link to="/" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50">Home</Link>
          <Link to="/opportunities" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50">Opportunities</Link>
          <Link to="/chat" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50">Chat</Link>
          <Link to="/profile" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50">Profile</Link>
        </div>
        <div className="pt-4 pb-3 border-t border-gray-200">
          <div className="px-5 flex flex-col space-y-3">
            {user ? (
              <>
                <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-md">
                  <User className="w-4 h-4 text-blue-600" />
                  <span className="text-gray-700 font-medium">Welcome, {user.name}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center justify-center gap-2 px-4 py-2 text-center rounded-md border border-red-600 text-red-600 hover:bg-red-50"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="px-4 py-2 text-center rounded-md border border-blue-600 text-blue-600 hover:bg-blue-50">
                  Login
                </Link>
                <Link to="/Signup" className="px-4 py-2 text-center rounded-md bg-blue-600 text-white hover:bg-blue-700">
                  Signup
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
