import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Upload, Check, ChevronRight, ChevronLeft } from 'lucide-react';
import { API_URL } from '../config';
import { useAuth } from '../context/AuthContext';

const CreateOpportunity = ({ isOpen, onClose, onCreated, opportunityToEdit = null }) => {
    const { user } = useAuth();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        industry: '',
        problem: '',
        description: '',
        solution: '',
        traction: '',
        fundingStage: '',
        investmentRange: '',
        tags: '',
        visibility: true
    });
    const [files, setFiles] = useState({
        pitchVideo: null,
        deck: null,
        gallery: []
    });

    useEffect(() => {
        if (opportunityToEdit) {
            setFormData({
                title: opportunityToEdit.title || '',
                industry: opportunityToEdit.industry || '',
                problem: opportunityToEdit.problem || '',
                description: opportunityToEdit.description || '',
                solution: opportunityToEdit.solution || '',
                traction: opportunityToEdit.traction || '',
                fundingStage: opportunityToEdit.fundingStage || '',
                investmentRange: opportunityToEdit.investmentRange || '',
                tags: Array.isArray(opportunityToEdit.tags) ? opportunityToEdit.tags.join(', ') : '',
                visibility: opportunityToEdit.visibility
            });
            // Reset files as we don't show existing files in file inputs for security/complexity reasons
            setFiles({ pitchVideo: null, deck: null, gallery: [] });
            setStep(1);
        } else {
            // Reset form for create mode
            setFormData({
                title: '',
                industry: '',
                problem: '',
                description: '',
                solution: '',
                traction: '',
                fundingStage: '',
                investmentRange: '',
                tags: '',
                visibility: true
            });
            setFiles({ pitchVideo: null, deck: null, gallery: [] });
            setStep(1);
        }
    }, [opportunityToEdit, isOpen]);

    if (!isOpen) return null;

    const handleFileChange = (e, type) => {
        const MAX_SIZE = 50 * 1024 * 1024; // 50MB

        if (type === 'gallery') {
            const selectedFiles = Array.from(e.target.files);
            const validFiles = selectedFiles.filter(file => {
                if (file.size > MAX_SIZE) {
                    toast.error(`File ${file.name} is too large. Max size is 50MB.`);
                    return false;
                }
                return true;
            });
            setFiles(prev => ({ ...prev, gallery: validFiles }));
        } else {
            const file = e.target.files[0];
            if (file) {
                if (file.size > MAX_SIZE) {
                    toast.error(`File ${file.name} is too large. Max size is 50MB.`);
                    e.target.value = null; // Reset input
                    return;
                }
                setFiles(prev => ({ ...prev, [type]: file }));
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const data = new FormData();
        Object.keys(formData).forEach(key => data.append(key, formData[key]));

        if (files.pitchVideo) data.append('pitchVideo', files.pitchVideo);
        if (files.deck) data.append('deck', files.deck);
        if (files.gallery.length > 0) {
            files.gallery.forEach(file => data.append('gallery', file));
        }

        try {
            const token = localStorage.getItem('token');

            if (opportunityToEdit) {
                await axios.put(`${API_URL}/api/opportunities/${opportunityToEdit._id}`, data, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                });
            } else {
                await axios.post(`${API_URL}/api/opportunities`, data, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                });
            }
            onCreated();
            onClose();
            // Reset form logic could be here
        } catch (error) {
            console.error("Error creating opportunity:", error);
            toast.error("Failed to create opportunity. " + (error.response?.data?.message || ''));
        } finally {
            setLoading(false);
        }
    };

    const nextStep = () => setStep(step + 1);
    const prevStep = () => setStep(step - 1);

    // Role check
    console.log("CreateOpportunity User:", user);
    console.log("Is Investor?", user?.accountType?.toLowerCase() === 'investor');
    const isInvestor = user?.accountType?.toLowerCase() === 'investor';

    const renderStep1 = () => (
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                    {isInvestor ? 'Request Title (e.g., "Seed Stage AI SaaS")' : 'Startup Name / Title'}
                </label>
                <input
                    type="text"
                    required
                    placeholder={isInvestor ? "What are you looking for?" : "e.g. Acme AI: Revolutionizing Healthcare"}
                    className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:border-blue-500"
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Industry</label>
                <select
                    className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:border-blue-500"
                    value={formData.industry}
                    onChange={e => setFormData({ ...formData, industry: e.target.value })}
                >
                    <option value="">Select Industry</option>
                    <option value="Tech">Tech</option>
                    <option value="Health">Health</option>
                    <option value="Finance">Finance</option>
                    <option value="Education">Education</option>
                    <option value="Retail">Retail</option>
                </select>
            </div>

            {/* Conditional Fields */}
            {isInvestor ? (
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Requirement Description</label>
                    <textarea
                        required
                        rows="5"
                        placeholder="Describe what kind of startup or investment opportunity you are looking for..."
                        className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:border-blue-500"
                        value={formData.description}
                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                    />
                </div>
            ) : (
                <>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Problem Statement</label>
                        <textarea
                            required
                            rows="3"
                            placeholder="What specific problem are you solving?"
                            className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:border-blue-500"
                            value={formData.problem}
                            onChange={e => setFormData({ ...formData, problem: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Solution</label>
                        <textarea
                            required
                            rows="3"
                            placeholder="How does your product solve it?"
                            className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:border-blue-500"
                            value={formData.solution}
                            onChange={e => setFormData({ ...formData, solution: e.target.value })}
                        />
                    </div>
                </>
            )}
        </div>
    );

    const renderStep2 = () => (
        <div className="space-y-4">
            {!isInvestor && (
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Traction (Revenue, Users, etc.)</label>
                    <input
                        type="text"
                        placeholder="e.g. $10k MRR, 5000 Active Users"
                        className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:border-blue-500"
                        value={formData.traction}
                        onChange={e => setFormData({ ...formData, traction: e.target.value })}
                    />
                </div>
            )}

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Funding Stage</label>
                    <select
                        className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:border-blue-500"
                        value={formData.fundingStage}
                        onChange={e => setFormData({ ...formData, fundingStage: e.target.value })}
                    >
                        <option value="">Select Stage</option>
                        <option value="Pre-Seed">Pre-Seed</option>
                        <option value="Seed">Seed</option>
                        <option value="Series A">Series A</option>
                        <option value="Series B+">Series B+</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                        {isInvestor ? 'Ticket Size / Allocation' : 'Funding Ask / Round Size'}
                    </label>
                    <input
                        type="text"
                        placeholder={isInvestor ? "$50k - $200k" : "$100k - $500k"}
                        className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:border-blue-500"
                        value={formData.investmentRange}
                        onChange={e => setFormData({ ...formData, investmentRange: e.target.value })}
                    />
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Tags (Comma separated)</label>
                <input
                    type="text"
                    placeholder="AI, SaaS, B2B"
                    className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:border-blue-500"
                    value={formData.tags}
                    onChange={e => setFormData({ ...formData, tags: e.target.value })}
                />
            </div>
        </div>
    );

    const renderStep3 = () => (
        <div className="space-y-6">
            <div className="border border-dashed border-white/20 rounded-xl p-6 text-center hover:bg-white/5 transition-colors">
                <Upload className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                <label className="block text-sm font-medium text-white mb-1">
                    {isInvestor ? 'Reference Video (Optional)' : 'Pitch Video'}
                </label>
                <input
                    type="file"
                    accept="video/*"
                    onChange={e => handleFileChange(e, 'pitchVideo')}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                />
                <p className="text-xs text-gray-500 mt-2">Max 50MB. MP4, WebM.</p>
            </div>

            <div className="border border-dashed border-white/20 rounded-xl p-6 text-center hover:bg-white/5 transition-colors">
                <label className="block text-sm font-medium text-white mb-1">
                    {isInvestor ? 'Brief / Mandate (PDF - Optional)' : 'Pitch Deck (PDF)'}
                </label>
                <input
                    type="file"
                    accept=".pdf"
                    onChange={e => handleFileChange(e, 'deck')}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700"
                />
            </div>

            {!isInvestor && (
                <div className="border border-dashed border-white/20 rounded-xl p-6 text-center hover:bg-white/5 transition-colors">
                    <label className="block text-sm font-medium text-white mb-1">Gallery Images</label>
                    <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={e => handleFileChange(e, 'gallery')}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-600 file:text-white hover:file:bg-gray-700"
                    />
                </div>
            )}
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <div className="bg-[#111] rounded-3xl w-full max-w-2xl border border-white/10 overflow-hidden shadow-2xl">
                {/* Header */}
                <div className="p-6 border-b border-white/10 flex justify-between items-center bg-[#151515]">
                    <div>
                        <h2 className="text-xl font-bold text-white">
                            {opportunityToEdit
                                ? 'Update Opportunity'
                                : isInvestor ? 'Create Investment Request' : 'Pitch Your Startup'}
                        </h2>
                        <div className="flex items-center gap-2 mt-2">
                            {[1, 2, 3].map(i => (
                                <div key={i} className={`h-1.5 rounded-full transition-all ${step >= i ? 'w-8 bg-blue-500' : 'w-4 bg-gray-700'}`} />
                            ))}
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                            Logged in as: <span className="text-blue-400 font-bold uppercase">{user?.accountType || 'Unknown'}</span>
                        </p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white p-2 hover:bg-white/10 rounded-full transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 max-h-[65vh] overflow-y-auto">
                    {step === 1 && renderStep1()}
                    {step === 2 && renderStep2()}
                    {step === 3 && renderStep3()}
                </form>

                <div className="p-6 border-t border-white/10 bg-[#151515] flex justify-between items-center">
                    {step > 1 ? (
                        <button type="button" onClick={prevStep} className="flex items-center gap-2 px-6 py-2.5 text-gray-300 hover:text-white font-medium">
                            <ChevronLeft size={20} /> Back
                        </button>
                    ) : (
                        <div></div>
                    )}

                    {step < 3 ? (
                        <button type="button" onClick={nextStep} className="flex items-center gap-2 px-8 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold shadow-lg transition-all">
                            Next Step <ChevronRight size={20} />
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="flex items-center gap-2 px-8 py-2.5 bg-green-600 hover:bg-green-500 text-white rounded-xl font-bold shadow-lg transition-all disabled:opacity-50"
                        >
                            {loading ? 'Processing...' : (opportunityToEdit ? 'Update Opportunity' : 'Publish Opportunity')} <Check size={20} />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CreateOpportunity;
