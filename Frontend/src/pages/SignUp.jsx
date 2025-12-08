import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff, Lock, Mail, User, AtSign } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

import { API_URL } from '../config';

export default function Signup() {
    const [fullName, setFullName] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [accountType, setAccountType] = useState('startup'); // Default to startup
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const canvasRef = useRef(null);
    const { login } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const handleMouseMove = (e) => {
            setMousePos({
                x: (e.clientX / window.innerWidth) * 2 - 1,
                y: -(e.clientY / window.innerHeight) * 2 + 1
            });
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const particles = [];
        const particleCount = 100;

        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                z: Math.random() * 1000,
                radius: Math.random() * 2 + 1
            });
        }

        function animate() {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            particles.forEach((particle) => {
                particle.z -= 2;
                if (particle.z <= 0) {
                    particle.z = 1000;
                    particle.x = Math.random() * canvas.width;
                    particle.y = Math.random() * canvas.height;
                }

                const scale = 1000 / (1000 + particle.z);
                const x2d = (particle.x - canvas.width / 2) * scale + canvas.width / 2;
                const y2d = (particle.y - canvas.height / 2) * scale + canvas.height / 2;
                const radius = particle.radius * scale;

                ctx.beginPath();
                ctx.arc(x2d, y2d, radius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(139, 92, 246, ${1 - particle.z / 1000})`;
                ctx.fill();
            });

            requestAnimationFrame(animate);
        }

        animate();
    }, []);

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
                // Log in the user with the returned data
                login({
                    id: data.user.id,
                    name: data.user.name,
                    email: data.user.email,
                    token: data.token,
                    accountType: data.user.accountType
                });

                // Navigate to completion page based on account type
                if (data.user.accountType === 'startup') {
                    navigate('/complete-profile/startup');
                } else {
                    navigate('/complete-profile/investor');
                }
            } else {
                // Prefer specific error message if available (from backend 500 or 400)
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
        <div className="relative min-h-screen overflow-hidden flex items-center justify-center">
            {/* Back to Home Button */}
            <Link
                to="/"
                className="absolute top-4 left-4 sm:top-8 sm:left-8 z-30 text-white/70 hover:text-white transition-colors"
            >
                <ArrowLeft className="w-8 h-8" />
            </Link>
            <canvas ref={canvasRef} className="absolute inset-0 z-0" />

            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20 z-10" />

            <div
                className="relative z-20 w-full max-w-md px-4 sm:px-6"
                style={{
                    transform: `perspective(1000px) rotateY(${mousePos.x * 5}deg) rotateX(${mousePos.y * 5}deg)`
                }}
            >
                <div className="backdrop-blur-xl bg-white/10 rounded-3xl shadow-2xl border border-white/20 p-6 sm:p-8 transform transition-all duration-300 hover:scale-105">

                    <div className="text-center mb-8">
                        <div className="inline-block p-4 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl mb-4 animate-pulse">
                            <User className="w-12 h-12 text-white" />
                        </div>
                        <h1 className="text-4xl font-bold text-white mb-2 bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
                            Create Account
                        </h1>
                        <p className="text-gray-300">Join us today</p>
                        {error && (
                            <p className="text-red-400 mt-2 text-sm">{error}</p>
                        )}
                    </div>

                    <div className="text-center mb-6">
                        <div className="flex justify-center space-x-4 mb-6">
                            <button
                                type="button"
                                onClick={() => setAccountType('startup')}
                                className={`px-6 py-3 rounded-xl border transition-all ${accountType === 'startup' ? 'bg-purple-600 border-purple-500 text-white' : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'}`}
                            >
                                I am a Startup
                            </button>
                            <button
                                type="button"
                                onClick={() => setAccountType('investor')}
                                className={`px-6 py-3 rounded-xl border transition-all ${accountType === 'investor' ? 'bg-blue-600 border-blue-500 text-white' : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'}`}
                            >
                                I am an Investor
                            </button>
                        </div>
                    </div>

                    <form className="space-y-6" onSubmit={handleSubmit}>

                        <div className="relative group">
                            <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-purple-400 w-5 h-5" />
                            <input
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                placeholder="Full Name"
                                className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400"
                                required
                            />
                        </div>

                        <div className="relative group">
                            <AtSign className="absolute left-4 top-1/2 transform -translate-y-1/2 text-purple-400 w-5 h-5" />
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Username"
                                className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400"
                                required
                            />
                        </div>

                        <div className="relative group">
                            <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-purple-400 w-5 h-5" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Email Address"
                                className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400"
                                required
                            />
                        </div>

                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-purple-400 w-5 h-5" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Password"
                                className="w-full pl-12 pr-12 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>

                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-purple-400 w-5 h-5" />
                            <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Confirm Password"
                                className="w-full pl-12 pr-12 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                            >
                                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Signing Up...' : 'Sign Up'}
                        </button>

                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-gray-400">
                            Already have an account?{' '}
                            <Link to="/login" className="text-purple-400 font-semibold">
                                Sign In
                            </Link>
                        </p>
                    </div>

                </div>

                <div className="mt-6 text-center">
                    <div className="inline-flex space-x-2 items-center text-gray-500 text-sm">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <span>Secure Connection</span>
                    </div>
                </div>

            </div>
        </div>
    );
}
