import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { Plus, Search, Filter, Briefcase, DollarSign, Calendar, Clock, ArrowLeft } from 'lucide-react';
import CreateOpportunity from '../components/CreateOpportunity';
import { useNavigate } from 'react-router-dom';

const Opportunities = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [opportunities, setOpportunities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    // View Mode for Startup: 'browse' or 'applications'
    const [viewMode, setViewMode] = useState('browse');
    const [myApplications, setMyApplications] = useState([]);

    // Filters
    const [filterIndustry, setFilterIndustry] = useState('');
    const [filterType, setFilterType] = useState('');

    const fetchOpportunities = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const url = 'http://localhost:3002/api/opportunities';

            const params = {};
            if (filterIndustry) params.industry = filterIndustry;
            if (filterType) params.type = filterType;

            const res = await axios.get(url, {
                headers: { Authorization: `Bearer ${token}` },
                params
            });
            setOpportunities(res.data);
        } catch (error) {
            console.error("Error fetching opportunities", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchMyApplications = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:3002/api/opportunities/my/applications', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMyApplications(res.data);
        } catch (error) {
            console.error("Error fetching applications", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (viewMode === 'browse' || user?.accountType === 'investor') {
            fetchOpportunities();
        } else if (viewMode === 'applications' && user?.accountType === 'startup') {
            fetchMyApplications();
        }
    }, [filterIndustry, filterType, viewMode, user]);

    // Derived state for display
    const displayedOpportunities = user?.accountType === 'investor'
        ? opportunities.filter(op => op.investor?._id === user._id || op.investor === user._id)
        : opportunities;

    return (
        <div className="min-h-screen bg-black text-white p-6 md:p-10">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Header Section */}
                <button
                    onClick={() => navigate('/')}
                    className="flex items-center text-gray-400 hover:text-white mb-6 transition-colors"
                >
                    <ArrowLeft size={20} className="mr-2" />
                    Go Back to Home
                </button>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                            {user?.accountType === 'investor' ? 'My Opportunities' : 'Explore Opportunities'}
                        </h1>
                        <p className="text-gray-400 mt-1">
                            {user?.accountType === 'investor'
                                ? 'Manage your postings and review applications'
                                : 'Find funding, partnerships, and more'}
                        </p>
                    </div>

                    {user?.accountType === 'investor' && (
                        <button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all shadow-lg shadow-blue-500/20"
                        >
                            <Plus size={20} />
                            Create Opportunity
                        </button>
                    )}

                    {user?.accountType === 'startup' && (
                        <div className="flex bg-[#111] p-1 rounded-xl border border-white/10">
                            <button
                                onClick={() => setViewMode('browse')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${viewMode === 'browse' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'
                                    }`}
                            >
                                Browse
                            </button>
                            <button
                                onClick={() => setViewMode('applications')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${viewMode === 'applications' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'
                                    }`}
                            >
                                My Applications
                            </button>
                        </div>
                    )}
                </div>

                {/* Filters Bar (Startup View - Browse Mode) */}
                {user?.accountType === 'startup' && viewMode === 'browse' && (
                    <div className="bg-[#111] p-4 rounded-xl border border-white/10 flex flex-wrap gap-4 items-center">
                        <div className="flex items-center gap-2 text-gray-400">
                            <Filter size={18} />
                            <span className="text-sm font-medium">Filters:</span>
                        </div>

                        <select
                            value={filterIndustry}
                            onChange={(e) => setFilterIndustry(e.target.value)}
                            className="bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                        >
                            <option value="">All Industries</option>
                            <option value="Tech">Tech</option>
                            <option value="Health">Health</option>
                            <option value="Finance">Finance</option>
                            <option value="Education">Education</option>
                        </select>

                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            className="bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                        >
                            <option value="">All Types</option>
                            <option value="Funding">Funding</option>
                            <option value="Partnership">Partnership</option>
                            <option value="Challenge">Challenge</option>
                            <option value="Accelerator">Accelerator</option>
                            <option value="Hiring">Hiring</option>
                        </select>

                        <div className="ml-auto relative">
                            <input
                                type="text"
                                placeholder="Search..."
                                className="bg-black/40 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500 w-full md:w-64"
                            />
                            <Search className="absolute left-3 top-2.5 text-gray-500" size={16} />
                        </div>
                    </div>
                )}

                {/* Content Area */}
                {viewMode === 'browse' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {loading ? (
                            <p className="text-gray-400">Loading opportunities...</p>
                        ) : displayedOpportunities.length > 0 ? (
                            displayedOpportunities.map(op => (
                                <div
                                    key={op._id}
                                    onClick={() => navigate(`/opportunities/${op._id}`)}
                                    className="bg-[#111] rounded-2xl border border-white/5 p-6 hover:border-blue-500/30 transition-all hover:bg-[#151515] cursor-pointer group"
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${op.type === 'Funding' ? 'border-green-500/30 text-green-400 bg-green-500/10' :
                                            op.type === 'Partnership' ? 'border-purple-500/30 text-purple-400 bg-purple-500/10' :
                                                'border-blue-500/30 text-blue-400 bg-blue-500/10'
                                            }`}>
                                            {op.type}
                                        </span>
                                        {op.status === 'Closed' && (
                                            <span className="text-red-500 text-xs font-bold uppercase tracking-wider">Closed</span>
                                        )}
                                    </div>

                                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">{op.title}</h3>
                                    <p className="text-gray-400 line-clamp-2 text-sm mb-4">{op.description}</p>

                                    <div className="space-y-2 mb-6">
                                        <div className="flex items-center gap-2 text-gray-500 text-sm">
                                            <Briefcase size={16} />
                                            <span>{op.industry}</span>
                                        </div>
                                        {op.budget && (
                                            <div className="flex items-center gap-2 text-gray-500 text-sm">
                                                <DollarSign size={16} />
                                                <span>{op.budget}</span>
                                            </div>
                                        )}
                                        {op.deadline && (
                                            <div className="flex items-center gap-2 text-gray-500 text-sm">
                                                <Clock size={16} />
                                                <span>Due: {new Date(op.deadline).toLocaleDateString()}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden">
                                                {op.investor?.profilePicture ? (
                                                    <img src={op.investor.profilePicture} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="text-xs font-bold text-white">{op.investor?.name?.[0] || 'I'}</span>
                                                )}
                                            </div>
                                            <span className="text-sm font-medium text-gray-300">{op.investor?.name || 'Investor'}</span>
                                        </div>
                                        {user?.accountType === 'investor' && (
                                            <div className="text-xs text-blue-400 bg-blue-500/10 px-2 py-1 rounded">
                                                {op.applicationsCount || 0} Applicants
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full text-center py-20 text-gray-500">
                                No opportunities found.
                            </div>
                        )}
                    </div>
                ) : (
                    // My Applications View
                    <div className="space-y-4">
                        {myApplications.length > 0 ? (
                            myApplications.map(app => (
                                <div key={app._id} className="bg-[#111] rounded-xl border border-white/10 p-6 flex justify-between items-center hover:border-blue-500/30 transition-all">
                                    <div className="flex-1">
                                        <h3
                                            onClick={() => navigate(`/opportunities/${app.opportunity?._id}`)}
                                            className="text-xl font-bold text-white hover:text-blue-400 cursor-pointer mb-2"
                                        >
                                            {app.opportunity?.title || 'Opportunity Unavailable'}
                                        </h3>
                                        <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                                            <div className="flex items-center gap-2">
                                                <div className="w-5 h-5 rounded-full bg-gray-700 flex items-center justify-center text-xs text-white">
                                                    {app.investor?.name?.[0] || 'I'}
                                                </div>
                                                <span>{app.investor?.name}</span>
                                            </div>
                                            <span>•</span>
                                            <span>Applied: {new Date(app.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <div className="mt-2 bg-black/30 p-2 rounded text-sm text-gray-500 line-clamp-1 max-w-2xl">
                                            <span className="text-gray-400 font-medium">Proposal:</span> {app.proposal}
                                        </div>
                                    </div>

                                    <div className="ml-4 flex flex-col items-end gap-2">
                                        <div className={`px-4 py-2 rounded-lg text-sm font-bold border ${app.status === 'Accepted' ? 'border-green-500/30 text-green-400 bg-green-500/10' :
                                            app.status === 'Rejected' ? 'border-red-500/30 text-red-400 bg-red-500/10' :
                                                'border-blue-500/30 text-blue-400 bg-blue-500/10'
                                            }`}>
                                            {app.status}
                                        </div>
                                        <button
                                            onClick={() => navigate(`/opportunities/${app.opportunity?._id}`)}
                                            className="text-gray-400 hover:text-white text-sm underline"
                                        >
                                            View Details
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-20 text-gray-500">
                                You haven't applied to any opportunities yet.
                            </div>
                        )}
                    </div>
                )}
            </div>

            <CreateOpportunity
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onCreated={fetchOpportunities}
            />
        </div>
    );
};

export default Opportunities;
