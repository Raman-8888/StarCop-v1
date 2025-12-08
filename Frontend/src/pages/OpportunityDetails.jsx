import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Calendar, DollarSign, Briefcase, ArrowLeft, Send, Download, ExternalLink } from 'lucide-react';
import ApplyModal from '../components/ApplyModal';

const OpportunityDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [opportunity, setOpportunity] = useState(null);
    const [applications, setApplications] = useState([]); // For Investor view
    const [myApplication, setMyApplication] = useState(null); // For Startup view
    const [loading, setLoading] = useState(true);
    const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

    const fetchDetails = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`http://localhost:3002/api/opportunities/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setOpportunity(res.data);

            if (user?.accountType === 'investor' && res.data.investor._id === user._id) {
                // Fetch applications if owner
                const appsRes = await axios.get(`http://localhost:3002/api/opportunities/${id}/applications`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setApplications(appsRes.data);
            } else if (user?.accountType === 'startup') {
                // Check if already applied
                const myAppsRes = await axios.get(`http://localhost:3002/api/opportunities/my/applications`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const found = myAppsRes.data.find(app => app.opportunity._id === id || app.opportunity === id);
                setMyApplication(found);
            }

        } catch (error) {
            console.error("Error fetching details", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDetails();
    }, [id, user]);

    const handleStatusUpdate = async (appId, newStatus) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:3002/api/opportunities/application/${appId}/status`,
                { status: newStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            // Update local state
            setApplications(apps => apps.map(app =>
                app._id === appId ? { ...app, status: newStatus } : app
            ));
        } catch (error) {
            console.error("Error updating status", error);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to delete this opportunity?")) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:3002/api/opportunities/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            navigate('/opportunities');
        } catch (error) {
            console.error("Failed to delete", error);
        }
    };

    if (loading) return <div className="text-white p-10">Loading...</div>;
    if (!opportunity) return <div className="text-white p-10">Opportunity not found</div>;

    const isOwner = user?.accountType === 'investor' && opportunity.investor._id === user._id;

    return (
        <div className="min-h-screen bg-black text-white p-6 md:p-10">
            <div className="max-w-5xl mx-auto">
                <button
                    onClick={() => navigate('/opportunities')}
                    className="flex items-center text-gray-400 hover:text-white mb-6 transition-colors"
                >
                    <ArrowLeft size={20} className="mr-2" />
                    Back to Opportunities
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-[#111] rounded-2xl border border-white/10 p-8">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h1 className="text-3xl font-bold mb-2">{opportunity.title}</h1>
                                    <div className="flex flex-wrap gap-3">
                                        <span className="bg-blue-500/10 text-blue-400 px-3 py-1 rounded-lg text-sm border border-blue-500/20">
                                            {opportunity.type}
                                        </span>
                                        <span className="bg-gray-800 text-gray-300 px-3 py-1 rounded-lg text-sm border border-white/5">
                                            {opportunity.industry}
                                        </span>
                                        <span className={`px-3 py-1 rounded-lg text-sm border ${opportunity.status === 'Open'
                                                ? 'bg-green-500/10 text-green-400 border-green-500/20'
                                                : 'bg-red-500/10 text-red-400 border-red-500/20'
                                            }`}>
                                            {opportunity.status}
                                        </span>
                                    </div>
                                </div>
                                {isOwner && (
                                    <button
                                        onClick={handleDelete}
                                        className="text-red-500 hover:bg-red-500/10 px-3 py-1.5 rounded-lg text-sm transitions-colors"
                                    >
                                        Delete
                                    </button>
                                )}
                            </div>

                            <div className="prose prose-invert max-w-none text-gray-300 mb-8">
                                <p className="whitespace-pre-wrap">{opportunity.description}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-6">
                                <div className="flex items-center gap-3 text-gray-300">
                                    <div className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center text-gray-400">
                                        <DollarSign size={20} />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Budget / Investment</p>
                                        <p className="font-medium">{opportunity.budget || 'Negotiable'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 text-gray-300">
                                    <div className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center text-gray-400">
                                        <Calendar size={20} />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Deadline</p>
                                        <p className="font-medium">
                                            {opportunity.deadline ? new Date(opportunity.deadline).toLocaleDateString() : 'No Deadline'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Startup: Apply Action */}
                        {!isOwner && user?.accountType === 'startup' && (
                            <div className="bg-[#111] rounded-2xl border border-white/10 p-6 flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-semibold mb-1">Interested in this opportunity?</h3>
                                    <p className="text-gray-400 text-sm">
                                        {myApplication
                                            ? `You applied on ${new Date(myApplication.createdAt).toLocaleDateString()}`
                                            : 'Submit your proposal and pitch deck.'}
                                    </p>
                                </div>
                                {myApplication ? (
                                    <div className="px-6 py-2.5 bg-gray-800 text-gray-300 rounded-xl font-medium border border-white/10">
                                        Status: <span className="text-white">{myApplication.status}</span>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => setIsApplyModalOpen(true)}
                                        className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 transition-all"
                                    >
                                        Apply Now
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Investor: Applications List */}
                        {isOwner && (
                            <div className="space-y-4">
                                <h2 className="text-2xl font-bold">Applications ({applications.length})</h2>
                                {applications.length === 0 ? (
                                    <div className="text-gray-500">No applications received yet.</div>
                                ) : (
                                    applications.map(app => (
                                        <div key={app._id} className="bg-[#111] border border-white/10 rounded-xl p-6">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-12 h-12 rounded-full bg-gray-700 overflow-hidden">
                                                        {app.startup.profilePicture ? (
                                                            <img src={app.startup.profilePicture} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-white font-bold text-lg">
                                                                {app.startup.name[0]}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-lg">{app.startup.name}</h3>
                                                        <p className="text-gray-400 text-sm">{app.startup.startupDetails?.industry || 'Startup'}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <select
                                                        value={app.status}
                                                        onChange={(e) => handleStatusUpdate(app._id, e.target.value)}
                                                        className={`bg-black/40 border border-white/10 rounded-lg px-3 py-1 text-sm focus:outline-none cursor-pointer ${app.status === 'Accepted' ? 'text-green-400' :
                                                                app.status === 'Rejected' ? 'text-red-400' :
                                                                    'text-blue-400'
                                                            }`}
                                                    >
                                                        <option value="Submitted">Submitted</option>
                                                        <option value="Viewed">Viewed</option>
                                                        <option value="Shortlisted">Shortlisted</option>
                                                        <option value="Accepted">Accepted</option>
                                                        <option value="Rejected">Rejected</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <div className="bg-black/30 rounded-lg p-4 mb-4 text-gray-300 text-sm">
                                                <p className="font-medium text-gray-500 mb-1">Proposal:</p>
                                                {app.proposal}
                                            </div>

                                            <div className="flex gap-3">
                                                {app.pitchDeck && (
                                                    <a href={app.pitchDeck} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 bg-blue-500/10 px-3 py-2 rounded-lg transition-colors">
                                                        <ExternalLink size={16} /> Pitch Deck
                                                    </a>
                                                )}
                                                {app.videoLink && (
                                                    <a href={app.videoLink} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300 bg-purple-500/10 px-3 py-2 rounded-lg transition-colors">
                                                        <ExternalLink size={16} /> Video Pitch
                                                    </a>
                                                )}
                                                <button className="flex items-center gap-2 text-sm text-gray-400 hover:text-white bg-white/5 px-3 py-2 rounded-lg transition-colors ml-auto">
                                                    <Send size={16} /> Message
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>

                    {/* Sidebar: Investor Profile */}
                    <div className="space-y-6">
                        <div className="bg-[#111] rounded-2xl border border-white/10 p-6">
                            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Posted By</h3>
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-16 h-16 rounded-full bg-gray-700 overflow-hidden">
                                    {opportunity.investor.profilePicture ? (
                                        <img src={opportunity.investor.profilePicture} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-white font-bold text-xl">
                                            {opportunity.investor.name[0]}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <h4 className="font-bold text-lg">{opportunity.investor.name}</h4>
                                    <p className="text-gray-400 text-sm">{opportunity.investor.investorDetails?.companyName || 'Private Investor'}</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Location</p>
                                    <p className="text-sm text-gray-300">{opportunity.investor.investorDetails?.location || 'Global'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Focus Areas</p>
                                    <div className="flex flex-wrap gap-2">
                                        {opportunity.investor.investorDetails?.investmentFocus?.map((focus, i) => (
                                            <span key={i} className="bg-white/5 px-2 py-1 rounded text-xs text-gray-300">{focus}</span>
                                        )) || <span className="text-gray-500 text-sm">Not specified</span>}
                                    </div>
                                </div>
                            </div>

                            <button className="w-full mt-6 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl text-sm font-medium transition-colors border border-white/10">
                                View Full Profile
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <ApplyModal
                isOpen={isApplyModalOpen}
                onClose={() => setIsApplyModalOpen(false)}
                opportunityId={id}
                onApplied={() => {
                    fetchDetails(); // Refresh to update status
                }}
            />
        </div>
    );
};

export default OpportunityDetails;
