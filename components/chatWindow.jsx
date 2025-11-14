"use client";

import React, { useState, useRef, useEffect } from "react";

export default function ChatWindow() {
  const [messages, setMessages] = useState([
    { id: "welcome", role: "bot", text: "👋 Hi! Upload a file or ask a question." }
  ]);

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const bottomRef = useRef();

 
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Handle sending message
  async function sendMessage(e) {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = { id: Date.now(), role: "user", text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: userMsg.text })
      });

      const data = await res.json();

      const botMsg = {
        id: "bot-" + Date.now(),
        role: "bot",
        text: data.answer || "No response",
        sources: data.sources || []
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        { id: "err-" + Date.now(), role: "bot", text: "⚠️ Error: " + err.message }
      ]);
    }

    setIsLoading(false);
  }

  // Handle upload
  async function handleUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData
    });

    const data = await res.json();

    setMessages(prev => [
      ...prev,
      {
        id: "upload-" + Date.now(),
        role: "bot",
        text: `📄 File uploaded and processed! (${data.chunks} chunks)`
      }
    ]);
  }

  return (
    <div className="flex flex-col h-[75vh] bg-white shadow-lg rounded-2xl border p-4">

      {/* ===== Header ===== */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b">
        <h2 className="text-lg font-semibold text-slate-700">RAG Chatbot</h2>

        {/* Upload button */}
        <label className="cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1 rounded-lg border transition">
          Upload File
          <input
            type="file"
            accept=".txt,.md,.json"
            className="hidden"
            onChange={handleUpload}
          />
        </label>
      </div>

      {/* ===== Messages area ===== */}
      <div className="flex-1 overflow-y-auto space-y-4 p-2">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex ${
              m.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[75%] px-4 py-3 rounded-2xl shadow-sm text-sm whitespace-pre-wrap ${
                m.role === "user"
                  ? "bg-sky-600 text-white rounded-br-sm"
                  : "bg-slate-100 text-slate-800 rounded-bl-sm"
              }`}
            >
              {m.text}

              {/* Show sources if any */}
              {m.sources && m.sources.length > 0 && (
                <div className="mt-2 text-xs text-slate-500">
                  🔎 Sources:
                  <ul className="list-disc ml-4">
                    {m.sources.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* typing indicator */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-slate-100 text-slate-500 px-4 py-2 rounded-xl text-sm animate-pulse">
              Thinking...
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* ===== Input area ===== */}
      <form onSubmit={sendMessage} className="mt-4 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask something..."
          className="flex-1 border rounded-xl px-4 py-2 focus:outline-none focus:ring focus:ring-sky-200"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="bg-sky-600 hover:bg-sky-700 text-white px-5 py-2 rounded-xl transition disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  );
}
