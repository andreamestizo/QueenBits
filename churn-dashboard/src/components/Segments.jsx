import { useMemo, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts'
import segments from '../data/segments.json'
import SectionBg from './SectionBg.jsx'
import { COLORS, CHART_PALETTE, fmtNumber, fmtPct, fmtCompact } from '../theme.js'

const bgImg = '/images/3.png'

const DIMENSIONS = [
  { id: 'territory', label: 'Región / territorio', key: 'territory' },
  { id: 'subchannel', label: 'Tipo de negocio (canal)', key: 'subchannel' },
  { id: 'size', label: 'Tamaño de cliente', key: 'size' },
]

export default function Segments() {
  const [dimension, setDimension] = useState('territory')
  const [riskFilter, setRiskFilter] = useState('Todos')
  const [sortBy, setSortBy] = useState('churn_rate')

  const cross = segments.cross
  const dimKey = DIMENSIONS.find((d) => d.id === dimension).key

  const data = useMemo(() => {
    const filtered = riskFilter === 'Todos' ? cross : cross.filter((r) => r.risk === riskFilter)
    const map = new Map()
    for (const row of filtered) {
      const k = row[dimKey]
      if (!map.has(k)) map.set(k, { key: k, n: 0, churn: 0, cajas: 0 })
      const acc = map.get(k)
      acc.n += row.n
      acc.churn += row.churn
      acc.cajas += row.cajas
    }
    let arr = Array.from(map.values()).map((d) => ({
      ...d,
      churn_rate: d.n ? (d.churn / d.n) * 100 : 0,
    }))
    arr = arr.filter((d) => d.n >= 30)
    arr.sort((a, b) => (sortBy === 'churn_rate' ? b.churn_rate - a.churn_rate : b.n - a.n))
    return arr.slice(0, 14)
  }, [cross, dimKey, riskFilter, sortBy])

  const overallRate = useMemo(() => {
    const tot = cross.reduce((acc, r) => ({ n: acc.n + r.n, churn: acc.churn + r.churn }), { n: 0, churn: 0 })
    return (tot.churn / tot.n) * 100
  }, [cross])

  return (
    <>
      <SectionBg src={bgImg} />
      <div className="section-inner">
      <div className="section-head">
        <span className="section-kicker">02 · Diagnóstico</span>
        <h2>¿Dónde se concentra el churn?</h2>
        <p>
          Filtra por nivel de riesgo y cambia la dimensión de análisis para identificar si la fuga
          es un problema regional, de canal comercial o de tamaño de cliente, y dónde priorizar el
          esfuerzo comercial.
        </p>
      </div>

      <div className="filter-bar">
        <div className="filter-field">
          <label>Dimensión a comparar</label>
          <select value={dimension} onChange={(e) => setDimension(e.target.value)}>
            {DIMENSIONS.map((d) => (
              <option key={d.id} value={d.id}>{d.label}</option>
            ))}
          </select>
        </div>
        <div className="filter-field">
          <label>Nivel de riesgo</label>
          <select value={riskFilter} onChange={(e) => setRiskFilter(e.target.value)}>
            <option value="Todos">Todos los niveles</option>
            <option value="Alto">Solo riesgo alto</option>
            <option value="Medio">Solo riesgo medio</option>
            <option value="Bajo">Solo riesgo bajo</option>
          </select>
        </div>
        <div className="filter-field">
          <label>Ordenar por</label>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="churn_rate">Mayor tasa de churn</option>
            <option value="n">Mayor número de clientes</option>
          </select>
        </div>
        <button className="filter-reset" onClick={() => { setDimension('territory'); setRiskFilter('Todos'); setSortBy('churn_rate') }}>
          Restablecer filtros
        </button>
      </div>

      <div className="grid grid-2">
        <div className="panel" style={{ textAlign: 'left' }}>
          <h3 style={{ marginBottom: 4 }}>
            Tasa de churn por {DIMENSIONS.find((d) => d.id === dimension).label.toLowerCase()}
          </h3>
          <p className="muted" style={{ fontSize: 13, marginBottom: 12 }}>
          </p>
          <ResponsiveContainer width="100%" height={420}>
            <BarChart data={data} layout="vertical" margin={{ left: 8, right: 36 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(127,23,87,0.08)" horizontal={false} />
              <XAxis type="number" unit="%" tick={{ fontSize: 11, fill: '#7c5a70' }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="key" width={150} tick={{ fontSize: 12, fill: '#3a1430' }} axisLine={false} tickLine={false} />
              <Tooltip
                formatter={(v, name) => name === 'churn_rate' ? [fmtPct(v), 'Tasa de churn'] : [fmtNumber(v), name]}
                contentStyle={{ borderRadius: 12, border: '1px solid rgba(127,23,87,0.15)', fontSize: 12 }}
              />
              <Bar dataKey="churn_rate" radius={[0, 8, 8, 0]} barSize={16}>
                {data.map((d, i) => (
                  <Cell key={d.key} fill={CHART_PALETTE[i % CHART_PALETTE.length]} />
                ))}
                <LabelList dataKey="churn_rate" position="right" formatter={(v) => fmtPct(v)} style={{ fontSize: 11, fill: '#7c5a70' }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="panel" style={{ textAlign: 'left' }}>
          <h3 style={{ marginBottom: 4 }}>Tamaño de cada grupo y volumen asociado</h3>
          <p className="muted" style={{ fontSize: 13, marginBottom: 12 }}>
            Número de clientes evaluados y cajas vendidas en el último mes por cada grupo, para
            entender qué segmentos concentran tanto el riesgo como el volumen de negocio.
          </p>
          <ResponsiveContainer width="100%" height={420}>
            <BarChart data={data} margin={{ left: -10, right: 12 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(127,23,87,0.08)" vertical={false} />
              <XAxis dataKey="key" tick={{ fontSize: 10.5, fill: '#7c5a70' }} angle={-30} textAnchor="end" height={90} interval={0} axisLine={false} tickLine={false} />
              <YAxis yAxisId="left" tick={{ fontSize: 11, fill: '#7c5a70' }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: '#7c5a70' }} axisLine={false} tickLine={false} tickFormatter={fmtCompact} />
              <Tooltip
                formatter={(v, name) => name === 'n' ? [fmtNumber(v), 'Clientes'] : [fmtCompact(v), 'Cajas vendidas (mes)']}
                contentStyle={{ borderRadius: 12, border: '1px solid rgba(127,23,87,0.15)', fontSize: 12 }}
              />
              <Bar yAxisId="left" dataKey="n" name="n" fill={COLORS.plum} radius={[6, 6, 0, 0]} barSize={16} />
              <Bar yAxisId="right" dataKey="cajas" name="cajas" fill={COLORS.amber} radius={[6, 6, 0, 0]} barSize={16} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      </div>
    </>
  )
}
