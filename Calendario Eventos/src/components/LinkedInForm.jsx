import { useState } from "react";
import { Box, Button, FormControl, FormLabel, Input, Select, Textarea, VStack, Text } from "@chakra-ui/react";

const PUB_TYPES = ["Post", "Reel", "Carrusel", "Campaña"];

export default function LinkedInForm({ country, onCreate }) {
  const today = new Date().toISOString().slice(0, 10);
  const [publicationType, setPublicationType] = useState(PUB_TYPES[0]);
  const [link, setLink] = useState("");
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [objective, setObjective] = useState("");

  function submit(e) {
    e.preventDefault();
    if (!startDate || !endDate) return alert("Faltan fechas.");
    if (endDate < startDate) return alert("La fecha fin no puede ser menor que inicio.");

    onCreate?.({
      country,
      publicationType,
      link: link.trim(),
      startDate,
      endDate,
      objective: objective.trim(),
    });

    setLink("");
    setObjective("");
  }

  return (
    <Box borderWidth="1px" borderColor="gray.200" bg="white" borderRadius="xl" p={5}>
      <Text fontWeight="900" fontSize="lg" mb={3}>Linkedyn (Campañas)</Text>

      <Box as="form" onSubmit={submit}>
        <VStack spacing={4} align="stretch">
          <FormControl>
            <FormLabel fontWeight="800">Tipo de publicación</FormLabel>
            <Select value={publicationType} onChange={(e) => setPublicationType(e.target.value)}>
              {PUB_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </Select>
          </FormControl>

          <FormControl>
            <FormLabel fontWeight="800">Link</FormLabel>
            <Input value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://..." />
          </FormControl>

          <FormControl>
            <FormLabel fontWeight="800">Fecha inicio</FormLabel>
            <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </FormControl>

          <FormControl>
            <FormLabel fontWeight="800">Fecha fin</FormLabel>
            <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </FormControl>

          <FormControl>
            <FormLabel fontWeight="800">Objetivo</FormLabel>
            <Textarea value={objective} onChange={(e) => setObjective(e.target.value)} placeholder="Ej: awareness / leads / tráfico..." />
          </FormControl>

          <Button type="submit" bg="gray.900" color="white" _hover={{ bg: "gray.800" }} fontWeight="900">
            Guardar campaña
          </Button>
        </VStack>
      </Box>
    </Box>
  );
}
