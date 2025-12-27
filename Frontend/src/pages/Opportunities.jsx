import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { Search, Filter, ArrowLeft, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../config';
import OpportunityCard from '../components/OpportunityCard';
import CreateOpportunity from '../components/CreateOpportunity';
import ConfirmationModal from '../components/ConfirmationModal';
import UnauthorizedModal from '../components/UnauthorizedModal';

import { motion } from 'framer-motion';

const Opportunities = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    // Unified Feed State
    const [opportunities, setOpportunities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingOpportunity, setEditingOpportunity] = useState(null); // New State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [opportunityToDelete, setOpportunityToDelete] = useState(null);
    const [showAuthModal, setShowAuthModal] = useState(false);

    const handleCardClick = (opportunity) => {
        if (!user) {
            setShowAuthModal(true);
        } else {
            navigate(`/opportunities/${opportunity._id}`);
        }
    };

    const [filters, setFilters] = useState({
        industry: '',
        fundingStage: '',
        investmentRange: '',
        search: ''
    });

    // Handle opening modal for edit
    const handleEdit = (opportunity) => {
        setEditingOpportunity(opportunity);
        setIsCreateModalOpen(true);
    };

    // Reset editing state when modal closes
    const handleModalClose = () => {
        setIsCreateModalOpen(false);
        setEditingOpportunity(null);
    };

    // Handle delete click
    const handleDelete = (opportunityId) => {
        setOpportunityToDelete(opportunityId);
        setIsDeleteModalOpen(true);
    };

    // Confirm delete
    const confirmDelete = async () => {
        if (!opportunityToDelete) return;

        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_URL}/api/opportunities/${opportunityToDelete}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Update state to remove deleted item
            setOpportunities(prev => prev.filter(op => op._id !== opportunityToDelete));
            setOpportunityToDelete(null);
        } catch (error) {
            console.error("Delete failed", error);
        }
    };

    const fetchOpportunities = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/api/opportunities`, {
                headers: { Authorization: `Bearer ${token}` },
                params: filters
            });
            const currentUserId = user?.id || user?._id;
            console.log("Sorting Feed. Current User:", currentUserId);

            let allOps = res.data;
            let sortedData = allOps;

            if (currentUserId) {
                const ownerOps = [];
                const otherOps = [];

                allOps.forEach(op => {
                    const creatorId = op.creatorId?._id || op.creatorId;
                    const isOwner = creatorId && currentUserId.toString() === creatorId.toString();
                    if (isOwner) {
                        ownerOps.push(op);
                    } else {
                        otherOps.push(op);
                    }
                });

                console.log(`Found ${ownerOps.length} owner posts and ${otherOps.length} others.`);
                sortedData = [...ownerOps, ...otherOps];
            }

            setOpportunities(sortedData);
        } catch (error) {
            console.error("Error fetching opportunities", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOpportunities();
    }, [filters, user]);

    return (
        <div className="relative min-h-screen text-white font-sans overflow-hidden">


            <div className="relative z-10 max-w-7xl mx-auto p-6 md:p-10 space-y-8 pt-24" style={{ paddingTop: '6rem' }}>
                {/* Header with Create Button */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                    className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4"
                >
                    <div>
                        <h1 className="text-5xl md:text-6xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-500 drop-shadow-sm">
                            Discover.
                        </h1>
                        <p className="text-gray-400 mt-2 text-lg max-w-xl leading-relaxed">
                            Connect with high-potential startups and visionary investors in a curated ecosystem.
                        </p>
                    </div>

                    {user && (
                        <button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-blue-500/30 transform hover:-translate-y-0.5 whitespace-nowrap"
                        >
                            <Plus size={20} />
                            {user.accountType === 'investor' ? 'Create Request' : 'Post Opportunity'}
                        </button>
                    )}
                </motion.div>

                {/* Search & Filters */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="backdrop-blur-xl bg-white/5 border border-white/10 p-2 rounded-2xl flex flex-wrap gap-2 items-center shadow-2xl"
                >
                    <div className="flex-1 relative min-w-[250px] group">
                        <Search className="absolute left-4 top-3.5 text-gray-500 group-focus-within:text-blue-400 transition-colors" size={20} />
                        <input
                            type="text"
                            placeholder="Search by keyword..."
                            className="bg-transparent border-none rounded-xl pl-12 pr-4 py-3 text-base text-white focus:ring-0 w-full placeholder-gray-500"
                            value={filters.search}
                            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                        />
                    </div>

                    <div className="h-8 w-px bg-white/10 mx-2 hidden md:block"></div>

                    <select
                        className="bg-black/20 hover:bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm font-medium text-gray-300 focus:outline-none focus:border-blue-500 focus:text-white transition-colors cursor-pointer"
                        value={filters.industry}
                        onChange={(e) => setFilters({ ...filters, industry: e.target.value })}
                    >
                        <option value="">All Industries</option>
                        <option value="Tech">Tech</option>
                        <option value="Health">Health</option>
                        <option value="Finance">Finance</option>
                        <option value="Education">Education</option>
                    </select>

                    <select
                        className="bg-black/20 hover:bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm font-medium text-gray-300 focus:outline-none focus:border-blue-500 focus:text-white transition-colors cursor-pointer"
                        value={filters.fundingStage}
                        onChange={(e) => setFilters({ ...filters, fundingStage: e.target.value })}
                    >
                        <option value="">Any Stage</option>
                        <option value="Pre-Seed">Pre-Seed</option>
                        <option value="Seed">Seed</option>
                        <option value="Series A">Series A</option>
                    </select>
                </motion.div>

                {/* Grid */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                    {loading ? (
                        <div className="col-span-full py-32 flex justify-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                        </div>
                    ) : opportunities.length > 0 ? (
                        opportunities.map((op, index) => (
                            <motion.div
                                key={op._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 * index }}
                            >
                                <OpportunityCard
                                    opportunity={op}
                                    isInvestor={true}
                                    onEdit={handleEdit}
                                    onDelete={handleDelete}
                                    onClick={() => handleCardClick(op)}
                                />
                            </motion.div>
                        ))
                    ) : (
                        <div className="col-span-full text-center py-32">
                            <h3 className="text-2xl font-bold text-gray-300">No matches found</h3>
                            <p className="text-gray-500 mt-2">Try adjusting your filters to broaden your search.</p>
                        </div>
                    )}
                </motion.div>
            </div >

            <CreateOpportunity
                isOpen={isCreateModalOpen}
                onClose={handleModalClose}
                onCreated={fetchOpportunities}
                opportunityToEdit={editingOpportunity}
            />

            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="Delete Opportunity?"
                message="Are you sure you want to remove this opportunity? This will permanently delete all data, including received interests and analytics. This action cannot be undone."
                confirmText="Yes, Delete It"
            />

            <UnauthorizedModal
                isOpen={showAuthModal}
                onClose={() => setShowAuthModal(false)}
                title="Opportunity Access Required"
                message="Please log in to access the opportunity details."
            />
        </div >
    );
};

export default Opportunities;
