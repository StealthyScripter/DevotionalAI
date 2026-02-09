
import { GoogleGenAI, Type } from "@google/genai";
import { Theme, Format, Length, Audience, Style, GeneratedContent } from "./types";

const SYSTEM_INSTRUCTION = `
You are a compassionate, wise, and encouraging AI Christian Pastor. 
Your primary mission is to provide Bible-based guidance, prayerful support, and theological insights rooted in the Holy Scriptures.

STRICT CONSTRAINTS:
1. Focus on Christian encouragement and Biblical wisdom.
2. Address the user with warmth and respect. Use a tone that reflects the fruits of the Spirit.
3. When quoting scripture, include the book, chapter, and verse reference.
`;

const ensurePaidKey = async () => {
  // @ts-ignore
  const hasKey = await window.aistudio.hasSelectedApiKey();
  if (!hasKey) {
    // @ts-ignore
    await window.aistudio.openSelectKey();
  }
};

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
  ${customInstruction ? `ADJUSTMENT REQUEST: ${customInstruction}` : ""}
  Provide practical application and a clear call to action.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: basePrompt,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
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
  return { ...JSON.parse(text.trim()), format } as GeneratedContent;
};

export const generateImagePro = async (prompt: string, size: "1K" | "2K" | "4K" = "1K"): Promise<string> => {
  await ensurePaidKey();
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview',
    contents: { parts: [{ text: prompt }] },
    config: {
      imageConfig: { aspectRatio: "1:1", imageSize: size }
    }
  });
  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
  }
  throw new Error("No image returned.");
};

export const editImageFlash = async (base64Image: string, prompt: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        { inlineData: { data: base64Image.split(',')[1], mimeType: 'image/png' } },
        { text: prompt }
      ]
    }
  });
  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
  }
  throw new Error("Editing failed.");
};

export const generateVeoVideo = async (prompt: string, aspectRatio: '16:9' | '9:16' = '16:9'): Promise<string> => {
  await ensurePaidKey();
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  let operation = await ai.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt,
    config: { numberOfVideos: 1, resolution: '720p', aspectRatio }
  });
  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 10000));
    operation = await ai.operations.getVideosOperation({ operation });
  }
  const link = operation.response?.generatedVideos?.[0]?.video?.uri;
  const res = await fetch(`${link}&key=${process.env.API_KEY}`);
  const blob = await res.blob();
  return URL.createObjectURL(blob);
};

export const generateVeoVideoFromImage = async (base64Image: string, prompt?: string, aspectRatio: '16:9' | '9:16' = '16:9'): Promise<string> => {
  await ensurePaidKey();
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  let operation = await ai.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt: prompt || 'Animate this sacred scene',
    image: {
      imageBytes: base64Image.split(',')[1],
      mimeType: 'image/png'
    },
    config: { numberOfVideos: 1, resolution: '720p', aspectRatio }
  });
  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 10000));
    operation = await ai.operations.getVideosOperation({ operation });
  }
  const link = operation.response?.generatedVideos?.[0]?.video?.uri;
  const res = await fetch(`${link}&key=${process.env.API_KEY}`);
  const blob = await res.blob();
  return URL.createObjectURL(blob);
};

export const analyzeOrEditContent = async (text: string, task: string, isComplex = false): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: isComplex ? 'gemini-3-pro-preview' : 'gemini-3-flash-preview',
    contents: `TEXT: ${text}\n\nTASK: ${task}`,
    config: { systemInstruction: SYSTEM_INSTRUCTION }
  });
  return response.text || "";
};
