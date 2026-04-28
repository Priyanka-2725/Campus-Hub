export default function MessageBubble({ message, isOwnMessage }) {
  return (
    <div className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[75%] rounded-3xl px-4 py-3 shadow-sm ${
          isOwnMessage ? "bg-pine text-white" : "bg-white text-slate-800"
        }`}
      >
        <p className="text-sm leading-6">{message.content}</p>
        <p
          className={`mt-2 text-[11px] uppercase tracking-[0.2em] ${
            isOwnMessage ? "text-white/70" : "text-slate-400"
          }`}
        >
          {new Date(message.timestamp).toLocaleString()}
        </p>
      </div>
    </div>
  );
}
