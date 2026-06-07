import { useMemo, useState } from 'react'
import sim from '../data/simulator.json'
import { COLORS, fmtPct } from '../theme.js'

function findByLabel(table, label) {
  const found = table.find((b) => b.bin === label)
  return found ? found.prob : sim.baseline_prob
}

export default function Simulator() {
  const [coolers, setCoolers] = useState(2)
  const [doors, setDoors] = useState(2)
  const [volPorCooler, setVolPorCooler] = useState(2) // index into bins
  const [mesesEquipo, setMesesEquipo] = useState(1)
  const [deltaCoolers, setDeltaCoolers] = useState(2) // index: 0 redujo>=2,1 redujo1,2 sin cambio,3 aumentó
  const [trans, setTrans] = useState(2)
  const [tasaCoolers, setTasaCoolers] = useState(2)
  const [territorio, setTerritorio] = useState(sim.territorios[0])
  const [canal, setCanal] = useState(sim.canales[0])

  const volBins = sim.por_vol_cooler.map((b) => b.bin)
  const mesesBins = sim.por_meses_equipo.map((b) => b.bin)
  const deltaBins = sim.por_delta_coolers.map((b) => b.bin)
  const transBins = sim.por_trans.map((b) => b.bin)
  const tasaBins = sim.por_tasa_coolers_ventas.map((b) => b.bin)

  const result = useMemo(() => {
    const coolerBin = coolers === 0 ? '0' : coolers === 1 ? '1' : coolers === 2 ? '2' : coolers === 3 ? '3' : '4-5'
    const doorBin = doors === 0 ? '0' : doors === 1 ? '1' : doors === 2 ? '2' : doors <= 4 ? '3-4' : '5-8'

    const factors = [
      findByLabel(sim.por_coolers, coolerBin),
      findByLabel(sim.por_doors, doorBin),
      findByLabel(sim.por_vol_cooler, volBins[volPorCooler]),
      findByLabel(sim.por_meses_equipo, mesesBins[mesesEquipo]),
      findByLabel(sim.por_delta_coolers, deltaBins[deltaCoolers]),
      findByLabel(sim.por_trans, transBins[trans]),
      findByLabel(sim.por_tasa_coolers_ventas, tasaBins[tasaCoolers]),
      findByLabel(sim.por_territorio.map((t) => ({ bin: t.key, prob: t.prob })), territorio),
      findByLabel(sim.por_canal.map((t) => ({ bin: t.key, prob: t.prob })), canal),
    ]

    // Combinar factores como desviaciones relativas a la base, ponderando para suavizar el efecto.
    const base = sim.baseline_prob
    const weights = [1.1, 0.7, 1.2, 1.0, 1.3, 1.1, 1.0, 0.6, 0.6]
    let logOdds = 0
    let wSum = 0
    factors.forEach((f, i) => {
      const ratio = Math.max(f, 0.0005) / Math.max(base, 0.0005)
      logOdds += weights[i] * Math.log(ratio)
      wSum += weights[i]
    })
    const blended = base * Math.exp(logOdds / wSum)
    const prob = Math.min(Math.max(blended, 0.05), 85)
    return prob
  }, [coolers, doors, volPorCooler, mesesEquipo, deltaCoolers, trans, tasaCoolers, territorio, canal])

  const delta = result - sim.baseline_prob
  const level = result >= 8 ? 'Alto' : result >= 2 ? 'Medio' : 'Bajo'
  const levelColor = level === 'Alto' ? COLORS.orange : level === 'Medio' ? COLORS.amber : COLORS.plum

  return (
    <div className="section-inner">
      <div className="section-head">
        <span className="section-kicker">06 · Simulación</span>
        <h2>Simulador "qué pasaría si…"</h2>
        <p>
          Ajusta el equipo instalado, el comportamiento transaccional y el segmento de un cliente
          hipotético para estimar cómo se mueve su probabilidad de churn. La estimación se calcula
          combinando los patrones reales observados en la cartera para cada combinación de
          variables.
        </p>
      </div>

      <div className="sim-grid">
        <div className="panel">
          <h3 style={{ marginBottom: 16, textAlign: 'left' }}>Variables del cliente hipotético</h3>

          <div className="sim-control">
            <label>Coolers instalados <span className="sim-value">{coolers}</span></label>
            <input type="range" min={0} max={6} step={1} value={coolers} onChange={(e) => setCoolers(Number(e.target.value))} />
          </div>

          <div className="sim-control">
            <label>Puertas (doors) <span className="sim-value">{doors}</span></label>
            <input type="range" min={0} max={9} step={1} value={doors} onChange={(e) => setDoors(Number(e.target.value))} />
          </div>

          <div className="sim-control">
            <label>Volumen por cooler <span className="sim-value">{volBins[volPorCooler]}</span></label>
            <input type="range" min={0} max={volBins.length - 1} step={1} value={volPorCooler} onChange={(e) => setVolPorCooler(Number(e.target.value))} />
          </div>

          <div className="sim-control">
            <label>Movimiento reciente de equipo <span className="sim-value">{deltaBins[deltaCoolers]}</span></label>
            <input type="range" min={0} max={deltaBins.length - 1} step={1} value={deltaCoolers} onChange={(e) => setDeltaCoolers(Number(e.target.value))} />
          </div>

          <div className="sim-control">
            <label>Meses desde el último cambio de equipo <span className="sim-value">{mesesBins[mesesEquipo]}</span></label>
            <input type="range" min={0} max={mesesBins.length - 1} step={1} value={mesesEquipo} onChange={(e) => setMesesEquipo(Number(e.target.value))} />
          </div>

          <div className="sim-control">
            <label>Transacciones del último mes <span className="sim-value">{transBins[trans]}</span></label>
            <input type="range" min={0} max={transBins.length - 1} step={1} value={trans} onChange={(e) => setTrans(Number(e.target.value))} />
          </div>

          <div className="sim-control">
            <label>Dependencia del cooler en ventas <span className="sim-value">{tasaBins[tasaCoolers]}</span></label>
            <input type="range" min={0} max={tasaBins.length - 1} step={1} value={tasaCoolers} onChange={(e) => setTasaCoolers(Number(e.target.value))} />
          </div>

          <div className="grid grid-2" style={{ gap: 14 }}>
            <div className="sim-control" style={{ marginBottom: 0 }}>
              <label>Territorio</label>
              <select value={territorio} onChange={(e) => setTerritorio(e.target.value)}>
                {sim.territorios.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="sim-control" style={{ marginBottom: 0 }}>
              <label>Canal comercial</label>
              <select value={canal} onChange={(e) => setCanal(e.target.value)}>
                {sim.canales.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="sim-result">
          <span className="muted" style={{ color: 'rgba(255,255,255,0.75)', fontSize: 12.5, textTransform: 'uppercase', letterSpacing: '1.4px', fontWeight: 700 }}>
            Probabilidad estimada de churn
          </span>
          <span className="sim-gauge">{fmtPct(result, 2)}</span>
          <span className="level-tag" style={{ background: levelColor, color: '#fff' }}>Riesgo {level}</span>
          <span className={`delta ${delta >= 0 ? 'up' : 'down'}`}>
            {delta >= 0 ? '+' : ''}{fmtPct(delta, 2)} vs. promedio de la cartera ({fmtPct(sim.baseline_prob, 2)})
          </span>
          <div style={{ width: '100%', marginTop: 6 }}>
            <div style={{ height: 10, borderRadius: 999, background: 'rgba(255,255,255,0.18)', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${Math.min(result / 30, 1) * 100}%`, background: `linear-gradient(90deg, ${COLORS.amber}, ${COLORS.pink})`, borderRadius: 999 }} />
            </div>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', marginTop: 6 }}>
            </p>
          </div>
          <p style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.85)', lineHeight: 1.6, marginTop: 4 }}>
            {simNarrative(level, delta)}
          </p>
        </div>
      </div>
    </div>
  )
}

function simNarrative(level, delta) {
  if (level === 'Alto') {
    return 'Esta combinación de variables coincide con perfiles donde históricamente se concentra la mayor parte del churn observado: conviene priorizar contacto preventivo y revisión de equipo.'
  }
  if (level === 'Medio') {
    return delta >= 0
      ? 'El riesgo se ubica por encima del promedio de la cartera: vale la pena dar seguimiento cercano a la evolución de su volumen y equipo instalado.'
      : 'El riesgo se mantiene moderado y por debajo del promedio: el cliente muestra señales relativamente estables.'
  }
  return 'Este perfil se asemeja a los clientes con menor probabilidad de fuga de la cartera: condiciones estables y sin señales de alerta relevantes.'
}
