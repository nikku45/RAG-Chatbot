// components/Message.jsx
import React from "react";

export default function Message({ message }) {
  const isUser = message.role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[80%] ${isUser ? "bg-sky-600 text-white" : "bg-slate-100 text-slate-900"} rounded-xl p-3`}>
        <div className="text-sm whitespace-pre-wrap">{message.text}</div>
        {message.sources && message.sources.length > 0 && (
          <div className="mt-2 text-xs text-slate-500">
            Sources:
            <ul className="list-disc pl-4">
              {message.sources.map((s, i) => <li key={i}>{s}</li>)}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
