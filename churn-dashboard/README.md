# Predicción de Churn — Dashboard comercial

Panel interactivo en React que traduce un modelo de predicción de churn (clientes de una empresa
de mercadeo de bebidas) en una herramienta accionable para el equipo comercial: cuántos clientes
están en riesgo de irse, por qué, cuánto vale ese riesgo en dinero y qué hacer al respecto —
incluyendo un asistente de IA conectado a Gemini para resolver dudas sobre los datos.

## Contenido del dashboard

- **Overview** — KPIs ejecutivos (tasa de churn, clientes en riesgo, dinero en juego) y gráficas
  sobre qué mueve el churn (movimiento de equipo, composición de la cartera por nivel de riesgo).
- **Churn por segmento** — dónde se concentra la fuga según el perfil del cliente.
- **Comportamiento transaccional** — patrones de compra de clientes activos vs. en riesgo.
- **Equipo instalado** — relación entre coolers/puertas de exhibición y la probabilidad de churn.
- **Clientes en riesgo** — listado accionable con nivel de riesgo y botón directo para contactar.
- **Simulador "qué pasaría si"** — explora cómo cambian las proyecciones al ajustar variables clave.
- **Agende de retención** — chatbot (impulsado por Gemini) entrenado exclusivamente para
  interpretar KPIs de churn y sugerir estrategias de retención.

Los datos provienen de `testing_completo_con_predicciones.csv` (generado por `QueenBits.ipynb`,
ver el README de la carpeta superior), preprocesados en archivos JSON agregados dentro de
`src/data/`.

## Stack técnico

- **Frontend**: React 19 + Vite, [Recharts](https://recharts.org/) para visualizaciones,
  [motion](https://motion.dev/) para animaciones y [lucide-react](https://lucide.dev/) para iconos.
- **Backend**: Express 5 + [`@google/genai`](https://www.npmjs.com/package/@google/genai) (SDK de
  Gemini), ejecutado con [`tsx`](https://github.com/privatenumber/tsx) sin paso de compilación.
  Mantiene la API Key fuera del navegador e intercepta las llamadas a Gemini de forma segura.

## Requisitos

- Node.js 20+
- Una API Key de [Google AI Studio](https://aistudio.google.com/apikey) (solo necesaria para que
  responda el chatbot; el resto del dashboard funciona sin ella).

## Instalación

```bash
npm install --legacy-peer-deps
```

> El flag `--legacy-peer-deps` es necesario por un conflicto de versiones entre React 19 y algunas
> dependencias de UI (p. ej. `lucide-react`).

## Configuración del chatbot (Gemini)

1. Copia `.env.example` a `.env`:

   ```bash
   cp .env.example .env
   ```

2. Abre `.env` y coloca tu API Key:

   ```
   GEMINI_API_KEY=tu_clave_aqui
   ```

   El archivo `.env` está en `.gitignore` — nunca se sube al repositorio ni se expone al navegador;
   solo lo lee el servidor (`server.ts`) mediante `dotenv`.

   Si no configuras una clave, el chatbot sigue funcionando pero responde con un mensaje indicando
   que falta la configuración.

## Cómo correrlo

El dashboard se sirve **siempre a través del servidor de Express** (`server.ts`), porque es el que
expone el endpoint `/api/chat` que conecta con Gemini. El comando estándar de Vite (`npm run dev`)
no incluye ese backend, así que el chatbot no funcionará si lo usas para abrir la app.

**Desarrollo** (con hot-reload, vía Vite en modo middleware dentro de Express):

```bash
npm run server
```

Abre **http://localhost:3000**.

**Producción** (build optimizado servido como estático):

```bash
npm run build
npm start
```

Abre **http://localhost:3000**.

## Despliegue en Vercel

Vercel no ejecuta un servidor Express persistente como `server.ts` — sirve el frontend como
sitio estático y convierte los archivos dentro de `api/` en funciones serverless. Por eso el
chat tiene una segunda implementación pensada para ese entorno: **`api/chat.ts`** (con la misma
lógica e instrucción de sistema que `server.ts`, compartida desde `api/_chatPrompt.ts` para que
ambas no se desincronicen).

Para desplegarlo:

1. Sube el repositorio a GitHub e impórtalo en [vercel.com](https://vercel.com/new). Vercel
   detecta automáticamente que es un proyecto Vite (la configuración también está explícita en
   `vercel.json`: build con `vite build`, salida en `dist/`, y `api/chat.ts` como función
   serverless).
2. En **Project → Settings → Environment Variables**, agrega `GEMINI_API_KEY` con tu clave de
   Google AI Studio. (Nunca subas tu `.env` — Vercel inyecta esta variable directamente en la
   función serverless en producción).
3. Despliega. El `fetch('/api/chat', …)` del chatbot seguirá funcionando sin cambios: Vercel
   enruta automáticamente `/api/*` a la función correspondiente.

`server.ts` sigue siendo el backend para desarrollo local (`npm run server` / `npm start`); no
forma parte del despliegue en Vercel.

## Scripts disponibles

| Script            | Descripción                                                            |
| ----------------- | ---------------------------------------------------------------------- |
| `npm run server`  | Levanta Express + Vite en modo desarrollo (incluye `/api/chat`)        |
| `npm start`       | Levanta Express en modo producción sirviendo `dist/` (requiere build)  |
| `npm run build`   | Genera el build de producción en `dist/`                               |
| `npm run dev`     | Solo Vite, sin backend — útil para iterar la UI, **sin chatbot**       |
| `npm run lint`    | Corre ESLint sobre el proyecto                                         |
| `npm run preview` | Sirve el build de producción con el preview de Vite (sin backend)      |

## Estructura del proyecto

```
churn-dashboard/
├─ server.ts                # Backend Express + integración con Gemini
├─ .env.example             # Plantilla de variables de entorno
├─ public/images/           # Imágenes decorativas e ilustración del chatbot
├─ src/
│  ├─ components/           # Una sección del dashboard por componente + chatbot
│  ├─ data/                 # JSON agregados a partir del CSV original
│  ├─ theme.js              # Paleta de colores y formateadores compartidos
│  └─ App.jsx               # Layout, navegación y composición de secciones
└─ dist/                    # Build de producción (generado por `npm run build`)
```
