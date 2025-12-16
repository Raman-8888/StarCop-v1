import React, { useState } from 'react';
import axios from 'axios';
import { X, Upload, Send, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { API_URL } from '../config';

const SendInterestModal = ({ isOpen, onClose, opportunityId, onSuccess }) => {
    const [message, setMessage] = useState('');
    const [video, setVideo] = useState(null);
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const token = localStorage.getItem('token');
            let requestVideoUrl = '';

            // 1. Upload Video if present
            if (video) {
                const formData = new FormData();
                formData.append('file', video);
                formData.append('upload_preset', 'ml_default'); // Assuming unsigned or handle via backend signature if needed. 
                // Wait, previous implementation in createOpportunity used backend logic? 
                // Ah, previous CreateOpportunity sent file to backend via Multer.
                // We should do the same here. BUT sendInterest endpoint currently only accepts JSON body with 'message'.
                // I need to update sendInterest endpoint to handle file upload OR use the same helper?
                // Actually, opportunity.routes.js sendInterest is likely just a POST with JSON.
                // Checking opportunity.routes.js ... (I didn't explicitly modify it to add upload middleware for sendInterest).
                // I need to fix backend route for sendInterest to accept files! or implement client-side upload.
                // Given the backend pattern usually is "Backend handles upload", let's assume I need to update backend route too.
                // But specifically for this Modal, let's look at how CreateOpportunity did it.
                // It sent FormData to /api/opportunities.
                // So sendInterest needs to be updated to handle Form Data.
            }

            // Wait, I can't easily change the backend *right now* inside this write_to_filethought flow without a separate step.
            // AND I missed updating the route for interest to use multer.
            // Let's implement this Modal to send JSON for now, and I will fix the backend in next step.
            // Actually, I can use the same pattern: Client sends FormData, Backend uses Multer + Cloudinary.

            const formData = new FormData();
            formData.append('message', message);
            if (video) formData.append('requestVideo', video);

            await axios.post(`${API_URL}/api/opportunities/${opportunityId}/interest`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            onSuccess();
            onClose();
            toast.success('Interest sent successfully!');
        } catch (error) {
            console.error("Failed to send interest", error);
            if (error.response?.status === 400 && error.response?.data?.message === "Interest already sent") {
                toast.success("You have already sent interest to this opportunity.");
                onSuccess(); // Update UI to show 'Request Sent'
                onClose();
            } else {
                toast.error(error.response?.data?.message || "Failed to send interest");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-[#111] rounded-2xl w-full max-w-md border border-white/10 shadow-2xl overflow-hidden">
                <div className="p-5 border-b border-white/10 flex justify-between items-center bg-[#151515]">
                    <h3 className="text-lg font-bold text-white">Send Interest</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-white/10">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Message</label>
                        <textarea
                            rows="4"
                            placeholder="Introduce yourself and explain why you're interested..."
                            className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:border-blue-500 focus:outline-none resize-none"
                            value={message}
                            onChange={e => setMessage(e.target.value)}
                        />
                    </div>

                    <div className="border border-dashed border-white/20 rounded-xl p-4 text-center hover:bg-white/5 transition-colors cursor-pointer relative">
                        <input
                            type="file"
                            accept="video/*"
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            onChange={e => {
                                const file = e.target.files[0];
                                if (file) {
                                    if (file.size > 50 * 1024 * 1024) { // 50MB
                                        toast.error(`File ${file.name} is too large. Max size is 50MB.`);
                                        e.target.value = null; // Reset
                                        return;
                                    }
                                    setVideo(file);
                                }
                            }}
                        />
                        <div className="flex flex-col items-center gap-2">
                            <Upload className="text-blue-500" size={24} />
                            <span className="text-sm text-gray-400">
                                {video ? video.name : "Attach a video pitch (Max 50MB)"}
                            </span>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {loading ? 'Sending...' : 'Send Request'} <Send size={18} />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default SendInterestModal;
