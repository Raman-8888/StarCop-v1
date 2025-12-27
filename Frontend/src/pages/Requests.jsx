import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Inbox, Send, ArrowLeft } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { API_URL } from '../config';
import InterestRequestCard from '../components/InterestRequestCard';

const Requests = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('received');
    const [receivedRequests, setReceivedRequests] = useState([]);
    const [sentRequests, setSentRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRequests();
    }, [activeTab]);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };

            if (activeTab === 'received') {
                const response = await axios.get(`${API_URL}/api/opportunities/startup/my-interests`, { headers });
                setReceivedRequests(response.data);
            } else {
                const response = await axios.get(`${API_URL}/api/opportunities/investor/sent-interests`, { headers });
                setSentRequests(response.data);
            }
        } catch (error) {
            console.error('Fetch requests error:', error);
            toast.error('Failed to load requests');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = () => {
        fetchRequests();
    };

    const renderRequests = () => {
        const requests = activeTab === 'received' ? receivedRequests : sentRequests;

        if (loading) {
            return (
                <div className="flex items-center justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            );
        }

        if (requests.length === 0) {
            return (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-4">
                        {activeTab === 'received' ? <Inbox size={32} className="text-gray-500" /> : <Send size={32} className="text-gray-500" />}
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">No Requests</h3>
                    <p className="text-gray-400">
                        {activeTab === 'received' 
                            ? "You haven't received any interest requests yet." 
                            : "You haven't sent any interest requests yet."}
                    </p>
                </div>
            );
        }

        return (
            <div className="grid gap-4">
                {requests.map((request) => (
                    <InterestRequestCard
                        key={request._id}
                        interest={request}
                        onStatusUpdate={handleStatusUpdate}
                    />
                ))}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-black text-white">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-lg border-b border-white/10">
                <div className="max-w-4xl mx-auto px-4 py-4">
                    <div className="flex items-center gap-4 mb-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="p-2 hover:bg-white/10 rounded-full transition-colors"
                        >
                            <ArrowLeft size={24} />
                        </button>
                        <h1 className="text-2xl font-bold">Interest Requests</h1>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-2">
                        <button
                            onClick={() => setActiveTab('received')}
                            className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
                                activeTab === 'received'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                            }`}
                        >
                            <div className="flex items-center justify-center gap-2">
                                <Inbox size={18} />
                                Received
                                {receivedRequests.length > 0 && (
                                    <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs">
                                        {receivedRequests.length}
                                    </span>
                                )}
                            </div>
                        </button>
                        <button
                            onClick={() => setActiveTab('sent')}
                            className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
                                activeTab === 'sent'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                            }`}
                        >
                            <div className="flex items-center justify-center gap-2">
                                <Send size={18} />
                                Sent
                                {sentRequests.length > 0 && (
                                    <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs">
                                        {sentRequests.length}
                                    </span>
                                )}
                            </div>
                        </button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-4xl mx-auto px-4 py-6">
                {renderRequests()}
            </div>
        </div>
    );
};

export default Requests;
