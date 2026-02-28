import { useState } from 'react'
import {
  Alert, AlertIcon, Box, Button, FormControl, FormLabel, HStack, Input, Select, Stack, Text, Textarea
} from '@chakra-ui/react'
import mammoth from 'mammoth'
import { parseDocxTextToMeeting } from '../utils/parseDocx.js'
import { EVENT_TYPES } from './EventLegend.jsx'

export default function ImportDocx({ country, onImported }) {
  const [error, setError] = useState('')
  const [preview, setPreview] = useState([]) // array of { fileName, rawText, meetingDraft }
  const [loading, setLoading] = useState(false)

  async function onPickFiles(e) {
    const files = Array.from(e.target.files || [])
    setError('')
    setPreview([])
    if (!files.length) return

    setLoading(true)
    try {
      const items = []
      for (const file of files) {
        const arrayBuffer = await file.arrayBuffer()
        const result = await mammoth.extractRawText({ arrayBuffer })
        const rawText = result?.value || ''
        const draft = parseDocxTextToMeeting(rawText, file.name)
        draft.country = country
        draft.city = country === 'CL' ? 'Santiago' : 'Lima'
        items.push({ fileName: file.name, rawText, draft })
      }
      setPreview(items)
    } catch (err) {
      setError('No pude leer el .docx. Revisa que sea Word moderno (.docx) y no .doc antiguo.')
    } finally {
      setLoading(false)
    }
  }

  function updateDraft(i, patch) {
    setPreview(prev => prev.map((p, idx) => idx === i ? ({ ...p, draft: { ...p.draft, ...patch } }) : p))
  }

  function importAll() {
    onImported?.(preview.map(p => p.draft))
    setPreview([])
  }

  return (
    <Box borderWidth="1px" borderRadius="lg" p={4} bg="white">
      <Stack spacing={3}>
        <Text fontWeight="bold">Importar Word (.docx)</Text>

        {error ? (
          <Alert status="error" borderRadius="md">
            <AlertIcon />
            {error}
          </Alert>
        ) : null}

        <FormControl>
          <FormLabel>Selecciona uno o varios .docx</FormLabel>
          <Input type="file" accept=".docx" multiple onChange={onPickFiles} />
        </FormControl>

        {loading ? <Text>Procesando...</Text> : null}

        {preview.length ? (
          <>
            <Text fontWeight="bold">Previsualización</Text>
            <Stack spacing={4}>
              {preview.map((p, i) => (
                <Box key={p.fileName} borderWidth="1px" borderRadius="lg" p={3}>
                  <Stack spacing={2}>
                    <Text fontWeight="semibold">{p.fileName}</Text>

                    <HStack spacing={3} align="start">
                      <FormControl isRequired>
                        <FormLabel>Nombre</FormLabel>
                        <Input value={p.draft.title} onChange={e => updateDraft(i, { title: e.target.value })} />
                      </FormControl>

                      <FormControl isRequired>
                        <FormLabel>Tipo</FormLabel>
                        <Select value={p.draft.type} onChange={e => updateDraft(i, { type: e.target.value })}>
                          {EVENT_TYPES.map(t => <option key={t.key} value={t.key}>{t.label}</option>)}
                        </Select>
                      </FormControl>
                    </HStack>

                    <HStack spacing={3} align="start">
                      <FormControl isRequired>
                        <FormLabel>Inicio</FormLabel>
                        <Input type="datetime-local"
                          value={new Date(p.draft.start).toISOString().slice(0,16)}
                          onChange={e => updateDraft(i, { start: new Date(e.target.value).toISOString() })}
                        />
                      </FormControl>

                      <FormControl isRequired>
                        <FormLabel>Fin</FormLabel>
                        <Input type="datetime-local"
                          value={new Date(p.draft.end).toISOString().slice(0,16)}
                          onChange={e => updateDraft(i, { end: new Date(e.target.value).toISOString() })}
                        />
                      </FormControl>
                    </HStack>

                    <FormControl>
                      <FormLabel>Notas (texto extraído)</FormLabel>
                      <Textarea rows={6} value={p.draft.notes} onChange={e => updateDraft(i, { notes: e.target.value })} />
                    </FormControl>
                  </Stack>
                </Box>
              ))}
            </Stack>

            <HStack justify="flex-end">
              <Button colorScheme="blue" onClick={importAll}>Importar {preview.length}</Button>
            </HStack>
          </>
        ) : null}
      </Stack>
    </Box>
  )
}
