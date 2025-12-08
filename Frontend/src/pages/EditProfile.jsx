import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Camera, Save, X } from 'lucide-react';
import { API_URL } from '../config';

export default function EditProfile() {
    const { user, login } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [imagePreview, setImagePreview] = useState(user?.profilePicture || '');

    // Basic fields
    const [formData, setFormData] = useState({
        name: user?.name || '',
        bio: user?.bio || '',
        phoneNumber: user?.phoneNumber || '',
        // Extended details could be here too, but for simplicity we'll focus on the core profile parts requested
        // and maybe link to the deeper "Complete Profile" pages for the specific business logic if needed.
        // But the user asked for "Edit Profile" button. 
        // Let's allow editing the basic fields + "Location" as requested in the must-have list.
    });

    const [location, setLocation] = useState('');

    useEffect(() => {
        if (user) {
            const loc = user.accountType === 'startup' ? user.startupDetails?.location : user.investorDetails?.location;
            setLocation(loc || '');
        }
    }, [user]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // We need to construct the payload handling potentially nested objects for location
            // Since location is inside startupDetails or investorDetails
            const payload = {
                ...formData,
            };

            if (user.accountType === 'startup') {
                payload.startupDetails = { ...user.startupDetails, location };
            } else if (user.accountType === 'investor') {
                payload.investorDetails = { ...user.investorDetails, location };
            }

            // Note: Image upload usually requires a separate flow (uploading file -> getting URL)
            // For this demo, we assume the user might input a URL or we skip the file upload UI complexity
            // unless we have an Upload component ready. 
            // We can just keep the profilePicture if it's in formData (if we added it).
            // Since I didn't add profilePicture input yet, let's assume it's just text for now or we add a URL input.

            // Quick Fix: Add simple URL input for profile picture for now, or assume separate upload logic.
            // Given the requirements, I'll stick to text inputs to keep it clean, 
            // but I should add a way to change the PP if possible.
            // I'll add a simple URL input for Profile Picture to formData.

            if (imagePreview !== user.profilePicture) {
                payload.profilePicture = imagePreview;
            }

            const response = await fetch(`${API_URL}/api/auth/update-profile`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (data.success) {
                login({ ...user, ...data.user });
                navigate('/profile');
            } else {
                alert(data.message || 'Failed to update profile');
            }
        } catch (error) {
            console.error(error);
            alert('Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
            <div className="w-full max-w-2xl bg-gray-900 rounded-2xl border border-white/10 overflow-hidden">
                <div className="p-6 border-b border-white/10 flex items-center justify-between">
                    <h2 className="text-xl font-bold">Edit Profile</h2>
                    <button onClick={() => navigate('/profile')} className="text-gray-400 hover:text-white">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Profile Picture */}
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-purple-500 bg-gray-800 relative group">
                            {imagePreview ? (
                                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-500">
                                    <Camera className="w-8 h-8" />
                                </div>
                            )}
                            {/* Overlay for fake upload or URL input hint */}
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                <span className="text-xs">Change URL</span>
                            </div>
                        </div>
                        <input
                            type="text"
                            placeholder="Profile Picture URL"
                            value={imagePreview}
                            onChange={(e) => setImagePreview(e.target.value)}
                            className="bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm w-full max-w-xs text-center focus:border-purple-500 outline-none"
                        />
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Full Name</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:border-purple-500 outline-none transition-colors"
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Bio</label>
                            <textarea
                                name="bio"
                                value={formData.bio}
                                onChange={handleChange}
                                rows="3"
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:border-purple-500 outline-none transition-colors resize-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Location</label>
                            <input
                                type="text"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:border-purple-500 outline-none transition-colors"
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Phone Number</label>
                            <input
                                type="tel"
                                name="phoneNumber"
                                value={formData.phoneNumber}
                                onChange={handleChange}
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:border-purple-500 outline-none transition-colors"
                            />
                        </div>
                    </div>

                    <div className="pt-4 flex gap-4">
                        <button
                            type="button"
                            onClick={() => navigate('/profile')}
                            className="flex-1 py-3 rounded-xl border border-white/10 hover:bg-white/5 transition-colors font-semibold"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 transition-colors font-semibold flex items-center justify-center gap-2"
                        >
                            <Save className="w-4 h-4" />
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
