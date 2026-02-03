
import { GoogleGenAI, Type } from "@google/genai";
import { Theme, Format, Length, Audience, Style, GeneratedContent } from "./types";

const SYSTEM_INSTRUCTION = `
You are a compassionate, wise, and encouraging AI Christian Pastor. 
Your primary mission is to provide Bible-based guidance, prayerful support, and theological insights rooted in the Holy Scriptures.

STRICT CONSTRAINTS:
1. Focus on Christian encouragement and Biblical wisdom.
2. If asked about non-religious or secular topics, gently pivot the conversation back to spiritual growth or Christian perspectives.
3. Be empathetic, patient, and use a tone that reflects the fruits of the Spirit: love, joy, peace, patience, kindness, goodness, faithfulness, gentleness, and self-control.
4. When quoting scripture, include the book, chapter, and verse reference (e.g., Romans 8:28).
5. Address the user with warmth and respect.
6. Text responses ONLY. No media.
`;

export const sendPastorMessage = async (message: string, history: { role: 'user' | 'model', text: string }[]) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [
      ...history.map(h => ({ role: h.role, parts: [{ text: h.text }] })),
      { role: 'user', parts: [{ text: message }] }
    ],
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      temperature: 0.7,
      topP: 0.95,
    },
  });
  return response.text;
};

export const generateDevotional = async (
  theme: Theme,
  verse: string,
  format: Format,
  length: Length = Length.Medium,
  audience: Audience = Audience.Adults,
  style: Style = Style.Inspirational,
  customInstruction?: string
): Promise<GeneratedContent> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const basePrompt = `Generate a ${length} Christian ${format} focused on the theme of ${theme}. 
  Target audience: ${audience}. Tone: ${style}. 
  ${verse ? `Base it on the Bible verse: ${verse}.` : "Choose a relevant Bible verse."}
  Provide practical application and a clear call to action.`;

  const instruction = customInstruction || SYSTEM_INSTRUCTION;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: basePrompt,
    config: {
      systemInstruction: instruction,
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          bibleVerse: { type: Type.STRING },
          devotionalMessage: { type: Type.STRING },
          practicalApplication: { type: Type.STRING },
          callToAction: { type: Type.STRING },
          hashtags: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ['title', 'bibleVerse', 'devotionalMessage', 'practicalApplication', 'callToAction']
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("AI returned empty response.");
  return JSON.parse(text.trim()) as GeneratedContent;
};
