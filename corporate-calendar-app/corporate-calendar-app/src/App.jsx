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

function pad2(n) {
  return String(n).padStart(2, "0");
}

function ymd(date) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function daysInMonth(date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

export default function App() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(ymd(new Date()));

  // Eventos guardados (por ahora en memoria)
  const [events, setEvents] = useState([]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = startOfMonth(currentDate);
  const firstWeekday = firstDay.getDay(); // 0-6
  const totalDays = daysInMonth(currentDate);

  const monthTitle = `${MONTHS[month]} ${year}`;

  function prevMonth() {
    setCurrentDate(new Date(year, month - 1, 1));
  }
  function nextMonth() {
    setCurrentDate(new Date(year, month + 1, 1));
  }
  function goToday() {
    const now = new Date();
    setCurrentDate(new Date(now.getFullYear(), now.getMonth(), 1));
    setSelectedDay(ymd(now));
  }

  const gridCells = useMemo(() => {
    const cells = [];
    // espacios antes
    for (let i = 0; i < firstWeekday; i++) cells.push(null);
    // días del mes
    for (let d = 1; d <= totalDays; d++) {
      cells.push(new Date(year, month, d));
    }
    // relleno para terminar semana completa
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [firstWeekday, totalDays, year, month]);

  const selectedEvents = useMemo(() => {
    return events.filter((e) => e.dateKey === selectedDay);
  }, [events, selectedDay]);

  function handleCreateEvent(payload) {
    // dateKey = día (YYYY-MM-DD) para pintarlo en calendario
    const dateKey = payload.fechaHora ? payload.fechaHora.slice(0, 10) : selectedDay;

    setEvents((prev) => [
      ...prev,
      {
        id: crypto.randomUUID?.() || String(Date.now()),
        dateKey,
        ...payload,
      },
    ]);

    alert("Evento guardado ✅ (por ahora queda en memoria del navegador)");
  }

  // Helpers para mini “marcadores” en el calendario
  function markersForDay(dateKey) {
    const items = events.filter((e) => e.dateKey === dateKey);
    if (items.length === 0) return null;

    // Por ahora: solo mostrará “barras” (después pondremos colores por tipo / estados)
    return (
      <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 6 }}>
        {items.slice(0, 3).map((e) => (
          <span
            key={e.id}
            title={e.nombreEvento}
            style={{
              display: "inline-block",
              height: 6,
              width: 22,
              borderRadius: 99,
              background: "#F4B400",
            }}
          />
        ))}
        {items.length > 3 && (
          <span style={{ fontSize: 12, color: "#555" }}>+{items.length - 3}</span>
        )}
      </div>
    );
  }

  return (
    <div style={styles.page}>
      {/* Header simple (después metemos logo PNG y tabs) */}
      <div style={styles.header}>
        <div style={styles.brandLeft}>
          <div style={styles.logoBox}>Logo</div>
          <div style={{ fontWeight: 900 }}>Calendario Entel Connect</div>
        </div>

        <div style={styles.monthNav}>
          <button style={styles.navBtn} onClick={prevMonth} title="Mes anterior">
            ←
          </button>
          <div style={styles.monthTitle}>{monthTitle}</div>
          <button style={styles.navBtn} onClick={nextMonth} title="Mes siguiente">
            →
          </button>
          <button style={styles.todayBtn} onClick={goToday}>
            Hoy
          </button>
        </div>
      </div>

      <div style={styles.mainGrid}>
        {/* Calendario */}
        <div style={styles.calendarCard}>
          <div style={styles.weekHeader}>
            {DAYS.map((d) => (
              <div key={d} style={styles.weekDay}>
                {d}
              </div>
            ))}
          </div>

          <div style={styles.monthGrid}>
            {gridCells.map((dateObj, idx) => {
              if (!dateObj) return <div key={idx} style={styles.dayCellEmpty} />;

              const key = ymd(dateObj);
              const isSelected = key === selectedDay;

              return (
                <button
                  key={key}
                  onClick={() => setSelectedDay(key)}
                  style={{
                    ...styles.dayCell,
                    ...(isSelected ? styles.dayCellSelected : {}),
                  }}
                >
                  <div style={styles.dayNumber}>{dateObj.getDate()}</div>
                  {markersForDay(key)}
                </button>
              );
            })}
          </div>
        </div>

        {/* Panel derecho: Formulario */}
        <div style={styles.side}>
          <EventForm onCreate={handleCreateEvent} />
        </div>
      </div>

      {/* Panel inferior: detalle del día seleccionado */}
      <div style={styles.detailCard}>
        <div style={styles.detailHeader}>
          <div style={{ fontSize: 18, fontWeight: 900 }}>
            Detalle del día: {selectedDay}
          </div>
          <div style={{ color: "#666" }}>
            Aquí después vamos a mostrar comentarios, colores y bloqueos.
          </div>
        </div>

        {selectedEvents.length === 0 ? (
          <div style={{ padding: 14, color: "#555" }}>
            No hay eventos guardados para este día.
          </div>
        ) : (
          <div style={{ padding: 14, display: "grid", gap: 10 }}>
            {selectedEvents.map((e) => (
              <div key={e.id} style={styles.eventRow}>
                <div style={{ fontWeight: 900 }}>{e.nombreEvento}</div>
                <div style={{ color: "#555" }}>
                  <b>Tipo:</b> {e.tipoEvento} &nbsp;|&nbsp; <b>Hora:</b>{" "}
                  {e.fechaHora ? e.fechaHora.replace("T", " ") : "-"} &nbsp;|&nbsp;{" "}
                  <b>Duración:</b> {e.duracionHoras}h
                </div>
                {e.direccion && (
                  <div style={{ color: "#555" }}>
                    <b>Dirección:</b> {e.direccion}
                  </div>
                )}
                {Array.isArray(e.invitadosPorEmpresa) && e.invitadosPorEmpresa.length > 0 && (
                  <div style={{ color: "#555" }}>
                    <b>Empresas:</b>{" "}
                    {e.invitadosPorEmpresa
                      .map(
                        (x) =>
                          `${x.razonSocial} (Inv: ${x.invitados}, Conf: ${x.confirmados})`
                      )
                      .join(" · ")}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f5f6f8",
    padding: 18,
    fontFamily: "Arial, sans-serif",
    boxSizing: "border-box",
  },
  header: {
    background: "#fff",
    border: "1px solid #e6e6e6",
    borderRadius: 14,
    padding: "14px 16px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  brandLeft: { display: "flex", alignItems: "center", gap: 12 },
  logoBox: {
    width: 52,
    height: 34,
    borderRadius: 10,
    border: "1px dashed #cfcfcf",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#777",
    fontWeight: 800,
    fontSize: 12,
  },
  monthNav: { display: "flex", alignItems: "center", gap: 10 },
  monthTitle: { fontSize: 18, fontWeight: 900, textTransform: "capitalize" },
  navBtn: {
    height: 36,
    width: 44,
    borderRadius: 10,
    border: "1px solid #ddd",
    background: "#fff",
    cursor: "pointer",
    fontWeight: 900,
  },
  todayBtn: {
    height: 36,
    padding: "0 12px",
    borderRadius: 10,
    border: "1px solid #111",
    background: "#111",
    color: "#fff",
    cursor: "pointer",
    fontWeight: 900,
  },
  mainGrid: {
    display: "grid",
    gridTemplateColumns: "1.6fr 1fr",
    gap: 14,
    marginTop: 14,
    alignItems: "start",
  },
  calendarCard: {
    background: "#fff",
    border: "1px solid #e6e6e6",
    borderRadius: 14,
    padding: 14,
  },
  weekHeader: {
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)",
    gap: 10,
    marginBottom: 10,
  },
  weekDay: {
    textAlign: "center",
    fontWeight: 900,
    color: "#333",
    padding: "8px 0",
    borderRadius: 10,
    background: "#f3f4f6",
  },
  monthGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)",
    gap: 10,
  },
  dayCellEmpty: {
    height: 110,
    borderRadius: 12,
    background: "transparent",
  },
  dayCell: {
    height: 110,
    borderRadius: 12,
    border: "1px solid #e8e8e8",
    background: "#fff",
    cursor: "pointer",
    padding: 10,
    textAlign: "left",
    boxShadow: "0 1px 0 rgba(0,0,0,0.02)",
  },
  dayCellSelected: {
    border: "2px solid #4c8bf5",
    background: "#eef5ff",
  },
  dayNumber: { fontWeight: 900, fontSize: 14, color: "#111" },
  side: { display: "grid", gap: 14 },
  detailCard: {
    marginTop: 14,
    background: "#fff",
    border: "1px solid #e6e6e6",
    borderRadius: 14,
    overflow: "hidden",
  },
  detailHeader: {
    padding: 14,
    borderBottom: "1px solid #eee",
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  eventRow: {
    border: "1px solid #eee",
    borderRadius: 12,
    padding: 12,
    background: "#fafafa",
    display: "grid",
    gap: 6,
  },
};
