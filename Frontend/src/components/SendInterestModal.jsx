import React, { useState } from 'react';
import axios from 'axios';
import { X, Upload, Send, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { API_URL } from '../config';

const SendInterestModal = ({ isOpen, onClose, opportunityId, onSuccess }) => {
    const [message, setMessage] = useState('');
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
        const validFiles = [];

        for (const file of selectedFiles) {
            // Check file size (50MB max)
            if (file.size > 50 * 1024 * 1024) {
                toast.error(`${file.name} is too large. Max size is 50MB.`);
                continue;
            }

            // Check file type
            const validTypes = ['video/', 'image/', 'application/pdf'];
            const isValid = validTypes.some(type => file.type.startsWith(type) || file.type === 'application/pdf');

            if (!isValid) {
                toast.error(`${file.name} is not a supported file type. Please upload video, image, or PDF files.`);
                continue;
            }

            validFiles.push(file);
        }

        setFiles(prev => [...prev, ...validFiles]);
    };

    const removeFile = (index) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const token = localStorage.getItem('token');
            const formData = new FormData();

            formData.append('message', message);

            // Append all files as 'attachments'
            files.forEach(file => {
                formData.append('attachments', file);
            });

            await axios.post(`${API_URL}/api/opportunities/${opportunityId}/interest`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            onSuccess();
            onClose();
            setMessage('');
            setFiles([]);
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
                            accept="video/*,image/*,application/pdf"
                            multiple
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            onChange={handleFileChange}
                        />
                        <div className="flex flex-col items-center gap-2">
                            <Upload className="text-blue-500" size={24} />
                            <span className="text-sm text-gray-400">
                                Attach files (video, images, PDF) - Max 50MB each
                            </span>
                        </div>
                    </div>

                    {/* File Preview */}
                    {files.length > 0 && (
                        <div className="space-y-2">
                            {files.map((file, index) => (
                                <div key={index} className="flex items-center justify-between bg-black/40 border border-white/10 rounded-lg p-2">
                                    <div className="flex items-center gap-2 flex-1 min-w-0">
                                        <Check className="text-green-500 flex-shrink-0" size={16} />
                                        <span className="text-sm text-white truncate">{file.name}</span>
                                        <span className="text-xs text-gray-500 flex-shrink-0">
                                            ({(file.size / 1024 / 1024).toFixed(2)} MB)
                                        </span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => removeFile(index)}
                                        className="text-red-400 hover:text-red-300 p-1 flex-shrink-0"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

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
