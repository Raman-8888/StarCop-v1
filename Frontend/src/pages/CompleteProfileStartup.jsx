import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Rocket, Briefcase, Globe, MapPin, Users, DollarSign, Video } from 'lucide-react';
import { API_URL } from '../config';

export default function CompleteProfileStartup() {
    const { user, login } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        startupName: '',
        industry: '',
        stage: 'Idea',
        problemStatement: '',
        description: '',
        teamSize: 1,
        website: '',
        location: '',
        pitchVideo: '',
        fundingNeeded: false,
        amountSeeking: ''
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch(`${API_URL}/api/auth/update-profile`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                },
                body: JSON.stringify({ startupDetails: formData })
            });

            const data = await response.json();

            if (data.success) {
                // Update local user context
                login({ ...user, ...data.user });
                navigate('/');
            } else {
                setError(data.message || 'Failed to update profile');
            }
        } catch (err) {
            console.error(err);
            setError('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white p-6 flex justify-center items-center">
            <div className="max-w-2xl w-full">
                <div className="text-center mb-10">
                    <Rocket className="w-16 h-16 text-purple-500 mx-auto mb-4" />
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
                        Tell us about your Startup and Your Team
                    </h1>
                    <p className="text-gray-400 mt-2">Complete your profile to get discovered by investors.</p>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-xl">
                    {error && <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded text-red-300 text-sm">{error}</div>}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Startup Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Startup Name</label>
                            <div className="relative">
                                <Rocket className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                                <input
                                    type="text"
                                    name="startupName"
                                    value={formData.startupName}
                                    onChange={handleChange}
                                    required
                                    className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-purple-500 transition-colors"
                                    placeholder="e.g. Acme AI"
                                />
                            </div>
                        </div>

                        {/* Industry & Stage */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Industry</label>
                                <div className="relative">
                                    <Briefcase className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                                    <input
                                        type="text"
                                        name="industry"
                                        value={formData.industry}
                                        onChange={handleChange}
                                        required
                                        className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-purple-500 transition-colors"
                                        placeholder="e.g. FinTech, HealthTech"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Stage</label>
                                <select
                                    name="stage"
                                    value={formData.stage}
                                    onChange={handleChange}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-purple-500 text-white"
                                >
                                    <option value="Idea">Idea Stage</option>
                                    <option value="MVP">MVP Ready</option>
                                    <option value="Early Revenue">Early Revenue</option>
                                    <option value="Growth">Growth Stage</option>
                                </select>
                            </div>
                        </div>

                        {/* Problem Statement */}
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Problem You Are Solving</label>
                            <textarea
                                name="problemStatement"
                                value={formData.problemStatement}
                                onChange={handleChange}
                                className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-purple-500 h-24"
                                placeholder="Describe the core problem..."
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">What Your Startup Does</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-purple-500 h-24"
                                placeholder="Describe your solution..."
                            />
                        </div>

                        {/* Team Size & Location */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Team Size</label>
                                <div className="relative">
                                    <Users className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                                    <input
                                        type="number"
                                        name="teamSize"
                                        value={formData.teamSize}
                                        onChange={handleChange}
                                        min="1"
                                        className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-purple-500"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Location</label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                                    <input
                                        type="text"
                                        name="location"
                                        value={formData.location}
                                        onChange={handleChange}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-purple-500"
                                        placeholder="City, Country"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Website & Video */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Website / Portfolio</label>
                                <div className="relative">
                                    <Globe className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                                    <input
                                        type="url"
                                        name="website"
                                        value={formData.website}
                                        onChange={handleChange}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-purple-500"
                                        placeholder="https://..."
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Pitch Video Link (Optional)</label>
                                <div className="relative">
                                    <Video className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                                    <input
                                        type="url"
                                        name="pitchVideo"
                                        value={formData.pitchVideo}
                                        onChange={handleChange}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-purple-500"
                                        placeholder="YouTube/Vimeo link"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Funding */}
                        <div className="space-y-4 pt-4 border-t border-white/10">
                            <label className="flex items-center space-x-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="fundingNeeded"
                                    checked={formData.fundingNeeded}
                                    onChange={handleChange}
                                    className="w-5 h-5 rounded border-gray-600 text-purple-600 focus:ring-purple-500 bg-gray-700"
                                />
                                <span className="text-white">We are currently raising funds</span>
                            </label>

                            {formData.fundingNeeded && (
                                <div className="animate-fade-in-down">
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Amount Seeking</label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                                        <input
                                            type="text"
                                            name="amountSeeking"
                                            value={formData.amountSeeking}
                                            onChange={handleChange}
                                            className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-purple-500"
                                            placeholder="e.g. $500,000"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 rounded-xl transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Saving Profile...' : 'Complete Profile'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
