
export default function MessageBubble({ msg, isMine }) {
  return (
    <div className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
      <div className={`px-4 py-2 rounded-lg max-w-[70%] ${isMine ? "bg-purple-600 text-white" : "bg-white/10 text-white"
        }`}>
        {msg.text}
      </div>
    </div>
  );
}
