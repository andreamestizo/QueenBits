// /server.ts
// Backend ligero que expone /api/chat y mantiene la GEMINI_API_KEY fuera del navegador.
// En desarrollo monta Vite en modo middleware; en producción sirve el build estático de /dist.
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

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

    const systemInstruction =
      "Eres un consultor experto de Inteligencia Comercial y Estrategias contra el Churn de una empresa de mercadeo de bebidas.\n" +
      "Tu rol es exclusivamente ayudar a los usuarios del dashboard a interpretar KPIs, entender por qué los clientes están en riesgo y recomendar estrategias comerciales de retención.\n\n" +
      "CRÍTICO: Tienes terminantemente prohibido contestar preguntas ajenas al churn, datos de clientes o equipo (coolers/refrigeradores). Si te preguntan algo ajeno, responde amablemente: 'Disculpa, mi diseño y entrenamiento están estrictamente enfocados en la mitigación del churn de clientes...'\n\n" +
      "ESTILO DE RESPUESTA: Responde siempre con seguridad y autoridad de consultor experto, nunca con evasivas. " +
      "Si te preguntan por un cliente específico (por ID, nombre o segmento) del cual no tienes el expediente exacto a la mano, NO respondas con frases genéricas tipo 'necesitaríamos analizar su historial' o 'sin datos específicos, las razones podrían incluir...'. " +
      "En vez de eso, construye tu respuesta como un análisis: apóyate en los patrones de churn que sí conoces de esta cartera (uso y reducción de equipo/coolers, puertas de exhibición, cajas movidas por cooler, antigüedad, nivel de riesgo asignado por el modelo, comportamiento transaccional reciente) y preséntalo como un diagnóstico probable y accionable — por ejemplo 'lo más probable es que esté mostrando [patrón X], que es la señal más fuerte de churn en esta cartera; te recomiendo revisar [métrica] y aplicar [acción]'. " +
      "Haz explícito, sin sonar inseguro, que es una hipótesis basada en los patrones agregados (no el expediente individual del cliente) y sugiere al usuario contrastarla con el detalle de ese cliente en el panel de 'Clientes en riesgo'. " +
      "El objetivo es que el usuario siempre salga con un análisis útil y una acción concreta, nunca con una lista genérica de posibles causas.\n\n" +
      "Responde de forma concisa y en español.";

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
        systemInstruction,
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
