// app/page.jsx
"use client";

import React from "react";
import ChatWindow from "../components/chatWindow";

export default function Page() {
  return (
    <main className="min-h-screen flex flex-col gap-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">RAG Chatbot — Internship Demo</h1>
        <div className="text-sm text-slate-600">Model: OpenAI</div>
      </header>

      <section className="flex-1">
        <div className="bg-white rounded-2xl shadow p-4">
          <ChatWindow />
        </div>
      </section>

      <footer className="text-xs text-slate-500">
        Built with Next.js & OpenAI — Demo for internship assessment.
      </footer>
    </main>
  );
}
