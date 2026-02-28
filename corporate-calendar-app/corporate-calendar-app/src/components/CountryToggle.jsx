import { Button, ButtonGroup } from '@chakra-ui/react'

export default function CountryToggle({ value, onChange }) {
  return (
    <ButtonGroup isAttached variant="outline">
      <Button onClick={() => onChange('CL')} isActive={value === 'CL'}>
        Chile (Santiago)
      </Button>
      <Button onClick={() => onChange('PE')} isActive={value === 'PE'}>
        Perú (Lima)
      </Button>
    </ButtonGroup>
  )
}
