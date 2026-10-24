import express from "express";
import cors from "cors";
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// ── Classifier setup ──────────────────────────────────────────────────
const classifierModel = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
  generationConfig: { responseMimeType: "application/json" },
});

function safeParseJSON(raw) {
  try {
    const cleaned = raw.replace(/```json/gi, "").replace(/```/g, "").trim();
    return JSON.parse(cleaned);
  } catch {
    return null;
  }
}

async function classifyMessage(message) {
  const prompt = `Classify this message. Respond ONLY with JSON, no extra text.
{
  "intent": one of ["greeting","question","complaint","order_tracking","refund_request","farewell","other"],
  "sentiment": one of ["positive","negative","neutral"],
  "confidence": number 0.0 to 1.0
}
Message: "${message}"`;

  const result = await classifierModel.generateContent(prompt);
  console.log("RAW classifier output:", result.response.text());
  return safeParseJSON(result.response.text());
}
//--

app.get("/", (req, res) => {
  res.json({ status: "Backend is running ✅" });
});

app.post("/chat", async (req, res) => {
  const { messages } = req.body;

  if (!messages || messages.length === 0) {
    return res.status(400).json({ error: "No messages provided" });
  }

  try {
    const latestMessage = messages[messages.length - 1].text;

    // Run classification and chat in parallel — faster than sequential
    const [classification, chatResult] = await Promise.all([
      classifyMessage(latestMessage),
      (async () => {
        const geminiHistory = messages.slice(0, -1).map((msg) => ({
          role: msg.role === "assistant" ? "model" : "user",
          parts: [{ text: msg.text }],
        }));
        const chat = model.startChat({ history: geminiHistory });
        return chat.sendMessage(latestMessage);
      })(),
    ]);

    const reply = chatResult.response.text();

    // Return reply + classification metadata
    res.json({
      reply,
      classification: classification || null,
    });
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ error: "Something went wrong" });
  }
});
app.listen(3000, () => {
  console.log("✅ Backend running on http://localhost:3000");
});