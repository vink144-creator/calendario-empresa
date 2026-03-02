
import { useState } from "react";
import { Box, Input, Button, FormControl, FormLabel, VStack } from "@chakra-ui/react";

export default function EventForm({ onCreate }) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    if (!title || !date) return;
    onCreate({ title, date });
    setTitle("");
    setDate("");
  }

  return (
    <Box as="form" onSubmit={handleSubmit} borderWidth="1px" p={6} borderRadius="lg">
      <VStack spacing={4}>
        <FormControl>
          <FormLabel>Título del evento</FormLabel>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} />
        </FormControl>

        <FormControl>
          <FormLabel>Fecha</FormLabel>
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </FormControl>

        <Button type="submit" colorScheme="blue" width="full">
          Crear Evento
        </Button>
      </VStack>
    </Box>
  );
}
