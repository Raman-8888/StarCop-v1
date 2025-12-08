import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Briefcase, MapPin, Globe, CheckCircle, DollarSign } from 'lucide-react';
import { API_URL } from '../config';

export default function CompleteProfileInvestor() {
    const { user, login } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        companyName: '',
        role: '',
        investmentFocus: [], // Array of strings
        preferredStage: [], // Array of strings
        typicalAmount: '',
        portfolio: '', // URL or text
        website: '',
        location: ''
    });

    // Helper to handle multiselect checkboxes
    const handleMultiSelect = (field, value) => {
        setFormData(prev => {
            const current = prev[field];
            if (current.includes(value)) {
                return { ...prev, [field]: current.filter(item => item !== value) };
            } else {
                return { ...prev, [field]: [...current, value] };
            }
        });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
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
                body: JSON.stringify({ investorDetails: formData })
            });

            const data = await response.json();

            if (data.success) {
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

    const FOCUS_AREAS = ['AI', 'SaaS', 'Consumer Tech', 'DeepTech', 'Healthcare', 'FinTech', 'EdTech', 'Web3'];
    const STAGES = ['Idea', 'MVP', 'Revenue', 'Growth'];

    return (
        <div className="min-h-screen bg-black text-white p-6 flex justify-center items-center">
            <div className="max-w-2xl w-full">
                <div className="text-center mb-10">
                    <Briefcase className="w-16 h-16 text-blue-500 mx-auto mb-4" />
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-500">
                        Investor Profile
                    </h1>
                    <p className="text-gray-400 mt-2">Let startups know what you're looking for.</p>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-xl">
                    {error && <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded text-red-300 text-sm">{error}</div>}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Company & Role */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Company / Firm Name</label>
                                <input
                                    type="text"
                                    name="companyName"
                                    value={formData.companyName}
                                    onChange={handleChange}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-blue-500"
                                    placeholder="e.g. Sequoia, Angel"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Your Role</label>
                                <input
                                    type="text"
                                    name="role"
                                    value={formData.role}
                                    onChange={handleChange}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-blue-500"
                                    placeholder="e.g. Partner, Angel Investor"
                                />
                            </div>
                        </div>

                        {/* Investment Focus (Multi-select) */}
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-3">Investment Focus</label>
                            <div className="flex flex-wrap gap-3">
                                {FOCUS_AREAS.map(area => (
                                    <button
                                        key={area}
                                        type="button"
                                        onClick={() => handleMultiSelect('investmentFocus', area)}
                                        className={`px-4 py-2 rounded-full text-sm border transition-all ${formData.investmentFocus.includes(area)
                                                ? 'bg-blue-600 border-blue-500 text-white'
                                                : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                                            }`}
                                    >
                                        {area}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Preferred Stage (Multi-select) */}
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-3">Preferred Stage</label>
                            <div className="flex flex-wrap gap-3">
                                {STAGES.map(stage => (
                                    <button
                                        key={stage}
                                        type="button"
                                        onClick={() => handleMultiSelect('preferredStage', stage)}
                                        className={`px-4 py-2 rounded-full text-sm border transition-all ${formData.preferredStage.includes(stage)
                                                ? 'bg-green-600 border-green-500 text-white'
                                                : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                                            }`}
                                    >
                                        {stage}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Typical Amount & Location */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Typical Investment Amount</label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                                    <input
                                        type="text"
                                        name="typicalAmount"
                                        value={formData.typicalAmount}
                                        onChange={handleChange}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-blue-500"
                                        placeholder="e.g. $50k - $200k"
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
                                        className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-blue-500"
                                        placeholder="City, Country"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Website & Portfolio */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Website / LinkedIn</label>
                                <div className="relative">
                                    <Globe className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                                    <input
                                        type="url"
                                        name="website"
                                        value={formData.website}
                                        onChange={handleChange}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-blue-500"
                                        placeholder="https://..."
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Previous Investments (Portfolio)</label>
                                <div className="relative">
                                    <CheckCircle className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                                    <input
                                        type="text"
                                        name="portfolio"
                                        value={formData.portfolio}
                                        onChange={handleChange}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-blue-500"
                                        placeholder="Companies you backed..."
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold py-4 rounded-xl transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Saving Profile...' : 'Complete Investor Profile'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
