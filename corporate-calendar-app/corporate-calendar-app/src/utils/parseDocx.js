import { parseDMY } from './date.js'

export function parseDocxTextToMeeting(rawText, fileName) {
  const text = (rawText || '').replace(/\r/g, '')
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean)

  // Fecha
  const fechaLine = lines.find(l => /^Fecha\s+de\s+Reuni[oó]n\s*:/i.test(l)) || lines.find(l => /^Fecha\s*:/i.test(l))
  const fecha = fechaLine ? (parseDMY(fechaLine.split(':').slice(1).join(':')) || new Date()) : new Date()

  // Asistentes
  const asistentesLine = lines.find(l => /^Asistentes\s*:/i.test(l)) || lines.find(l => /^(Participantes|Asistencia)\s*:/i.test(l))
  const asistentes = asistentesLine
    ? asistentesLine.split(':').slice(1).join(':').split(',').map(x => x.trim()).filter(Boolean)
    : []

  // Temas (1., 2., 3.)
  const temas = lines
    .filter(l => /^\d+\.\s+/.test(l))
    .map(l => l.replace(/^\d+\.\s+/, '').trim())

  return {
    id: crypto.randomUUID(),
    name: (fileName || 'Minuta importada').replace(/\.docx$/i, ''),
    country: 'CL', // por defecto; puedes cambiarlo en la previsualización
    city: 'Santiago',
    start: new Date(fecha).toISOString(),
    end: new Date(new Date(fecha).getTime() + 60*60*1000).toISOString(), // +1h por defecto
    type: 'Workshops', // se ajusta en UI
    organizer: '',
    place: '',
    address: '',
    topic: '',
    guests: asistentes.map(a => ({ name: a, email: '', company: '', country: '' })),
    confirmedCount: 0,
    budgetCLP: 0,
    notes: text,
    temas,
    source: { kind: 'imported_docx', fileName: fileName || '' }
  }
}
