import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff, Lock, Mail, User, AtSign, Briefcase, TrendingUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { API_URL } from '../config';
import LoginScene3D from '../components/3d/LoginScene3D';

export default function Signup() {
    const [fullName, setFullName] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [accountType, setAccountType] = useState('startup'); // Default to startup
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError("Passwords don't match!");
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters long');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/api/auth/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name: fullName, username, email, password, accountType }),
            });

            const data = await response.json();

            if (data.success) {
                login({
                    id: data.user.id,
                    name: data.user.name,
                    username: data.user.username,
                    email: data.user.email,
                    token: data.token,
                    accountType: data.user.accountType
                });

                if (data.user.accountType === 'startup') {
                    navigate('/complete-profile/startup');
                } else {
                    navigate('/complete-profile/investor');
                }
            } else {
                setError(data.error || data.message || 'Signup failed');
            }
        } catch (error) {
            console.error('Signup error:', error);
            setError('Failed to connect to server. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden font-sans">
            {/* 3D Background */}
            <LoginScene3D />

            {/* Back to Home Button */}


            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative z-20 w-full max-w-lg"
            >
                <div className="backdrop-blur-xl bg-white/5 rounded-3xl border border-white/10 p-6 md:p-8 shadow-2xl">

                    <div className="text-center mb-6">
                        <h1 className="text-3xl font-bold mb-2 tracking-tight">Create Account</h1>
                        <p className="text-gray-400 text-sm">Join the network of the future.</p>
                    </div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs text-center font-medium"
                        >
                            {error}
                        </motion.div>
                    )}

                    <div className="flex gap-3 mb-6">
                        <button
                            type="button"
                            onClick={() => setAccountType('startup')}
                            className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${accountType === 'startup'
                                ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/20'
                                : 'bg-black/40 text-gray-400 border border-white/10 hover:bg-white/5'
                                }`}
                        >
                            <Briefcase size={14} /> I am a Startup
                        </button>
                        <button
                            type="button"
                            onClick={() => setAccountType('investor')}
                            className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${accountType === 'investor'
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
                                : 'bg-black/40 text-gray-400 border border-white/10 hover:bg-white/5'
                                }`}
                        >
                            <TrendingUp size={14} /> I am an Investor
                        </button>
                    </div>

                    <form className="space-y-3" onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold uppercase tracking-wide text-gray-500 ml-1">Full Name</label>
                                <div className="relative group">
                                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 group-focus-within:text-purple-400 transition-colors w-4 h-4" />
                                    <input
                                        type="text"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        placeholder="John Doe"
                                        className="w-full pl-10 pr-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white text-sm placeholder-gray-600 focus:outline-none focus:border-purple-500 transition-all"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold uppercase tracking-wide text-gray-500 ml-1">Username</label>
                                <div className="relative group">
                                    <AtSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 group-focus-within:text-purple-400 transition-colors w-4 h-4" />
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        placeholder="johndoe"
                                        className="w-full pl-10 pr-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white text-sm placeholder-gray-600 focus:outline-none focus:border-purple-500 transition-all"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase tracking-wide text-gray-500 ml-1">Email</label>
                            <div className="relative group">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 group-focus-within:text-purple-400 transition-colors w-4 h-4" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="name@example.com"
                                    className="w-full pl-10 pr-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white text-sm placeholder-gray-600 focus:outline-none focus:border-purple-500 transition-all"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase tracking-wide text-gray-500 ml-1">Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 group-focus-within:text-purple-400 transition-colors w-4 h-4" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Create a password"
                                    className="w-full pl-10 pr-10 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white text-sm placeholder-gray-600 focus:outline-none focus:border-purple-500 transition-all"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-white"
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase tracking-wide text-gray-500 ml-1">Confirm Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 group-focus-within:text-purple-400 transition-colors w-4 h-4" />
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Confirm password"
                                    className="w-full pl-10 pr-10 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white text-sm placeholder-gray-600 focus:outline-none focus:border-purple-500 transition-all"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-white"
                                >
                                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3.5 bg-white text-black font-bold text-base rounded-xl hover:bg-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                        >
                            {loading ? 'Creating Account...' : 'Sign Up'}
                        </button>
                    </form>

                    <div className="mt-5 text-center text-gray-500 text-xs">
                        Already have an account?{' '}
                        <Link to="/login" className="text-white font-bold hover:text-purple-400 transition-colors">
                            Sign In
                        </Link>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
