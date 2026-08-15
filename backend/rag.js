import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from "dotenv";
import fs from "fs";
import path from "path";
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Two different models today:
// 1. Embedding model — converts text to numbers
// 2. Generation model — answers questions
const generationModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
const embeddingModel = genAI.getGenerativeModel({ model: "gemini-embedding-001" });


// ── STEP 1: Load and chunk the document ──────────────────────────────

function loadAndChunkDocument(filePath) {
  const text = fs.readFileSync(filePath, "utf-8");
  
  // Split by double newline — each section becomes a chunk
  const chunks = text
    .split("\n\n")
    .map((chunk) => chunk.trim())
    .filter((chunk) => chunk.length > 20); // remove empty/tiny chunks

  console.log(`📄 Loaded ${chunks.length} chunks from document\n`);
  return chunks;
}

// ── STEP 2: Embed all chunks ──────────────────────────────────────────

async function embedText(text) {
  const result = await embeddingModel.embedContent(text);
  return result.embedding.values; // array of 768 numbers
}

async function embedAllChunks(chunks) {
  console.log("🔢 Embedding all chunks...");
  const embedded = await Promise.all(
    chunks.map(async (chunk) => ({
      text: chunk,
      embedding: await embedText(chunk),
    }))
  );
  console.log(`✅ Embedded ${embedded.length} chunks\n`);
  return embedded;
}

// ── STEP 3: Cosine similarity ─────────────────────────────────────────

function cosineSimilarity(vecA, vecB) {
  const dot = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const magA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const magB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  return dot / (magA * magB);
}

// ── STEP 4: Find most relevant chunk for a query ──────────────────────

async function findRelevantChunk(query, embeddedChunks) {
  console.log(`🔍 Finding relevant chunk for: "${query}"`);
  
  const queryEmbedding = await embedText(query);

  // Score every chunk against the query
  const scored = embeddedChunks.map((chunk) => ({
    text: chunk.text,
    score: cosineSimilarity(queryEmbedding, chunk.embedding),
  }));

  // Sort by score descending
  scored.sort((a, b) => b.score - a.score);

  console.log("\n📊 Chunk scores:");
  scored.forEach((s, i) => {
    console.log(`  ${i + 1}. Score: ${s.score.toFixed(4)} | ${s.text.substring(0, 60)}...`);
  });

  return scored[0]; // return best match
}

// ── STEP 5: Answer using retrieved context ────────────────────────────

async function answerWithContext(query, relevantChunk) {
  const prompt = `You are a helpful HR assistant. Answer the question using ONLY the context below.
If the answer is not in the context, say "I don't have that information."

Context:
${relevantChunk.text}

Question: ${query}

Answer:`;

  const result = await generationModel.generateContent(prompt);
  return result.response.text();
}

// ── MAIN: Run the full RAG pipeline ──────────────────────────────────

async function main() {
  // Load document
  const filePath = path.join("docs", "sample.txt");
  const chunks = loadAndChunkDocument(filePath);

  // Embed all chunks (in real apps, you'd store these, not re-embed every time)
  const embeddedChunks = await embedAllChunks(chunks);

  // Test with 3 different questions
  const questions = [
    // "How many days of paid leave do employees get?",
    // "Can I work from home every day?",
    "whats the rating scale?",
  ];

  for (const question of questions) {
    console.log("\n" + "=".repeat(60));
    const relevantChunk = await findRelevantChunk(question, embeddedChunks);
    console.log(`\n✅ Best chunk (score: ${relevantChunk.score.toFixed(4)}):`);
    console.log(relevantChunk.text);
    
    const answer = await answerWithContext(question, relevantChunk);
    console.log(`\n💬 Answer: ${answer}`);
  }
}

main();