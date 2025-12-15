import { GoogleGenAI, Chat } from "@google/genai";
import { SYSTEM_INSTRUCTION, SALES_SYSTEM_INSTRUCTION } from "../types";

let chatSession: Chat | null = null;
let currentMode: 'automation' | 'sales' = 'automation';

const getClient = () => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY is missing. Please set it in your environment variables.");
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const initializeChat = (mode: 'automation' | 'sales' = 'automation') => {
  const ai = getClient();
  
  // Create chat session - this is synchronous in the new SDK
  // We use the 'gemini-2.5-flash' model for speed and efficiency
  chatSession = ai.chats.create({
    model: "gemini-2.5-flash",
    config: {
      temperature: 0.7,
      systemInstruction: mode === 'sales' ? SALES_SYSTEM_INSTRUCTION : SYSTEM_INSTRUCTION,
    },
    history: [],
  });
  
  currentMode = mode;
  return chatSession;
};

export const sendMessageStream = async (message: string, mode: 'automation' | 'sales' = 'automation') => {
  // Re-initialize if the mode has changed or session doesn't exist
  if (!chatSession || currentMode !== mode) {
    initializeChat(mode);
  }
  
  if (!chatSession) {
    throw new Error("Chat session could not be established.");
  }

  // Send message using the correct SDK method
  return await chatSession.sendMessageStream({ message });
};