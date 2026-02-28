export function toISODate(d) {
  const dt = new Date(d)
  const yyyy = dt.getFullYear()
  const mm = String(dt.getMonth() + 1).padStart(2, '0')
  const dd = String(dt.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

export function formatDateTimeLocal(isoString) {
  if (!isoString) return ''
  const d = new Date(isoString)
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  const hh = String(d.getHours()).padStart(2, '0')
  const mi = String(d.getMinutes()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`
}

export function parseDMY(text) {
  // "16-12-2025" -> Date
  const m = String(text).trim().match(/(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})/)
  if (!m) return null
  const dd = Number(m[1])
  const mm = Number(m[2]) - 1
  const yyyy = Number(m[3])
  const d = new Date(yyyy, mm, dd, 9, 0, 0, 0)
  return isNaN(d.getTime()) ? null : d
}

export function overlaps(aStart, aEnd, bStart, bEnd) {
  const as = new Date(aStart).getTime()
  const ae = new Date(aEnd).getTime()
  const bs = new Date(bStart).getTime()
  const be = new Date(bEnd).getTime()
  if ([as,ae,bs,be].some(Number.isNaN)) return false
  return as < be && bs < ae
}
