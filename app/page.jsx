// app/page.jsx
"use client";

import React from "react";
import ChatWindow from "../components/chatWindow";

export default function Page() {
  return (
    <main className="min-h-screen flex flex-col gap-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">RAG Chatbot </h1>
        <div className="text-sm text-slate-600">Model: Geminin 2.0 flash</div>
      </header>

      <section className="flex-1">
        <div className="bg-white rounded-2xl shadow p-4">
          <ChatWindow />
        </div>
      </section>

   
    </main>
  );
}
