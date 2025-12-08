import React, { useState } from 'react';
import axios from 'axios';
import { X } from 'lucide-react';

const ApplyModal = ({ isOpen, onClose, opportunityId, onApplied }) => {
    const [formData, setFormData] = useState({
        proposal: '',
        pitchDeck: '',
        videoLink: ''
    });

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.post(`http://localhost:3002/api/opportunities/${opportunityId}/apply`, formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            onApplied();
            onClose();
        } catch (error) {
            console.error("Error applying:", error);
            alert("Failed to apply. You might have already applied.");
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-[#1A1A1A] rounded-2xl w-full max-w-lg border border-white/10">
                <div className="p-6 border-b border-white/10 flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-white">Apply to Opportunity</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Why are you a good fit?</label>
                        <textarea
                            required
                            rows="5"
                            className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500"
                            placeholder="Write your proposal here..."
                            value={formData.proposal}
                            onChange={(e) => setFormData({ ...formData, proposal: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Pitch Deck URL (Optional)</label>
                        <input
                            type="url"
                            className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500"
                            placeholder="https://..."
                            value={formData.pitchDeck}
                            onChange={(e) => setFormData({ ...formData, pitchDeck: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Video Pitch URL (Optional)</label>
                        <input
                            type="url"
                            className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500"
                            placeholder="https://..."
                            value={formData.videoLink}
                            onChange={(e) => setFormData({ ...formData, videoLink: e.target.value })}
                        />
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-400 hover:text-white"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg font-medium"
                        >
                            Submit Application
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ApplyModal;
