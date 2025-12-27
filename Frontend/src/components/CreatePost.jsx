import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Image, X, Send, Loader2 } from 'lucide-react';
import { API_URL } from '../config';

const CreatePost = ({ onPostCreated }) => {
    const { user } = useAuth();
    const [caption, setCaption] = useState('');
    const [file, setFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [loading, setLoading] = useState(false);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setPreviewUrl(URL.createObjectURL(selectedFile));
        }
    };

    const clearFile = () => {
        setFile(null);
        setPreviewUrl('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!caption && !file) return;

        setLoading(true);

        try {
            const formData = new FormData();
            formData.append('caption', caption);
            if (file) {
                formData.append('image', file); // 'image' key matches backend middleware
            }

            const response = await fetch(`${API_URL}/api/posts`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${user.token}`
                },
                body: formData
            });

            const data = await response.json();

            if (response.ok) {
                setCaption('');
                clearFile();
                if (onPostCreated) onPostCreated(data);
            } else {
                alert(data.message || 'Failed to create post');
            }
        } catch (error) {
            console.error('Error creating post:', error);
            alert('Failed to create post');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-gray-900 rounded-xl border border-white/10 p-4 mb-8">
            <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-800 flex-shrink-0">
                    {user?.profilePicture ? (
                        <img src={user.profilePicture} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-500 font-bold">
                            {user?.name?.charAt(0).toUpperCase()}
                        </div>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="flex-1 space-y-4">
                    <textarea
                        value={caption}
                        onChange={(e) => setCaption(e.target.value)}
                        placeholder="What's on your mind?"
                        rows="2"
                        className="w-full bg-transparent border-none focus:ring-0 text-white placeholder-gray-500 resize-none py-2"
                    />

                    {previewUrl && (
                        <div className="relative rounded-lg overflow-hidden bg-black/50 max-h-64 inline-block">
                            {file?.type?.startsWith('video/') ? (
                                <video src={previewUrl} controls className="max-h-64 object-contain" />
                            ) : (
                                <img src={previewUrl} alt="Preview" className="max-h-64 object-contain" />
                            )}
                            <button
                                type="button"
                                onClick={clearFile}
                                className="absolute top-2 right-2 p-1 bg-black/60 rounded-full text-white hover:bg-black/80 transition-colors z-10"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    )}

                    <div className="flex items-center justify-between md:justify-start gap-4 pt-2 border-t border-white/5">
                        <label className="cursor-pointer flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors bg-purple-500/10 px-4 py-2 rounded-lg">
                            <Image className="w-5 h-5" />
                            <span className="text-sm font-medium">Add Photo/Video</span>
                            <input
                                type="file"
                                accept="image/*,video/*"
                                onChange={handleFileChange}
                                className="hidden"
                            />
                        </label>

                        <button
                            type="submit"
                            disabled={loading || (!caption && !file)}
                            className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                            Post
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreatePost;
