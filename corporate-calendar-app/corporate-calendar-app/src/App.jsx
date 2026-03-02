<div style={{padding: 10, background: "yellow", fontWeight: 900}}>
  VERSION NUEVA - PRUEBA
</div>
import React, { useMemo, useState } from "react";
import EventForm from "./components/EventForm";

const DAYS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const MONTHS = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];

// Helpers
function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}
function endOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}
function addMonths(date, delta) {
  return new Date(date.getFullYear(), date.getMonth() + delta, 1);
}
function sameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}
function yyyyMmDd(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
function toLocalDayKeyFromISO(isoString) {
  // Para agrupar por día local
  const d = new Date(isoString);
  return yyyyMmDd(new Date(d.getFullYear(), d.getMonth(), d.getDate()));
}

export default function App() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);

  // Eventos guardados (por ahora en memoria)
  const [events, setEvents] = useState([]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthTitle = `${MONTHS[month]} ${year}`;

  function nextMonth() {
    setCurrentDate(addMonths(currentDate, 1));
    setSelectedDay(null);
  }
  function prevMonth() {
    setCurrentDate(addMonths(currentDate, -1));
    setSelectedDay(null);
  }
  function goToday() {
    const now = new Date();
    setCurrentDate(new Date(now.getFullYear(), now.getMonth(), 1));
    setSelectedDay(new Date(now.getFullYear(), now.getMonth(), now.getDate()));
  }

  // Construcción de celdas del calendario (con días vacíos al inicio)
  const calendarCells = useMemo(() => {
    const first = startOfMonth(currentDate);
    const last = endOfMonth(currentDate);

    const firstDayOfWeek = first.getDay(); // 0=Dom..6=Sáb
    const daysInMonth = last.getDate();

    const cells = [];

    // Vacíos antes del 1
    for (let i = 0; i < firstDayOfWeek; i++) {
      cells.push({ type: "empty", key: `e-${i}` });
    }

    // Días del mes
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      cells.push({ type: "day", date, key: `d-${day}` });
    }

    return cells;
  }, [currentDate, year, month]);

  // Agrupar eventos por día (yyyy-mm-dd)
  const eventsByDay = useMemo(() => {
    const map = new Map();
    for (const ev of events) {
      const key = toLocalDayKeyFromISO(ev.fechaHoraISO);
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(ev);
    }
    return map;
  }, [events]);

  function handleSaveEvent(ev) {
    setEvents((prev) => [ev, ...prev]);

    // Seleccionar el día del evento automáticamente
    const d = new Date(ev.fechaHoraISO);
    const localDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    setCurrentDate(new Date(localDay.getFullYear(), localDay.getMonth(), 1));
    setSelectedDay(localDay);
  }

  const selectedKey = selectedDay ? yyyyMmDd(selectedDay) : null;
  const selectedEvents = selectedKey ? eventsByDay.get(selectedKey) || [] : [];

  return (
    <div style={page}>
      {/* HEADER */}
      <div style={header}>
        <div style={titleWrap}>
          <h1 style={title}>Calendario</h1>
          <div style={monthText}>{monthTitle}</div>
        </div>

        <div style={navButtons}>
          <button style={btn} onClick={prevMonth} title="Mes anterior">
            ◀
          </button>
          <button style={btnGhost} onClick={goToday}>
            Hoy
          </button>
          <button style={btn} onClick={nextMonth} title="Mes siguiente">
            ▶
          </button>
        </div>
      </div>

      {/* FORM (por ahora visible arriba; luego lo movemos a pestaña 1) */}
      <div style={panel}>
        <EventForm onSave={handleSaveEvent} />
      </div>

      {/* CALENDARIO */}
      <div style={calendarWrap}>
        <div style={dowRow}>
          {DAYS.map((d) => (
            <div key={d} style={dowCell}>
              {d}
            </div>
          ))}
        </div>

        <div style={grid}>
          {calendarCells.map((c) => {
            if (c.type === "empty") {
              return <div key={c.key} style={cellEmpty} />;
            }

            const dayKey = yyyyMmDd(c.date);
            const dayEvents = eventsByDay.get(dayKey) || [];
            const isSelected = selectedDay && sameDay(c.date, selectedDay);

            return (
              <div
                key={c.key}
                style={{
                  ...cell,
                  ...(isSelected ? cellSelected : {}),
                }}
                onClick={() => setSelectedDay(c.date)}
              >
                <div style={cellTop}>
                  <div style={dayNumber}>{c.date.getDate()}</div>
                </div>

                {/* Mini lista de eventos en la celda */}
                <div style={cellEvents}>
                  {dayEvents.slice(0, 2).map((ev) => (
                    <div key={ev.id} style={eventPill} title={ev.nombreEvento}>
                      {ev.nombreEvento}
                    </div>
                  ))}
                  {dayEvents.length > 2 && (
                    <div style={moreText}>+{dayEvents.length - 2} más</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* PANEL INFERIOR: Detalle del día seleccionado */}
      <div style={bottomPanel}>
        <div style={bottomHeader}>
          <div style={bottomTitle}>
            {selectedDay
              ? `Día ${selectedDay.getDate()} (${MONTHS[selectedDay.getMonth()]} ${selectedDay.getFullYear()})`
              : "Selecciona un día"}
          </div>
          <div style={bottomHint}>
            Aquí veremos comentarios, colores y detalle (lo siguiente que haremos).
          </div>
        </div>

        {!selectedDay && (
          <div style={emptyState}>
            Haz click en una fecha para ver su detalle.
          </div>
        )}

        {selectedDay && selectedEvents.length === 0 && (
          <div style={emptyState}>
            No hay eventos guardados para este día.
          </div>
        )}

        {selectedDay && selectedEvents.length > 0 && (
          <div style={detailList}>
            {selectedEvents.map((ev) => {
              const d = new Date(ev.fechaHoraISO);
              const hh = String(d.getHours()).padStart(2, "0");
              const mm = String(d.getMinutes()).padStart(2, "0");

              return (
                <div key={ev.id} style={detailCard}>
                  <div style={detailRowTop}>
                    <div style={detailName}>{ev.nombreEvento}</div>
                    <div style={detailType}>{ev.tipoEvento}</div>
                  </div>

                  <div style={detailRow}>
                    <div style={detailLabel}>Organiza:</div>
                    <div style={detailValue}>{ev.gerenteLabel}</div>
                  </div>

                  <div style={detailRow}>
                    <div style={detailLabel}>Hora:</div>
                    <div style={detailValue}>
                      {hh}:{mm} ({ev.duracionHoras}h)
                    </div>
                  </div>

                  <div style={detailRow}>
                    <div style={detailLabel}>Dirección:</div>
                    <div style={detailValue}>{ev.direccion || "—"}</div>
                  </div>

                  <div style={detailRow}>
                    <div style={detailLabel}>Presupuesto:</div>
                    <div style={detailValue}>
                      {ev.presupuestoCLP
                        ? `$ ${Number(ev.presupuestoCLP).toLocaleString("es-CL")}`
                        : "—"}
                    </div>
                  </div>

                  {ev.invitadosPorRazonSocial?.length > 0 && (
                    <div style={{ marginTop: 10 }}>
                      <div style={{ fontWeight: 800, marginBottom: 6 }}>
                        Invitados por razón social
                      </div>
                      <div style={rsGrid}>
                        {ev.invitadosPorRazonSocial.map((r) => (
                          <div key={r.id} style={rsCard}>
                            <div style={{ fontWeight: 800 }}>{r.razonSocial}</div>
                            <div style={{ fontSize: 12, opacity: 0.75 }}>
                              Invitados: {r.invitados} · Confirmados: {r.confirmados}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

/* ====== ESTILOS ====== */
const page = {
  minHeight: "100vh",
  background: "#f4f6f9",
  padding: 18,
  boxSizing: "border-box",
  fontFamily: "Arial, sans-serif",
};

const header = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
  background: "#fff",
  border: "1px solid #e6e9f0",
  borderRadius: 16,
  padding: "14px 16px",
};

const titleWrap = { display: "flex", flexDirection: "column", gap: 6 };

const title = { margin: 0, fontSize: 20 };

const monthText = {
  fontSize: 14,
  opacity: 0.75,
  textTransform: "capitalize",
};

const navButtons = { display: "flex", gap: 8, alignItems: "center" };

const btn = {
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid #0f172a",
  background: "#0f172a",
  color: "white",
  fontWeight: 800,
  cursor: "pointer",
};

const btnGhost = {
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid #d9dde6",
  background: "white",
  color: "#0f172a",
  fontWeight: 800,
  cursor: "pointer",
};

const panel = {
  marginTop: 14,
  background: "#fff",
  border: "1px solid #e6e9f0",
  borderRadius: 16,
  padding: 10,
};

const calendarWrap = {
  marginTop: 14,
  background: "#fff",
  border: "1px solid #e6e9f0",
  borderRadius: 16,
  padding: 12,
};

const dowRow = {
  display: "grid",
  gridTemplateColumns: "repeat(7, 1fr)",
  gap: 10,
  marginBottom: 10,
};

const dowCell = {
  fontSize: 12,
  fontWeight: 800,
  opacity: 0.7,
  padding: "6px 8px",
};

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(7, 1fr)",
  gap: 10,
};

const cellEmpty = {
  minHeight: 120,
  borderRadius: 12,
  background: "transparent",
};

const cell = {
  minHeight: 120,
  borderRadius: 12,
  border: "1px solid #e6e9f0",
  background: "#fff",
  padding: 10,
  cursor: "pointer",
  boxSizing: "border-box",
  display: "flex",
  flexDirection: "column",
};

const cellSelected = {
  outline: "2px solid #1d4ed8",
  background: "#eef4ff",
};

const cellTop = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: 8,
};

const dayNumber = { fontWeight: 900 };

const cellEvents = {
  display: "flex",
  flexDirection: "column",
  gap: 6,
  overflow: "hidden",
};

const eventPill = {
  fontSize: 12,
  padding: "6px 8px",
  borderRadius: 10,
  background: "#fef3c7",
  border: "1px solid #fde68a",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
};

const moreText = { fontSize: 12, opacity: 0.7 };

const bottomPanel = {
  marginTop: 14,
  background: "#fff",
  border: "1px solid #e6e9f0",
  borderRadius: 16,
  padding: 14,
};

const bottomHeader = { marginBottom: 10 };

const bottomTitle = { fontSize: 16, fontWeight: 900, textTransform: "capitalize" };

const bottomHint = { fontSize: 12, opacity: 0.7, marginTop: 6 };

const emptyState = {
  padding: 14,
  borderRadius: 12,
  background: "#f8fafc",
  border: "1px solid #e6e9f0",
  opacity: 0.85,
};

const detailList = { display: "grid", gap: 12 };

const detailCard = {
  borderRadius: 14,
  border: "1px solid #e6e9f0",
  padding: 12,
  background: "#fff",
};

const detailRowTop = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 10,
  marginBottom: 10,
};

const detailName = { fontSize: 15, fontWeight: 900 };

const detailType = {
  fontSize: 12,
  padding: "6px 10px",
  borderRadius: 999,
  background: "#eef2ff",
  border: "1px solid #c7d2fe",
  whiteSpace: "nowrap",
};

const detailRow = {
  display: "grid",
  gridTemplateColumns: "120px 1fr",
  gap: 10,
  padding: "4px 0",
};

const detailLabel = { fontSize: 12, opacity: 0.75, fontWeight: 800 };

const detailValue = { fontSize: 13 };

const rsGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: 10,
};

const rsCard = {
  borderRadius: 12,
  border: "1px solid #eef2f7",
  background: "#f8fafc",
  padding: 10,
};
