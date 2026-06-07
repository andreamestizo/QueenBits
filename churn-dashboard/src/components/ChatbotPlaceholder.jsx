import { useState } from 'react'

const botImg = '/images/7.png'

export default function ChatbotPlaceholder() {
  const [open, setOpen] = useState(false)

  return (
    <div className="chatbot-fab">
      {open && (
        <div className="chatbot-bubble">
          <h4>Asistente de retención</h4>
          <p>
            Aquí vivirá un chatbot conectado al modelo de churn: podrás preguntarle por un cliente,
            pedirle que explique por qué tiene cierto nivel de riesgo o que sugiera el siguiente
            mejor contacto.
          </p>
          <span className="soon">Próximamente</span>
          <div className="chatbot-input">
            <input type="text" placeholder="Escribe tu pregunta…" disabled />
            <button type="button" disabled>↑</button>
          </div>
        </div>
      )}
      <button
        type="button"
        className="chatbot-avatar"
        onClick={() => setOpen((v) => !v)}
        aria-label="Abrir asistente de retención (próximamente)"
        title="Asistente de retención — próximamente"
      >
        <img src={botImg} alt="Asistente virtual" />
      </button>
    </div>
  )
}
