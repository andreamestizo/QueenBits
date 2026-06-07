export const COLORS = {
  wine: '#7f1757',
  plum: '#a11f6d',
  pink: '#fd3e7e',
  cream: '#f8f3f6',
  orange: '#f24023',
  amber: '#f19041',
}

export const CHART_PALETTE = [
  COLORS.wine,
  COLORS.pink,
  COLORS.amber,
  COLORS.plum,
  COLORS.orange,
  '#c75a96',
  '#f7b48a',
  '#5e2747',
]

export function fmtNumber(n, decimals = 0) {
  if (n === null || n === undefined || Number.isNaN(n)) return '—'
  return Number(n).toLocaleString('es-MX', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

export function fmtCompact(n) {
  if (n === null || n === undefined || Number.isNaN(n)) return '—'
  const abs = Math.abs(n)
  if (abs >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M'
  if (abs >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, '') + 'k'
  return fmtNumber(n)
}

export function fmtPct(n, decimals = 1) {
  if (n === null || n === undefined || Number.isNaN(n)) return '—'
  return `${Number(n).toLocaleString('es-MX', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}%`
}
