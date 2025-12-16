import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config';
import { Bookmark, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import OpportunityCard from '../components/OpportunityCard';

const SavedOpportunitiesView = () => {
    const navigate = useNavigate();
    const [savedOps, setSavedOps] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchSaved = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/api/opportunities/investor/saved`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Map the response to extract the opportunity object + add saved=true flag logic if needed
            // The endpoint returns SavedOpportunity objects which contain the opportunity
            setSavedOps(res.data.map(item => item.opportunity));
        } catch (error) {
            console.error("Error fetching saved", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSaved();
    }, []);

    return (
        <div className="min-h-screen bg-black text-white p-6 md:p-10">
            <div className="max-w-7xl mx-auto space-y-8">
                <button
                    onClick={() => navigate('/opportunities')}
                    className="flex items-center text-gray-400 hover:text-white mb-6 transition-colors"
                >
                    <ArrowLeft size={20} className="mr-2" />
                    Back to Feed
                </button>

                <div className="flex items-center gap-3">
                    <div className="p-3 bg-yellow-500/10 rounded-full text-yellow-500">
                        <Bookmark size={24} />
                    </div>
                    <h1 className="text-3xl font-bold">Saved Opportunities</h1>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {loading ? (
                        <p className="text-gray-400">Loading saved items...</p>
                    ) : savedOps.length > 0 ? (
                        savedOps.map(op => (
                            <OpportunityCard
                                key={op._id}
                                opportunity={op}
                                isInvestor={true}
                                onSaveToggle={() => fetchSaved()} // Refresh on toggle (unsave)
                            />
                        ))
                    ) : (
                        <div className="col-span-full text-center py-20 text-gray-500">
                            You haven't saved any opportunities yet.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SavedOpportunitiesView;
