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

function toLocalDateTimeInputValue(date) {
  // yyyy-MM-ddTHH:mm
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function clampInt(v, min, max) {
  const n = Number.parseInt(v, 10);
  if (Number.isNaN(n)) return min;
  return Math.max(min, Math.min(max, n));
}

export default function EventForm({ onCreate }) {
  const [name, setName] = useState("");
  const [manager, setManager] = useState("");
  const [start, setStart] = useState(() => toLocalDateTimeInputValue(new Date()));
  const [durationHours, setDurationHours] = useState(1);
  const [type, setType] = useState(EVENT_TYPES[0]);
  const [budgetClp, setBudgetClp] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");

  // Empresas invitadas (chips con invited/confirmed)
  const [companyName, setCompanyName] = useState("");
  const [companyInvited, setCompanyInvited] = useState(1);
  const [companyConfirmed, setCompanyConfirmed] = useState(0);
  const [companies, setCompanies] = useState([]);

  const totals = useMemo(() => {
    const invited = companies.reduce((acc, c) => acc + (Number(c.invited) || 0), 0);
    const confirmed = companies.reduce((acc, c) => acc + (Number(c.confirmed) || 0), 0);
    return { invited, confirmed };
  }, [companies]);

  function addCompany() {
    const n = companyName.trim();
    if (!n) return;

    const invited = clampInt(companyInvited, 0, 9999);
    const confirmed = clampInt(companyConfirmed, 0, invited);

    // si existe, actualiza
    setCompanies((prev) => {
      const idx = prev.findIndex((c) => c.name.toLowerCase() === n.toLowerCase());
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], invited, confirmed };
        return copy;
      }
      return [...prev, { name: n, invited, confirmed }];
    });

    setCompanyName("");
    setCompanyInvited(1);
    setCompanyConfirmed(0);
  }

  function removeCompany(nameToRemove) {
    setCompanies((prev) => prev.filter((c) => c.name !== nameToRemove));
  }

  function submit(e) {
    e.preventDefault();

    const cleanName = name.trim();
    const cleanManager = manager.trim();
    if (!cleanName || !cleanManager) {
      alert("Falta Nombre del Evento o Gerente que lo organiza.");
      return;
    }

    const startDateTime = new Date(start);
    if (Number.isNaN(startDateTime.getTime())) {
      alert("Fecha y hora inválida.");
      return;
    }

    const event = {
      name: cleanName,
      manager: cleanManager,
      startDateTime: startDateTime.toISOString(),
      durationHours: clampInt(durationHours, 1, 72),
      type,
      budgetClp: budgetClp === "" ? 0 : Number(String(budgetClp).replace(/[^\d]/g, "")),
      address: address.trim(),
      companies,
      notes: notes.trim(),
    };

    onCreate?.(event);

    // reset básico
    setName("");
    setManager("");
    setDurationHours(1);
    setType(EVENT_TYPES[0]);
    setBudgetClp("");
    setAddress("");
    setNotes("");
    setCompanies([]);
  }

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto" }}>
      <div
        style={{
          background: "#FFFFFF",
          border: "1px solid #E5E7EB",
          borderRadius: 16,
          padding: 16,
        }}
      >
        <div style={{ fontSize: 18, fontWeight: 900, marginBottom: 10 }}>Crear Evento</div>

        <form onSubmit={submit} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field label="Nombre del Evento">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Workshop con BCI"
              style={inputStyle}
            />
          </Field>

          <Field label="Gerente que lo organiza">
            <input
              value={manager}
              onChange={(e) => setManager(e.target.value)}
              placeholder="Ej: VS - Vinklaguer Sanchez"
              style={inputStyle}
            />
          </Field>

          <Field label="Fecha y hora">
            <input
              type="datetime-local"
              value={start}
              onChange={(e) => setStart(e.target.value)}
              style={inputStyle}
            />
          </Field>

          <Field label="Duración (horas)">
            <input
              type="number"
              min={1}
              max={72}
              value={durationHours}
              onChange={(e) => setDurationHours(e.target.value)}
              style={inputStyle}
            />
          </Field>

          <Field label="Tipo de evento">
            <select value={type} onChange={(e) => setType(e.target.value)} style={inputStyle}>
              {EVENT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Presupuesto (CLP)">
            <input
              value={budgetClp}
              onChange={(e) => setBudgetClp(e.target.value)}
              placeholder="Ej: 350000"
              inputMode="numeric"
              style={inputStyle}
            />
          </Field>

          <Field label="Dirección del evento" span2>
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Ej: Av. Providencia 1234, Santiago"
              style={inputStyle}
            />
          </Field>

          <div style={{ gridColumn: "1 / -1", marginTop: 6 }}>
            <div style={{ fontWeight: 900, marginBottom: 8 }}>Invitados por razón social</div>

            <div style={{ display: "grid", gridTemplateColumns: "1.4fr 0.7fr 0.7fr auto", gap: 10, alignItems: "end" }}>
              <Field label="Razón social">
                <input
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Ej: Banco de Chile"
                  style={inputStyle}
                />
              </Field>

              <Field label="Invitados">
                <input
                  type="number"
                  min={0}
                  max={9999}
                  value={companyInvited}
                  onChange={(e) => setCompanyInvited(e.target.value)}
                  style={inputStyle}
                />
              </Field>

              <Field label="Confirmados">
                <input
                  type="number"
                  min={0}
                  max={9999}
                  value={companyConfirmed}
                  onChange={(e) => setCompanyConfirmed(e.target.value)}
                  style={inputStyle}
                />
              </Field>

              <button
                type="button"
                onClick={addCompany}
                style={{
                  height: 44,
                  padding: "0 14px",
                  borderRadius: 12,
                  border: "1px solid #111827",
                  background: "#111827",
                  color: "#FFFFFF",
                  fontWeight: 900,
                  cursor: "pointer",
                }}
              >
                + Agregar
              </button>
            </div>

            {/* chips */}
            <div style={{ marginTop: 10, display: "flex", gap: 10, flexWrap: "wrap" }}>
              {companies.map((c) => (
                <div
                  key={c.name}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "10px 12px",
                    borderRadius: 999,
                    border: "1px solid #E5E7EB",
                    background: "#F8FAFC",
                    fontWeight: 900,
                  }}
                >
                  <span>{c.name}</span>
                  <span style={miniPill}>Inv: {c.invited}</span>
                  <span style={miniPill}>Conf: {c.confirmed}</span>
                  <button
                    type="button"
                    onClick={() => removeCompany(c.name)}
                    title="Eliminar"
                    style={{
                      border: "none",
                      background: "transparent",
                      cursor: "pointer",
                      fontWeight: 900,
                      color: "#EF4444",
                      fontSize: 16,
                      lineHeight: 1,
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 10, color: "#334155", fontWeight: 800 }}>
              Totales: <b>{totals.invited}</b> invitados / <b>{totals.confirmed}</b> confirmados
            </div>
          </div>

          <Field label="Comentario / notas" span2>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej: objetivos, agenda, restricciones, etc."
              style={{ ...inputStyle, minHeight: 110, resize: "vertical" }}
            />
          </Field>

          <div style={{ gridColumn: "1 / -1", display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 6 }}>
            <button
              type="submit"
              style={{
                padding: "12px 16px",
                borderRadius: 12,
                border: "1px solid #111827",
                background: "#111827",
                color: "#FFFFFF",
                fontWeight: 900,
                cursor: "pointer",
              }}
            >
              Guardar Evento
            </button>
          </div>
        </form>
      </div>

      <div style={{ marginTop: 12, color: "#64748B", fontWeight: 700 }}>
        *Este formulario guarda eventos en memoria (sin base de datos). En el siguiente paso lo conectamos a persistencia.
      </div>
    </div>
  );
}

function Field({ label, children, span2 }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, gridColumn: span2 ? "1 / -1" : undefined }}>
      <div style={{ fontSize: 13, fontWeight: 900, color: "#0F172A" }}>{label}</div>
      {children}
    </div>
  );
}

const inputStyle = {
  height: 44,
  borderRadius: 12,
  border: "1px solid #E5E7EB",
  padding: "0 12px",
  fontSize: 14,
  fontWeight: 700,
  outline: "none",
  background: "#FFFFFF",
};

const miniPill = {
  fontSize: 12,
  fontWeight: 900,
  padding: "6px 10px",
  borderRadius: 999,
  border: "1px solid #E5E7EB",
  background: "#FFFFFF",
  color: "#0F172A",
};
