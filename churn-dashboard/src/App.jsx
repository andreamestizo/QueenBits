import { useState } from 'react'
import './App.css'

import Overview from './components/Overview.jsx'
import Segments from './components/Segments.jsx'
import Behavior from './components/Behavior.jsx'
import Coolers from './components/Coolers.jsx'
import AtRiskList from './components/AtRiskList.jsx'
import Simulator from './components/Simulator.jsx'
import ChurnChatbot from './components/ChurnChatbot.jsx'

const SECTIONS = [
  { id: 'overview', label: 'Overview' },
  { id: 'segmentos', label: 'Churn por segmento' },
  { id: 'comportamiento', label: 'Comportamiento transaccional' },
  { id: 'equipo', label: 'Equipo instalado' },
  { id: 'riesgo', label: 'Clientes en riesgo' },
  { id: 'simulador', label: 'Simulador "qué pasaría si"' },
]

function App() {
  const [active, setActive] = useState('overview')

  const scrollTo = (id) => {
    setActive(id)
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark" />
          <div>
            <h1>Predicción de Churn</h1>
            <p className="brand-sub">Panel comercial para anticipar la fuga de clientes</p>
          </div>
        </div>
        <nav className="topnav">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              className={active === s.id ? 'nav-btn active' : 'nav-btn'}
              onClick={() => scrollTo(s.id)}
            >
              {s.label}
            </button>
          ))}
        </nav>
      </header>

      <main>
        <section id="overview" className="section">
          <Overview />
        </section>

        <section id="segmentos" className="section section-alt">
          <Segments />
        </section>

        <section id="comportamiento" className="section">
          <Behavior />
        </section>

        <section id="equipo" className="section section-alt">
          <Coolers />
        </section>

        <section id="riesgo" className="section">
          <AtRiskList />
        </section>

        <section id="simulador" className="section section-alt">
          <Simulator />
        </section>
      </main>

      <footer className="footer">
        <p>
          Panel construido a partir de <code>testing_completo_con_predicciones.csv</code> · Modelo de
          predicción de churn · Datos de clientes anonimizados
        </p>
      </footer>

      <ChurnChatbot />
    </div>
  )
}

export default App
