// app/globals.jsx
import React from "react";

export const metadata = {
  title: "RAG Chatbot Demo",
  description: "",
};

export default function Globals({ children }) {
  return (
    <>
      <head>
       
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body className="bg-slate-50 text-slate-900">
        {children}
      </body>
    </>
  );
}
