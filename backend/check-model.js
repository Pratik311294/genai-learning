import * as dotenv from "dotenv";
dotenv.config();

const response = await fetch(
  `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`
);
const data = await response.json();

// Filter only embedding models
const embeddingModels = data.models?.filter(m => 
  m.supportedGenerationMethods?.includes("embedContent")
);

console.log("Available embedding models:");
embeddingModels?.forEach(m => console.log(" -", m.name));