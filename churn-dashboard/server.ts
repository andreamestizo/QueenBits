// /server.ts
// Backend ligero que expone /api/chat y mantiene la GEMINI_API_KEY fuera del navegador.
// En desarrollo monta Vite en modo middleware; en producción sirve el build estático de /dist.
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { CHURN_SYSTEM_INSTRUCTION } from "./api/_chatPrompt.js";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: "10mb" }));

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
});

// Endpoint de Chat con filtro estricto de Churn
app.post("/api/chat", async (req, res) => {
  try {
    const { message, chatHistory } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.json({
        response:
          "**Configuración requerida**: agrega tu GEMINI_API_KEY en un archivo .env (puedes copiar .env.example) para activar al asistente.",
      });
    }

    const contents: { role: "user" | "model"; parts: { text: string }[] }[] = [];
    if (Array.isArray(chatHistory)) {
      chatHistory.forEach((msg: { role: string; content: string }) => {
        if (msg.role !== "system") {
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

    res.json({ response: response.text || "Sin respuesta." });
  } catch (error: any) {
    console.error("Error de Gemini:", error?.message || error);
    res.status(500).json({ error: "Error de comunicación con Gemini AI." });
  }
});

// Levantar Vite en desarrollo o servir estáticos en producción
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(process.cwd(), "dist")));
    app.get("/*splat", (req, res) => {
      res.sendFile(path.join(process.cwd(), "dist/index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Servidor del dashboard de churn escuchando en http://localhost:${PORT}`);
  });
}

startServer();
