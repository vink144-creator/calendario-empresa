import { useState } from "react";
import { Box, Button, FormControl, FormLabel, Input, Textarea, VStack, Text } from "@chakra-ui/react";
import { toLocalDateTimeValue } from "../features/calendar/dateUtils";

export default function BrainForm({ country, onCreate }) {
  const [title, setTitle] = useState("");
  const [startLocal, setStartLocal] = useState(() => toLocalDateTimeValue(new Date()));
  const [reason, setReason] = useState("");

  function submit(e) {
    e.preventDefault();
    const cleanTitle = title.trim();
    if (!cleanTitle) return alert("Falta nombre del evento.");

    onCreate?.({
      country,
      title: cleanTitle,
      startLocal,
      reason: reason.trim(),
    });

    setTitle("");
    setReason("");
  }

  return (
    <Box borderWidth="1px" borderColor="gray.200" bg="white" borderRadius="xl" p={5}>
      <Text fontWeight="900" fontSize="lg" mb={3}>Cerebro (Bloqueos externos)</Text>

      <Box as="form" onSubmit={submit}>
        <VStack spacing={4} align="stretch">
          <FormControl>
            <FormLabel fontWeight="800">Nombre del evento externo</FormLabel>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ej: Concierto masivo / Feria / Marcha" />
          </FormControl>

          <FormControl>
            <FormLabel fontWeight="800">Fecha y hora</FormLabel>
            <Input type="datetime-local" value={startLocal} onChange={(e) => setStartLocal(e.target.value)} />
          </FormControl>

          <FormControl>
            <FormLabel fontWeight="800">Motivo (por qué es mala fecha)</FormLabel>
            <Textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Ej: tráfico, hotelería llena, baja disponibilidad..." />
          </FormControl>

          <Button type="submit" bg="gray.900" color="white" _hover={{ bg: "gray.800" }} fontWeight="900">
            Guardar bloqueo
          </Button>
        </VStack>
      </Box>
    </Box>
  );
}
