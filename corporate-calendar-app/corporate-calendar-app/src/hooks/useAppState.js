import { useEffect, useMemo, useState } from 'react'
import { loadState, saveState } from '../utils/storage.js'
import externalCL from '../data/externalEvents.cl.json'

const defaultState = {
  selectedCountry: 'CL', // CL o PE
  events: [],
  externalEvents: {
    CL: externalCL,
    PE: []
  }
}

export function useAppState() {
  const [state, setState] = useState(() => loadState() || defaultState)

  useEffect(() => {
    saveState(state)
  }, [state])

  const actions = useMemo(() => ({
    setCountry(country) {
      setState(s => ({ ...s, selectedCountry: country }))
    },
    upsertEvent(event) {
      setState(s => {
        const idx = s.events.findIndex(e => e.id === event.id)
        const events = idx >= 0
          ? s.events.map(e => e.id === event.id ? event : e)
          : [event, ...s.events]
        return { ...s, events }
      })
    },
    deleteEvent(id) {
      setState(s => ({ ...s, events: s.events.filter(e => e.id !== id) }))
    },
    addExternalEvent(country, ev) {
      setState(s => ({
        ...s,
        externalEvents: { ...s.externalEvents, [country]: [ev, ...(s.externalEvents?.[country] || [])] }
      }))
    },
    setAll(nextState) {
      setState(nextState)
    }
  }), [])

  return { state, setState, actions }
}
