
import dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.GOOGLE_API_KEY;
const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

async function listModels() {
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.models) {
      console.log("Available Models:");
      data.models.forEach(model => {
        if (model.supportedGenerationMethods && model.supportedGenerationMethods.includes("generateContent")) {
            console.log(`- ${model.name}`);
        }
      });
    } else {
      console.log("No models found or error:", data);
    }
  } catch (error) {
    console.error("Error fetching models:", error);
  }
}

listModels();
