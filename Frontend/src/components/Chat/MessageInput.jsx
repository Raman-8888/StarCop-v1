import React, { useState, useRef } from "react";
import { Send, Paperclip, X, File, Image, Video, FileText } from "lucide-react";

export default function MessageInput({ onSendMessage, disabled = false }) {
  const [text, setText] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      const validFiles = filesArray.filter(file => {
        // 50MB limit
        if (file.size > 50 * 1024 * 1024) {
          console.error(`File ${file.name} is too large (max 50MB)`);
          return false;
        }
        return true;
      });
      setSelectedFiles(prev => [...prev, ...validFiles]);
    }
  };

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if ((!text.trim() && selectedFiles.length === 0) || disabled || isUploading) return;

    try {
      setIsUploading(true);
      await onSendMessage(text, selectedFiles);
      setText("");
      setSelectedFiles([]);
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const getFileIcon = (type) => {
    if (type.startsWith("image/")) return <Image size={16} className="text-blue-400" />;
    if (type.startsWith("video/")) return <Video size={16} className="text-purple-400" />;
    if (type.includes("pdf")) return <FileText size={16} className="text-red-400" />;
    return <File size={16} className="text-gray-400" />;
  };

  return (
    <div className="space-y-2">
      {/* File Previews */}
      {selectedFiles.length > 0 && (
        <div className="flex flex-wrap gap-2 p-2 bg-white/5 rounded-lg max-h-32 overflow-y-auto">
          {selectedFiles.map((file, index) => (
            <div key={index} className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-full border border-white/10">
              {getFileIcon(file.type)}
              <span className="text-xs text-gray-200 truncate max-w-[100px]">{file.name}</span>
              <button
                onClick={() => removeFile(index)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex gap-2 items-end">
        <input
          type="file"
          multiple
          ref={fileInputRef}
          onChange={handleFileSelect}
          className="hidden"
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading || disabled}
          className="p-3 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-[1px]"
          title="Attach files"
        >
          <Paperclip className="w-5 h-5" />
        </button>

        <div className="flex-grow relative">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={isUploading || disabled}
            className="w-full pl-4 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none placeholder-gray-400 focus:border-purple-500/50 focus:bg-white/10 transition-all disabled:opacity-50"
            placeholder={disabled ? "Messaging unavailable" : "Type a message..."}
          />
        </div>

        <button
          type="submit"
          disabled={(!text.trim() && selectedFiles.length === 0) || isUploading || disabled}
          className="p-3 bg-purple-600 text-white rounded-xl hover:bg-purple-500 shadow-lg shadow-purple-900/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none mb-[1px]"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
}
