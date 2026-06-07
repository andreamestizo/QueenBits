// /api/chat.ts
// Función serverless de Vercel que expone POST /api/chat.
// Es el equivalente, para producción en Vercel, del endpoint que server.ts expone
// en desarrollo — mantiene la GEMINI_API_KEY fuera del navegador (solo vive como
// variable de entorno del proyecto en Vercel) e intercepta las llamadas a Gemini.
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { GoogleGenAI } from "@google/genai";
import { CHURN_SYSTEM_INSTRUCTION } from "./_chatPrompt.js";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Método no permitido. Usa POST." });
  }

  try {
    const { message, chatHistory } = req.body ?? {};

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Falta el campo 'message' en la solicitud." });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(200).json({
        response:
          "**Configuración requerida**: agrega la variable de entorno GEMINI_API_KEY en tu proyecto de Vercel (Project → Settings → Environment Variables) para activar al asistente.",
      });
    }

    const contents: { role: "user" | "model"; parts: { text: string }[] }[] = [];
    if (Array.isArray(chatHistory)) {
      chatHistory.forEach((msg: { role: string; content: string }) => {
        if (msg?.role !== "system" && typeof msg?.content === "string") {
          contents.push({
            role: msg.role === "user" ? "user" : "model",
            parts: [{ text: msg.content }],
          });
        }
      });
    }
    contents.push({ role: "user", parts: [{ text: message }] });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents,
      config: {
        systemInstruction: CHURN_SYSTEM_INSTRUCTION,
        temperature: 0.7,
      },
    });

    return res.status(200).json({ response: response.text || "Sin respuesta." });
  } catch (error: any) {
    console.error("Error de Gemini:", error?.message || error);
    return res.status(500).json({ error: "Error de comunicación con Gemini AI." });
  }
}
