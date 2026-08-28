"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import Modal from "../ui/Modal";
import type { Call, Technician } from "../../lib/types";

type EditInterventionModalProps = {
  call: Call;
  open: boolean;
  onClose: () => void;
  onUpdated: (updatedCall: Call) => void;
  role?: string;
};

export default function EditInterventionModal({
  call,
  open,
  onClose,
  onUpdated,
  role,
}: EditInterventionModalProps) {
  const isAdmin = role === "admin";

  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [streetNumber, setStreetNumber] = useState(
  call.street_number || ""
);

const [streetName, setStreetName] = useState(
  call.street_name || ""
);

const [postalCode, setPostalCode] = useState(
  call.postal_code || ""
);

const [city, setCity] = useState(
  call.city || ""
);

const [country, setCountry] = useState(
  call.country || "France"
);
  const [problem, setProblem] = useState("");
  const [interventionDate, setInterventionDate] = useState("");
  const [technician, setTechnician] = useState("");
  const [urgency, setUrgency] = useState("normal");
  const [status, setStatus] = useState("nouveau");
  const [saving, setSaving] = useState(false);
  const [technicians, setTechnicians] = useState<
    Pick<Technician, "id" | "name">[]
  >([]);

  useEffect(() => {
    if (!call) return;

    setClientName(call.client_name || "");
    setClientPhone(call.client_phone || "");
    setClientEmail(call.client_email || "");
    setStreetNumber(call.street_number || "");
    setStreetName(call.street_name || "");
    setPostalCode(call.postal_code || "");
    setCity(call.city || "");
    setCountry(call.country || "France");
    setProblem(call.problem || "");
    setInterventionDate(
      call.intervention_date
        ? new Date(call.intervention_date).toISOString().slice(0, 16)
        : ""
    );
    
    setTechnician(call.technician || "");
    setUrgency(call.urgency || "normal");
    setStatus(call.status || "nouveau");
   
  }, [call]);

  useEffect(() => {
  async function chargerTechniciens() {
    const { data, error } = await supabase
      .from("technicians")
      .select("id, name")
      .order("name", { ascending: true });

    if (error) {
      console.error(
        "Erreur chargement techniciens :",
        error
      );
      return;
    }

    setTechnicians(data || []);
  }

  chargerTechniciens();
}, []);

  async function enregistrer() {
    setSaving(true);

    const champsDetaillesRenseignes =
      streetNumber.trim() ||
      streetName.trim() ||
      postalCode.trim() ||
      city.trim();

    const adresseComplete = champsDetaillesRenseignes
      ? [
          [streetNumber.trim(), streetName.trim()]
            .filter(Boolean)
            .join(" "),
          [postalCode.trim(), city.trim()]
            .filter(Boolean)
            .join(" "),
          country.trim(),
        ]
          .filter(Boolean)
          .join(", ")
      : call.address || null;

    const payload = {
      client_name: clientName.trim(),
      client_phone: clientPhone.trim(),
      client_email: clientEmail.trim() || null,
      address: adresseComplete || null,
street_number: streetNumber.trim() || null,
street_name: streetName.trim() || null,
postal_code: postalCode.trim() || null,
city: city.trim() || null,
country: country.trim() || "France",
      problem: problem.trim(),
      intervention_date: interventionDate || null,
      // Le technicien et le statut ne sont modifiables ici que par un admin.
      // Pour un non-admin, on renvoie systématiquement la valeur d'origine
      // de l'intervention, jamais celle du formulaire (champs masqués).
      technician: isAdmin
        ? technician || null
        : call.technician || null,
      urgency,
      status: isAdmin ? status : call.status || "nouveau",
    };

    const { data, error } = await supabase
      .from("calls")
      .update(payload)
      .eq("id", call.id)
      .select("*")
      .single();

    setSaving(false);

    if (error) {
      alert("Erreur : " + error.message);
      return;
    }

    onUpdated(data);
    onClose();
    alert("✅ Intervention modifiée");
  }

  return (
    <Modal
      open={open}
      title="Modifier l’intervention"
      onClose={onClose}
    >
      <div
  style={{
    display: "grid",
    gap: "12px",
    maxHeight: "70vh",
    overflowY: "auto",
    paddingRight: "8px",
    paddingBottom: "10px",
  }}
>
       <div
  style={{
    padding: "16px",
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    background: "#f8fafc",
  }}
>
  <div
    style={{
      fontWeight: "700",
      marginBottom: "14px",
      color: "#0f172a",
    }}
  >
    👤 Informations client
  </div>

  <div
    style={{
      display: "grid",
      gap: "14px",
    }}
  >
    <label>
      <span style={labelStyle}>Nom du client</span>
      <input
        value={clientName}
        onChange={(e) => setClientName(e.target.value)}
        placeholder="Ex : Mr Brad"
        style={inputStyle}
      />
    </label>

    <label>
      <span style={labelStyle}>Téléphone</span>
      <input
        type="tel"
        value={clientPhone}
        onChange={(e) => setClientPhone(e.target.value)}
        placeholder="Ex : 06 45 25 64 56"
        style={inputStyle}
      />
    </label>

    <label>
      <span style={labelStyle}>Adresse e-mail</span>
      <input
        type="email"
        value={clientEmail}
        onChange={(e) => setClientEmail(e.target.value)}
        placeholder="Ex : client@email.fr"
        style={inputStyle}
      />
    </label>
  </div>
</div>

       {!streetNumber && !streetName && !postalCode && !city && call.address && (
  <div
    style={{
      padding: "12px 14px",
      background: "#fef3c7",
      border: "1px solid #fbbf24",
      borderRadius: "10px",
      marginBottom: "14px",
      fontSize: "13px",
      color: "#92400e",
    }}
  >
    ⚠️ Adresse actuelle (ancien format) : <strong>{call.address}</strong>
    <br />
    Renseignez les champs ci-dessous pour la mettre à jour au nouveau format.
  </div>
)}

<div
  style={{
    padding: "16px",
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    background: "#f8fafc",
  }}
>
  <div
    style={{
      fontWeight: "700",
      marginBottom: "14px",
      color: "#0f172a",
    }}
  >
    📍 Adresse d’intervention
  </div>

  <div
    style={{
      display: "grid",
      gridTemplateColumns: "1fr 2fr",
      gap: "14px",
      marginBottom: "14px",
    }}
  >
    <label style={{ display: "block" }}>
      <span style={labelStyle}>N°</span>
      <input
        value={streetNumber}
        onChange={(e) => setStreetNumber(e.target.value)}
        placeholder="10"
        style={inputStyle}
      />
    </label>

    <label style={{ display: "block" }}>
      <span style={labelStyle}>Nom de la rue</span>
      <input
        value={streetName}
        onChange={(e) => setStreetName(e.target.value)}
        placeholder="Rue de Lieusaint"
        style={inputStyle}
      />
    </label>
  </div>

  <div
    style={{
      display: "grid",
      gridTemplateColumns: "1fr 2fr",
      gap: "14px",
      marginBottom: "14px",
    }}
  >
    <label style={{ display: "block" }}>
      <span style={labelStyle}>Code postal</span>
      <input
        value={postalCode}
        onChange={(e) => setPostalCode(e.target.value)}
        placeholder="77380"
        style={inputStyle}
      />
    </label>

    <label style={{ display: "block" }}>
      <span style={labelStyle}>Ville</span>
      <input
        value={city}
        onChange={(e) => setCity(e.target.value)}
        placeholder="Combs-la-Ville"
        style={inputStyle}
      />
    </label>
  </div>

  <label style={{ display: "block" }}>
    <span style={labelStyle}>Pays</span>
    <input
      value={country}
      onChange={(e) => setCountry(e.target.value)}
      placeholder="France"
      style={inputStyle}
    />
  </label>
</div>

        <textarea
          value={problem}
          onChange={(e) => setProblem(e.target.value)}
          placeholder="Problème"
          rows={4}
          style={inputStyle}
        />
<label>
  <span style={labelStyle}>Date et heure d’intervention</span>
  <input
    type="datetime-local"
    value={interventionDate}
    onChange={(e) => setInterventionDate(e.target.value)}
    style={inputStyle}
  />
</label>

{isAdmin && (
  <label>
    <span style={labelStyle}>Technicien</span>
    <select
      value={technician}
      onChange={(e) => setTechnician(e.target.value)}
      style={inputStyle}
    >
      <option value="">Aucun technicien</option>

      {technicians.map((tech) => (
        <option
          key={tech.id}
          value={tech.name}
        >
          {tech.name}
        </option>
      ))}
    </select>
  </label>
)}

<label>
  <span style={labelStyle}>Priorité</span>
  <select
    value={urgency}
    onChange={(e) => setUrgency(e.target.value)}
    style={inputStyle}
  >
    <option value="normal">Normale</option>
    <option value="important">Importante</option>
    <option value="urgent">Urgente</option>
  </select>
</label>

{isAdmin && (
  <label>
    <span style={labelStyle}>Statut</span>
    <select
      value={status}
      onChange={(e) => setStatus(e.target.value)}
      style={inputStyle}
    >
      <option value="nouveau">Nouveau</option>
      <option value="planifie">Planifié</option>
      <option value="en_route">En route</option>
      <option value="arrived">Arrivé</option>
      <option value="in_progress">En intervention</option>
      <option value="termine">Terminé</option>
    </select>
  </label>
)}
       
          

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "10px",
            marginTop: "10px",
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={secondaryButtonStyle}
          >
            Annuler
          </button>

          <button
            type="button"
            onClick={enregistrer}
            disabled={saving}
            style={primaryButtonStyle}
          >
            {saving ? "Enregistrement..." : "Enregistrer"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block",
  marginBottom: "6px",
  fontSize: "13px",
  fontWeight: "700",
  color: "#475569",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "11px 12px",
  border: "1px solid #cbd5e1",
  borderRadius: "10px",
  outline: "none",
};

const primaryButtonStyle: React.CSSProperties = {
  padding: "11px 16px",
  border: "none",
  borderRadius: "10px",
  background: "#2563eb",
  color: "white",
  fontWeight: "700",
  cursor: "pointer",
};

const secondaryButtonStyle: React.CSSProperties = {
  padding: "11px 16px",
  border: "1px solid #cbd5e1",
  borderRadius: "10px",
  background: "white",
  fontWeight: "700",
  cursor: "pointer",
};