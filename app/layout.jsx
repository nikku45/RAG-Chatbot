// app/layout.jsx
import "./globals.jsx";

export const metadata = {
  title: "RAG Chatbot Demo",
  description: "Simple RAG Chatbot built with Next.js and OpenAI",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body className="bg-slate-50 min-h-screen">
        <div className="max-w-4xl mx-auto px-4 py-8">{children}</div>
      </body>
    </html>
  );
}
