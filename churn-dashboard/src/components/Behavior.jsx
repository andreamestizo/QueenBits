import { useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts'
import behavior from '../data/behavior.json'
import dependencia from '../data/dependencia_equipo.json'
import SectionBg from './SectionBg.jsx'
import { COLORS, fmtNumber } from '../theme.js'

const bgImg = '/images/4.png'

const METRICS = [
  { id: 'trans', label: 'Número de transacciones', activos: 'trans_activos', churn: 'trans_churn', unit: '' },
  { id: 'cajas', label: 'Cajas vendidas (uni_boxes_sold_m)', activos: 'cajas_activos', churn: 'cajas_churn', unit: '' },
]

const ESTADO_COLOR = { Activo: COLORS.plum, Fuga: COLORS.orange }

export default function Behavior() {
  const [metric, setMetric] = useState('trans')
  const m = METRICS.find((x) => x.id === metric)
  const data = behavior.series_tiempo

  const depBars = dependencia.map((d) => ({
    ...d,
    tasa_pct: Math.round(d.tasa_coolers_ventas * 1000) / 10,
  }))

  return (
    <>
      <SectionBg src={bgImg} />
      <div className="section-inner">
      <div className="section-head">
        <span className="section-kicker">03 · Señales tempranas</span>
        <h2>Comportamiento transaccional</h2>
        <p>
        </p>
      </div>

      <div className="filter-bar">
        <div className="filter-field">
          <label>Métrica a comparar</label>
          <select value={metric} onChange={(e) => setMetric(e.target.value)}>
            {METRICS.map((x) => (
              <option key={x.id} value={x.id}>{x.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-2">
        <div className="panel" style={{ textAlign: 'left' }}>
          <h3 style={{ marginBottom: 4 }}>{m.label} · evolución por antigüedad de equipo</h3>
          <p className="muted" style={{ fontSize: 13, marginBottom: 12 }}>
            Promedio de clientes desde el último mes de cambio de equipo y transacciones realizadas
          </p>
          <ResponsiveContainer width="100%" height={360}>
            <LineChart data={data} margin={{ left: -16, right: 16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(127,23,87,0.08)" vertical={false} />
              <XAxis dataKey="mes" tick={{ fontSize: 11, fill: '#7c5a70' }} axisLine={false} tickLine={false} label={{ value: 'Meses desde el último cambio de equipo', position: 'insideBottom', offset: -4, fontSize: 11, fill: '#7c5a70' }} />
              <YAxis tick={{ fontSize: 11, fill: '#7c5a70' }} axisLine={false} tickLine={false} />
              <Tooltip
                formatter={(v, name) => [fmtNumber(v, 1), name === m.activos ? 'Clientes activos' : 'Clientes con churn']}
                labelFormatter={(l) => `Mes ${l} desde cambio de equipo`}
                contentStyle={{ borderRadius: 12, border: '1px solid rgba(127,23,87,0.15)', fontSize: 12 }}
              />
              <Legend
                formatter={(v) => (v === m.activos ? 'Clientes activos' : 'Clientes con churn')}
                wrapperStyle={{ fontSize: 12 }}
              />
              <Line type="monotone" dataKey={m.activos} stroke={COLORS.plum} strokeWidth={3} dot={false} name={m.activos} />
              <Line type="monotone" dataKey={m.churn} stroke={COLORS.orange} strokeWidth={3} strokeDasharray="6 4" dot={false} name={m.churn} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="panel" style={{ textAlign: 'left' }}>
          <h3 style={{ marginBottom: 4 }}>Volumen por cooler, por nivel de riesgo</h3>
          <p className="muted" style={{ fontSize: 13, marginBottom: 12 }}>
            muestra cuántas cajas produce en promedio cada cooler
            instalado, y qué tan dependiente es la venta del
            equipo. Los clientes que terminan en churn llegan con coolers mucho menos productivos y
            más dependientes del equipo, una señal de alerta temprana sobre la salud de la cuenta.
          </p>
          <ResponsiveContainer width="100%" height={360}>
            <BarChart data={depBars} margin={{ left: -16, right: 16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(127,23,87,0.08)" vertical={false} />
              <XAxis dataKey="grupo" tick={{ fontSize: 10, fill: '#7c5a70' }} angle={-25} textAnchor="end" height={80} interval={0} axisLine={false} tickLine={false} />
              <YAxis yAxisId="left" tick={{ fontSize: 11, fill: '#7c5a70' }} axisLine={false} tickLine={false} label={{ value: 'Cajas por cooler', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#7c5a70' }} />
              <Tooltip
                formatter={(v, name, p) => name === 'vol_por_cooler'
                  ? [fmtNumber(v, 1) + ' cajas/cooler', 'Volumen por cooler']
                  : [fmtNumber(p.payload.tasa_coolers_ventas * 100, 1) + '%', 'Dependencia del equipo en ventas']}
                contentStyle={{ borderRadius: 12, border: '1px solid rgba(127,23,87,0.15)', fontSize: 12 }}
              />
              <Legend
                payload={[
                  { value: 'Clientes activos', type: 'square', color: COLORS.plum },
                  { value: 'Clientes con churn', type: 'square', color: COLORS.orange },
                ]}
                wrapperStyle={{ fontSize: 12 }}
              />
              <Bar yAxisId="left" dataKey="vol_por_cooler" radius={[6, 6, 0, 0]} barSize={26}>
                {depBars.map((d) => (
                  <Cell key={d.grupo} fill={ESTADO_COLOR[d.estado]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <p className="muted" style={{ fontSize: 12, marginTop: 4 }}>
            Pasa el cursor sobre cada barra para ver también su nivel de dependencia del equipo en
            las ventas (<code>tasa_coolers_ventas</code>).
          </p>
        </div>
      </div>
      </div>
    </>
  )
}
