import React, { useState } from "react";
import { Send } from "lucide-react";

export default function MessageInput({ onSendMessage }) {
  const [text, setText] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSendMessage(text);
    setText("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex mt-4 relative">
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="flex-grow px-3 py-2 rounded-l border bg-gray-800 text-white outline-none placeholder-gray-400"
        placeholder="Type a message..."
      />
      <button
        type="submit"
        className="px-4 py-2 bg-purple-600 text-white rounded-r hover:bg-purple-700 transition-colors"
      >
        <Send className="w-4 h-4" />
      </button>
    </form>
  );
}
