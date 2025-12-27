import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, ZoomIn, ZoomOut, RotateCw, Check } from 'lucide-react';
import { getCroppedImg, validateImageFile } from '../utils/imageCrop';
import toast from 'react-hot-toast';

const ThumbnailCropper = ({ isOpen, onClose, onCropComplete }) => {
    const [imageSrc, setImageSrc] = useState(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    const onCropChange = (crop) => {
        setCrop(crop);
    };

    const onZoomChange = (zoom) => {
        setZoom(zoom);
    };

    const onCropAreaChange = useCallback((croppedArea, croppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const handleFileSelect = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            processFile(file);
        }
    };

    const processFile = (file) => {
        const validation = validateImageFile(file, 5);
        if (!validation.valid) {
            toast.error(validation.error);
            return;
        }

        const reader = new FileReader();
        reader.addEventListener('load', () => {
            setImageSrc(reader.result?.toString() || '');
        });
        reader.readAsDataURL(file);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);

        const file = e.dataTransfer.files?.[0];
        if (file) {
            processFile(file);
        }
    };

    const handleCropConfirm = async () => {
        if (!imageSrc || !croppedAreaPixels) return;

        setIsProcessing(true);
        try {
            const croppedBlob = await getCroppedImg(
                imageSrc,
                croppedAreaPixels,
                0,
                1280,
                720
            );

            // Convert blob to File object
            const croppedFile = new File([croppedBlob], 'thumbnail.jpg', {
                type: 'image/jpeg',
            });

            onCropComplete(croppedFile);
            handleReset();
            onClose();
            toast.success('Thumbnail cropped successfully!');
        } catch (error) {
            console.error('Crop error:', error);
            toast.error('Failed to crop image. Please try again.');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleReset = () => {
        setImageSrc(null);
        setCrop({ x: 0, y: 0 });
        setZoom(1);
        setCroppedAreaPixels(null);
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/90 backdrop-blur-sm"
                />

                {/* Modal */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative w-full max-w-4xl bg-[#111] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
                >
                    {/* Header */}
                    <div className="p-6 border-b border-white/10 flex justify-between items-center">
                        <div>
                            <h3 className="text-xl font-bold text-white">Adjust Thumbnail</h3>
                            <p className="text-sm text-gray-400 mt-1">
                                Crop your image to 16:9 aspect ratio (1280x720)
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/10 rounded-full transition-colors"
                        >
                            <X className="w-5 h-5 text-gray-400" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        {!imageSrc ? (
                            // Upload Zone
                            <div
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                className={`relative border-2 border-dashed rounded-xl transition-all ${isDragging
                                        ? 'border-blue-500 bg-blue-500/10'
                                        : 'border-white/20 bg-white/5'
                                    }`}
                            >
                                <label className="flex flex-col items-center justify-center py-20 cursor-pointer">
                                    <Upload className="w-16 h-16 text-gray-400 mb-4" />
                                    <p className="text-lg font-semibold text-white mb-2">
                                        Drop your image here
                                    </p>
                                    <p className="text-sm text-gray-400 mb-4">
                                        or click to browse
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        JPG, PNG, or WebP • Max 5MB
                                    </p>
                                    <input
                                        type="file"
                                        accept="image/jpeg,image/jpg,image/png,image/webp"
                                        onChange={handleFileSelect}
                                        className="hidden"
                                    />
                                </label>
                            </div>
                        ) : (
                            // Cropper
                            <div className="space-y-6">
                                {/* Crop Area */}
                                <div className="relative bg-black rounded-xl overflow-hidden" style={{ height: '400px' }}>
                                    <Cropper
                                        image={imageSrc}
                                        crop={crop}
                                        zoom={zoom}
                                        aspect={16 / 9}
                                        onCropChange={onCropChange}
                                        onZoomChange={onZoomChange}
                                        onCropComplete={onCropAreaChange}
                                        objectFit="contain"
                                        showGrid={true}
                                        style={{
                                            containerStyle: {
                                                backgroundColor: '#000',
                                            },
                                            cropAreaStyle: {
                                                border: '2px solid #3b82f6',
                                            },
                                        }}
                                    />
                                </div>

                                {/* Zoom Control */}
                                <div className="flex items-center gap-4">
                                    <ZoomOut className="w-5 h-5 text-gray-400" />
                                    <input
                                        type="range"
                                        min={1}
                                        max={3}
                                        step={0.1}
                                        value={zoom}
                                        onChange={(e) => setZoom(Number(e.target.value))}
                                        className="flex-1 h-2 bg-white/10 rounded-lg appearance-none cursor-pointer slider"
                                    />
                                    <ZoomIn className="w-5 h-5 text-gray-400" />
                                    <span className="text-sm text-gray-400 w-12 text-right">
                                        {zoom.toFixed(1)}x
                                    </span>
                                </div>

                                {/* Info */}
                                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                                    <p className="text-sm text-blue-400">
                                        💡 Drag to reposition • Pinch or scroll to zoom • Final size: 1280x720
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-4 bg-white/5 border-t border-white/5 flex justify-between items-center">
                        <div>
                            {imageSrc && (
                                <button
                                    onClick={handleReset}
                                    className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors"
                                >
                                    Reset
                                </button>
                            )}
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={onClose}
                                className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors"
                            >
                                Cancel
                            </button>
                            {imageSrc && (
                                <button
                                    onClick={handleCropConfirm}
                                    disabled={isProcessing}
                                    className="px-6 py-2 rounded-lg text-sm font-bold text-white shadow-lg transition-all active:scale-95 flex items-center gap-2 bg-blue-600 hover:bg-blue-500 shadow-blue-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isProcessing ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            <Check size={16} />
                                            Apply Crop
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                </motion.div>

                <style jsx>{`
                    .slider::-webkit-slider-thumb {
                        appearance: none;
                        width: 16px;
                        height: 16px;
                        background: #3b82f6;
                        border-radius: 50%;
                        cursor: pointer;
                    }
                    .slider::-moz-range-thumb {
                        width: 16px;
                        height: 16px;
                        background: #3b82f6;
                        border-radius: 50%;
                        cursor: pointer;
                        border: none;
                    }
                `}</style>
            </div>
        </AnimatePresence>
    );
};

export default ThumbnailCropper;
