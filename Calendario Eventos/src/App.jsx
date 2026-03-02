import { useMemo, useState } from "react";
import {
  Badge,
  Box,
  Button,
  ButtonGroup,
  Divider,
  FormControl,
  FormLabel,
  HStack,
  Image,
  Input,
  Select,
  Spacer,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  Textarea,
  VStack,
  NumberInput,
  NumberInputField,
  Tag,
  TagCloseButton,
  TagLabel,
  Stack,
} from "@chakra-ui/react";
import { AttachmentIcon } from "@chakra-ui/icons";

import MonthView from "./features/calendar/MonthView";
import DayDetails from "./features/calendar/DayDetails";
import { addMonths, formatClp, toLocalDateTimeValue, ymdFromDate } from "./features/calendar/dateUtils";
import { useCalendarStore } from "./features/events/useEvents";
import { EVENT_TYPES } from "./features/events/eventMeta";

/** =========================
 *  Formularios embebidos
 *  ========================= */

function clampInt(v, min, max) {
  const n = Number.parseInt(v, 10);
  if (Number.isNaN(n)) return min;
  return Math.max(min, Math.min(max, n));
}

function normalizeMoney(raw) {
  const digits = String(raw ?? "").replace(/[^\d]/g, "");
  return digits === "" ? 0 : Number(digits);
}

/** Nuevo Evento */
function NewEventForm({ country, onCreate }) {
  const [title, setTitle] = useState("");
  const [manager, setManager] = useState("");
  const [startLocal, setStartLocal] = useState(() => toLocalDateTimeValue(new Date()));
  const [durationHours, setDurationHours] = useState(1);
  const [eventType, setEventType] = useState(EVENT_TYPES[0]);
  const [address, setAddress] = useState("");
  const [budgetClpRaw, setBudgetClpRaw] = useState("");
  const [notes, setNotes] = useState("");

  // Empresas como “chips” (etiquetas redondeadas)
  const [companyName, setCompanyName] = useState("");
  const [companyInvited, setCompanyInvited] = useState(1);
  const [companyConfirmed, setCompanyConfirmed] = useState(0);
  const [companies, setCompanies] = useState([]);

  const totals = useMemo(() => {
    const invited = companies.reduce((a, c) => a + (Number(c.invited) || 0), 0);
    const confirmed = companies.reduce((a, c) => a + (Number(c.confirmed) || 0), 0);
    return { invited, confirmed };
  }, [companies]);

  function addCompany() {
    const name = companyName.trim();
    if (!name) return;

    const invited = clampInt(companyInvited, 0, 9999);
    const confirmed = clampInt(companyConfirmed, 0, invited);

    setCompanies((prev) => {
      const idx = prev.findIndex((c) => c.name.toLowerCase() === name.toLowerCase());
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], invited, confirmed };
        return copy;
      }
      return [...prev, { name, invited, confirmed }];
    });

    setCompanyName("");
    setCompanyInvited(1);
    setCompanyConfirmed(0);
  }

  function removeCompany(name) {
    setCompanies((prev) => prev.filter((c) => c.name !== name));
  }

  function submit(e) {
    e.preventDefault();

    const cleanTitle = title.trim();
    const cleanManager = manager.trim();
    if (!cleanTitle || !cleanManager) {
      alert("Falta Nombre del Evento o Gerente organizador.");
      return;
    }
    if (!startLocal) {
      alert("Falta fecha y hora.");
      return;
    }

    onCreate?.({
      country,
      title: cleanTitle,
      manager: cleanManager,
      startLocal,
      durationHours: clampInt(durationHours, 1, 24),
      address: address.trim(),
      budgetClp: normalizeMoney(budgetClpRaw),
      eventType,
      companies,
      notes: notes.trim(),
    });

    // reset
    setTitle("");
    setManager("");
    setDurationHours(1);
    setEventType(EVENT_TYPES[0]);
    setAddress("");
    setBudgetClpRaw("");
    setCompanies([]);
    setNotes("");
  }

  return (
    <Box borderWidth="1px" borderColor="gray.200" bg="white" borderRadius="xl" p={5} w="100%">
      <Text fontWeight="900" fontSize="lg" mb={3}>
        Nuevo Evento
      </Text>

      <Box as="form" onSubmit={submit}>
        <VStack spacing={4} align="stretch">
          <HStack spacing={4} align="stretch" flexWrap="wrap">
            <FormControl flex="1" minW="240px">
              <FormLabel fontWeight="800">Nombre del Evento</FormLabel>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ej: Workshop con BCI" />
            </FormControl>

            <FormControl flex="1" minW="240px">
              <FormLabel fontWeight="800">Gerente organizador</FormLabel>
              <Input value={manager} onChange={(e) => setManager(e.target.value)} placeholder="Ej: VS - Vinklaguer Sanchez" />
            </FormControl>
          </HStack>

          <HStack spacing={4} align="stretch" flexWrap="wrap">
            <FormControl flex="1" minW="240px">
              <FormLabel fontWeight="800">Fecha y hora</FormLabel>
              <Input type="datetime-local" value={startLocal} onChange={(e) => setStartLocal(e.target.value)} />
            </FormControl>

            <FormControl w="220px">
              <FormLabel fontWeight="800">Duración (horas)</FormLabel>
              <NumberInput min={1} max={24} value={durationHours} onChange={(v) => setDurationHours(v)}>
                <NumberInputField />
              </NumberInput>
            </FormControl>

            <FormControl flex="1" minW="240px">
              <FormLabel fontWeight="800">Tipo de evento</FormLabel>
              <Select value={eventType} onChange={(e) => setEventType(e.target.value)}>
                {EVENT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </Select>
            </FormControl>
          </HStack>

          <HStack spacing={4} align="stretch" flexWrap="wrap">
            <FormControl flex="1" minW="320px">
              <FormLabel fontWeight="800">Dirección</FormLabel>
              <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Ej: Av. Providencia 1234, Santiago" />
            </FormControl>

            <FormControl w="260px">
              <FormLabel fontWeight="800">Presupuesto (CLP)</FormLabel>
              <Input
                value={budgetClpRaw}
                onChange={(e) => setBudgetClpRaw(e.target.value)}
                placeholder="Ej: 350000"
                inputMode="numeric"
              />
              <Text fontSize="sm" color="gray.500" mt={1}>
                Vista previa: <b>{formatClp(normalizeMoney(budgetClpRaw))}</b> CLP
              </Text>
            </FormControl>
          </HStack>

          <Divider />

          <Box>
            <Text fontWeight="900" mb={2}>
              Empresas invitadas (formato etiquetas)
            </Text>

            <HStack spacing={3} flexWrap="wrap" align="end">
              <FormControl flex="1" minW="260px">
                <FormLabel fontWeight="800">Razón social</FormLabel>
                <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Ej: Banco de Chile" />
              </FormControl>

              <FormControl w="140px">
                <FormLabel fontWeight="800">Invitados</FormLabel>
                <NumberInput min={0} max={9999} value={companyInvited} onChange={(v) => setCompanyInvited(v)}>
                  <NumberInputField />
                </NumberInput>
              </FormControl>

              <FormControl w="160px">
                <FormLabel fontWeight="800">Confirmados</FormLabel>
                <NumberInput min={0} max={9999} value={companyConfirmed} onChange={(v) => setCompanyConfirmed(v)}>
                  <NumberInputField />
                </NumberInput>
              </FormControl>

              <Button onClick={addCompany} variant="solid" colorScheme="blue" fontWeight="900">
                + Agregar
              </Button>
            </HStack>

            <HStack spacing={2} mt={3} wrap="wrap">
              {companies.map((c) => (
                <Tag key={c.name} size="lg" borderRadius="full" variant="subtle">
                  <TagLabel fontWeight="800">
                    {c.name} • {c.invited}/{c.confirmed}
                  </TagLabel>
                  <TagCloseButton onClick={() => removeCompany(c.name)} />
                </Tag>
              ))}
            </HStack>

            <Text fontSize="sm" color="gray.600" mt={2}>
              Totales: <b>{totals.invited}</b> invitados / <b>{totals.confirmed}</b> confirmados
            </Text>
          </Box>

          <FormControl>
            <FormLabel fontWeight="800">Comentario</FormLabel>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Objetivo, agenda, restricciones..." />
          </FormControl>

          <HStack justify="flex-end">
            <Button type="submit" bg="gray.900" color="white" _hover={{ bg: "gray.800" }} fontWeight="900">
              Guardar evento
            </Button>
          </HStack>
        </VStack>
      </Box>

      <Text fontSize="sm" color="gray.500" mt={3}>
        *Se guarda en tu navegador (localStorage). Chile y Perú quedan separados.
      </Text>
    </Box>
  );
}

/** Cerebro */
function BrainForm({ country, onCreate }) {
  const [title, setTitle] = useState("");
  const [startLocal, setStartLocal] = useState(() => toLocalDateTimeValue(new Date()));
  const [reason, setReason] = useState("");

  function submit(e) {
    e.preventDefault();
    const cleanTitle = title.trim();
    if (!cleanTitle) return alert("Falta nombre del evento externo.");

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
      <Text fontWeight="900" fontSize="lg" mb={3}>
        Cerebro (fechas no recomendables)
      </Text>

      <Box as="form" onSubmit={submit}>
        <VStack spacing={4} align="stretch">
          <FormControl>
            <FormLabel fontWeight="800">Nombre del evento externo</FormLabel>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ej: Feria, concierto, marcha..." />
          </FormControl>

          <FormControl>
            <FormLabel fontWeight="800">Fecha y hora</FormLabel>
            <Input type="datetime-local" value={startLocal} onChange={(e) => setStartLocal(e.target.value)} />
          </FormControl>

          <FormControl>
            <FormLabel fontWeight="800">Motivo</FormLabel>
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

/** Clima */
const WEATHER_TYPES = ["Lluvia", "Tormenta", "Nieve", "Viento", "Inundación", "Ola de calor"];

function WeatherForm({ country, onCreate }) {
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
      <Text fontWeight="900" fontSize="lg" mb={3}>
        Clima (bloqueos)
      </Text>

      <Box as="form" onSubmit={submit}>
        <VStack spacing={4} align="stretch">
          <FormControl>
            <FormLabel fontWeight="800">Fecha</FormLabel>
            <Input type="date" value={dateKey} onChange={(e) => setDateKey(e.target.value)} />
          </FormControl>

          <FormControl>
            <FormLabel fontWeight="800">Tipo</FormLabel>
            <Select value={weatherType} onChange={(e) => setWeatherType(e.target.value)}>
              {WEATHER_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </Select>
          </FormControl>

          <FormControl>
            <FormLabel fontWeight="800">Comentario</FormLabel>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Ej: alerta meteorológica, recomendación..." />
          </FormControl>

          <Button type="submit" bg="gray.900" color="white" _hover={{ bg: "gray.800" }} fontWeight="900">
            Guardar clima
          </Button>
        </VStack>
      </Box>
    </Box>
  );
}

/** Linkedyn */
const PUB_TYPES = ["Post", "Reel", "Carrusel", "Campaña"];

function LinkedInForm({ country, onCreate }) {
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
      <Text fontWeight="900" fontSize="lg" mb={3}>
        Linkedyn (campañas)
      </Text>

      <Box as="form" onSubmit={submit}>
        <VStack spacing={4} align="stretch">
          <FormControl>
            <FormLabel fontWeight="800">Tipo de publicación</FormLabel>
            <Select value={publicationType} onChange={(e) => setPublicationType(e.target.value)}>
              {PUB_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </Select>
          </FormControl>

          <FormControl>
            <FormLabel fontWeight="800">Link</FormLabel>
            <Input value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://..." />
          </FormControl>

          <HStack spacing={4} flexWrap="wrap">
            <FormControl minW="240px">
              <FormLabel fontWeight="800">Fecha inicio</FormLabel>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </FormControl>

            <FormControl minW="240px">
              <FormLabel fontWeight="800">Fecha fin</FormLabel>
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </FormControl>
          </HStack>

          <FormControl>
            <FormLabel fontWeight="800">Objetivo</FormLabel>
            <Textarea value={objective} onChange={(e) => setObjective(e.target.value)} placeholder="Ej: awareness, leads, tráfico..." />
          </FormControl>

          <Button type="submit" bg="gray.900" color="white" _hover={{ bg: "gray.800" }} fontWeight="900">
            Guardar campaña
          </Button>
        </VStack>
      </Box>
    </Box>
  );
}

/** =========================
 *  App principal
 *  ========================= */

export default function App() {
  const { state, country, actions, getDaySummary } = useCalendarStore();

  const [anchor, setAnchor] = useState(() => new Date());
  const [selectedDateKey, setSelectedDateKey] = useState(() => ymdFromDate(new Date()));

  const summary = useMemo(() => getDaySummary(selectedDateKey), [getDaySummary, selectedDateKey]);

  function goToday() {
    const t = new Date();
    setAnchor(new Date(t.getFullYear(), t.getMonth(), 1));
    setSelectedDateKey(ymdFromDate(t));
  }
  function prevMonth() {
    setAnchor((a) => addMonths(a, -1));
  }
  function nextMonth() {
    setAnchor((a) => addMonths(a, 1));
  }

  function onPickLogo(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => actions.setLogo(reader.result);
    reader.readAsDataURL(file);
  }

  function handleCreateCommercial(payload) {
    actions.addCommercial(payload);
    const dk = String(payload.startLocal).split("T")[0];
    setSelectedDateKey(dk);
    const d = new Date(dk + "T00:00");
    setAnchor(new Date(d.getFullYear(), d.getMonth(), 1));
  }

  function handleCreateBrain(payload) {
    actions.addBrain(payload);
    const dk = String(payload.startLocal).split("T")[0];
    setSelectedDateKey(dk);
    const d = new Date(dk + "T00:00");
    setAnchor(new Date(d.getFullYear(), d.getMonth(), 1));
  }

  function handleCreateWeather(payload) {
    actions.addWeather(payload);
    setSelectedDateKey(payload.dateKey);
    const d = new Date(payload.dateKey + "T00:00");
    setAnchor(new Date(d.getFullYear(), d.getMonth(), 1));
  }

  function handleCreateLinkedin(payload) {
    actions.addLinkedin(payload);
    setSelectedDateKey(payload.startDate);
    const d = new Date(payload.startDate + "T00:00");
    setAnchor(new Date(d.getFullYear(), d.getMonth(), 1));
  }

  return (
    <Box minH="100vh" bg="gray.50">
      {/* Barra superior */}
      <Box bg="white" borderBottomWidth="1px" borderColor="gray.200" position="sticky" top={0} zIndex={10}>
        <HStack px={6} py={3} spacing={4}>
          {/* Logo */}
          <HStack spacing={3}>
            <Box
              w="170px"
              h="56px"
              borderWidth="1px"
              borderColor="gray.200"
              borderRadius="lg"
              overflow="hidden"
              bg="gray.50"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              {state.ui.logoDataUrl ? (
                <Image src={state.ui.logoDataUrl} alt="logo" maxH="56px" objectFit="contain" />
              ) : (
                <Text fontWeight="900" color="gray.500">
                  LOGO
                </Text>
              )}
            </Box>

            <Button leftIcon={<AttachmentIcon />} variant="outline" fontWeight="800" size="sm" as="label" cursor="pointer">
              Subir logo (PNG)
              <Input type="file" accept="image/png" onChange={onPickLogo} display="none" />
            </Button>
          </HStack>

          <Spacer />

          {/* Título centrado */}
          <Box w="min(760px, 100%)">
            <Input
              value={state.ui.title}
              onChange={(e) => actions.setTitle(e.target.value)}
              textAlign="center"
              fontWeight="900"
              fontSize="lg"
              borderRadius="xl"
              bg="white"
            />
          </Box>

          <Spacer />

          {/* Selector país */}
          <ButtonGroup isAttached variant="outline">
            <Button
              onClick={() => actions.setCountry("CL")}
              fontWeight="900"
              bg={country === "CL" ? "blue.50" : "white"}
              borderColor={country === "CL" ? "blue.300" : "gray.200"}
            >
              Chile
            </Button>
            <Button
              onClick={() => actions.setCountry("PE")}
              fontWeight="900"
              bg={country === "PE" ? "blue.50" : "white"}
              borderColor={country === "PE" ? "blue.300" : "gray.200"}
            >
              Perú
            </Button>
          </ButtonGroup>
        </HStack>

        <Divider />

        {/* Tabs */}
        <Tabs variant="soft-rounded" colorScheme="blue">
          <TabList px={6} py={3} gap={2} flexWrap="wrap">
            <Tab fontWeight="900">Calendario</Tab>
            <Tab fontWeight="900">Nuevo Evento</Tab>
            <Tab fontWeight="900">Cerebro</Tab>
            <Tab fontWeight="900">Estadísticas</Tab>
            <Tab fontWeight="900">Clima</Tab>
            <Tab fontWeight="900">Linkedyn</Tab>
          </TabList>

          <TabPanels px={6} pb={6}>
            {/* Calendario */}
            <TabPanel p={0}>
              <VStack align="stretch" spacing={4}>
                <HStack align="start" spacing={4} flexWrap="wrap">
                  <Box flex="1" minW="720px">
                    <MonthView
                      anchor={anchor}
                      onPrev={prevMonth}
                      onNext={nextMonth}
                      onToday={goToday}
                      selectedDateKey={selectedDateKey}
                      onSelectDateKey={setSelectedDateKey}
                      getDaySummary={getDaySummary}
                    />
                  </Box>

                  <Box w="420px" minW="360px">
                    <DayDetails dateKey={selectedDateKey} summary={summary} />
                  </Box>
                </HStack>

                {/* Leyenda abajo (la afinamos después con colores/íconos exactos) */}
                <Box borderWidth="1px" borderColor="gray.200" bg="white" borderRadius="xl" p={4}>
                  <Text fontWeight="900" mb={2}>
                    Leyenda
                  </Text>
                  <Stack spacing={2}>
                    <HStack>
                      <Badge borderRadius="full" px={3} colorScheme="blue">
                        Eventos
                      </Badge>
                      <Text color="gray.600" fontSize="sm">
                        Se ven con ícono + contador dentro del día.
                      </Text>
                    </HStack>
                    <HStack>
                      <Badge borderRadius="full" px={3} colorScheme="red">
                        No sugerida
                      </Badge>
                      <Text color="gray.600" fontSize="sm">
                        Cerebro o Clima bloquean la fecha (oscuro).
                      </Text>
                    </HStack>
                    <HStack>
                      <Badge borderRadius="full" px={3} colorScheme="linkedin">
                        Linkedyn
                      </Badge>
                      <Text color="gray.600" fontSize="sm">
                        Marca rangos con fondo claro (cuando lo cargues).
                      </Text>
                    </HStack>
                  </Stack>
                </Box>
              </VStack>
            </TabPanel>

            {/* Nuevo Evento */}
            <TabPanel p={0}>
              <NewEventForm country={country} onCreate={handleCreateCommercial} />
            </TabPanel>

            {/* Cerebro */}
            <TabPanel p={0}>
              <BrainForm country={country} onCreate={handleCreateBrain} />
            </TabPanel>

            {/* Estadísticas (placeholder por ahora) */}
            <TabPanel p={0}>
              <Box borderWidth="1px" borderColor="gray.200" bg="white" borderRadius="xl" p={5}>
                <Text fontWeight="900" fontSize="lg">
                  Estadísticas
                </Text>
                <Text color="gray.600" mt={2}>
                  Próximo paso: totales por gerente (cantidad de eventos, presupuesto total, etc.).
                </Text>
              </Box>
            </TabPanel>

            {/* Clima */}
            <TabPanel p={0}>
              <WeatherForm country={country} onCreate={handleCreateWeather} />
            </TabPanel>

            {/* Linkedyn */}
            <TabPanel p={0}>
              <LinkedInForm country={country} onCreate={handleCreateLinkedin} />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </Box>
  );
}
