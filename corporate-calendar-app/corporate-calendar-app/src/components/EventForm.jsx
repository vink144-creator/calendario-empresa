import { useMemo, useState } from 'react'
import {
  Alert, AlertIcon, Box, Button, Divider, FormControl, FormLabel, HStack, Input, NumberInput,
  NumberInputField, Select, Stack, Textarea
} from '@chakra-ui/react'
import { overlaps } from '../utils/date.js'
import { EVENT_TYPES } from './EventLegend.jsx'

export default function EventForm({ country, externalEvents, initialValue, onCancel, onSave }) {
  const isEdit = Boolean(initialValue?.id)

  const [value, setValue] = useState(() => initialValue || ({
    id: crypto.randomUUID(),
    country,
    city: country === 'CL' ? 'Santiago' : 'Lima',
    title: '',
    type: 'Workshops',
    start: new Date().toISOString(),
    end: new Date(Date.now() + 60*60*1000).toISOString(),
    organizer: '',
    place: '',
    address: '',
    topic: '',
    notes: '',
    campaignStart: '',
    campaignEnd: '',
    budgetCLP: 0,
    confirmedCount: 0
  }))

  const [error, setError] = useState('')

  const conflicts = useMemo(() => {
    const exts = (externalEvents || []).map(e => ({
      id: e.id,
      title: e.title,
      start: e.start,
      end: e.end
    }))
    return exts.filter(e => overlaps(value.start, value.end, e.start, e.end))
  }, [externalEvents, value.start, value.end])

  function validate() {
    if (!value.title.trim()) return 'El nombre del evento es obligatorio.'
    if (!value.start || !value.end) return 'Fecha/hora de inicio y fin son obligatorias.'
    if (new Date(value.end) <= new Date(value.start)) return 'La hora de término debe ser posterior al inicio.'
    if (!value.type) return 'El tipo de evento es obligatorio.'
    if (!value.organizer.trim()) return 'El gerente organizador es obligatorio.'
    if (!value.place.trim()) return 'El lugar es obligatorio.'
    if (!value.address.trim()) return 'La dirección es obligatoria.'
    if (!value.topic.trim()) return 'El nombre del tema es obligatorio.'
    if (value.type === 'Campaña') {
      if (!value.campaignStart || !value.campaignEnd) return 'Para campañas, indica fecha desde/hasta.'
      if (new Date(value.campaignEnd) < new Date(value.campaignStart)) return 'En campañas, la fecha hasta debe ser posterior.'
    }
    return ''
  }

  function submit() {
    const msg = validate()
    setError(msg)
    if (msg) return
    onSave?.(value)
  }

  return (
    <Box borderWidth="1px" borderRadius="lg" p={4} bg="white">
      <Stack spacing={3}>
        {error ? (
          <Alert status="error" borderRadius="md">
            <AlertIcon />
            {error}
          </Alert>
        ) : null}

        {conflicts.length ? (
          <Alert status="warning" borderRadius="md">
            <AlertIcon />
            Ojo: este evento se cruza con {conflicts.length} evento(s) externos en Santiago. Igual puedes guardar.
          </Alert>
        ) : null}

        <FormControl isRequired>
          <FormLabel>Nombre del evento</FormLabel>
          <Input value={value.title} onChange={e => setValue(v => ({ ...v, title: e.target.value }))} />
        </FormControl>

        <HStack spacing={3} align="start">
          <FormControl isRequired>
            <FormLabel>Inicio</FormLabel>
            <Input type="datetime-local"
              value={new Date(value.start).toISOString().slice(0,16)}
              onChange={e => setValue(v => ({ ...v, start: new Date(e.target.value).toISOString() }))}
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Fin</FormLabel>
            <Input type="datetime-local"
              value={new Date(value.end).toISOString().slice(0,16)}
              onChange={e => setValue(v => ({ ...v, end: new Date(e.target.value).toISOString() }))}
            />
          </FormControl>
        </HStack>

        <HStack spacing={3} align="start">
          <FormControl isRequired>
            <FormLabel>Tipo</FormLabel>
            <Select value={value.type} onChange={e => setValue(v => ({ ...v, type: e.target.value }))}>
              {EVENT_TYPES.map(t => <option key={t.key} value={t.key}>{t.label}</option>)}
            </Select>
          </FormControl>

          <FormControl>
            <FormLabel>Ciudad</FormLabel>
            <Select value={value.city} onChange={e => setValue(v => ({ ...v, city: e.target.value }))}>
              {country === 'CL' ? (
                <>
                  <option value="Santiago">Santiago</option>
                </>
              ) : (
                <>
                  <option value="Lima">Lima</option>
                </>
              )}
            </Select>
          </FormControl>
        </HStack>

        <Divider />

        <HStack spacing={3} align="start">
          <FormControl isRequired>
            <FormLabel>Gerente organizador</FormLabel>
            <Input value={value.organizer} onChange={e => setValue(v => ({ ...v, organizer: e.target.value }))} />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Nombre del tema</FormLabel>
            <Input value={value.topic} onChange={e => setValue(v => ({ ...v, topic: e.target.value }))} />
          </FormControl>
        </HStack>

        <HStack spacing={3} align="start">
          <FormControl isRequired>
            <FormLabel>Lugar</FormLabel>
            <Input value={value.place} onChange={e => setValue(v => ({ ...v, place: e.target.value }))} />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Dirección</FormLabel>
            <Input value={value.address} onChange={e => setValue(v => ({ ...v, address: e.target.value }))} />
          </FormControl>
        </HStack>

        <FormControl>
          <FormLabel>Notas / detalle</FormLabel>
          <Textarea rows={6} value={value.notes} onChange={e => setValue(v => ({ ...v, notes: e.target.value }))} />
        </FormControl>

        {value.type === 'Campaña' ? (
          <HStack spacing={3} align="start">
            <FormControl isRequired>
              <FormLabel>Desde</FormLabel>
              <Input type="date" value={value.campaignStart} onChange={e => setValue(v => ({ ...v, campaignStart: e.target.value }))} />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Hasta</FormLabel>
              <Input type="date" value={value.campaignEnd} onChange={e => setValue(v => ({ ...v, campaignEnd: e.target.value }))} />
            </FormControl>
          </HStack>
        ) : null}

        <HStack spacing={3} align="start">
          <FormControl>
            <FormLabel>Monto del evento (CLP)</FormLabel>
            <NumberInput value={value.budgetCLP} min={0} onChange={(_, num) => setValue(v => ({ ...v, budgetCLP: Number.isFinite(num) ? num : 0 }))}>
              <NumberInputField />
            </NumberInput>
          </FormControl>

          <FormControl>
            <FormLabel>Confirmados</FormLabel>
            <NumberInput value={value.confirmedCount} min={0} onChange={(_, num) => setValue(v => ({ ...v, confirmedCount: Number.isFinite(num) ? num : 0 }))}>
              <NumberInputField />
            </NumberInput>
          </FormControl>
        </HStack>

        <HStack justify="flex-end">
          <Button variant="ghost" onClick={onCancel}>Cancelar</Button>
          <Button colorScheme="blue" onClick={submit}>{isEdit ? 'Guardar cambios' : 'Crear evento'}</Button>
        </HStack>
      </Stack>
    </Box>
  )
}
