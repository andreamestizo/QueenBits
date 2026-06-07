import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Bot, Send, X, Sparkles, AlertCircle } from 'lucide-react'
import { COLORS } from '../theme.js'

const botImg = '/images/7.png'

export default function ChurnChatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [inputVal, setInputVal] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const scrollRef = useRef(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isOpen, isLoading])

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault()
    if (!inputVal.trim() || isLoading) return

    const userMsg = {
      id: String(Date.now()),
      role: 'user',
      content: inputVal,
      timestamp: new Date().toLocaleTimeString(),
    }
    const history = messages
    setMessages((prev) => [...prev, userMsg])
    setInputVal('')
    setIsLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg.content, chatHistory: history }),
      })
      const data = await res.json()
      setMessages((prev) => [
        ...prev,
        {
          id: String(Date.now() + 1),
          role: 'model',
          content: data.response || data.error || 'No pude obtener una respuesta en este momento.',
          timestamp: new Date().toLocaleTimeString(),
        },
      ])
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: String(Date.now() + 2),
          role: 'model',
          content: 'No pude comunicarme con el asistente. Verifica que el servidor esté activo e inténtalo de nuevo.',
          timestamp: new Date().toLocaleTimeString(),
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="chatbot-fab">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.96 }}
            transition={{ duration: 0.18 }}
            className="chatbot-panel"
          >
            <div className="chatbot-panel-head">
              <span>
                <Sparkles size={15} style={{ color: COLORS.amber }} />
                Archi: Agente de retención
              </span>
              <button type="button" onClick={() => setIsOpen(false)} aria-label="Cerrar chat" className="chatbot-panel-close">
                <X size={16} />
              </button>
            </div>

            <div className="chatbot-panel-msgs" ref={scrollRef}>
              {messages.length === 0 && (
                <div className="chatbot-empty">
                  Pregúntame por ejemplo: <em>“¿Por qué un cliente con pocos coolers tiene más riesgo de churn?”</em> o{' '}
                  <em>“¿Qué argumento le doy a un cliente de riesgo alto en Monterrey?”</em>
                </div>
              )}
              {messages.map((m) => (
                <div key={m.id} className={`chatbot-msg-row ${m.role === 'user' ? 'is-user' : 'is-model'}`}>
                  <div className="chatbot-msg-bubble">{m.content}</div>
                </div>
              ))}
              {isLoading && (
                <div className="chatbot-msg-row is-model">
                  <div className="chatbot-msg-bubble chatbot-typing">
                    <span /><span /><span />
                  </div>
                </div>
              )}
            </div>

            <form onSubmit={handleSendMessage} className="chatbot-panel-form">
              <input
                type="text"
                placeholder="Escribe tu consulta sobre churn…"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                disabled={isLoading}
              />
              <button type="submit" disabled={isLoading || !inputVal.trim()} aria-label="Enviar mensaje">
                <Send size={15} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        animate={isOpen ? { scale: 0.92, rotate: -10 } : { y: [0, -12, 0], rotate: [0, -3, 0, 3, 0] }}
        transition={isOpen ? { duration: 0.15 } : { duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
        className="chatbot-avatar"
        aria-label={isOpen ? 'Cerrar asistente de retención' : 'Abrir asistente de retención'}
        title="Co-pilot de retención — pregúntame sobre churn"
      >
        <img src={botImg} alt="Asistente virtual de retención" onError={(e) => { e.currentTarget.style.display = 'none' }} />
        {!isOpen && <Bot size={20} className="chatbot-avatar-icon" />}
      </motion.button>
    </div>
  )
}
