import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from "dotenv";
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

function printResponse(techniqueName, prompt, response) {
  console.log(`🧠 Technique: \n${techniqueName}`);
  console.log(`\n💬 Prompt: \n${prompt}`);
//   console.log(`📝 Prompt: ${prompt.substring(0, 100)}...`);
  console.log(`\n💬 Response: \n${response}`);
}
async function zerovsFewShot() {
    // --- Zero-shot prompt ---
    const model = genAI.getGenerativeModel({model:"gemini-2.5-flash"});
    const zeroShotPrompt = `Capital of India?`;
    const zeroSHotResponse = await model.generateContent(zeroShotPrompt);
    printResponse("Zero-shot", zeroShotPrompt, zeroSHotResponse.response.text());
    // Few-shot — with examples
  const fewShotPrompt = `Classify sentiment. Examples:
"Amazing product, will buy again!" → positive
"Terrible experience, never again" → negative  
"It works as expected" → neutral
"Fast shipping but product broke after 2 days" → negative

Now classify this:
"The delivery was late and the packaging was damaged"
Respond with only one word: positive, negative, or neutral.`;

const fewshot = await model.generateContent(fewShotPrompt);
printResponse("Few-shot", fewShotPrompt, fewshot.response.text());
}
async function roleBased(){
const question = `When should i cook?`;
const ModelSimple = genAI.getGenerativeModel({ model: "gemini-2.5-flash"});
const simpleResponse = await ModelSimple.generateContent(question);
printResponse("Simple", question, simpleResponse.response.text());

 const hrModel = genAI.getGenerativeModel({ 
    model: "gemini-2.5-flash",
    systemInstruction: `You are a strict HR policy advisor for a large Indian IT company. 
You only answer questions related to HR policies, workplace conduct, and employee relations.
Keep responses concise — under 100 words.
For non-HR questions, respond: "This is outside my scope as an HR advisor."`
});
const hrResponse = await hrModel.generateContent(question);
printResponse("Role-based", question, hrResponse.response.text());
}

// ── TECHNIQUE 3: Chain of Thought ────────────────────────────────────

async function chainOfThought() {
  console.log("\n\n🔬 EXPERIMENT 3: Chain of Thought");

  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const problem = "A software company has 3 teams. Team A completes a feature in 6 days, Team B in 4 days, Team C in 12 days. If all teams work together, how many days to complete the feature?";

  // Without CoT
  const directPrompt = `${problem}\nAnswer with just the number.`;
  const directResult = await model.generateContent(directPrompt);
  printResponse("Direct (no CoT)", directPrompt, directResult.response.text());

  // With CoT
  const cotPrompt = `${problem}\nThink through this step by step before giving the final answer.`;
  const cotResult = await model.generateContent(cotPrompt);
  printResponse("Chain of Thought", cotPrompt, cotResult.response.text());
}
async function main(){
    // console.log("Running Zero-shot vs Few-shot example...");
    // await zerovsFewShot();
    // console.log("Running Role-based example...");
    // await roleBased();
    console.log("Running Chain of Thought example...");
    await chainOfThought();
}
main();
