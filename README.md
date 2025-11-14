📚 RAG Chatbot using Next.js, Google Gemini & Embeddings

A Retrieval-Augmented Generation (RAG) chatbot built using Next.js (App Router) and Google Gemini 2.0 Flash, with support for file uploads, chunking, embeddings, and context-aware answers.
This project was developed as part of an internship assignment.

🚀 Features
🔍 1. Retrieval-Augmented Generation (RAG)

The chatbot intelligently searches your knowledge base using embeddings and provides accurate answers.

📤 2. File Upload Support

Upload .txt, .md, or .json files. The system will:

Read and split the file into chunks

Create embeddings for each chunk

Add them to the dynamic KB (in-memory)

Use them for subsequent queries

🤖 3. Google Gemini Integration

Uses the Gemini 2.0 Flash model for fast and high-quality responses.

🗂️ 4. Static + Dynamic Knowledge Base

Static Knowledge Base: stored in public/knowledge.json
(Automatically shipped to .next/static/ in production)

Dynamic Knowledge Base: created from user-uploaded files

💬 5. Modern Chat UI

Clean chat bubbles

Auto-scroll

File upload button

Typing indicator

Source citations

Tailwind CSS (no PostCSS required)

🌐 6. Fully Deployed on Vercel

Supports Node.js runtime

Optimized API routes

Production build support for static JSON files

🛠️ Tech Stack
Layer	Technology
Framework	Next.js (App Router)
Styling	Tailwind CSS
AI Model	Google Gemini 2.0 Flash
Embeddings	text-embedding-004
Runtime	Vercel Serverless (Node.js)
Language	JavaScript / React
```
project-root/
│
├── app/
│   ├── api/
│   │   ├── chat/route.js       # RAG retrieval + Gemini response
│   │   └── upload/route.js     # File upload + chunking + embeddings
│   ├── components/
│   │   └── ChatWindow.jsx      # Chat UI
│
├── public/
│   └── knowledge.json          # Static KB (deployed to .next/static/)
│
├── package.json
└── README.md
```
🔑 Environment Variables

Create a .env.local file (for development):
```
GOOGLE_API_KEY=your_gemini_key
```
▶️ Running the Project Locally

Install dependencies:
```
npm install
```

Run dev server:
```
npm run dev
```

Open:
```
http://localhost:3000
```

📤 Uploading Knowledge Files

Supported formats:

.txt,.md,.json

When uploaded:

Content is chunked

Embeddings are generated

Saved to dynamic in-memory store

Immediately available to the RAG pipeline

🤖 How the Chatbot Works
1) User sends a question
2) Question is embedded
3) System computes cosine similarity with KB chunks
4) Top 3 chunks are selected as context
5) Gemini generates an answer based on ONLY the retrieved context
6) Sources are shown in the UI

⚠️ Limitations

Dynamic KB stored in memory resets when the serverless function cold-starts

For persistent storage, an external DB is needed (Supabase, Firestore, etc.)

PDF upload is not supported yet (can be added)

🔮 Possible Future Enhancements

PDF Upload Support

Persistent Vector DB (Pinecone, Chroma, Supabase)

Markdown-formatted chat responses

UI theming (dark/light mode)

Multi-file upload

Per-user knowledge bases

👤 Author

Nitin Rajput
