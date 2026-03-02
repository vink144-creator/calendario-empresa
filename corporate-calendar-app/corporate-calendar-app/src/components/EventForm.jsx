import React, { useMemo, useState } from "react";

const EVENT_TYPES = [
  "Reunión de prospección (primera reunión)",
  "Reunión de descubrimiento de necesidades",
  "Workshop",
  "Presentación de propuesta Tecnica",
  "Reunión de negociación / cierre",
  "Presentación de propuesta Economica",
  "Desayuno",
  "Almuerzo",
  "Cena",
  "Evento Anual con Pathers",
  "Evento Networking",
  "Lanzamiento de nuevo Producto",
];

const MANAGERS = [
  { code: "FC", name: "Fernando Chilet" },
  { code: "AD", name: "Alejandro Daccarett" },
  { code: "CP", name: "Carolina Pinilla" },
  { code: "EG", name: "Edwin Gallardo" },
  { code: "PR", name: "Pablo Rondan" },
  { code: "MA", name: "Miguiar Apestegui" },
  { code: "VS", name: "Vinklaguer Sanchez" },
];

function formatCLPInput(value) {
  // Solo dígitos
  const digits = String(value ?? "").replace(/[^\d]/g, "");
  if (!digits) return "";
  // Sin separadores raros: 1000000 -> 1.000.000
  return Number(digits).toLocaleString("es-CL");
}

function parseCLPToNumber(value) {
  const digits = String(value ?? "").replace(/[^\d]/g, "");
  return digits ? Number(digits) : 0;
}

export default function EventForm({ onSave }) {
  const [nombreEvento, setNombreEvento] = useState("");
  const [gerente, setGerente] = useState("VS");
  const [fechaHora, setFechaHora] = useState("");
  const [duracionHoras, setDuracionHoras] = useState(1);
  const [tipoEvento, setTipoEvento] = useState(EVENT_TYPES[0]);

  const [presupuestoCLP, setPresupuestoCLP] = useState("");
  const [direccion, setDireccion] = useState("");

  // Empresas invitadas (chips)
  const [empresaInput, setEmpresaInput] = useState("");
  const [empresas, setEmpresas] = useState([]); // { id, razonSocial, invitados, confirmados }

  const gerenteLabel = useMemo(() => {
    const m = MANAGERS.find((x) => x.code === gerente);
    return m ? `${m.code} - ${m.name}` : gerente;
  }, [gerente]);

  function addEmpresa() {
    const name = empresaInput.trim();
    if (!name) return;

    // Evitar duplicados por nombre (case-insensitive)
    const exists = empresas.some(
      (e) => e.razonSocial.toLowerCase() === name.toLowerCase()
    );
    if (exists) {
      setEmpresaInput("");
      return;
    }

    setEmpresas((prev) => [
      ...prev,
      {
        id: crypto?.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random(),
        razonSocial: name,
        invitados: 0,
        confirmados: 0,
      },
    ]);
    setEmpresaInput("");
  }

  function removeEmpresa(id) {
    setEmpresas((prev) => prev.filter((e) => e.id !== id));
  }

  function updateEmpresa(id, patch) {
    setEmpresas((prev) =>
      prev.map((e) => {
        if (e.id !== id) return e;
        const next = { ...e, ...patch };

        // Reglas mínimas: confirmados no puede ser > invitados
        const inv = Number(next.invitados || 0);
        let conf = Number(next.confirmados || 0);
        if (conf > inv) conf = inv;

        return { ...next, invitados: inv, confirmados: conf };
      })
    );
  }

  function handleSubmit(e) {
    e.preventDefault();

    if (!nombreEvento.trim()) {
      alert("Falta: Nombre del Evento");
      return;
    }
    if (!fechaHora) {
      alert("Falta: Fecha y hora");
      return;
    }
    if (!duracionHoras || Number(duracionHoras) <= 0) {
      alert("Duración debe ser mayor a 0 horas");
      return;
    }

    const presupuesto = parseCLPToNumber(presupuestoCLP);

    const event = {
      id: crypto?.randomUUID ? crypto.randomUUID() : String(Date.now()),
      nombreEvento: nombreEvento.trim(),
      gerenteCode: gerente,
      gerenteLabel,
      fechaHoraISO: new Date(fechaHora).toISOString(),
      duracionHoras: Number(duracionHoras),
      tipoEvento,
      presupuestoCLP: presupuesto,
      direccion: direccion.trim(),
      invitadosPorRazonSocial: empresas,
      createdAtISO: new Date().toISOString(),
    };

    if (onSave) onSave(event);

    // Reset
    setNombreEvento("");
    setFechaHora("");
    setDuracionHoras(1);
    setTipoEvento(EVENT_TYPES[0]);
    setPresupuestoCLP("");
    setDireccion("");
    setEmpresaInput("");
    setEmpresas([]);
  }

  return (
    <div style={{ padding: 20, maxWidth: 1100 }}>
      <h2 style={{ margin: 0, marginBottom: 14 }}>Crear evento</h2>

      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 14 }}>
        {/* Fila 1 */}
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 12 }}>
          <div>
            <label style={{ fontWeight: 700, display: "block", marginBottom: 6 }}>
              Nombre del Evento
            </label>
            <input
              value={nombreEvento}
              onChange={(e) => setNombreEvento(e.target.value)}
              placeholder="Ej: Workshop Entel Connect - SKY"
              style={inputStyle}
            />
          </div>

          <div>
            <label style={{ fontWeight: 700, display: "block", marginBottom: 6 }}>
              Gerente que lo organiza
            </label>
            <select
              value={gerente}
              onChange={(e) => setGerente(e.target.value)}
              style={inputStyle}
            >
              {MANAGERS.map((m) => (
                <option key={m.code} value={m.code}>
                  {m.code} - {m.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Fila 2 */}
        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 0.6fr 1fr", gap: 12 }}>
          <div>
            <label style={{ fontWeight: 700, display: "block", marginBottom: 6 }}>
              Fecha y hora
            </label>
            <input
              type="datetime-local"
              value={fechaHora}
              onChange={(e) => setFechaHora(e.target.value)}
              style={inputStyle}
            />
          </div>

          <div>
            <label style={{ fontWeight: 700, display: "block", marginBottom: 6 }}>
              Duración (horas)
            </label>
            <input
              type="number"
              min={0.5}
              step={0.5}
              value={duracionHoras}
              onChange={(e) => setDuracionHoras(e.target.value)}
              style={inputStyle}
            />
          </div>

          <div>
            <label style={{ fontWeight: 700, display: "block", marginBottom: 6 }}>
              Tipo de evento
            </label>
            <select
              value={tipoEvento}
              onChange={(e) => setTipoEvento(e.target.value)}
              style={inputStyle}
            >
              {EVENT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Fila 3 */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 12 }}>
          <div>
            <label style={{ fontWeight: 700, display: "block", marginBottom: 6 }}>
              Presupuesto (CLP)
            </label>
            <input
              value={presupuestoCLP}
              onChange={(e) => setPresupuestoCLP(formatCLPInput(e.target.value))}
              placeholder="Ej: 1.500.000"
              style={inputStyle}
              inputMode="numeric"
            />
            <div style={{ fontSize: 12, opacity: 0.7, marginTop: 6 }}>
              Se guarda como número (sin puntos).
            </div>
          </div>

          <div>
            <label style={{ fontWeight: 700, display: "block", marginBottom: 6 }}>
              Dirección del evento
            </label>
            <input
              value={direccion}
              onChange={(e) => setDireccion(e.target.value)}
              placeholder="Ej: Av. Apoquindo 3000, Las Condes"
              style={inputStyle}
            />
          </div>
        </div>

        {/* Invitados */}
        <div style={cardStyle}>
          <div style={{ fontWeight: 800, marginBottom: 10 }}>
            Razón social de los invitados
          </div>

          {/* Input + botón */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 10 }}>
            <input
              value={empresaInput}
              onChange={(e) => setEmpresaInput(e.target.value)}
              placeholder="Escribe la razón social y presiona +"
              style={inputStyle}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addEmpresa();
                }
              }}
            />
            <button type="button" onClick={addEmpresa} style={btnPrimary}>
              +
            </button>
          </div>

          {/* Chips */}
          {empresas.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
              {empresas.map((e) => (
                <div key={e.id} style={chipStyle}>
                  <span style={{ fontWeight: 700 }}>
                    {e.razonSocial}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeEmpresa(e.id)}
                    style={chipXStyle}
                    title="Eliminar"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Tabla de conteos */}
          {empresas.length > 0 && (
            <div style={{ marginTop: 14, overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th style={thStyle}>Razón social</th>
                    <th style={thStyle}>Invitados</th>
                    <th style={thStyle}>Confirmados</th>
                  </tr>
                </thead>
                <tbody>
                  {empresas.map((e) => (
                    <tr key={e.id}>
                      <td style={tdStyle}>{e.razonSocial}</td>
                      <td style={tdStyle}>
                        <input
                          type="number"
                          min={0}
                          value={e.invitados}
                          onChange={(ev) =>
                            updateEmpresa(e.id, { invitados: ev.target.value })
                          }
                          style={miniInput}
                        />
                      </td>
                      <td style={tdStyle}>
                        <input
                          type="number"
                          min={0}
                          value={e.confirmados}
                          onChange={(ev) =>
                            updateEmpresa(e.id, { confirmados: ev.target.value })
                          }
                          style={miniInput}
                        />
                        <div style={{ fontSize: 11, opacity: 0.7, marginTop: 4 }}>
                          (No puede superar invitados)
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Botón guardar */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <button type="submit" style={btnSave}>
            Guardar evento
          </button>
        </div>
      </form>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid #d9dde6",
  outline: "none",
  fontSize: 14,
  background: "white",
};

const cardStyle = {
  border: "1px solid #e6e9f0",
  borderRadius: 14,
  padding: 14,
  background: "#fff",
};

const btnPrimary = {
  padding: "10px 14px",
  borderRadius: 10,
  border: "1px solid #1d4ed8",
  background: "#1d4ed8",
  color: "white",
  fontWeight: 900,
  cursor: "pointer",
  width: 44,
};

const btnSave = {
  padding: "10px 16px",
  borderRadius: 10,
  border: "1px solid #0f172a",
  background: "#0f172a",
  color: "white",
  fontWeight: 800,
  cursor: "pointer",
};

const chipStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: 10,
  padding: "6px 10px",
  borderRadius: 999,
  border: "1px solid #d9dde6",
  background: "#f8fafc",
  fontSize: 13,
};

const chipXStyle = {
  border: "none",
  background: "transparent",
  cursor: "pointer",
  fontSize: 18,
  lineHeight: "18px",
  padding: 0,
};

const thStyle = {
  textAlign: "left",
  fontSize: 12,
  opacity: 0.75,
  padding: "8px 6px",
  borderBottom: "1px solid #e6e9f0",
};

const tdStyle = {
  padding: "10px 6px",
  borderBottom: "1px solid #f0f2f7",
  verticalAlign: "top",
};

const miniInput = {
  width: 120,
  padding: "8px 10px",
  borderRadius: 10,
  border: "1px solid #d9dde6",
  outline: "none",
};
