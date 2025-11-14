import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const EMBED_MODEL = "models/text-embedding-004";

// in-memory storage for uploaded texts
export let dynamicKB = [];
export let dynamicEmbeddings = [];

// simple text chunker
function chunkText(text, chunkSize = 500) {
  const chunks = [];
  for (let i = 0; i < text.length; i += chunkSize) {
    chunks.push(text.slice(i, i + chunkSize));
  }
  return chunks;
}

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file) {
      return new Response(JSON.stringify({ error: "No file uploaded" }), { status: 400 });
    }

    const text = await file.text();   // works for .txt, .md, .json, .pdf(as text)

    const chunks = chunkText(text);

    const embedder = genAI.getGenerativeModel({ model: EMBED_MODEL });

    for (let chunk of chunks) {
      const res = await embedder.embedContent({
        content: { parts: [{ text: chunk }] }
      });

      dynamicKB.push(chunk);
      dynamicEmbeddings.push(res.embedding.values);
    }

    return new Response(
      JSON.stringify({
        message: "File processed successfully",
        chunks: chunks.length
      }),
      { status: 200 }
    );

  } catch (err) {
    console.error("UPLOAD ERROR:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
