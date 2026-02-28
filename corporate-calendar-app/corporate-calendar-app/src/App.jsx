import { useMemo, useState } from 'react'
import { Box, Button, Container, Divider, HStack, Stack, Text } from '@chakra-ui/react'
import CountryToggle from './components/CountryToggle.jsx'
import EventLegend from './components/EventLegend.jsx'
import EventList from './components/EventList.jsx'
import EventDetail from './components/EventDetail.jsx'
import EventForm from './components/EventForm.jsx'
import ImportDocx from './components/ImportDocx.jsx'
import { exportBackup, importBackupFile } from './utils/storage.js'
import { useAppState } from './hooks/useAppState.js'

function normalizeExternal(country, arr) {
  return (arr || []).map(e => ({
    id: e.id,
    country,
    city: e.city,
    title: e.title,
    start: e.start,
    end: e.end,
    type: 'Externo',
    isExternal: true,
    notes: e.source ? `Fuente: ${e.source}` : ''
  }))
}

export default function App() {
  const { state, actions } = useAppState()
  const country = state.selectedCountry

  const [selectedId, setSelectedId] = useState('')
  const [mode, setMode] = useState('list') // list | new | edit | import
  const [draftEdit, setDraftEdit] = useState(null)

  const events = useMemo(() => state.events.filter(e => e.country === country), [state.events, country])

  const external = useMemo(() => normalizeExternal(country, state.externalEvents?.[country] || []), [state.externalEvents, country])

  const allForList = useMemo(() => {
    // Mostramos externos (solo en CL por defecto) junto con los internos, pero no se pueden eliminar desde la lista externa
    return [...events, ...external].sort((a,b)=> new Date(b.start) - new Date(a.start))
  }, [events, external])

  const selected = useMemo(() => events.find(e => e.id === selectedId) || null, [events, selectedId])

  function startNew() {
    setDraftEdit(null)
    setMode('new')
  }

  function startEdit() {
    if (!selected) return
    setDraftEdit(selected)
    setMode('edit')
  }

  function onSave(ev) {
    actions.upsertEvent(ev)
    setSelectedId(ev.id)
    setMode('list')
  }

  function onDelete(id) {
    actions.deleteEvent(id)
    if (selectedId === id) setSelectedId('')
    setMode('list')
  }

  async function onImportBackup(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const data = await importBackupFile(file)
    actions.setAll(data)
    setSelectedId('')
    setMode('list')
  }

  return (
    <Container maxW="1200px" py={6}>
      <Stack spacing={4}>
        <HStack justify="space-between" wrap="wrap">
          <Stack spacing={0}>
            <Text fontSize="2xl" fontWeight="bold">Calendario corporativo</Text>
            <Text color="gray.600" fontSize="sm">Sin base de datos (todo local). Importa Word (.docx), crea eventos y evita choques con eventos externos de Santiago.</Text>
          </Stack>

          <CountryToggle value={country} onChange={(c) => { actions.setCountry(c); setSelectedId(''); setMode('list') }} />
        </HStack>

        <Box borderWidth="1px" borderRadius="lg" p={4} bg="white">
          <EventLegend />
          <Divider my={4} />
          <HStack wrap="wrap" spacing={2}>
            <Button colorScheme="blue" onClick={startNew}>Nuevo evento</Button>
            <Button variant="outline" onClick={() => setMode('import')}>Importar Word</Button>
            <Button variant="outline" onClick={() => exportBackup(state)}>Exportar respaldo</Button>

            <Button as="label" variant="outline" cursor="pointer">
              Importar respaldo
              <input type="file" accept="application/json" hidden onChange={onImportBackup} />
            </Button>
          </HStack>
        </Box>

        <HStack align="start" spacing={4} flexWrap="wrap">
          <Box flex="1" minW="340px">
            <EventList
              title={country === 'CL' ? 'Chile (Santiago)' : 'Perú (Lima)'}
              events={allForList}
              selectedId={selectedId}
              onSelect={(ev) => {
                if (ev.isExternal) return // externos: solo visibles
                setSelectedId(ev.id)
                setMode('list')
              }}
              onDelete={(id) => onDelete(id)}
            />
          </Box>

          <Box flex="1" minW="340px">
            {mode === 'new' ? (
              <EventForm
                country={country}
                externalEvents={state.externalEvents?.[country] || []}
                onCancel={() => setMode('list')}
                onSave={onSave}
              />
            ) : null}

            {mode === 'edit' ? (
              <EventForm
                country={country}
                externalEvents={state.externalEvents?.[country] || []}
                initialValue={draftEdit}
                onCancel={() => setMode('list')}
                onSave={onSave}
              />
            ) : null}

            {mode === 'import' ? (
              <ImportDocx
                country={country}
                onImported={(imported) => {
                  imported.forEach(ev => actions.upsertEvent(ev))
                  setMode('list')
                }}
              />
            ) : null}

            {mode === 'list' ? (
              <EventDetail event={selected} onEdit={startEdit} />
            ) : null}
          </Box>
        </HStack>
      </Stack>
    </Container>
  )
}
