import { useMemo, useState } from 'react'
import atRisk from '../data/at_risk.json'
import SectionBg from './SectionBg.jsx'
import { COLORS, fmtNumber, fmtPct } from '../theme.js'

const bgImg = '/images/6.png'

const RISK_TAG = {
  Alto: 'tag-alto',
  Medio: 'tag-medio',
  Bajo: 'tag-bajo',
}

export default function AtRiskList() {
  const [selected, setSelected] = useState(null)
  const [riskFilter, setRiskFilter] = useState('Todos')
  const [search, setSearch] = useState('')
  const [limit, setLimit] = useState(25)
  const [contacted, setContacted] = useState(() => new Set())

  const toggleContacted = (id) => {
    setContacted((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const filtered = useMemo(() => {
    let rows = atRisk
    if (riskFilter !== 'Todos') rows = rows.filter((r) => r.riesgo === riskFilter)
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      rows = rows.filter((r) => r.nombre.toLowerCase().includes(q) || r.territorio.toLowerCase().includes(q) || r.canal.toLowerCase().includes(q))
    }
    return rows
  }, [riskFilter, search])

  const maxProb = atRisk[0]?.probabilidad || 1

  return (
    <>
      <SectionBg src={bgImg} />
      <div className="section-inner">
      <div className="section-head">
        <span className="section-kicker">05 · Priorización comercial</span>
        <h2>Clientes en riesgo: a quién contactar primero</h2>
        <p>
          Ranking de clientes ordenados por probabilidad de churn predicha por el modelo. Haz clic en cualquier fila para ver sus atributos clave
          (segmento, volumen histórico, equipo instalado) y definir con qué argumento abordarlo.
        </p>
      </div>

      <div className="filter-bar">
        <div className="filter-field" style={{ minWidth: 240 }}>
          <label>Buscar cliente, territorio o canal</label>
          <input type="text" placeholder="Ej. Cliente, Monterrey, Mayorista…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="filter-field">
          <label>Nivel de riesgo</label>
          <select value={riskFilter} onChange={(e) => setRiskFilter(e.target.value)}>
            <option value="Todos">Todos</option>
            <option value="Alto">Alto</option>
            <option value="Medio">Medio</option>
            <option value="Bajo">Bajo</option>
          </select>
        </div>
        <div className="filter-field">
          <label>Mostrar</label>
          <select value={limit} onChange={(e) => setLimit(Number(e.target.value))}>
            <option value={25}>Top 25</option>
            <option value={50}>Top 50</option>
            <option value={100}>Top 100</option>
          </select>
        </div>
      </div>

      <div className="panel" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="risk-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Cliente</th>
                <th>Territorio</th>
                <th>Canal</th>
                <th>Tamaño</th>
                <th>Riesgo</th>
                <th>Probabilidad de churn</th>
                <th>Acción comercial</th>
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, limit).map((r) => (
                <tr key={r.id} className="risk-row" onClick={() => setSelected(r)}>
                  <td className="muted">{r.rank}</td>
                  <td className="risk-name">{r.nombre}</td>
                  <td>{r.territorio}</td>
                  <td>{r.canal}</td>
                  <td>{r.tamano}</td>
                  <td><span className={`tag ${RISK_TAG[r.riesgo]}`}>{r.riesgo}</span></td>
                  <td>
                    <span className="bar-mini-track">
                      <span className="track">
                        <span className="fill" style={{ width: `${(r.probabilidad / maxProb) * 100}%` }} />
                      </span>
                    </span>
                    {fmtPct(r.probabilidad)}
                  </td>
                  <td>
                    <ContactButton
                      contacted={contacted.has(r.id)}
                      onClick={(e) => { e.stopPropagation(); toggleContacted(r.id) }}
                    />
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={8} className="muted" style={{ textAlign: 'center', padding: 28 }}>No hay clientes que coincidan con la búsqueda.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <p className="muted" style={{ fontSize: 12, marginTop: 10, textAlign: 'left' }}>
        Mostrando {Math.min(limit, filtered.length)} de {filtered.length} clientes filtrados (de un
        ranking de los {atRisk.length} con mayor probabilidad de fuga predicha).
      </p>

      {selected && (
        <CustomerModal
          customer={selected}
          onClose={() => setSelected(null)}
          contacted={contacted.has(selected.id)}
          onToggleContacted={() => toggleContacted(selected.id)}
        />
      )}
      </div>
    </>
  )
}

function ContactButton({ contacted, onClick }) {
  return (
    <button type="button" className={`contact-btn${contacted ? ' is-done' : ''}`} onClick={onClick}>
      {contacted ? 'Contactado' : 'Llamar / Contactar'}
    </button>
  )
}

function CustomerModal({ customer: c, onClose, contacted, onToggleContacted }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Cerrar">×</button>
        <span className="section-kicker">Ficha del cliente</span>
        <h3>{c.nombre}</h3>
        <p className="muted" style={{ fontSize: 13 }}>
          {c.territorio} · {c.canal} · Tamaño {c.tamano} ·{' '}
          <span className={`tag ${RISK_TAG[c.riesgo]}`}>Riesgo {c.riesgo}</span>
        </p>

        <div className="modal-grid">
          <Stat label="Probabilidad de churn" value={fmtPct(c.probabilidad)} highlight />
          <Stat label="Transacciones último mes" value={fmtNumber(c.trans_ult_mes, 1)} />
          <Stat label="Cajas vendidas (último mes)" value={fmtNumber(c.cajas_ult_mes, 1)} />
          <Stat label="Volumen por cooler" value={fmtNumber(c.vol_por_cooler, 1)} />
          <Stat label="Coolers instalados" value={fmtNumber(c.coolers)} />
          <Stat label="Puertas (doors)" value={fmtNumber(c.doors)} />
          <Stat label="Cambio reciente de equipo (delta)" value={(c.delta_coolers > 0 ? '+' : '') + fmtNumber(c.delta_coolers)} />
          <Stat label="Meses desde cambio de equipo" value={c.meses_desde_cambio_equipo < 0 ? 'Sin cambios registrados' : fmtNumber(c.meses_desde_cambio_equipo)} />
        </div>

        <div style={{ marginTop: 20, padding: 16, borderRadius: 12, background: 'rgba(127,23,87,0.05)' }}>
          <h4 style={{ fontSize: 13, marginBottom: 6, color: COLORS.wine }}>Argumento sugerido para el equipo comercial</h4>
          <p style={{ fontSize: 13, color: '#5a3f53', lineHeight: 1.6 }}>
            {buildPitch(c)}
          </p>
        </div>

        <div style={{ marginTop: 18, display: 'flex', justifyContent: 'flex-end' }}>
          <ContactButton contacted={contacted} onClick={onToggleContacted} />
        </div>
      </div>
    </div>
  )
}

function Stat({ label, value, highlight }) {
  return (
    <div className="modal-stat" style={highlight ? { background: 'rgba(253,62,126,0.12)' } : undefined}>
      <div className="lab">{label}</div>
      <div className="val" style={highlight ? { color: COLORS.pink } : undefined}>{value}</div>
    </div>
  )
}

function buildPitch(c) {
  const parts = []
  if (c.delta_coolers < 0) {
    parts.push('ha reducido el número de coolers instalados, una señal de desinversión en el punto de venta')
  } else if (c.coolers <= 1) {
    parts.push('opera con poco equipo instalado, lo que limita su capacidad de venta y de exhibición')
  }
  if (c.trans_ult_mes < 40) {
    parts.push('muestra un volumen transaccional bajo en el último periodo registrado')
  }
  if (c.vol_por_cooler < 50 && c.coolers > 0) {
    parts.push('su volumen por cooler está por debajo del promedio de la cartera, lo que sugiere equipo subutilizado')
  }
  if (parts.length === 0) {
    parts.push('combina varias señales de riesgo del modelo aunque sus métricas operativas se ven estables; conviene una visita de revisión preventiva')
  }
  return `Este cliente de canal ${c.canal.toLowerCase()} en ${c.territorio} ${parts.join('; ')}. Se recomienda contacto prioritario ofreciendo revisión/optimización de equipo y condiciones comerciales antes de que la relación se deteriore.`
}
