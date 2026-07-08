import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY;

let modelInstance = null;

if (apiKey) {
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    // Initialize standard Gemini Flash model
    modelInstance = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: 
        "You are an AI Health Assistant for the Smart Health Management System. " +
        "You help patients check mild symptoms, provide general nutrition and wellness advice, " +
        "and explain basic medicine information. Keep answers structured, warm, and easy to read. " +
        "CRITICAL: Always append a disclaimer at the very end stating: 'Please consult a registered doctor or healthcare professional for any serious symptoms or formal diagnoses.'"
    });
    console.log("Gemini AI: Client initialized successfully.");
  } catch (err) {
    console.error("Gemini AI initialization failed:", err);
  }
} else {
  console.warn("Gemini AI: GEMINI_API_KEY not configured. AI assistant will run in simulated demo mode.");
}

export const generateHealthReply = async (userMessage) => {
  // Graceful fallback if api key is missing or model initialization failed
  if (!modelInstance) {
    return (
      "👋 Hello! I am running in Offline Demo Mode because the GEMINI_API_KEY is not set in the server's .env file.\n\n" +
      "Here is a simulated response to your question: \"" + userMessage + "\"\n\n" +
      "• If you asked about a symptom (e.g. headache, fever): Be sure to get plenty of rest, stay hydrated, and monitor your temperature. Over-the-counter medication like paracetamol can help with minor pain.\n" +
      "• If you asked about medicines: Always take prescriptions exactly as instructed by your doctor and read packaging guides.\n\n" +
      "Once you set the GEMINI_API_KEY in the server's .env and restart, I will be able to analyze your inputs dynamically using Google Gemini.\n\n" +
      "Disclaimer: Please consult a registered doctor or healthcare professional for any serious symptoms or formal diagnoses."
    );
  }

  try {
    const result = await modelInstance.generateContent(userMessage);
    const response = await result.response;
    return response.text();
  } catch (err) {
    console.error("Error calling Gemini API:", err);
    return "I apologize, but I encountered an error communicating with my neural systems. Please check the server logs or try again shortly.";
  }
};
