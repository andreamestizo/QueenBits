import { useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell, LabelList,
  PolarAngleAxis, Tooltip, Legend, ResponsiveContainer, RadialBarChart, RadialBar,
} from 'recharts'
import overview from '../data/overview.json'
import coolers from '../data/coolers.json'
import { COLORS, fmtCompact, fmtNumber, fmtPct } from '../theme.js'

const DEFAULT_PRECIO = 180

export default function Overview() {
  const o = overview
  const riskShare = (o.n_at_risk / o.n_customers) * 100
  const [precio, setPrecio] = useState(DEFAULT_PRECIO)
  const valorEnRiesgo = o.cajas_at_risk * precio

  // Cómo se mueve el churn según lo que el cliente hace con su equipo instalado
  const movimientoData = coolers.movimiento_equipo
  const aumento = movimientoData.find((m) => m.mov === 'Aumentó equipo')
  const redujo = movimientoData.find((m) => m.mov === 'Redujo equipo')
  const sinCambio = movimientoData.find((m) => m.mov === 'Sin cambio')

  return (
    <div className="section-inner">
      <div className="section-head">
        <span className="section-kicker">Pantalla inicial</span>
        <h2>Resumen ejecutivo del churn</h2>
        <p>
          Conoce tus riesgos y prioridades: un overview de la tasa de churn y sus implicaciones para tu negocio
        </p>
      </div>

      <div className="grid grid-4" style={{ marginBottom: 24 }}>
        <div className="panel kpi-card">
          <span className="kpi-label">Tasa de churn observada</span>
          <span className="kpi-value">{fmtPct(o.churn_rate)}</span>
          <span className="kpi-sub">
            <strong>{fmtNumber(o.n_churn)}</strong> de {fmtNumber(o.n_customers)} clientes evaluados
            ya presentaron fuga
          </span>
        </div>

        <div className="panel kpi-card alt-1">
          <span className="kpi-label">Clientes en riesgo (alto + medio)</span>
          <span className="kpi-value">{fmtCompact(o.n_at_risk)}</span>
          <span className="kpi-sub">
            equivalen al <strong>{fmtPct(riskShare)}</strong> de la base
          </span>
        </div>

        <div className="panel kpi-card alt-2">
          <span className="kpi-label">Volumen de negocio en riesgo</span>
          <span className="kpi-value">{fmtCompact(o.cajas_at_risk)} cajas/mes</span>
          <span className="kpi-sub">
            asociadas a clientes en riesgo
          </span>
        </div>

        <div className="panel kpi-card alt-3">
          <span className="kpi-label">Posible costo asociado a clientes en riesgo</span>
          <span className="kpi-value">${fmtCompact(valorEnRiesgo)} /mes</span>
          <span className="kpi-sub" style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            estimado a
            <input
              type="number"
              min={1}
              value={precio}
              onChange={(e) => setPrecio(Math.max(1, Number(e.target.value) || 0))}
              style={{ width: 64, padding: '3px 6px', borderRadius: 8, border: '1px solid var(--border)', fontSize: 12.5 }}
            />
            $ por caja vendida · ajusta el valor a tu precio promedio real
          </span>
        </div>
      </div>

      <div className="grid grid-2">
        <div className="panel" style={{ textAlign: 'left' }}>
          <h3 style={{ marginBottom: 4 }}>¿Cuanto cambia el churn con respecto al equipo?</h3>
          <p className="muted" style={{ fontSize: 13, marginBottom: 16 }}>
            La tasa de churn no es pareja entre clientes: quienes <strong>reducen</strong> su equipo
            instalado se van a una tasa de <strong>{fmtPct(redujo.churn_rate)}</strong>, casi{' '}
            <strong>{fmtNumber(redujo.churn_rate / aumento.churn_rate, 1)}×</strong> más que quienes lo{' '}
            <strong>aumentan</strong> ({fmtPct(aumento.churn_rate)}). Incluso quienes no mueven nada
            registran un churn de <strong>{fmtPct(sinCambio.churn_rate)}</strong>. Reducir equipo es,
            por sí solo, una señal de alerta temprana.
          </p>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={movimientoData} margin={{ top: 16, right: 16, left: -12, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(127,23,87,0.12)" vertical={false} />
              <XAxis dataKey="mov" tick={{ fontSize: 12, fill: '#7c5a70' }} />
              <YAxis tickFormatter={(v) => `${v}%`} tick={{ fontSize: 11, fill: '#a98ba0' }} />
              <Tooltip
                formatter={(v, _n, p) => [`${fmtNumber(v, 2)}%`, `Tasa de churn · ${fmtNumber(p.payload.n)} clientes`]}
                contentStyle={{ borderRadius: 12, border: '1px solid rgba(127,23,87,0.15)', fontSize: 12 }}
              />
              <Bar dataKey="churn_rate" radius={[8, 8, 0, 0]} maxBarSize={76}>
                {movimientoData.map((d) => (
                  <Cell
                    key={d.mov}
                    fill={d.mov === 'Redujo equipo' ? COLORS.orange : d.mov === 'Sin cambio' ? COLORS.amber : COLORS.plum}
                  />
                ))}
                <LabelList dataKey="churn_rate" position="top" formatter={(v) => `${fmtNumber(v, 2)}%`} style={{ fontSize: 11.5, fill: COLORS.wine, fontWeight: 700 }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <p className="muted" style={{ fontSize: 12, marginTop: 4 }}>
          </p>
        </div>

        <div className="panel" style={{ textAlign: 'left', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ marginBottom: 4 }}>Composición de la cartera por nivel de riesgo</h3>
          <p className="muted" style={{ fontSize: 13, marginBottom: 8 }}>
            Distribución de los {fmtNumber(o.n_customers)} clientes evaluados según el nivel de
            riesgo asignado por el modelo de predicción de churn.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
            <ResponsiveContainer width="55%" height={220}>
              <RadialBarChart
                innerRadius="38%"
                outerRadius="100%"
                data={[
                  { name: 'Bajo', value: o.n_bajo, fill: COLORS.plum },
                  { name: 'Medio', value: o.n_medio, fill: COLORS.amber },
                  { name: 'Alto', value: o.n_alto, fill: COLORS.orange },
                ]}
                startAngle={90}
                endAngle={-270}
              >
                <PolarAngleAxis type="number" domain={[0, o.n_customers]} angleAxisId={0} tick={false} />
                <RadialBar dataKey="value" background={{ fill: 'rgba(127,23,87,0.06)' }} cornerRadius={8} />
                <Tooltip formatter={(v, n) => [fmtNumber(v), `Riesgo ${n}`]} contentStyle={{ borderRadius: 12, fontSize: 12 }} />
              </RadialBarChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, paddingLeft: 8 }}>
              <LegendRow color={COLORS.orange} label="Riesgo alto" value={o.n_alto} total={o.n_customers} />
              <LegendRow color={COLORS.amber} label="Riesgo medio" value={o.n_medio} total={o.n_customers} />
              <LegendRow color={COLORS.plum} label="Riesgo bajo" value={o.n_bajo} total={o.n_customers} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function LegendRow({ color, label, value, total }) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600 }}>
        <span style={{ width: 10, height: 10, borderRadius: 4, background: color, display: 'inline-block' }} />
        {label}
      </div>
      <div style={{ fontSize: 18, fontWeight: 700, color: COLORS.wine, marginLeft: 18 }}>
        {fmtNumber(value)}
      </div>
      <div className="muted" style={{ fontSize: 12, marginLeft: 18 }}>
        {fmtPct((value / total) * 100)} de la cartera
      </div>
    </div>
  )
}
