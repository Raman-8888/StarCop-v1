import React, { useState, useRef, useEffect } from 'react';
import { Download, File, FileText, Image as ImageIcon, Video as VideoIcon, Trash2, MoreVertical } from 'lucide-react';

export default function MessageBubble({ message, isMine, onDelete }) {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);
  const hasAttachments = message?.attachments && message.attachments.length > 0;

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  const getFileIcon = (attachment) => {
    switch (attachment.type) {
      case 'image': return <ImageIcon className="w-4 h-4" />;
      case 'video': return <VideoIcon className="w-4 h-4" />;
      case 'pdf': return <FileText className="w-4 h-4" />;
      default: return <File className="w-4 h-4" />;
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const handleDownload = () => {
    // Download all attachments
    message.attachments?.forEach(attachment => {
      const link = document.createElement('a');
      link.href = attachment.url;
      link.download = attachment.filename;
      link.click();
    });
    setShowMenu(false);
  };

  const handleDelete = () => {
    onDelete(message._id);
    setShowMenu(false);
  };

  return (
    <div className={`flex ${isMine ? "justify-end" : "justify-start"} group`}>
      <div
        className={`relative rounded-xl max-w-[70%] shadow-lg backdrop-blur-md ${isMine
          ? "bg-gradient-to-br from-purple-600/90 to-purple-700/90 text-white shadow-purple-900/30"
          : "bg-gradient-to-br from-white/10 to-white/5 text-white shadow-black/40 backdrop-blur-xl"
          }`}
        style={{
          boxShadow: isMine
            ? '0 4px 6px -1px rgba(126, 34, 206, 0.3), 0 2px 4px -1px rgba(126, 34, 206, 0.2), inset 0 1px 0 0 rgba(255, 255, 255, 0.1)'
            : '0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -1px rgba(0, 0, 0, 0.3), inset 0 1px 0 0 rgba(255, 255, 255, 0.05)'
        }}
      >
        {/* Text Message */}
        {message.text && (
          <div className={`px-4 py-2 ${isMine ? 'text-right' : 'text-left'}`}>
            {message.text}
          </div>
        )}

        {/* File Attachments */}
        {hasAttachments && (
          <div className={`space-y-2 p-2 ${isMine ? 'flex flex-col items-end' : 'flex flex-col items-start'}`}>
            {message.attachments.map((attachment, index) => (
              <div key={index}>
                {/* Image Preview */}
                {attachment.type === 'image' && (
                  <div className="rounded-lg overflow-hidden max-w-sm shadow-md">
                    <img
                      src={attachment.url}
                      alt={attachment.filename}
                      className="w-full h-auto cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => window.open(attachment.url, '_blank')}
                    />
                  </div>
                )}

                {/* Video Preview */}
                {attachment.type === 'video' && (
                  <div className="rounded-lg overflow-hidden max-w-sm shadow-md">
                    <video
                      src={attachment.url}
                      controls
                      className="w-full h-auto"
                    />
                  </div>
                )}

                {/* PDF and Document Downloads */}
                {(attachment.type === 'pdf' || attachment.type === 'document' || attachment.type === 'other') && (
                  <a
                    href={attachment.url}
                    download={attachment.filename}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center gap-3 p-3 rounded-lg transition-colors shadow-sm ${isMine
                      ? 'bg-purple-700/50 hover:bg-purple-700/70'
                      : 'bg-white/20 hover:bg-white/30'
                      }`}
                  >
                    <div className="flex-shrink-0">
                      {getFileIcon(attachment)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{attachment.filename}</p>
                      <p className="text-xs opacity-75">{formatFileSize(attachment.size)}</p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{attachment.filename}</p>
                      <p className="text-xs opacity-75">{formatFileSize(attachment.size)}</p>
                    </div>
                    <Download className="w-4 h-4 flex-shrink-0" />
                  </a>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Dropdown Menu Button - Left Side */}
        {isMine && (
          <div className="absolute top-1 left-1" ref={menuRef}>
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 hover:bg-black/20 rounded-full transition-all opacity-0 group-hover:opacity-100 transform hover:scale-110"
            >
              <MoreVertical className="w-5 h-5" />
            </button>

            {/* Dropdown Menu */}
            {showMenu && (
              <div
                className="absolute top-10 left-0 rounded-xl shadow-2xl overflow-hidden z-10 min-w-[150px]"
                style={{
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -2px rgba(0, 0, 0, 0.3), inset 0 1px 0 0 rgba(255, 255, 255, 0.05)'
                }}
              >
                {hasAttachments && (
                  <button
                    onClick={handleDownload}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/10 transition-colors text-left text-sm font-medium"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download</span>
                  </button>
                )}
                <button
                  onClick={handleDelete}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-500/20 text-red-400 transition-colors text-left text-sm font-medium"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
