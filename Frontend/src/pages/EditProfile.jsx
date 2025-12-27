import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Camera, Save, X } from 'lucide-react';
import { API_URL } from '../config';
import ProfilePictureCropper from '../components/ProfilePictureCropper';

export default function EditProfile() {
    const { user, login } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [imagePreview, setImagePreview] = useState(user?.profilePicture || '');
    const [file, setFile] = useState(null);
    const [isCropperOpen, setIsCropperOpen] = useState(false);

    // Basic fields
    const [formData, setFormData] = useState({
        name: user?.name || '',
        bio: user?.bio || '',
        phoneNumber: user?.phoneNumber || '',
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
            const formDataToSend = new FormData();
            formDataToSend.append('name', formData.name);
            formDataToSend.append('bio', formData.bio);
            formDataToSend.append('phoneNumber', formData.phoneNumber);
            formDataToSend.append('location', location);

            if (file) {
                formDataToSend.append('profilePicture', file);
            }

            // Note: If you need nested objects like startupDetails/investorDetails, 
            // you might need to handle them differently with FormData or the backend should accept flat fields and structure them.
            // Based on my backend update, I used flat fields (bio, location, website) and updated them.
            // The backend controller: const { bio, location, website } = req.body;
            // So sending them as flat fields in FormData works perfectly with the updated controller.

            const response = await fetch(`${API_URL}/api/users/update`, { // Updated endpoint based on user.routes.js
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${user.token}`
                    // Do NOT set Content-Type header when sending FormData, browser does it automatically with boundary
                },
                body: formDataToSend
            });

            const data = await response.json();

            if (response.ok) { // Check response.ok property
                login({ ...user, ...data }); // Update context with new user data
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
        <div className="min-h-screen text-white flex items-center justify-center p-4">
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
                        <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-purple-500 bg-gray-800">
                            {imagePreview ? (
                                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-500">
                                    <Camera className="w-8 h-8" />
                                </div>
                            )}
                        </div>
                        <button
                            type="button"
                            onClick={() => setIsCropperOpen(true)}
                            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-semibold transition-colors flex items-center gap-2"
                        >
                            <Camera className="w-4 h-4" />
                            {imagePreview ? 'Change Photo' : 'Upload Photo'}
                        </button>
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

            {/* Profile Picture Cropper Modal */}
            <ProfilePictureCropper
                isOpen={isCropperOpen}
                onClose={() => setIsCropperOpen(false)}
                currentImage={imagePreview}
                onCropComplete={(croppedFile, previewUrl) => {
                    setFile(croppedFile);
                    setImagePreview(previewUrl);
                }}
            />
        </div>
    );
}
