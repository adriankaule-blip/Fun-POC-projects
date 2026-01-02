
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { ChatMessage, LunchboxSelection } from "../types";

// Always initialize with the named parameter apiKey.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getMadpakkeAdvice = async (history: ChatMessage[], selection: LunchboxSelection) => {
  try {
    const selectionSummary = `Ingredienser: 
      Bund: ${selection.base?.name || 'Ikke valgt'}
      Protein: ${selection.protein?.name || 'Ikke valgt'}
      Grønt: ${selection.green?.name || 'Ikke valgt'}
      Ekstra: ${selection.extra?.name || 'Ikke valgt'}`;

    const contents = history.map(msg => ({
      parts: [{ text: msg.text }],
      role: msg.role === 'user' ? 'user' : 'model'
    }));

    // If history is empty, it's the initial "magic" reaction
    const messageContent = history.length > 0 ? contents : `Giv din lynhurtige magiske dom over denne kombination: ${selectionSummary}`;

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: messageContent,
      config: {
        systemInstruction: `Du er 'Madpakke-Magikeren'. Din mission er at forklare børn, HVORFOR deres madvalg er geniale for deres krop.
        REGLER:
        1. Svar altid på DANSK.
        2. Vær EKSTREMT kortfattet. Max 2-3 korte sætninger.
        3. Educational fokus: Nævn 1-2 specifikke sundhedsfordele (f.eks. 'Rugbrød giver dig super-energi til hele dagen' eller 'Gulerødder giver dig falkeblik').
        4. Brug comic-lydeffekter (BAM!, SLURP!, WOW!).
        5. Ingen stjerner (*) eller formatering.
        6. Vær en positiv mentor, der opmuntrer til sunde valg.
        
        Nuværende madpakke-stats: ${selectionSummary}.`,
        temperature: 0.8,
        topP: 0.9,
      }
    });

    return response.text?.replace(/\*/g, '') || "KAPOW! Din krop vil elske det her! ✨";
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return "UPS! En magisk røgsky blokerede vejen! Prøv igen! 💨✨";
  }
};

export const generateLunchboxImage = async (selection: LunchboxSelection) => {
  try {
    const prompt = `A professional, vibrant, and delicious kid's lunchbox in a clean bento box. 
    It contains: ${selection.base?.name}, ${selection.protein?.name}, ${selection.green?.name}, and ${selection.extra?.name}. 
    Top-down view, bright studio lighting, white background, colorful presentation. 
    High quality, cinematic food photography.`;

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: prompt }],
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1"
        }
      }
    });

    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }
    return null;
  } catch (error) {
    console.error("Image generation failed:", error);
    return null;
  }
};
