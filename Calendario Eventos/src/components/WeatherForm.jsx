import { useState } from "react";
import { Box, Button, FormControl, FormLabel, Input, Select, Textarea, VStack, Text } from "@chakra-ui/react";

const WEATHER_TYPES = ["Lluvia", "Tormenta", "Nieve", "Viento", "Inundación", "Ola de calor"];

export default function WeatherForm({ country, onCreate }) {
  const [dateKey, setDateKey] = useState(() => new Date().toISOString().slice(0, 10)); // YYYY-MM-DD
  const [weatherType, setWeatherType] = useState(WEATHER_TYPES[0]);
  const [notes, setNotes] = useState("");

  function submit(e) {
    e.preventDefault();
    if (!dateKey) return alert("Falta fecha.");

    onCreate?.({
      country,
      dateKey,
      weatherType,
      notes: notes.trim(),
    });

    setNotes("");
  }

  return (
    <Box borderWidth="1px" borderColor="gray.200" bg="white" borderRadius="xl" p={5}>
      <Text fontWeight="900" fontSize="lg" mb={3}>Clima (Bloqueos por meteorología)</Text>

      <Box as="form" onSubmit={submit}>
        <VStack spacing={4} align="stretch">
          <FormControl>
            <FormLabel fontWeight="800">Fecha</FormLabel>
            <Input type="date" value={dateKey} onChange={(e) => setDateKey(e.target.value)} />
          </FormControl>

          <FormControl>
            <FormLabel fontWeight="800">Tipo de inconveniente</FormLabel>
            <Select value={weatherType} onChange={(e) => setWeatherType(e.target.value)}>
              {WEATHER_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </Select>
          </FormControl>

          <FormControl>
            <FormLabel fontWeight="800">Comentario</FormLabel>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Ej: alerta meteorológica / recomendación..." />
          </FormControl>

          <Button type="submit" bg="gray.900" color="white" _hover={{ bg: "gray.800" }} fontWeight="900">
            Guardar bloqueo clima
          </Button>
        </VStack>
      </Box>
    </Box>
  );
}
