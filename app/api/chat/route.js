// app/api/chat/route.js

import fs from "fs";
import path from "path";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

const EMBED_MODEL = "models/text-embedding-004"; // Embeddings model
const CHAT_MODEL = "models/gemini-2.0-flash";    // Chat model

let kb = null;            // knowledge base
let kbEmbeddings = null;  // cached embeddings

// ----------------------------------
// Utility: Cosine Similarity
// ----------------------------------
function cosineSim(a, b) {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return dot / (Math.sqrt(na) * Math.sqrt(nb) + 1e-12);
}

// ----------------------------------
// Load knowledge base JSON
// ----------------------------------
async function loadKB() {
  if (kb) return kb;
  const file = path.join(process.cwd(), "data", "knowledge.json");
  kb = JSON.parse(fs.readFileSync(file, "utf8"));
  return kb;
}

// ----------------------------------
// Create & Cache embeddings for KB
// ----------------------------------
async function ensureKBEmbeddings() {
  if (kbEmbeddings) return kbEmbeddings;

  const items = await loadKB();
  const embedder = genAI.getGenerativeModel({ model: EMBED_MODEL });

  // Get embeddings for all KB texts
  const result = await embedder.embedContent({
    content: items.map((i) => i.text)
  });

  kbEmbeddings = result.embeddings.map((e) => e.values);

  return kbEmbeddings;
}


// ----------------------------------
// POST handler
// ----------------------------------
export async function POST(req) {
  try {
    const body = await req.json();
    const question = body.question;

    if (!question) {
      return new Response(
        JSON.stringify({ error: "Missing question" }),
        { status: 400 }
      );
    }

    // Load KB + embeddings
    const kbItems = await loadKB();
    const embeddings = await ensureKBEmbeddings();

    // Get embedding for user query
    const embedder = genAI.getGenerativeModel({ model: EMBED_MODEL });
    const qEmbedRes = await embedder.embedContent({ content: question });
    const qEmb = qEmbedRes.embedding.values;

    // Compute similarities
    const sims = embeddings.map((e, i) => ({
      idx: i,
      score: cosineSim(qEmb, e)
    })).sort((a, b) => b.score - a.score);

    // Top 3 retrieved
    const top = sims.slice(0, 3);

    // Build context chunk
    const context = top.map(t => {
      const kbItem = kbItems[t.idx];
      return `Title: ${kbItem.title}\nText: ${kbItem.text}`;
    }).join("\n\n---\n\n");

    // Prepare chat prompt
    const systemPrompt = `
You are an AI assistant. Answer the user's question using ONLY the context below.
If answer is outside the context, say: "I don't know based on the provided context."
`;

    const fullPrompt = `
${systemPrompt}

User question: ${question}

Context:
${context}

Answer:
`;

    // Generate answer using Gemini Flash
    const chatModel = genAI.getGenerativeModel({ model: CHAT_MODEL });

    const response = await chatModel.generateContent(fullPrompt);
    const answer = response.response.text();

    const sourceTitles = top.map(t => kbItems[t.idx].title);

    return new Response(
      JSON.stringify({ answer, sources: sourceTitles }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );

  } catch (err) {
    console.error("RAG Error:", err);
    return new Response(
      JSON.stringify({ error: err.message || "Server error" }),
      { status: 500 }
    );
  }
}
