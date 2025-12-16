import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Trash2, X } from 'lucide-react';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = "Delete", isDestructive = true }) => {
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
                    className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                />

                {/* Modal */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative w-full max-w-md bg-[#111] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
                >
                    <div className="p-6">
                        <div className="flex items-start gap-4">
                            <div className={`p-3 rounded-full ${isDestructive ? 'bg-red-500/10 text-red-500' : 'bg-blue-500/10 text-blue-500'}`}>
                                {isDestructive ? <AlertTriangle size={24} /> : <div className="w-6 h-6" />}
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
                                <p className="text-gray-400 text-sm leading-relaxed">
                                    {message}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 bg-white/5 border-t border-white/5 flex justify-end gap-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => {
                                onConfirm();
                                onClose();
                            }}
                            className={`px-6 py-2 rounded-lg text-sm font-bold text-white shadow-lg transition-all active:scale-95 flex items-center gap-2
                                ${isDestructive
                                    ? 'bg-red-600 hover:bg-red-500 shadow-red-900/20'
                                    : 'bg-blue-600 hover:bg-blue-500 shadow-blue-900/20'
                                }`}
                        >
                            {isDestructive && <Trash2 size={16} />}
                            {confirmText}
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default ConfirmationModal;
