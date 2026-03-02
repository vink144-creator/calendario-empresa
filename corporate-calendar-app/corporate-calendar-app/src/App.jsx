import React, { useMemo, useState } from "react";
import EventForm from "./components/EventForm";

const DAYS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const MONTHS = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

const EVENT_TYPE_COLORS = {
  "Reunión de prospección (primera reunión)": { bg: "#E8F0FE", border: "#4C8BF5" },
  "Reunión de descubrimiento de necesidades": { bg: "#E6F4EA", border: "#34A853" },
  "Workshop": { bg: "#FEF7E0", border: "#F9AB00" },
  "Presentación de propuesta Tecnica": { bg: "#FCE8E6", border: "#EA4335" },
  "Reunión de negociación / cierre": { bg: "#F3E8FF", border: "#A142F4" },
  "Presentación de propuesta Economica": { bg: "#E0F2FE", border: "#0284C7" },
  "Desayuno": { bg: "#FFF7ED", border: "#F97316" },
  "Almuerzo": { bg: "#ECFDF5", border: "#10B981" },
  "Cena": { bg: "#FDF2F8", border: "#DB2777" },
  "Evento Anual con Pathers": { bg: "#EEF2FF", border: "#6366F1" },
  "Evento Networking": { bg: "#F1F5F9", border: "#334155" },
  "Lanzamiento de nuevo Producto": { bg: "#FAFAFA", border: "#111827" },
};

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function endOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

function sameDay(a, b) {
  return (
    a?.getFullYear() === b?.getFullYear() &&
    a?.getMonth() === b?.getMonth() &&
    a?.getDate() === b?.getDate()
  );
}

function ymd(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export default function App() {
  // Tabs: "calendario" | "crear" | "externos" | "invitados" | "stats" | "linkedin"
  const [tab, setTab] = useState("calendario");

  const [title, setTitle] = useState("Calendario de Eventos Entel Connect");
  const [logoDataUrl, setLogoDataUrl] = useState(null);

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(new Date());

  // Eventos internos (los que creas en "Crear Evento")
  const [events, setEvents] = useState(() => {
    // ejemplo inicial (puedes borrar si quieres)
    const today = new Date();
    return [
      {
        id: crypto.randomUUID(),
        name: "Reunión con cliente",
        manager: "VS - Vinklaguer Sanchez",
        startDateTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 10, 0).toISOString(),
        durationHours: 1,
        type: "Reunión de prospección (primera reunión)",
        budgetClp: 0,
        address: "Oficina",
        companies: [{ name: "Empresa X", invited: 3, confirmed: 1 }],
        notes: "Primer contacto / agenda de discovery",
      },
    ];
  });

  // Eventos externos (bloquean sugerencias de fecha)
  const [externalBlocks, setExternalBlocks] = useState(() => {
    const d = new Date();
    return [
      { id: crypto.randomUUID(), date: ymd(new Date(d.getFullYear(), d.getMonth(), d.getDate() + 3)), label: "Concierto masivo" },
    ];
  });

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);

  const monthLabel = `${MONTHS[currentDate.getMonth()]} ${currentDate.getFullYear()}`;

  // Armar grilla (incluye espacios antes del día 1)
  const calendarCells = useMemo(() => {
    const firstDayWeekIndex = monthStart.getDay(); // 0=Dom..6=Sáb
    const daysInMonth = monthEnd.getDate();

    const cells = [];
    for (let i = 0; i < firstDayWeekIndex; i++) {
      cells.push(null);
    }
    for (let day = 1; day <= daysInMonth; day++) {
      cells.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), day));
    }
    // rellenar hasta múltiplo de 7
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [currentDate, monthStart, monthEnd]);

  const eventsByDay = useMemo(() => {
    const map = new Map();
    for (const ev of events) {
      const d = new Date(ev.startDateTime);
      const key = ymd(new Date(d.getFullYear(), d.getMonth(), d.getDate()));
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(ev);
    }
    return map;
  }, [events]);

  const blocksByDay = useMemo(() => {
    const map = new Map();
    for (const b of externalBlocks) {
      if (!map.has(b.date)) map.set(b.date, []);
      map.get(b.date).push(b);
    }
    return map;
  }, [externalBlocks]);

  function prevMonth() {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  }
  function nextMonth() {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  }
  function goToday() {
    const t = new Date();
    setCurrentDate(new Date(t.getFullYear(), t.getMonth(), 1));
    setSelectedDay(t);
  }

  function onPickLogo(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setLogoDataUrl(reader.result);
    reader.readAsDataURL(file);
  }

  function addEvent(newEvent) {
    setEvents((prev) => [{ ...newEvent, id: crypto.randomUUID() }, ...prev]);
    // mover a calendario y seleccionar el día del evento
    const d = new Date(newEvent.startDateTime);
    setSelectedDay(d);
    setCurrentDate(new Date(d.getFullYear(), d.getMonth(), 1));
    setTab("calendario");
  }

  const selectedKey = selectedDay ? ymd(selectedDay) : null;
  const selectedInternalEvents = selectedKey ? (eventsByDay.get(selectedKey) || []) : [];
  const selectedExternal = selectedKey ? (blocksByDay.get(selectedKey) || []) : [];

  const tabButton = (key, label) => (
    <button
      key={key}
      onClick={() => setTab(key)}
      style={{
        padding: "10px 14px",
        borderRadius: 10,
        border: tab === key ? "1px solid #111827" : "1px solid #E5E7EB",
        background: tab === key ? "#111827" : "#FFFFFF",
        color: tab === key ? "#FFFFFF" : "#111827",
        cursor: "pointer",
        fontWeight: 600,
      }}
    >
      {label}
    </button>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#F8FAFC" }}>
      {/* TOP BAR */}
      <div
        style={{
          background: "#FFFFFF",
          borderBottom: "1px solid #E5E7EB",
          padding: "14px 18px",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <div style={{ display: "grid", gridTemplateColumns: "280px 1fr 280px", gap: 12, alignItems: "center" }}>
          {/* Left: Logo uploader */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <label
              style={{
                width: 54,
                height: 54,
                borderRadius: 14,
                border: "1px dashed #CBD5E1",
                display: "grid",
                placeItems: "center",
                overflow: "hidden",
                background: "#F8FAFC",
                cursor: "pointer",
              }}
              title="Subir logo PNG"
            >
              {logoDataUrl ? (
                <img src={logoDataUrl} alt="logo" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
              ) : (
                <span style={{ fontSize: 12, color: "#64748B", fontWeight: 700 }}>LOGO</span>
              )}
              <input type="file" accept="image/png" onChange={onPickLogo} style={{ display: "none" }} />
            </label>

            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <div style={{ fontSize: 12, color: "#64748B" }}>PNG</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#0F172A" }}>Subir logo</div>
            </div>
          </div>

          {/* Center: Title */}
          <div style={{ display: "flex", justifyContent: "center" }}>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{
                width: "min(820px, 100%)",
                border: "1px solid #E5E7EB",
                borderRadius: 14,
                padding: "12px 14px",
                fontSize: 16,
                fontWeight: 700,
                color: "#0F172A",
                background: "#FFFFFF",
                textAlign: "center",
              }}
            />
          </div>

          {/* Right: Actions */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
            <button
              onClick={goToday}
              style={{
                padding: "10px 12px",
                borderRadius: 12,
                border: "1px solid #E5E7EB",
                background: "#FFFFFF",
                cursor: "pointer",
                fontWeight: 700,
              }}
            >
              Hoy
            </button>
            <button
              onClick={() => setTab("crear")}
              style={{
                padding: "10px 12px",
                borderRadius: 12,
                border: "1px solid #111827",
                background: "#111827",
                color: "#FFFFFF",
                cursor: "pointer",
                fontWeight: 800,
              }}
            >
              + Crear Evento
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
          {tabButton("calendario", "Calendario")}
          {tabButton("crear", "Crear Evento")}
          {tabButton("externos", "Eventos Externos")}
          {tabButton("invitados", "Invitados")}
          {tabButton("stats", "Estadísticas")}
          {tabButton("linkedin", "LinkedIn")}
        </div>
      </div>

      {/* CONTENT */}
      <div style={{ padding: 18 }}>
        {tab === "crear" && (
          <EventForm onCreate={addEvent} />
        )}

        {tab !== "crear" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 14 }}>
            {/* Calendar Header with month + arrows */}
            <div
              style={{
                background: "#FFFFFF",
                border: "1px solid #E5E7EB",
                borderRadius: 16,
                padding: 14,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <div style={{ fontSize: 22, fontWeight: 900, color: "#0F172A", textTransform: "capitalize" }}>
                  {monthLabel}
                </div>
                <div style={{ fontSize: 13, color: "#64748B" }}>
                  Haz click en una fecha para ver detalles abajo.
                </div>
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <button
                  onClick={prevMonth}
                  style={{
                    padding: "10px 12px",
                    borderRadius: 12,
                    border: "1px solid #E5E7EB",
                    background: "#FFFFFF",
                    cursor: "pointer",
                    fontWeight: 900,
                  }}
                  aria-label="Mes anterior"
                >
                  ←
                </button>
                <button
                  onClick={goToday}
                  style={{
                    padding: "10px 14px",
                    borderRadius: 12,
                    border: "1px solid #E5E7EB",
                    background: "#FFFFFF",
                    cursor: "pointer",
                    fontWeight: 800,
                  }}
                >
                  Hoy
                </button>
                <button
                  onClick={nextMonth}
                  style={{
                    padding: "10px 12px",
                    borderRadius: 12,
                    border: "1px solid #E5E7EB",
                    background: "#FFFFFF",
                    cursor: "pointer",
                    fontWeight: 900,
                  }}
                  aria-label="Mes siguiente"
                >
                  →
                </button>
              </div>
            </div>

            {/* Calendar Grid (full width) */}
            <div
              style={{
                background: "#FFFFFF",
                border: "1px solid #E5E7EB",
                borderRadius: 16,
                padding: 14,
              }}
            >
              {/* week day header */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 10, marginBottom: 10 }}>
                {DAYS.map((d) => (
                  <div key={d} style={{ fontSize: 12, fontWeight: 900, color: "#64748B", textAlign: "left" }}>
                    {d}
                  </div>
                ))}
              </div>

              {/* cells */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 10 }}>
                {calendarCells.map((cellDate, idx) => {
                  if (!cellDate) {
                    return <div key={idx} style={{ height: 118 }} />;
                  }
                  const key = ymd(cellDate);
                  const isSelected = selectedDay && sameDay(cellDate, selectedDay);
                  const internal = eventsByDay.get(key) || [];
                  const external = blocksByDay.get(key) || [];

                  return (
                    <button
                      key={key}
                      onClick={() => setSelectedDay(cellDate)}
                      style={{
                        height: 118,
                        borderRadius: 12,
                        border: isSelected ? "2px solid #111827" : "1px solid #E5E7EB",
                        background: isSelected ? "#EEF2FF" : "#FFFFFF",
                        cursor: "pointer",
                        textAlign: "left",
                        padding: 10,
                        position: "relative",
                        overflow: "hidden",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ fontSize: 14, fontWeight: 900, color: "#0F172A" }}>{cellDate.getDate()}</div>

                        {/* badge bloqueo externo */}
                        {external.length > 0 && (
                          <span
                            title="Hay eventos externos / fecha no sugerida"
                            style={{
                              fontSize: 11,
                              fontWeight: 900,
                              padding: "4px 8px",
                              borderRadius: 999,
                              border: "1px solid #EF4444",
                              background: "#FEE2E2",
                              color: "#991B1B",
                            }}
                          >
                            No sugerida
                          </span>
                        )}
                      </div>

                      {/* mini lista de eventos */}
                      <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 6 }}>
                        {internal.slice(0, 2).map((ev) => {
                          const c = EVENT_TYPE_COLORS[ev.type] || { bg: "#F1F5F9", border: "#94A3B8" };
                          return (
                            <div
                              key={ev.id}
                              style={{
                                fontSize: 12,
                                fontWeight: 800,
                                padding: "6px 8px",
                                borderRadius: 10,
                                border: `1px solid ${c.border}`,
                                background: c.bg,
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                              title={`${ev.type}: ${ev.name}`}
                            >
                              {ev.name}
                            </div>
                          );
                        })}
                        {(internal.length > 2) && (
                          <div style={{ fontSize: 12, color: "#64748B", fontWeight: 800 }}>
                            +{internal.length - 2} más
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bottom details panel */}
            <div
              style={{
                background: "#FFFFFF",
                border: "1px solid #E5E7EB",
                borderRadius: 16,
                padding: 14,
              }}
            >
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12 }}>
                <div style={{ fontSize: 16, fontWeight: 900, color: "#0F172A" }}>
                  {selectedDay ? `Detalle del ${selectedKey}` : "Selecciona un día"}
                </div>

                {/* “leyenda” placeholder para colores/comentarios */}
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {[
                    { label: "Reuniones", color: "#4C8BF5" },
                    { label: "Workshops", color: "#F9AB00" },
                    { label: "Cierres", color: "#A142F4" },
                    { label: "No sugerida", color: "#EF4444" },
                  ].map((it) => (
                    <span
                      key={it.label}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 8,
                        padding: "6px 10px",
                        borderRadius: 999,
                        border: "1px solid #E5E7EB",
                        fontSize: 12,
                        fontWeight: 800,
                        color: "#0F172A",
                      }}
                    >
                      <span style={{ width: 10, height: 10, borderRadius: 999, background: it.color }} />
                      {it.label}
                    </span>
                  ))}
                </div>
              </div>

              <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {/* Internos */}
                <div style={{ border: "1px solid #E5E7EB", borderRadius: 14, padding: 12 }}>
                  <div style={{ fontWeight: 900, marginBottom: 10 }}>Eventos Entel Connect</div>
                  {selectedInternalEvents.length === 0 ? (
                    <div style={{ color: "#64748B", fontWeight: 700 }}>
                      Aquí aparecerán los eventos, reuniones o workshops.
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {selectedInternalEvents.map((ev) => {
                        const c = EVENT_TYPE_COLORS[ev.type] || { bg: "#F1F5F9", border: "#94A3B8" };
                        return (
                          <div
                            key={ev.id}
                            style={{
                              borderRadius: 14,
                              border: `1px solid ${c.border}`,
                              background: c.bg,
                              padding: 12,
                            }}
                          >
                            <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                              <div style={{ fontWeight: 900 }}>{ev.name}</div>
                              <div style={{ fontWeight: 900, color: "#334155" }}>{ev.durationHours}h</div>
                            </div>
                            <div style={{ marginTop: 6, color: "#334155", fontWeight: 700, fontSize: 13 }}>
                              <div><b>Tipo:</b> {ev.type}</div>
                              <div><b>Gerente:</b> {ev.manager}</div>
                              <div><b>Dirección:</b> {ev.address}</div>
                              <div><b>Presupuesto:</b> {Number(ev.budgetClp || 0).toLocaleString("es-CL")} CLP</div>
                            </div>

                            {ev.notes ? (
                              <div style={{ marginTop: 8, color: "#0F172A", fontWeight: 700, fontSize: 13 }}>
                                <b>Comentario:</b> {ev.notes}
                              </div>
                            ) : null}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Externos */}
                <div style={{ border: "1px solid #E5E7EB", borderRadius: 14, padding: 12 }}>
                  <div style={{ fontWeight: 900, marginBottom: 10 }}>Eventos Externos / Bloqueos</div>
                  {selectedExternal.length === 0 ? (
                    <div style={{ color: "#64748B", fontWeight: 700 }}>
                      No hay bloqueos para este día.
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {selectedExternal.map((b) => (
                        <div
                          key={b.id}
                          style={{
                            borderRadius: 14,
                            border: "1px solid #EF4444",
                            background: "#FEE2E2",
                            padding: 12,
                            fontWeight: 900,
                            color: "#991B1B",
                          }}
                        >
                          {b.label}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* placeholders para pestañas futuras */}
              {tab !== "calendario" && (
                <div style={{ marginTop: 12, color: "#64748B", fontWeight: 700 }}>
                  Esta pestaña todavía está en modo base. Luego la conectamos con formularios y reglas.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Solo placeholders para el resto de tabs (por ahora) */}
        {tab === "externos" && (
          <div style={{ marginTop: 14, background: "#FFFFFF", border: "1px solid #E5E7EB", borderRadius: 16, padding: 14 }}>
            <div style={{ fontWeight: 900, marginBottom: 8 }}>Eventos Externos</div>
            <div style={{ color: "#64748B", fontWeight: 700 }}>
              Próximo paso: formulario para marcar fechas “No sugeridas” (conciertos, ferias, etc.).
            </div>
          </div>
        )}

        {tab === "invitados" && (
          <div style={{ marginTop: 14, background: "#FFFFFF", border: "1px solid #E5E7EB", borderRadius: 16, padding: 14 }}>
            <div style={{ fontWeight: 900, marginBottom: 8 }}>Administrador de Invitados</div>
            <div style={{ color: "#64748B", fontWeight: 700 }}>
              Próximo paso: tablero por empresa / confirmados / pendientes.
            </div>
          </div>
        )}

        {tab === "stats" && (
          <div style={{ marginTop: 14, background: "#FFFFFF", border: "1px solid #E5E7EB", borderRadius: 16, padding: 14 }}>
            <div style={{ fontWeight: 900, marginBottom: 8 }}>Estadísticas</div>
            <div style={{ color: "#64748B", fontWeight: 700 }}>
              Próximo paso: métricas anual (eventos, éxito, conversión, costo, etc.).
            </div>
          </div>
        )}

        {tab === "linkedin" && (
          <div style={{ marginTop: 14, background: "#FFFFFF", border: "1px solid #E5E7EB", borderRadius: 16, padding: 14 }}>
            <div style={{ fontWeight: 900, marginBottom: 8 }}>LinkedIn</div>
            <div style={{ color: "#64748B", fontWeight: 700 }}>
              Próximo paso: cargar campañas + fechas (calendario editorial).
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
