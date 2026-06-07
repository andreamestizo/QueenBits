import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import coolers from '../data/coolers.json'
import SectionBg from './SectionBg.jsx'
import { COLORS, fmtNumber, fmtPct } from '../theme.js'

const bgImg = '/images/5.png'

export default function Coolers() {
  const comp = coolers.comparativo
  const activos = comp.find((c) => c.churn_real === 0)
  const churn = comp.find((c) => c.churn_real === 1)

  const compareData = [
    { name: 'Coolers instalados', activos: round1(activos.coolers), churn: round1(churn.coolers) },
    { name: 'Puertas (doors)', activos: round1(activos.doors), churn: round1(churn.doors) },
    { name: 'Volumen por cooler', activos: round1(activos.vol_por_cooler), churn: round1(churn.vol_por_cooler) },
  ]

  const movimiento = coolers.movimiento_equipo
  const pieColors = { 'Redujo equipo': COLORS.orange, 'Sin cambio': COLORS.plum, 'Aumentó equipo': COLORS.amber }

  const distActivos = Object.entries(coolers.distribucion.activos).map(([k, v]) => ({ bin: k, activos: v }))
  const distChurn = coolers.distribucion.churn
  const distMerged = distActivos.map((d) => ({ ...d, churn: distChurn[d.bin] ?? 0 }))

  return (
    <>
      <SectionBg src={bgImg} />
      <div className="section-inner">
      <div className="section-head">
        <span className="section-kicker">04 · Equipo instalado</span>
        <h2>Coolers, puertas y su relación con el churn</h2>
        <p>
          ¿El equipo instalado en el punto de venta anticipa la fuga? Comparamos la cantidad de
          coolers y puertas entre clientes activos y los que hicieron churn, y revisamos si hubo
          retiro o reducción de equipo antes del evento.
        </p>
      </div>

      <div className="grid grid-3">
        <div className="panel" style={{ textAlign: 'left', gridColumn: 'span 2' }}>
          <h3 style={{ marginBottom: 4 }}>Promedios: clientes activos vs. churn</h3>
          <p className="muted" style={{ fontSize: 13, marginBottom: 12 }}>
            Coolers y puertas instaladas en promedio, y volumen de cajas que produce cada cooler, contrastando ambos grupos.
          </p>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={compareData} margin={{ left: -10, right: 16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(127,23,87,0.08)" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#7c5a70' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#7c5a70' }} axisLine={false} tickLine={false} />
              <Tooltip
                formatter={(v, name) => [fmtNumber(v, 1), name === 'activos' ? 'Clientes activos' : 'Clientes con churn']}
                contentStyle={{ borderRadius: 12, border: '1px solid rgba(127,23,87,0.15)', fontSize: 12 }}
              />
              <Legend formatter={(v) => (v === 'activos' ? 'Clientes activos' : 'Clientes con churn')} wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="activos" fill={COLORS.plum} radius={[8, 8, 0, 0]} barSize={34} />
              <Bar dataKey="churn" fill={COLORS.orange} radius={[8, 8, 0, 0]} barSize={34} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="panel" style={{ textAlign: 'left' }}>
          <h3 style={{ marginBottom: 4 }}>Movimiento de equipo y churn</h3>
          <p className="muted" style={{ fontSize: 13, marginBottom: 12 }}>
            Tasa de churn observada según si el cliente redujo, mantuvo o aumentó su número de
            coolers, una señal de retiro de equipo previo a la fuga.
          </p>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={movimiento}
                dataKey="n"
                nameKey="mov"
                innerRadius={52}
                outerRadius={84}
                paddingAngle={3}
              >
                {movimiento.map((m) => (
                  <Cell key={m.mov} fill={pieColors[m.mov] || COLORS.pink} />
                ))}
              </Pie>
              <Tooltip
                formatter={(v, n, p) => [`${fmtNumber(v)} clientes · churn ${fmtPct(p.payload.churn_rate)}`, p.payload.mov]}
                contentStyle={{ borderRadius: 12, border: '1px solid rgba(127,23,87,0.15)', fontSize: 12 }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
            {movimiento.map((m) => (
              <div key={m.mov} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 9, height: 9, borderRadius: 3, background: pieColors[m.mov] || COLORS.pink, display: 'inline-block' }} />
                  {m.mov}
                </span>
                <span className="muted">{fmtNumber(m.n)} clientes · churn {fmtPct(m.churn_rate)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="panel" style={{ textAlign: 'left', marginTop: 20 }}>
        <h3 style={{ marginBottom: 4 }}>Distribución del número de coolers instalados</h3>
        <p className="muted" style={{ fontSize: 13, marginBottom: 12 }}>
          Porcentaje de clientes activos vs. clientes con churn según cuántos coolers tienen
          instalados. Si el churn se concentra en clientes con poco o nulo equipo instalado, el
          equipo es una señal predictiva relevante.
        </p>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={distMerged} margin={{ left: -10, right: 16 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(127,23,87,0.08)" vertical={false} />
            <XAxis dataKey="bin" tick={{ fontSize: 12, fill: '#7c5a70' }} axisLine={false} tickLine={false} label={{ value: 'Coolers instalados', position: 'insideBottom', offset: -4, fontSize: 11, fill: '#7c5a70' }} />
            <YAxis tick={{ fontSize: 11, fill: '#7c5a70' }} axisLine={false} tickLine={false} unit="%" />
            <Tooltip
              formatter={(v, name) => [fmtPct(v), name === 'activos' ? 'Clientes activos' : 'Clientes con churn']}
              contentStyle={{ borderRadius: 12, border: '1px solid rgba(127,23,87,0.15)', fontSize: 12 }}
            />
            <Legend formatter={(v) => (v === 'activos' ? 'Clientes activos' : 'Clientes con churn')} wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="activos" fill={COLORS.plum} radius={[8, 8, 0, 0]} barSize={26} />
            <Bar dataKey="churn" fill={COLORS.orange} radius={[8, 8, 0, 0]} barSize={26} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      </div>
    </>
  )
}

function round1(n) {
  return Math.round(n * 10) / 10
}
