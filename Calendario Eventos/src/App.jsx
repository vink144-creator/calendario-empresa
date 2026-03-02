import BrainForm from "./components/BrainForm";
import WeatherForm from "./components/WeatherForm";
import LinkedInForm from "./components/LinkedInForm";
import { Box, Heading, Button } from "@chakra-ui/react";
import { useState } from "react";
import EventForm from "./components/EventForm";

export default function App() {
  const [events, setEvents] = useState([]);

  function handleCreate(event) {
    setEvents((prev) => [...prev, event]);
  }

  return (
    <Box p={8}>
      <Heading mb={6}>Calendario Corporativo</Heading>
      <EventForm onCreate={handleCreate} />

      <Box mt={8}>
        <Heading size="md" mb={4}>Eventos creados:</Heading>
        {events.map((e, i) => (
          <Box key={i} p={4} borderWidth="1px" borderRadius="lg" mb={3}>
            <strong>{e.title}</strong><br />
            {e.date}
          </Box>
        ))}
      </Box>
    </Box>
  );
}
