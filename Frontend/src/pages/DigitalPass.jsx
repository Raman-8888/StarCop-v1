import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { API_URL } from '../config';
import ProfileCard from '../components/ProfileCard';
import LoginScene3D from '../components/3d/LoginScene3D';

const DigitalPass = () => {
    const { username } = useParams();
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await fetch(`${API_URL}/api/users/${username}`);
                const data = await response.json();

                if (response.ok) {
                    setProfile(data.user);
                } else {
                    setError(data.message || 'Failed to load profile');
                }
            } catch (err) {
                console.error(err);
                setError('Error loading profile');
            } finally {
                setLoading(false);
            }
        };

        if (username) {
            fetchProfile();
        }
    }, [username]);

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-black text-white">Loading...</div>;
    if (error) return <div className="min-h-screen flex items-center justify-center bg-black text-red-500">{error}</div>;
    if (!profile) return <div className="min-h-screen flex items-center justify-center bg-black text-white">User not found</div>;

    return (
        <div className="relative min-h-screen flex flex-col items-center justify-center p-4 overflow-hidden bg-black font-sans">
            {/* 3D Background */}
            <LoginScene3D />

            {/* Back Button */}
            <button
                onClick={() => navigate(-1)}
                className="absolute top-8 left-8 p-3 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-colors z-30"
            >
                <ArrowLeft className="w-6 h-6" />
            </button>

            <div className="relative z-20 flex flex-col items-center">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">Digital Pass</h1>
                    <p className="text-gray-400">Scan to view full profile details</p>
                </div>

                <div className="scale-100 md:scale-110 transform transition-transform">
                    <ProfileCard profile={profile} />
                </div>
            </div>
        </div>
    );
};

export default DigitalPass;

