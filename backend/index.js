import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from "dotenv";
dotenv.config();

// Initialize the client — this is your connection to Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Pick the model
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

async function askGemini(prompt) {
  console.log(`\n🧠 Prompt: ${prompt}`);
  console.log("⏳ Thinking...\n");

  const result = await model.generateContent(prompt);
  const response = result.response.text();

  console.log("✅ Response:");
  console.log(response);
  return response;
}

// --- Run 3 experiments ---

// Experiment 1: Simple question
await askGemini("What is the capital of France? Answer in one sentence.");
// Experiment 2: Structured output request
// await askGemini(
//   `List 3 benefits of learning AI in 2025. 
//    Format as JSON like this: { "benefits": ["...", "...", "..."] }`
// );
// Experiment 3: Role-playing with constraints
// await askGemini(
//   `You are a sarcastic tech mentor. 
//    A student says: "I want to learn AI in 3 months." 
//    Respond in 2 sentences.`
// );

// ---- Below code Openai model ----

// import OpenAI from "openai";
// import dotenv from "dotenv";

// dotenv.config();

// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
// });

// async function run() {
//   const response = await openai.chat.completions.create({
//     model: "gpt-4o-mini",
//     messages: [
//       { role: "user", content: "Explain AI in 2 simple sentence" }
//     ],
//   });

//   console.log(response.choices[0].message.content);
// }

// run();