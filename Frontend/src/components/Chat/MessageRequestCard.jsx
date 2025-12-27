import React from 'react';
import { FileText, Video, Image as ImageIcon, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';
import { acceptMessageRequest, rejectMessageRequest } from '../../services/messageRequestService';

const MessageRequestCard = ({ request, onStatusUpdate, onSelect }) => {
    const { senderId, firstMessageId, createdAt } = request;

    const handleAccept = async (e) => {
        e.stopPropagation();
        try {
            await acceptMessageRequest(request._id);
            toast.success('Request accepted');
            if (onStatusUpdate) onStatusUpdate();
        } catch (error) {
            console.error('Accept error:', error);
            toast.error('Failed to accept request');
        }
    };

    const handleReject = async (e) => {
        e.stopPropagation();
        try {
            await rejectMessageRequest(request._id);
            toast.success('Request rejected');
            if (onStatusUpdate) onStatusUpdate();
        } catch (error) {
            console.error('Reject error:', error);
            toast.error('Failed to reject request');
        }
    };

    const getFileIcon = (fileType) => {
        switch (fileType) {
            case 'video': return <Video size={12} className="text-purple-400" />;
            case 'pdf': return <FileText size={12} className="text-red-400" />;
            case 'image': return <ImageIcon size={12} className="text-blue-400" />;
            default: return <FileText size={12} className="text-gray-400" />;
        }
    };

    return (
        <div
            onClick={() => onSelect(request)}
            className="p-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl cursor-pointer transition-all group"
        >
            <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                    <img
                        src={senderId.profilePicture || 'https://via.placeholder.com/40'}
                        alt={senderId.name}
                        className="w-10 h-10 rounded-full object-cover border border-white/10"
                    />
                    <div>
                        <h4 className="text-white font-medium text-sm">{senderId.name}</h4>
                        <p className="text-xs text-gray-400">@{senderId.username}</p>
                    </div>
                </div>
                <span className="text-[10px] text-gray-500">
                    {dayjs(createdAt).format('MMM D')}
                </span>
            </div>

            <div className="ml-12">
                <p className="text-sm text-gray-300 line-clamp-2 mb-2">
                    {firstMessageId.text || (
                        <span className="italic text-gray-400">Sent an attachment</span>
                    )}
                </p>

                {firstMessageId.attachments?.length > 0 && (
                    <div className="flex items-center gap-2 mb-3">
                        <div className="flex items-center gap-1.5 px-2 py-1 bg-black/20 rounded text-xs text-gray-400">
                            {getFileIcon(firstMessageId.attachments[0].type)}
                            <span>Attachment</span>
                        </div>
                    </div>
                )}

                <div className="flex gap-2 mt-2">
                    <button
                        onClick={handleAccept}
                        className="flex-1 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded-lg transition-colors"
                    >
                        Accept
                    </button>
                    <button
                        onClick={handleReject}
                        className="flex-1 py-1.5 bg-white/5 hover:bg-red-500/20 text-gray-300 hover:text-red-400 border border-white/10 hover:border-red-500/30 text-xs font-medium rounded-lg transition-colors"
                    >
                        Reject
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MessageRequestCard;
