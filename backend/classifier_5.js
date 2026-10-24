import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({
    model:"gemini-2.5-flash",
    generationConfig: {
    responseMimeType: "application/json",
    }
})

// 3. Function to classify a message
async function classifyMessage(message) {

  const prompt = `
Classify this user message.

Return ONLY JSON in this format:

{
  "intent": "greeting | question | complaint | order_tracking | refund_request | farewell | other",
  "sentiment": "positive | negative | neutral",
  "confidence": 0.0,
  "entities": [],
  "tone": "friendly | formal | empathetic | informational"
}

User message:${message}`;

  const result = await model.generateContent(prompt);
  const responseText = result.response.text();

  const data = JSON.parse(responseText);
  return data;
}

async function main() {
    const userMessage = "where is my order? I placed it 3 days ago and still haven't received any updates.";
    const classification = await classifyMessage(userMessage);

    console.log("Classification Result:", classification);
}
main();