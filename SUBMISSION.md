# Queenbit: Nexos

## Inspiration
Para una empresa de mercadeo de bebidas, perder un cliente comercial no es solo perder una venta:
es perder ingresos recurrentes y el equipo (coolers, exhibidores) ya instalado en ese punto de
venta. El reto nos dio un dataset de transacciones, clientes y equipo con la tarea de predecir
churn — pero rápido nos dimos cuenta de que un modelo que solo escupe un número no le sirve a
nadie en el día a día. Quisimos ir un paso más allá: convertir esa predicción en algo que un
equipo comercial pudiera abrir cada mañana, entender en segundos y usar para decidir a quién
llamar primero.

## What it does
**Queenbit: Nexos** es un pipeline completo que va de los datos crudos a una herramienta de uso
diario:

- Un **modelo de predicción de churn** (LightGBM) que calcula, por cliente, su probabilidad de
  fuga y lo clasifica en un nivel de riesgo (Bajo / Medio / Alto).
- Un **dashboard comercial interactivo** que traduce esos resultados en KPIs ejecutivos (cuántos
  clientes están en riesgo, cuánto dinero representan), gráficas que explican *qué* mueve el churn
  (uso y reducción de equipo, comportamiento transaccional, segmentos), un listado accionable de
  clientes en riesgo con botón directo para contactarlos, y un simulador "qué pasaría si" para
  explorar escenarios.
- Un **co-pilot de retención**: un chatbot impulsado por Gemini, entrenado exclusivamente para
  interpretar los KPIs del dashboard y sugerir estrategias de retención — pensado para que
  cualquier persona del equipo comercial pueda "preguntarle a los datos" en lenguaje natural.

## How we built it
1. **Exploración** (`EDA.ipynb`): unimos los datasets de ventas, clientes y equipo, y exploramos
   con `pandas`/`seaborn`/`matplotlib` la distribución del churn, el volumen de ventas y los
   patrones de uso de coolers.
2. **Modelado** (`QueenBits.ipynb`): preparamos las variables, entrenamos un `LGBMClassifier`,
   interpretamos sus decisiones con `SHAP` y generamos la probabilidad de fuga y el nivel de
   riesgo para el set de testing, exportando `submission_QueenBits.csv` (entrega) y
   `testing_completo_con_predicciones.csv` (dataset enriquecido para análisis).
3. **Preprocesamiento**: convertimos ese CSV enriquecido en archivos JSON agregados, listos para
   alimentar visualizaciones sin recalcular nada en el navegador.
4. **Dashboard**: construimos una app en **React + Vite**, con **Recharts** para las gráficas,
   **motion** para las animaciones y una paleta de colores propia, organizada en secciones que
   cuentan una historia: del panorama general al detalle por cliente.
5. **Asistente de IA**: levantamos un backend en **Express 5** (`server.ts`, ejecutado con `tsx`)
   que intercepta las llamadas a la API de **Gemini** (`@google/genai`) — así la API key nunca se
   expone al navegador — y construimos la interfaz de chat con `lucide-react` y `motion/react`.

## Challenges we ran into
- **Traducir un modelo en una historia útil**: no bastaba con mostrar "65% de probabilidad de
  churn" — tuvimos que decidir qué gráficas realmente ayudan a un equipo comercial a entender el
  *porqué* y a actuar, e iteramos varias veces hasta encontrar las que cuentan algo accionable.
- **Asegurar el chatbot sin exponer la API key**: diseñar un backend que sirviera tanto el
  frontend como el endpoint de IA, sin que la clave de Gemini tocara el navegador, y hacer que
  Express 5, Vite (en modo middleware) y `tsx` convivieran bien tanto en desarrollo como en
  producción — incluyendo ajustar la sintaxis de rutas comodín que cambió entre versiones de
  Express.
- **Mantener al asistente enfocado y seguro**: afinamos el *system prompt* varias veces para que
  el chatbot se mantuviera estrictamente dentro del tema de churn, respondiera con autoridad de
  consultor (no con evasivas genéricas) y razonara a partir de los patrones reales de la cartera
  incluso cuando no tenía el expediente exacto de un cliente.
- **Conflictos de dependencias**: React 19 es reciente y algunas librerías de UI todavía declaran
  compatibilidad con versiones anteriores, lo que nos obligó a resolver conflictos de
  peer-dependencies durante la instalación.

## Accomplishments that we're proud of
- Construimos el flujo completo de punta a punta — **datos → modelo → predicciones → dashboard →
  asistente de IA** — y todo corre como una sola aplicación.
- El dashboard no se queda en "el modelo dice X": explica qué comportamientos y patrones de
  equipo se correlacionan con la fuga, y le da al equipo comercial una acción concreta inmediata
  (contactar al cliente, simular escenarios, preguntarle al co-pilot).
- Logramos que el asistente de IA se sienta como un consultor confiable — con seguridad, enfocado
  y útil — en lugar de un chatbot genérico que evade las preguntas difíciles.

## What we learned
- Que el valor de un modelo de churn no está solo en su precisión, sino en qué tan fácil es para
  alguien sin background técnico actuar sobre sus resultados — la "traducción" es tan importante
  como el modelo mismo.
- Cómo combinar un stack de ciencia de datos en Python (pandas, LightGBM, SHAP) con un stack web
  moderno (React, Express) y una API de un modelo de lenguaje en producción, manteniendo la
  seguridad de las credenciales como prioridad desde el diseño.
- La importancia de diseñar con cuidado las instrucciones de un asistente de IA: pequeños ajustes
  en el *system prompt* cambian radicalmente si las respuestas se sienten útiles y confiables o
  genéricas y evasivas.

## What's next for Queenbit: Nexos
- Conectar el dashboard a datos en vivo, para que los niveles de riesgo se actualicen
  automáticamente conforme entran nuevas transacciones.
- Darle al co-pilot acceso al expediente real de cada cliente (no solo a los patrones agregados de
  la cartera), para recomendaciones más precisas y personalizadas.
- Registrar las acciones de retención tomadas (llamadas, promociones) para medir, con datos, qué
  estrategias realmente reducen el churn con el tiempo.
- Enriquecer el modelo con más señales de comportamiento y estacionalidad, y llevar la
  explicabilidad (SHAP) directamente al dashboard para que cualquier persona pueda ver, cliente
  por cliente, qué está pesando más en su riesgo.
