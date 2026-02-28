import { Badge, Box, Button, HStack, Stack, Text, VStack } from '@chakra-ui/react'
import { CalendarDays, Trash2 } from 'lucide-react'
import { toISODate } from '../utils/date.js'
import { typeColorHex, EVENT_TYPES } from './EventLegend.jsx'

function labelOf(typeKey) {
  return EVENT_TYPES.find(t => t.key === typeKey)?.label || typeKey
}

export default function EventList({ title, events, selectedId, onSelect, onDelete }) {
  const byDate = events.reduce((acc, ev) => {
    const k = toISODate(ev.start)
    acc[k] ||= []
    acc[k].push(ev)
    return acc
  }, {})

  const sortedDates = Object.keys(byDate).sort((a, b) => new Date(b) - new Date(a))

  if (sortedDates.length === 0) {
    return (
      <Box borderWidth="1px" borderStyle="dashed" borderRadius="lg" p={6}>
        <VStack spacing={2}>
          <CalendarDays />
          <Text fontWeight="bold">No hay eventos todavía</Text>
          <Text color="gray.600">Crea uno nuevo o importa un Word (.docx).</Text>
        </VStack>
      </Box>
    )
  }

  return (
    <Stack spacing={4}>
      <Text fontWeight="bold">{title}</Text>
      {sortedDates.map(dateKey => (
        <Box key={dateKey}>
          <HStack justify="space-between" mb={2}>
            <Text fontWeight="bold">
              {new Date(dateKey + 'T00:00:00').toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </Text>
            <Badge>{byDate[dateKey].length}</Badge>
          </HStack>

          <Stack spacing={2}>
            {byDate[dateKey].sort((a,b)=> new Date(a.start)-new Date(b.start)).map(ev => {
              const isSel = ev.id === selectedId
              return (
                <Box
                  key={ev.id}
                  borderWidth="1px"
                  borderRadius="lg"
                  p={3}
                  bg={isSel ? 'blue.50' : 'white'}
                  borderColor={isSel ? 'blue.400' : 'gray.200'}
                  cursor="pointer"
                  onClick={() => onSelect?.(ev)}
                  _hover={{ borderColor: 'gray.400' }}
                >
                  <HStack justify="space-between" align="start">
                    <Stack spacing={1}>
                      <Text fontWeight="semibold" noOfLines={2}>{ev.title}</Text>
                      <HStack spacing={2} wrap="wrap">
                        <Badge style={{ background: typeColorHex(ev.type), color: '#fff' }}>
                          {labelOf(ev.type)}
                        </Badge>
                        <Badge variant="outline">{new Date(ev.start).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}</Badge>
                        {ev.city ? <Badge variant="subtle">{ev.city}</Badge> : null}
                        {ev.isExternal ? <Badge colorScheme="red">Externo</Badge> : null}
                      </HStack>
                      {ev.notes ? <Text fontSize="sm" color="gray.600" noOfLines={2}>{ev.notes}</Text> : null}
                    </Stack>

                    {onDelete ? (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => { e.stopPropagation(); onDelete(ev.id) }}
                        aria-label="Eliminar"
                      >
                        <Trash2 size={16} />
                      </Button>
                    ) : null}
                  </HStack>
                </Box>
              )
            })}
          </Stack>
        </Box>
      ))}
    </Stack>
  )
}
