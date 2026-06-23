const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

async function run() {
  console.log("Testing API Key...");
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  
  const models = [
    'gemini-2.5-flash',
    'gemini-2.5-pro',
    'gemini-2.0-flash',
    'gemini-1.5-flash',
    'gemini-1.5-pro'
  ];

  for (const m of models) {
    try {
      console.log(`Trying ${m}...`);
      const model = genAI.getGenerativeModel({ model: m });
      const result = await model.generateContent("Say hello world");
      console.log(`Success with ${m}! Response:`, result.response.text());
      return; // Stop if we find a working one
    } catch (e) {
      console.error(`${m} failed:`, e.message);
    }
  }
}

run();
