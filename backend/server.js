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

app.get("/", (req, res) => {
  res.json({ status: "Backend is running ✅" });
});

app.post("/chat", async (req, res) => {
  const { messages } = req.body;

  if (!messages || messages.length === 0) {
    return res.status(400).json({ error: "No required messages in request body" });
  }

  try {
    const geminiHistory = messages.slice(0, -1).map((msg) => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.text }],
    }));

    const chat = model.startChat({ history: geminiHistory });
    const latestMessage = messages[messages.length - 1];
    const result = await chat.sendMessage(latestMessage.text);
    const reply = result.response.text();

    return res.json({ reply });
  } catch (error) {
    console.error("Error processing messages:", error);
    return res.status(500).json({ error: "Error processing messages" });
  }
});

app.listen(3000, () => {
  console.log("✅ Backend running on http://localhost:3000");
});