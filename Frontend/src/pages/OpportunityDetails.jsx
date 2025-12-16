import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Calendar, DollarSign, Briefcase, ArrowLeft, Send, Bookmark, FileText, Check, Pencil } from 'lucide-react';
import { API_URL } from '../config';
import SendInterestModal from '../components/SendInterestModal';
import CreateOpportunity from '../components/CreateOpportunity';
import toast from 'react-hot-toast';

const OpportunityDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [opportunity, setOpportunity] = useState(null);
    const [loading, setLoading] = useState(true);
    const [interestSent, setInterestSent] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [isInterestModalOpen, setIsInterestModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get(`${API_URL}/api/opportunities/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setOpportunity(res.data);

                // Check if saved (this would ideally differ based on backend response)
                setIsSaved(res.data.saves > 0); // Simplified check, real app needs 'isSavedByUser'
            } catch (error) {
                console.error("Error fetching details", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
    }, [id]);

    const handleSendInterest = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/api/opportunities/${id}/interest`, { message }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setInterestSent(true);
        } catch (error) {
            console.error("Failed to send interest", error);
            toast.error(error.response?.data?.message || "Failed to send interest");
        }
    };

    const handleSave = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(`${API_URL}/api/opportunities/${id}/save`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setIsSaved(res.data.saved);
        } catch (error) {
            console.error("Save failed", error);
        }
    };

    if (loading) return <div className="text-white p-10 flex justify-center">Loading...</div>;
    if (!opportunity) return <div className="text-white p-10">Opportunity not found</div>;

    const currentUserId = user?.id || user?._id;
    const creatorUserId = opportunity.creatorId?._id || opportunity.creatorId;
    const isOwner = currentUserId && creatorUserId && currentUserId.toString() === creatorUserId.toString();

    return (
        <div className="min-h-screen bg-black text-white p-6 md:p-10">
            <div className="max-w-6xl mx-auto">
                <button
                    onClick={() => navigate('/opportunities')}
                    className="flex items-center text-gray-400 hover:text-white mb-6 transition-colors"
                >
                    <ArrowLeft size={20} className="mr-2" />
                    Back to Opportunities
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Video Player Section */}
                        {opportunity.pitchVideoUrl && (
                            <div className="rounded-2xl overflow-hidden bg-gray-900 border border-white/10 aspect-video shadow-2xl">
                                <video
                                    src={opportunity.pitchVideoUrl}
                                    controls
                                    className="w-full h-full object-contain"
                                    poster={opportunity.galleryUrls?.[0]} // Use first gallery image as poster if avail
                                />
                            </div>
                        )}

                        {/* Title & Stats */}
                        <div>
                            <div className="flex justify-between items-start">
                                <div>
                                    <h1 className="text-3xl md:text-4xl font-bold mb-3">{opportunity.title}</h1>
                                    <div className="flex flex-wrap gap-3">
                                        <span className="bg-blue-500/10 text-blue-400 px-3 py-1 rounded-lg text-sm border border-blue-500/20 font-medium">
                                            {opportunity.industry}
                                        </span>
                                        {opportunity.fundingStage && (
                                            <span className="bg-purple-500/10 text-purple-400 px-3 py-1 rounded-lg text-sm border border-purple-500/20 font-medium">
                                                {opportunity.fundingStage}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                {!isOwner && (
                                    <button
                                        onClick={handleSave}
                                        className={`p-3 rounded-full border transition-all ${isSaved
                                            ? 'bg-yellow-500 text-black border-yellow-500'
                                            : 'bg-white/5 text-gray-400 border-white/10 hover:border-white/30 hover:text-white'}`}
                                    >
                                        <Bookmark size={20} fill={isSaved ? "currentColor" : "none"} />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Details Cards */}
                        <div className="bg-[#111] rounded-2xl border border-white/10 p-8 space-y-6">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-200 mb-2">The Problem</h3>
                                <p className="text-gray-400 leading-relaxed whitespace-pre-wrap">{opportunity.problem}</p>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-200 mb-2">The Solution</h3>
                                <p className="text-gray-400 leading-relaxed whitespace-pre-wrap">{opportunity.solution}</p>
                            </div>
                            {opportunity.traction && (
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-200 mb-2">Traction</h3>
                                    <div className="bg-blue-500/5 border border-blue-500/10 rounded-xl p-4 text-blue-300 font-medium">
                                        {opportunity.traction}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Gallery */}
                        {opportunity.galleryUrls?.length > 0 && (
                            <div className="space-y-4">
                                <h3 className="text-xl font-bold">Product Gallery</h3>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {opportunity.galleryUrls.map((url, idx) => (
                                        <div key={idx} className="rounded-xl overflow-hidden border border-white/10 aspect-[4/3] bg-gray-900">
                                            <img src={url} alt={`Gallery ${idx}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Startup Profile */}
                        <div className="bg-[#111] rounded-2xl border border-white/10 p-6">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-16 h-16 rounded-full bg-gray-700 overflow-hidden border-2 border-white/10">
                                    {opportunity.creatorId.profilePicture ? (
                                        <img src={opportunity.creatorId.profilePicture} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-white font-bold text-xl">
                                            {opportunity.creatorId.name?.[0]}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <h4 className="font-bold text-lg">{opportunity.creatorId.name}</h4>
                                    <p className="text-gray-400 text-sm">Founder</p>
                                </div>
                            </div>

                            <div className="space-y-4 pt-4 border-t border-white/5">
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-500 text-sm">Asking Investment</span>
                                    <span className="font-bold text-green-400">{opportunity.investmentRange || 'Negotiable'}</span>
                                </div>
                                {opportunity.tags?.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {opportunity.tags.map((tag, i) => (
                                            <span key={i} className="bg-white/5 px-2 py-1 rounded text-xs text-gray-300">#{tag.trim()}</span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {opportunity.deckUrl && (
                                <a
                                    href={opportunity.deckUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center justify-center gap-2 w-full mt-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl text-sm font-medium transition-colors border border-white/10"
                                >
                                    <FileText size={18} /> View Pitch Deck (PDF)
                                </a>
                            )}
                        </div>

                        {/* Action Box (Investor Only) */}
                        {/* Action Box (Investor & Startup) */}
                        {!isOwner && (
                            <div className="bg-blue-600/10 rounded-2xl border border-blue-500/20 p-6">
                                <h3 className="text-lg font-bold text-white mb-2">Interested?</h3>
                                <p className="text-blue-200 text-sm mb-4">Express your interest and start a conversation.</p>

                                {interestSent ? (
                                    <div className="bg-green-500/20 text-green-400 p-4 rounded-xl flex items-center gap-2 font-medium justify-center">
                                        <Check size={20} /> Request Sent!
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => setIsInterestModalOpen(true)}
                                        className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
                                    >
                                        <Send size={18} /> Send Interest
                                    </button>
                                )}
                            </div>
                        )}

                        {isOwner && (
                            <div className="bg-[#111] rounded-2xl border border-white/10 p-6 text-center space-y-3">
                                <p className="text-gray-400">This is your listing.</p>
                                <button
                                    onClick={() => setIsEditModalOpen(true)}
                                    className="flex items-center justify-center gap-2 w-full py-3 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-600/30 rounded-xl font-bold transition-colors"
                                >
                                    <Pencil size={18} /> Edit Opportunity
                                </button>
                                <button className="text-red-400 hover:text-red-300 text-sm font-medium w-full py-2">Delete Opportunity</button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <SendInterestModal
                isOpen={isInterestModalOpen}
                onClose={() => setIsInterestModalOpen(false)}
                opportunityId={id}
                onSuccess={() => setInterestSent(true)}
            />

            <CreateOpportunity
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                opportunityToEdit={opportunity}
                onCreated={() => {
                    // Refetch details or reload
                    window.location.reload();
                }}
            />
        </div >
    );
};

export default OpportunityDetails;
