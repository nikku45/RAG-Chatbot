export const runtime = "nodejs";


import { dynamicKB, dynamicEmbeddings } from "../upload/route.js";
import fs from "fs";
import path from "path";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

const EMBED_MODEL = "models/text-embedding-004";
const CHAT_MODEL = "models/gemini-2.0-flash";

let kb = null;
let kbEmbeddings = null;



function cosineSim(a, b) {
  let dot = 0, aMag = 0, bMag = 0;

  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    aMag += a[i] ** 2;
    bMag += b[i] ** 2;
  }

  return dot / (Math.sqrt(aMag) * Math.sqrt(bMag) + 1e-12);
}




async function loadKB() {
  if (kb) return kb;

const file = path.join(process.cwd(), "app", "data", "knowledge.json");

  kb = JSON.parse(fs.readFileSync(file, "utf8"));
  return kb;
}




async function ensureKBEmbeddings() {
  if (kbEmbeddings) return kbEmbeddings;

  const items = await loadKB();
  const embedder = genAI.getGenerativeModel({ model: EMBED_MODEL });

  kbEmbeddings = [];

  for (const item of items) {
    const res = await embedder.embedContent({
      content: {
        parts: [{ text: item.text }]
      }
    });

    kbEmbeddings.push(res.embedding.values);
  }

  return kbEmbeddings;
}



export async function POST(req) {
  try {
    const body = await req.json();
    const question = body.question;

    if (!question) {
      return new Response(JSON.stringify({ error: "No question provided" }), { status: 400 });
    }

    // Load static KB + embeddings
    const kbItems = await loadKB();
    const staticEmbeddings = await ensureKBEmbeddings();

 
    const allTexts = [
      ...kbItems.map(i => i.text),
      ...dynamicKB
    ];

    const allEmbeddings = [
      ...staticEmbeddings,
      ...dynamicEmbeddings
    ];

    // -------- Embedding user query ----------
    const embedder = genAI.getGenerativeModel({ model: EMBED_MODEL });

    const qRes = await embedder.embedContent({
      content: { parts: [{ text: question }] }
    });

    const qEmb = qRes.embedding.values;

    // -------- Calculate similarity ----------
    const sims = allEmbeddings
      .map((emb, idx) => ({
        idx,
        score: cosineSim(qEmb, emb)
      }))
      .sort((a, b) => b.score - a.score);

    // Top 3 relevant documents
    const top = sims.slice(0, 3);

    // ---------------------------
    // Build hybrid RAG context
    // ---------------------------
    let context = "";

    top.forEach(t => {
      const isStatic = t.idx < kbItems.length;

      if (isStatic) {
        const item = kbItems[t.idx];
        context += `STATIC CHUNK:\n${item.title}\n${item.text}\n\n---\n\n`;
      } else {
        const dynIndex = t.idx - kbItems.length;
        context += `UPLOADED CHUNK:\n${dynamicKB[dynIndex]}\n\n---\n\n`;
      }
    });

    // -------- Call Gemini Chat Model --------
    const model = genAI.getGenerativeModel({ model: CHAT_MODEL });

    const prompt = `
You are a helpful RAG assistant.
Use ONLY the context below to answer the user's question.
If the answer is not in the context, say: "I don't know based on the given context."

User question:
${question}

Context:
${context}

Answer:
`;

    const result = await model.generateContent(prompt);
    const answer = result.response.text();

    // Prepare source titles
    const sources = top.map(t => {
      if (t.idx < kbItems.length) {
        return kbItems[t.idx].title;
      } else {
        return "Uploaded File Chunk";
      }
    });

    return new Response(
      JSON.stringify({ answer, sources }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );

  } catch (err) {
    console.error("Gemini RAG Error:", err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500 }
    );
  }
}

