# Calendario corporativo (sin base de datos)

## Requisitos
- Node.js 18+ (recomendado 20+)

## Cómo correrlo
```bash
npm install
npm run dev
```

Abre: http://localhost:5173

## Qué guarda
- Todo queda en tu navegador (localStorage).
- Puedes exportar/importar un respaldo (.json).

## Importar Word
- Soporta .docx (Word moderno) usando `mammoth`.
- Se hace un parse básico del formato tipo:
  - `Fecha de Reunión: dd-mm-aaaa`
  - `Asistentes: ...`
  - puntos numerados `1. ...`

## Eventos externos de Santiago
- Para evitar choques SIN usar APIs pagadas, la app trae una lista local editable:
  `src/data/externalEvents.cl.json`
- Puedes editar ese archivo, o cargar eventos externos manualmente desde la app.
