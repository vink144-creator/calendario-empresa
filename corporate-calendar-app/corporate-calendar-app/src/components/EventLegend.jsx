import { HStack, Badge, Text, Wrap, WrapItem } from '@chakra-ui/react'

export const EVENT_TYPES = [
  { key: 'Workshops', label: 'Workshops', color: '#3498db' },
  { key: 'Desayuno', label: 'Desayuno', color: '#f1c40f' },
  { key: 'Almuerzo', label: 'Almuerzo', color: '#e67e22' },
  { key: 'Cena', label: 'Cena', color: '#9b59b6' },
  { key: 'Networking', label: 'Networking', color: '#2ecc71' },
  { key: 'Lanzamiento', label: 'Lanzamiento de Producto', color: '#e74c3c' },
  { key: 'PartnerAnual', label: 'Evento Anual con Partner', color: '#e84393' },
  { key: 'Campaña', label: 'Publicación/Campaña (LinkedIn/Ads)', color: '#34495e' }
]

export function typeColorHex(typeKey) {
  return EVENT_TYPES.find(t => t.key === typeKey)?.color || '#95a5a6'
}

export default function EventLegend() {
  return (
    <>
      <Text fontWeight="bold" mb={2}>Leyenda</Text>
      <Wrap spacing={2}>
        {EVENT_TYPES.map(t => (
          <WrapItem key={t.key}>
            <HStack>
              <Badge borderRadius="md" px={2} py={1} style={{ background: t.color, color: '#fff' }}>
                {t.label}
              </Badge>
            </HStack>
          </WrapItem>
        ))}
      </Wrap>
    </>
  )
}
