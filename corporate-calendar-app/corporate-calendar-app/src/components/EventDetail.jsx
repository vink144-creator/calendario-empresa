import { Badge, Box, Button, Divider, HStack, Stack, Text } from '@chakra-ui/react'
import { Pencil } from 'lucide-react'
import { typeColorHex, EVENT_TYPES } from './EventLegend.jsx'

function labelOf(typeKey) {
  return EVENT_TYPES.find(t => t.key === typeKey)?.label || typeKey
}

export default function EventDetail({ event, onEdit }) {
  if (!event) {
    return (
      <Box borderWidth="1px" borderRadius="lg" p={4} bg="white">
        <Text color="gray.600">Selecciona un evento para ver el detalle.</Text>
      </Box>
    )
  }

  return (
    <Box borderWidth="1px" borderRadius="lg" p={4} bg="white">
      <Stack spacing={2}>
        <HStack justify="space-between" align="start">
          <Stack spacing={1}>
            <Text fontWeight="bold" fontSize="lg">{event.title}</Text>
            <HStack spacing={2} wrap="wrap">
              <Badge style={{ background: typeColorHex(event.type), color: '#fff' }}>{labelOf(event.type)}</Badge>
              <Badge variant="outline">{new Date(event.start).toLocaleString('es-CL')}</Badge>
              <Text>→</Text>
              <Badge variant="outline">{new Date(event.end).toLocaleString('es-CL')}</Badge>
              {event.city ? <Badge variant="subtle">{event.city}</Badge> : null}
            </HStack>
          </Stack>

          <Button size="sm" leftIcon={<Pencil size={16} />} onClick={onEdit}>
            Editar
          </Button>
        </HStack>

        <Divider />

        <Text><b>Organizador:</b> {event.organizer || '-'}</Text>
        <Text><b>Tema:</b> {event.topic || '-'}</Text>
        <Text><b>Lugar:</b> {event.place || '-'} {event.address ? `(${event.address})` : ''}</Text>
        <Text><b>Confirmados:</b> {event.confirmedCount ?? 0}</Text>
        <Text><b>Monto CLP:</b> {Number(event.budgetCLP || 0).toLocaleString('es-CL')}</Text>

        {event.type === 'Campaña' ? (
          <Text><b>Campaña:</b> {event.campaignStart || '-'} → {event.campaignEnd || '-'}</Text>
        ) : null}

        <Divider />

        <Text fontWeight="bold">Notas</Text>
        <Box whiteSpace="pre-wrap" color="gray.700" fontSize="sm">
          {event.notes || '(sin notas)'}
        </Box>
      </Stack>
    </Box>
  )
}
