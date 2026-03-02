import React, { useMemo, useState } from "react";

const EVENT_TYPES = [
  "Reunión de prospección (primera reunión)",
  "Reunión de descubrimiento de necesidades",
  "Workshop",
  "Presentación de propuesta Técnica",
  "Reunión de negociación / cierre",
  "Presentación de propuesta Económica",
  "Desayuno",
  "Almuerzo",
  "Cena",
  "Evento Anual con Partners",
  "Evento Networking",
  "Lanzamiento de nuevo Producto",
];

function formatCLP(value) {
  if (value === "" || value === null || value === undefined) return "";
  const num = Number(String(value).replace(/[^\d]/g, ""));
  if (Number.isNaN(num)) return "";
  return num.toLocaleString("es-CL");
}

export default function EventForm({ onCreate }) {
  const [nombreEvento, setNombreEvento] = useState("");
  const [gerenteOrganiza, setGerenteOrganiza] = useState("");
  const [fechaHora, setFechaHora] = useState(""); // datetime-local
  const [duracionHoras, setDuracionHoras] = useState(1);
  const [tipoEvento, setTipoEvento] = useState(EVENT_TYPES[0]);
  const [presupuestoCLP, setPresupuestoCLP] = useState("");
  const [direccion, setDireccion] = useState("");

  // Invitados por razón social (chips + números)
  const [empresaInput, setEmpresaInput] = useState("");
  const [empresas, setEmpresas] = useState([
    // ejemplo
    // { id: "1", nombre: "Entel", invitados: 5, confirmados: 2 }
  ]);

  const totalInvitados = useMemo(
    () => empresas.reduce((acc, e) => acc + (Number(e.invitados) || 0), 0),
    [empresas]
  );
  const totalConfirmados = useMemo(
    () => empresas.reduce((acc, e) => acc + (Number(e.confirmados) || 0), 0),
    [empresas]
  );

  function addEmpresa() {
    const nombre = empresaInput.trim();
    if (!nombre) return;

    // Evitar duplicados por nombre
    const exists = empresas.some(
      (e) => e.nombre.toLowerCase() === nombre.toLowerCase()
    );
    if (exists) {
      setEmpresaInput("");
      return;
    }

    setEmpresas((prev) => [
      ...prev,
      { id: crypto.randomUUID?.() || String(Date.now()), nombre, invitados: 0, confirmados: 0 },
    ]);
    setEmpresaInput("");
  }

  function removeEmpresa(id) {
    setEmpresas((prev) => prev.filter((e) => e.id !== id));
  }

  function updateEmpresa(id, patch) {
    setEmpresas((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...patch } : e))
    );
  }

  function handleEmpresaKeyDown(e) {
    if (e.key === "Enter") {
      e.preventDefault();
      addEmpresa();
    }
  }

  function handleSubmit(e) {
    e.preventDefault();

    const payload = {
      nombreEvento: nombreEvento.trim(),
      gerenteOrganiza: gerenteOrganiza.trim(),
      fechaHora,
      duracionHoras: Number(duracionHoras) || 1,
      tipoEvento,
      presupuestoCLP: Number(String(presupuestoCLP).replace(/[^\d]/g, "")) || 0,
      direccion: direccion.trim(),
      invitadosPorEmpresa: empresas.map((e) => ({
        razonSocial: e.nombre,
        invitados: Number(e.invitados) || 0,
        confirmados: Number(e.confirmados) || 0,
      })),
      createdAt: new Date().toISOString(),
    };

    if (!payload.nombreEvento || !payload.fechaHora) {
      alert("Falta completar: Nombre del Evento y Fecha/Hora.");
      return;
    }

    onCreate?.(payload);

    // Reset (mantengo tipo por comodidad)
    setNombreEvento("");
    setGerenteOrganiza("");
    setFechaHora("");
    setDuracionHoras(1);
    setPresupuestoCLP("");
    setDireccion("");
    setEmpresaInput("");
    setEmpresas([]);
  }

  return (
    <div style={styles.card}>
      <h2 style={styles.h2}>Crear Evento</h2>

      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.grid2}>
          <div>
            <label style={styles.label}>Nombre del Evento</label>
            <input
              style={styles.input}
              value={nombreEvento}
              onChange={(e) => setNombreEvento(e.target.value)}
              placeholder="Ej: Workshop con cliente X"
            />
          </div>

          <div>
            <label style={styles.label}>Gerente que lo organiza</label>
            <input
              style={styles.input}
              value={gerenteOrganiza}
              onChange={(e) => setGerenteOrganiza(e.target.value)}
              placeholder="Ej: Fernando Chilet"
            />
          </div>

          <div>
            <label style={styles.label}>Fecha y hora</label>
            <input
              style={styles.input}
              type="datetime-local"
              value={fechaHora}
              onChange={(e) => setFechaHora(e.target.value)}
            />
          </div>

          <div>
            <label style={styles.label}>Duración (horas)</label>
            <input
              style={styles.input}
              type="number"
              min={1}
              step={1}
              value={duracionHoras}
              onChange={(e) => setDuracionHoras(e.target.value)}
            />
          </div>

          <div>
            <label style={styles.label}>Tipo de evento</label>
            <select
              style={styles.input}
              value={tipoEvento}
              onChange={(e) => setTipoEvento(e.target.value)}
            >
              {EVENT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={styles.label}>Presupuesto (CLP)</label>
            <input
              style={styles.input}
              value={formatCLP(presupuestoCLP)}
              onChange={(e) => setPresupuestoCLP(e.target.value)}
              placeholder="Ej: 1.200.000"
              inputMode="numeric"
            />
          </div>

          <div style={{ gridColumn: "1 / -1" }}>
            <label style={styles.label}>Dirección del evento</label>
            <input
              style={styles.input}
              value={direccion}
              onChange={(e) => setDireccion(e.target.value)}
              placeholder="Ej: Av. Apoquindo 1234, Las Condes"
            />
          </div>
        </div>

        <div style={{ marginTop: 16 }}>
          <label style={styles.label}>
            Razón social de los invitados (agrega varias)
          </label>

          <div style={styles.row}>
            <input
              style={{ ...styles.input, flex: 1 }}
              value={empresaInput}
              onChange={(e) => setEmpresaInput(e.target.value)}
              onKeyDown={handleEmpresaKeyDown}
              placeholder="Escribe una empresa y presiona Enter"
            />
            <button type="button" style={styles.btn} onClick={addEmpresa}>
              + Agregar
            </button>
          </div>

          {empresas.length > 0 && (
            <div style={styles.empList}>
              {empresas.map((e) => (
                <div key={e.id} style={styles.empItem}>
                  <div style={styles.chip}>
                    <span style={{ fontWeight: 700 }}>{e.nombre}</span>
                    <button
                      type="button"
                      style={styles.chipX}
                      onClick={() => removeEmpresa(e.id)}
                      title="Quitar"
                    >
                      ×
                    </button>
                  </div>

                  <div style={styles.empNums}>
                    <div style={styles.empField}>
                      <span style={styles.smallLabel}>Invitados</span>
                      <input
                        style={styles.smallInput}
                        type="number"
                        min={0}
                        step={1}
                        value={e.invitados}
                        onChange={(ev) =>
                          updateEmpresa(e.id, { invitados: ev.target.value })
                        }
                      />
                    </div>

                    <div style={styles.empField}>
                      <span style={styles.smallLabel}>Confirmados</span>
                      <input
                        style={styles.smallInput}
                        type="number"
                        min={0}
                        step={1}
                        value={e.confirmados}
                        onChange={(ev) =>
                          updateEmpresa(e.id, { confirmados: ev.target.value })
                        }
                      />
                    </div>
                  </div>
                </div>
              ))}

              <div style={styles.totals}>
                <div>
                  <b>Total invitados:</b> {totalInvitados}
                </div>
                <div>
                  <b>Total confirmados:</b> {totalConfirmados}
                </div>
              </div>
            </div>
          )}
        </div>

        <div style={{ marginTop: 18, display: "flex", justifyContent: "flex-end" }}>
          <button type="submit" style={styles.primary}>
            Guardar Evento
          </button>
        </div>
      </form>
    </div>
  );
}

const styles = {
  card: {
    border: "1px solid #e6e6e6",
    borderRadius: 12,
    padding: 16,
    background: "#fff",
  },
  h2: { margin: 0, marginBottom: 12 },
  form: { width: "100%" },
  grid2: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 12,
  },
  label: { display: "block", fontSize: 13, fontWeight: 700, marginBottom: 6 },
  input: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid #dcdcdc",
    outline: "none",
  },
  row: { display: "flex", gap: 10, alignItems: "center" },
  btn: {
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid #dcdcdc",
    background: "#f7f7f7",
    cursor: "pointer",
    fontWeight: 700,
  },
  primary: {
    padding: "10px 14px",
    borderRadius: 10,
    border: "1px solid #111",
    background: "#111",
    color: "#fff",
    cursor: "pointer",
    fontWeight: 800,
  },
  empList: {
    marginTop: 10,
    border: "1px solid #eee",
    borderRadius: 12,
    padding: 12,
    background: "#fafafa",
  },
  empItem: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "center",
    padding: "10px 0",
    borderBottom: "1px solid #eee",
  },
  chip: {
    display: "inline-flex",
    alignItems: "center",
    gap: 10,
    padding: "6px 10px",
    borderRadius: 999,
    background: "#fff",
    border: "1px solid #e1e1e1",
    minWidth: 260,
  },
  chipX: {
    border: "none",
    background: "transparent",
    cursor: "pointer",
    fontSize: 18,
    lineHeight: 1,
  },
  empNums: { display: "flex", gap: 12, alignItems: "center" },
  empField: { display: "flex", flexDirection: "column", gap: 4 },
  smallLabel: { fontSize: 12, color: "#333", fontWeight: 700 },
  smallInput: {
    width: 120,
    padding: "8px 10px",
    borderRadius: 10,
    border: "1px solid #dcdcdc",
    outline: "none",
  },
  totals: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 18,
    paddingTop: 12,
  },
};
